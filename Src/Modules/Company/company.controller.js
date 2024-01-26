import bcrypt from "bcryptjs";
import { DateTime } from "luxon";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import employeeModel from "../../../DB/Models/Employee.model.js";
import attendanceModel from "../../../DB/Models/Attendance.model.js";
import { addCheckIn,  convertToAMPM, getPagination, isWithinTimeRange } from "../../Services/service.controller.js";
import cloudinary from "../../Services/cloudinary.js";
import companyModel from "../../../DB/Models/Company.model.js";

export const createEmployee = async (req, res) => {
    let employeeData = req.body;
    const { email, userName, phoneNumber } = employeeData;
    const employee = await employeeModel.findOne({
        $or: [
            { email },
            { userName },
            { phoneNumber }
        ]
    });

    if (employee) {
        const message =
            employee.email === employeeData.email ? "Email exists" :
                employee.userName === employeeData.userName ? "User Name exists" :
                    employee.phoneNumber === employeeData.phoneNumber ? "Phone Number exists" :
                        "";

        return res.status(409).json({ message });
    }

    const hashedPasswored = bcrypt.hashSync(employeeData.password, parseInt(process.env.SALT_ROUND));
    employeeData.password = hashedPasswored;
    employeeData.companyId = req.user._id;
    employeeData.isDeleted = false;
    const createUser = await employeeModel.create(employeeData);
    return res.status(201).json({ message: "Employee added successfully", createUser });

}

export const editIPAddress = async (req, res) => {
    const company = req.user;
    const { IPAddress } = req.body;
    company.IPAddress = IPAddress;
    await company.save();
    return res.status(201).json({ message: "IP Address edited successfully", newIPAddress: company.IPAddress });
}

export const getActiveEmployee = async (req, res) => {
    const companyId = req.user.id;
    const { page, perPage } = req.query;
    const { limit, offset } = getPagination(page || 1, perPage);

    const employees = await employeeModel.find({ isDeleted: false, companyId })
        .select('fullName userName phoneNumber startChecking endChecking')
        .populate({
            path: 'attendance',
            options: { perDocumentLimit: 1, sort: { createdAt: -1 } },
            select: '-updatedAt -__v '
        });

    const activeEmployees = employees
        .filter((emp) => {
            const lastCheckIn = emp.attendance[0];
            return (
                lastCheckIn?.isCheckIn &&
                !lastCheckIn.isCheckOut &&
                new Date() <= lastCheckIn.shiftEndDateTime
            );
        })
        .map(employee => ({
            employeeId: employee.id,
            fullName: employee.fullName,
            userName: employee.userName,
            phoneNumber: employee.phoneNumber,
            enterTime: DateTime.fromMillis(employee.attendance[0].enterTime, { zone: 'Asia/Jerusalem' }).toFormat('d/M/yyyy, h:mm a'),
            shiftEndDateTime: DateTime.fromJSDate(employee.attendance[0].shiftEndDateTime, { zone: 'Asia/Jerusalem' }).toFormat('d/M/yyyy, h:mm a')
        }));
    if (activeEmployees.length == 0) {
        return res.status(202).json({ message: "There are no active employees right now" });
    }
    const paginateEmployees = activeEmployees.slice(offset, offset + limit);

    return res.status(201).json({
        message: "success",
        employees: paginateEmployees,
        page: +page || 1,
        totalPages: Math.ceil(activeEmployees.length / limit) || 1,
        totalEmployees: activeEmployees.length
    });
}

export const getIpAddress = async (req, res) => {
    const remoteAddress = req.connection.remoteAddress;
    const forwardedFor = req.headers['x-forwarded-for'];

    // console.log('Remote Address:', remoteAddress);
    // console.log('Forwarded-For Header:', forwardedFor);

    return res.status(201).json({ message: "success", Public_IP_Address: forwardedFor });
}

export const checkInEmployee = async (req, res) => {
    const company = req.user;
    const { employeeId } = req.body;
    const employee = await employeeModel.findOne({ _id: employeeId, companyId: company._id, isDeleted: false });
    const { startChecking, endChecking } = employee;
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });
    if (!isWithinTimeRange(startChecking, endChecking, currentTime)) {
        return res.status(409).json({ message: `The employee ${employee.fullName} out of range checking, rejected`, startChecking, endChecking, currentTime });
    }
    const lastCheckIn = await attendanceModel.findOne({ employeeId }).sort({ createdAt: -1 });
    if (!lastCheckIn) {
        return await addCheckIn(employee, currentTime, res);
    } else if (!lastCheckIn.isCheckOut) {
        if (new Date() <= lastCheckIn.shiftEndDateTime) {
            return res.status(409).json({ message: `The employee ${employee.fullName} already checked in, if you want to check out go to checkOut button` });
        } else {
            return await addCheckIn(employee, currentTime, res);
        }
    } else if (lastCheckIn.isCheckOut) {
        const lastDayChecked = DateTime.fromJSDate(lastCheckIn.createdAt, { zone: 'Asia/Jerusalem' }).toISODate();
        const thisDay = DateTime.now().setZone('Asia/Jerusalem').toISODate();
        if (lastDayChecked == thisDay) {
            return res.status(404).json({ message: "Not allowed more than one check-in per day" });
        } else {
            return await addCheckIn(employee, currentTime, res);
        }
    }
    return res.status(201).json({ message: "Nothing allowed, maybe something wrong, rejected" });

}

