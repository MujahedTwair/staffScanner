import { DateTime } from 'luxon';
import bcrypt from 'bcryptjs';
import attendanceModel from "../../../../DB/Models/Attendance.model.js";
import companyModel from "../../../../DB/Models/Company.model.js";
import { addCheckIn, isWithinTimeRange } from '../../../Services/service.controller.js';
import employeeModel from '../../../../DB/Models/Employee.model.js';
import holidayModel from '../../../../DB/Models/Hoilday.model.js';


export const checkIn = async (req, res) => {
    const employee = req.user;
    const { deviceId } = req.body;

    // const networkAddress = req.headers['x-forwarded-for'];
    const networkAddress = '188.225.231.226';
    if (await checkDeviceId(employee, deviceId, res) || await checkIPAddress(employee, networkAddress, res)) {
        return;
    }

    const { _id, startChecking, endChecking } = employee;
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });
    if (!isWithinTimeRange(startChecking, endChecking, currentTime)) {
        return res.status(409).json({ message: "you are out of range checking, rejected", startChecking, endChecking, currentTime });
    }

    const lastCheckIn = await attendanceModel.findOne({ employeeId: _id }).sort({ createdAt: -1 });
    if (!lastCheckIn) {
        return await addCheckIn(employee, res);
    } else if (lastCheckIn.isCheckIn && !lastCheckIn.isCheckOut) {
        if (new Date() <= lastCheckIn.shiftEndDateTime) {
            return res.status(409).json({ message: "you are already checked in, if you want to check out go to checkOut button" });
        } else {
            return await addCheckIn(employee, res);
        }
    } else if (lastCheckIn.isCheckIn && lastCheckIn.isCheckOut) {
        return await addCheckIn(employee, res);
    }
    return res.status(201).json({ message: "Nothing allowed to you, maybe something wrong, rejected" });

}

export const checkOut = async (req, res) => {
    const employee = req.user;
    const { deviceId } = req.body;
    // const networkAddress = req.headers['x-forwarded-for'];
    const networkAddress = '188.225.231.226';
    if (await checkDeviceId(employee, deviceId, res) || (await checkIPAddress(employee, networkAddress, res))) {
        return;
    }

    const { _id, startChecking, endChecking } = employee;
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });
    if (!(isWithinTimeRange(startChecking, endChecking, currentTime))) {
        return res.status(409).json({ message: "you are out of range checking, rejected", startChecking, endChecking, currentTime });
    }

    const lastCheckIn = await attendanceModel.findOne({ employeeId: _id }).sort({ createdAt: -1 });
    // console.log(lastCheckIn);
    if (!lastCheckIn || (lastCheckIn.isCheckIn && lastCheckIn.isCheckOut)) {
        return res.status(409).json({ message: "you are not checked in yet, if you want to check in go to checkIn button" });
    } else if (lastCheckIn.isCheckIn && !lastCheckIn.isCheckOut) {

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

export const newCheckin = async (req, res) => {
    const check = await attendanceModel.create({
        isCheckIn: true, isCheckOut: true, enterTime: '4', leaveTime: '4', date: '4',
        employeeId: req.user._id
    })
    return res.json({ message: "new checkIn", check });
}

export const getAllowedCheck = async (req, res) => {
    const employee = req.user;
    const { _id, startChecking, endChecking } = employee;
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });
    if (!isWithinTimeRange(startChecking, endChecking, currentTime)) {
        return res.status(409).json({ message: "you are out of range checking, rejected", startChecking, endChecking, currentTime });
    }
    const lastCheckIn = await attendanceModel.findOne({ employeeId: _id }).sort({ createdAt: -1 });
    if (!lastCheckIn) {
        return res.status(201).json({ message: "checkIn" });
    } else if (lastCheckIn.isCheckIn && !lastCheckIn.isCheckOut) {
        if (new Date() <= lastCheckIn.shiftEndDateTime) {
            return res.status(201).json({ message: "checkOut" });
        } else {
            return res.status(201).json({ message: "checkIn" });
        }
    } else if (lastCheckIn.isCheckIn && lastCheckIn.isCheckOut) {
        return res.status(201).json({ message: "checkIn" });
    }
    return res.status(201).json({ message: "Nothing allowed to you, maybe something wrong" });
}

export const welcome = async (req, res) => {
    const employee = req.user;
    const { fullName, startChecking, endChecking, id } = employee;
    const start = convertToAMPM(startChecking);
    const end = convertToAMPM(endChecking);
    const currentDay = DateTime.now().setZone('Asia/Jerusalem').toFormat('cccc');
    const currentDate = DateTime.now().setZone('Asia/Jerusalem').toFormat('dd/MM/yyyy');
    const unReadHolidaysCount = await holidayModel.countDocuments({ employeeId: id, isRead: false });
    return res.status(200).json({ fullName, start, end, currentDay, currentDate, unReadHolidaysCount });
}

export const getAccountInformation = async (req, res) => {
    const id = req.user._id;
    const employee = await employeeModel.findOne({ _id: id, isDeleted: false }).select('-_id -companyId -password -isDeleted -deviceId -updatedAt -__v');
    if (!employee) {
        return res.status(409).json({ message: "ُEmployee not found" });
    }
    return res.status(201).json({ message: "success", employee });
}

export const updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const employee = await employeeModel.findOne({ _id: req.user.id, isDeleted: false });
    if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
    }
    const match = bcrypt.compareSync(oldPassword, employee.password);
    if (!match) {
        return res.status(409).json({ message: "Old password is not correct" });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALT_ROUND));
    employee.password = hashedNewPassword;
    await employee.save();
    return res.status(201).json({ message: "Password updated successfully" });
}


function convertToAMPM(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours < 12 ? 'Am' : 'Pm';
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes} ${period}`;

    return formattedTime;
}

const checkDeviceId = async (employee, deviceId, res) => {
    if (employee.deviceId != deviceId) {
        return res.status(409).json({ message: "illegal attemp: This is not your phone, rejected" });
    }
}

const checkIPAddress = async (employee, IPAddress, res) => {
    const company = await companyModel.findOne({ id: employee.companyId });
    if (IPAddress != company.IPAddress) {
        return res.status(409).json({ message: "illegal attemp: Your not at company, rejected" });
    }
}

export const getIpAddress = async (req, res) => {
    const remoteAddress = req.connection.remoteAddress;
    const forwardedFor = req.headers['x-forwarded-for'];

    // console.log('Remote Address:', remoteAddress);
    // console.log('Forwarded-For Header:', forwardedFor);

    return res.json({ 'Public IP Address': forwardedFor });
}