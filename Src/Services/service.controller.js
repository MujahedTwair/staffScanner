import { DateTime } from "luxon";
import attendanceModel from "../../DB/Models/Attendance.model.js";

export const getShiftEndDateTime = (startCheckingTime, endCheckingTime) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });
    const [startHours, startMinutes] = startCheckingTime.split(':');
    const [currentHours, currentMinutes] = currentTime.split(':');
    const [endHours, endMinutes] = endCheckingTime.split(':');

    const shiftStart = new Date();
    shiftStart.setHours(shiftStart.getHours() - (currentHours - startHours), shiftStart.getMinutes() - (currentMinutes - startMinutes) );

    const shiftEnd = new Date();
    shiftEnd.setHours(shiftEnd.getHours() + (endHours - currentHours), shiftEnd.getMinutes() + (endMinutes - currentMinutes));

    return shiftEnd;
}

export const addCheckIn = async (employee, res) => {
    const shiftEndDateTime = getShiftEndDateTime(employee.startChecking, employee.endChecking);
    // const shiftEndDateTime = DateTime.fromJSDate(shiftEnd).setZone('Asia/Jerusalem');
    // console.log(shiftEndDateTime);
    const newCheckin = await attendanceModel.create({ isCheckIn: true, isCheckOut: false, enterTime: Date.now(), employeeId: employee._id, shiftEndDateTime });
    return res.status(201).json({ message: "success check in", newCheckin });
}

export const isWithinTimeRange = (start, end, current) => {
    if (start <= end) {
        return current >= start && current <= end;
    } else {
        return current >= start || current <= end;
    }
}

export const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? (page - 1) * limit : 0;

    return { limit, offset };
};