export const checkOutEmployee = async (req, res) => {
    const company = req.user;
    const { employeeId } = req.body;
    const employee = await employeeModel.findOne({ _id: employeeId, companyId: company._id, isDeleted: false });
    const { startChecking, endChecking } = employee;
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });


    if (!(isWithinTimeRange(startChecking, endChecking, currentTime))) {
        return res.status(409).json({ message: `The employee ${employee.fullName} out of range checking, rejected`, startChecking, endChecking, currentTime });
    }

    const lastCheckIn = await attendanceModel.findOne({ employeeId }).sort({ createdAt: -1 });

    if (!lastCheckIn || lastCheckIn.isCheckOut) {
        return res.status(409).json({ message: `The employee ${employee.fullName} is not checked in yet, if you want to check in go to checkIn button` });
    } else if (!lastCheckIn.isCheckOut) {

        const { shiftEndDateTime } = lastCheckIn;

        const isOkCheckOut = new Date() <= shiftEndDateTime;
        if (!isOkCheckOut) {
            return res.status(409).json({ message: "This is not the same shift that checked in , please check in , Rejected" });
        }

        const newCheckOut = lastCheckIn;
        newCheckOut.isCheckOut = true;
        newCheckOut.leaveTime = Date.now();
        newCheckOut.shiftEndDateTime = undefined; // Unset the field
        await newCheckOut.save();
        return res.status(201).json({ message: "success check out", newCheckOut });
    }
    return res.status(201).json({ message: "There is something wronge in database... , rejected" });

}

export const getEmployees = async (req, res) => {
    const { page, perPage, search } = req.query;
    const { limit, offset } = getPagination(page, perPage);
    const companyId = req.user.id;
    let mongooseQuery = employeeModel.paginate({ companyId, isDeleted: false }, { select: 'fullName _id userName', limit, offset });
    if (search) {
        mongooseQuery = employeeModel.paginate({
            companyId, isDeleted: false,
            $or: [{ fullName: { $regex: search, $options: 'i' } }, { userName: { $regex: search, $options: 'i' } }]
        },
            { select: 'fullName _id userName', limit, offset });
    }
    const employees = await mongooseQuery;
    if (!employees.totalDocs) {
        return res.status(409).json({ message: "Employees not found" });
    }

    return res.status(200).json({
        message: "success",
        employees: employees.docs,
        page: employees.page,
        totalPages: employees.totalPages,
        totalEmployees: employees.totalDocs
    });

}

export const updateEmployee = async (req, res) => {
    const { employeeId } = req.params;
    const { password, ...updatedData } = req.body;
    if(updatedData.email || updatedData.phoneNumber){
        const employee = await employeeModel.findOne({
            $or: [
                { email: updatedData.email },
                { phoneNumber: updatedData.phoneNumber }
            ],
            _id: { $ne: employeeId } // Exclude the current employee from the search
        });
    
        if (employee) {
            const message =
                employee.email === updatedData.email ? "Email already used" :
                        employee.phoneNumber === updatedData.phoneNumber ? "Phone Number already used" :
                            "";
    
            return res.status(409).json({ message });
        }
    }
    if (password) {
        const hashNewPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
        updatedData.password = hashNewPassword;
    }
    const updatedEmployee = await employeeModel.findOneAndUpdate({ _id: employeeId, isDeleted: false }, updatedData, { new: true });

    if (!updatedEmployee) {
        return res.status(400).json({ message: "Employee not found" });
    }
    return res.status(200).json({ message: "Successfully updated", updatedEmployee });
}

export const deleteEmployee = async (req, res) => {
    const { employeeId } = req.params;
    const employee = await employeeModel.findOneAndUpdate({ _id: employeeId, isDeleted: false }, { isDeleted: true }, { new: true });

    if (!employee) {
        return res.status(402).json({ message: "Employees not found" });
    }
    return res.status(201).json({ message: "success", employee });
}

export const getSpeceficEmployee = async (req, res) => {
    const { employeeId } = req.params;
    const employee = await employeeModel.findOne({ _id: employeeId, companyId: req.user.id, isDeleted: false })
        .select('-createdAt -updatedAt -__v -password -isDeleted -companyId');
    if (!employee) {
        return res.status(409).json({ message: "Employee not found" });
    }
    employee.startChecking = convertToAMPM(employee.startChecking);
    employee.endChecking = convertToAMPM(employee.endChecking);

    return res.status(200).json({ message: "success", employee });

}

export const generateQr = async (req, res) => {
    const company = await companyModel.findById(req.user.id);
    const QrId = uuidv4();
    QRCode.toDataURL(QrId, async (err, code) => {
        try {
            const { secure_url, public_id } = await cloudinary.uploader.upload(code, { folder: `${process.env.APP_NAME}` })
            if (company.QrImage) {
                await cloudinary.uploader.destroy(company.QrImage.public_id);
            }
            company.QrImage = { secure_url, public_id };
            company.QrId = QrId;
            await company.save();
            return res.json({ message: "success", secure_url, QrId });
        } catch (error) {
            return res.status(500).json({ message: "catch error", error });
        }
    });
}

export const getQrImage = async (req, res) => {
    const company = await companyModel.findById(req.user.id);
    const imageUrl = company.QrImage.secure_url;
    if (!imageUrl) {
        return res.status(404).json({ message: "There is no QR-code yet, Please generate one" });
    }
    return res.status(200).json({ message: "success", imageUrl });
}

