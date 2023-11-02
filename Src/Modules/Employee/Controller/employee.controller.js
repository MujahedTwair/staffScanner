import { DateTime } from 'luxon';
import attendanceModel from "../../../../DB/Models/Attendance.model.js";
import companyModel from "../../../../DB/Models/Company.model.js";
import { getShiftEndDateTime } from '../../../Services/service.controller.js';


export const checkIn = async (req, res) => {
    const employee = req.user;
    const { device_Id } = req.body;
    
    // const networkAddress = req.headers['x-forwarded-for'];
    const networkAddress = '188.225.231.226';
    if (await checkDeviceId(employee, device_Id, res) || await checkIPAddress(employee, networkAddress, res)) {
        return;
    }

    const { _id, startChecking, endChecking } = employee;
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, });
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
    const { device_Id } = req.body;
    // const networkAddress = req.headers['x-forwarded-for'];
    const networkAddress = '188.225.231.226';
    if (await checkDeviceId(employee, device_Id, res) || (await checkIPAddress(employee, networkAddress, res))) {
        return;
    }

    const { _id, startChecking, endChecking } = employee;
    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
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
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, });
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
    const { fullName, startChecking, endChecking } = employee;
    const start = convertToAMPM(startChecking);
    const end = convertToAMPM(endChecking);
    const currentDay = DateTime.now().setZone('Asia/Jerusalem').toFormat('cccc');
    const currentDate = DateTime.now().setZone('Asia/Jerusalem').toFormat('dd/MM/yyyy');

    return res.status(200).json({ fullName, start, end, currentDay, currentDate });
}

function isWithinTimeRange(start, end, current) {
    if (start <= end) {
        return current >= start && current <= end;
    } else {
        return current >= start || current <= end;
    }
}

function convertToAMPM(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours < 12 ? 'Am' : 'Pm';
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes} ${period}`;

    return formattedTime;
}

const addCheckIn = async (employee, res) => {
    const shiftEndDateTime = getShiftEndDateTime(employee.startChecking, employee.endChecking);
    const newCheckin = await attendanceModel.create({ isCheckIn: true, isCheckOut: false, enterTime: Date.now(), employeeId: employee._id, shiftEndDateTime });
    return res.status(201).json({ message: "success check in", newCheckin });
}

const checkDeviceId = async (employee, device_Id, res) => {
    if (employee.device_Id != device_Id) {
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