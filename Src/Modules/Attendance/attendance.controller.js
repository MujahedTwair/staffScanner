import { DateTime } from "luxon";
import employeeModel from "../../../DB/Models/Employee.model.js";
import { calculateHours, convertToAMPM, defulatDuration, getCheckOutDate, getPagination, isWithinTimeRange } from "../../Services/service.controller.js";
import { printExcel } from "../../Services/excel.js";
import attendanceModel from "../../../DB/Models/Attendance.model.js";

export const reportEmp = async (req, res) => {
    const { _id } = req.user;
    let { startDuration, endDuration, excel } = req.query;
    ({ startDuration, endDuration } = defulatDuration(startDuration, endDuration));

    const employee = await employeeModel.findOne({ _id, isDeleted: false, })
        .populate({
            path: 'attendance',
            match: {
                createdAt: {
                    $gte: startDuration,
                    $lte: endDuration,
                },
            },
        });
    let allMilliSeconds = 0;
    let days = [];
    let notCorrectChecks = [];
    const { attendance } = employee;
    for (const element of attendance) {
        if (element.leaveTime) {
            const milliseconds = element.leaveTime - element.enterTime;
            const hours = calculateHours(milliseconds);
            const day = DateTime.fromJSDate(element.createdAt, { zone: "Asia/Jerusalem" }).toFormat('d/M/yyyy');
            const enterTime = DateTime.fromMillis(element.enterTime, { zone: "Asia/Jerusalem" }).toFormat('h:mm a, d/M/yyyy');
            const leaveTime = DateTime.fromMillis(element.leaveTime, { zone: "Asia/Jerusalem" }).toFormat('h:mm a, d/M/yyyy');
            days.push({ day, enterTime, leaveTime, hours, enterTimestamp: element.enterTime });
            allMilliSeconds += milliseconds;

        } else {
            const day = DateTime.fromJSDate(element.createdAt, { zone: "Asia/Jerusalem" }).toFormat('d/M/yyyy');
            const enterTime = DateTime.fromMillis(element.enterTime, { zone: 'Asia/Jerusalem' }).toFormat('h:mm a, d/M/yyyy');
            const shiftEnd = DateTime.fromJSDate(element.shiftEndDateTime, { zone: "Asia/Jerusalem" }).toFormat('h:mm a, d/M/yyyy');
            const attendaceId = req.role == 'company' ? element.id : undefined;
            notCorrectChecks.push({ day, enterTime, shiftEnd, attendaceId, enterTimestamp: element.enterTime });
        }
    }

    days = [...days].sort((a, b) => a.enterTimestamp - b.enterTimestamp);
    days.forEach(ele => delete ele.enterTimestamp);
    notCorrectChecks = [...notCorrectChecks].sort((a, b) => a.enterTimestamp - b.enterTimestamp);
    notCorrectChecks.forEach(ele => delete ele.enterTimestamp);
    const hours = calculateHours(allMilliSeconds);
    const { userName, fullName } = employee;

    if (excel == 'true') {
        return await printExcel({
            userName,
            fullName,
            days,
            totalHours: hours,
            notCorrectChecks,
            startDuration: startDuration.toFormat('d/M/yyyy'),
            endDuration: endDuration.toFormat('d/M/yyyy'),
        }, res);
    }
    return res.status(200).json({
        message: "success",
        userName,
        fullName,
        days,
        totalHours: hours,
        notCorrectChecks,
        startDuration: startDuration.toFormat('d/M/yyyy'),
        endDuration: endDuration.toFormat('d/M/yyyy'),
        allMilliSeconds
    });
}

export const allReportsComp = async (req, res) => {
    const { page, perPage } = req.query;
    const { limit, offset } = getPagination(page || 1, perPage);
    const companyId = req.user.id;
    let { startDuration, endDuration } = req.query;
    ({ startDuration, endDuration } = defulatDuration(startDuration, endDuration));

    const employees = await employeeModel.paginate({ companyId, isDeleted: false },
        {
            limit, offset, select: 'fullName userName phoneNumber',
            populate: {
                path: 'attendance',
                select: '-updatedAt -__v ',
                match: {
                    createdAt: {
                        $gte: startDuration,
                        $lte: endDuration
                    }
                }
            }
        });
    if (!employees.totalDocs) {
        return res.status(400).json({ message: "Employees not found" });
    }

    const mappedEmployees =
        employees.docs.map((employee) => {
            let allMilliSeconds = 0;
            let notCorrectChecks = 0;
            let correctChecks = 0;
            const attendaces = employee.attendance;
            for (const attendance of attendaces) {
                if (attendance.leaveTime) {
                    const milliseconds = attendance.leaveTime - attendance.enterTime;
                    allMilliSeconds += milliseconds;
                    correctChecks++;
                } else {
                    notCorrectChecks++;
                }
            }
            const totalHours = calculateHours(allMilliSeconds);
            return {
                name: employee.fullName,
                userName: employee.userName,
                phoneNumber: employee.phoneNumber,
                totalHours,
                correctChecks,
                notCorrectChecks,
                employeeId: employee.id
            }
        })
    return res.status(201).json({
        message: "success",
        employees: mappedEmployees,
        startDuration: startDuration.toFormat('d/M/yyyy'),
        endDuration: endDuration.toFormat('d/M/yyyy'),
        page: employees.page,
        totalPages: employees.totalPages,
        totalEmployees: employees.totalDocs
    });
}

export const reportComp = async (req, res, next) => {
    const { employeeId } = req.params;
    const employee = await employeeModel.findOne({ _id: employeeId, companyId: req.user.id });
    if (!employee) {
        return res.status(409).json({ message: "Employee not found" });
    }
    req.user._id = employeeId;
    req.role = 'company';
    next();
}

export const solveCheckOut = async (req, res) => {
    const { attendanceId, checkOutTime } = req.body;
    const attendance = await attendanceModel.findById(attendanceId);
    if (!attendance) {
        return res.status(404).json({ message: "Attendance not found" });
    }
    if (attendance.isCheckOut) {
        return res.status(409).json({ message: "This attendace is already checked out, rejected" });
    }
    const enterTimeHours = DateTime.fromMillis(attendance.enterTime, { zone: 'Asia/Jerusalem' }).toFormat('HH:mm');
    const shiftEndTime = DateTime.fromJSDate(attendance.shiftEndDateTime, { zone: 'Asia/Jerusalem' }).toFormat('HH:mm');
    if (!isWithinTimeRange(enterTimeHours, shiftEndTime, checkOutTime)) {
        return res.status(400).json({
            message: `Check out time must be between enterTime (${convertToAMPM(enterTimeHours)}), ` +
                `and shiftEndTime (${convertToAMPM(shiftEndTime)}), Rejected`
        });
    }
    const checkOutDate = getCheckOutDate(shiftEndTime, attendance.shiftEndDateTime, checkOutTime);
    attendance.leaveTime = checkOutDate.toMillis();
    attendance.isCheckOut = true;
    attendance.shiftEndDateTime = undefined;
    await attendance.save();

    return res.status(201).json({ message: `The check-out done successfully at ${convertToAMPM(checkOutTime)}`, attendance });
}