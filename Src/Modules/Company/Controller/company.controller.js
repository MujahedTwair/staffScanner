import bcrypt from 'bcryptjs'
import employeeModel from '../../../../DB/Models/Employee.model.js';
import { calculateNetworkAddress } from '../../../Services/service.controller.js';
import attendanceModel from '../../../../DB/Models/Attendance.model.js';

export const createEmployee = async (req, res) => {
    let employeeData = req.body;
    const { email, userName, phoneNumber, startChecking, endChecking } = employeeData;
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

    const createUser = await employeeModel.create(employeeData);
    return res.status(201).json({ message: "Employee added successfuly", createUser });

}

export const editIPAddress = async (req, res) => {
    const company = req.user;
    const { IPAddress, subnetMask } = req.body;
    company.IPAddress = calculateNetworkAddress(IPAddress, subnetMask);
    await company.save();
    return res.status(201).json({ message: "IP Address edited successfully", newIPAddress: company.IPAddress });
}

export const getActiveEmployee = async (req, res) => {
    const company = req.user;
    const active = await attendanceModel.find({ isCheckIn: 'true', isCheckOut: 'false' })
    .select('enterTime employeeId')
    .populate({
        path: 'employeeId',
        select: ' -_id userName',
        match: {companyId: company._id}
    });

    const activeEmp = await employeeModel.find({companyId: company._id})
    .select('fullName')
    .populate({
        
    })
    return res.json({active})
}
//checkin