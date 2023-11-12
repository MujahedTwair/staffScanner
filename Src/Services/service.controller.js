import { DateTime } from "luxon";
import attendanceModel from "../../DB/Models/Attendance.model.js";

export const getShiftEndDateTime = (startCheckingTime, endCheckingTime) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });
    const [startHours, startMinutes] = startCheckingTime.split(':').map(ele => +ele);
    const [currentHours, currentMinutes] = currentTime.split(':').map(ele => +ele);
    const [endHours, endMinutes] = endCheckingTime.split(':').map(ele => +ele);

    // const shiftStart = DateTime.now().minus({ hours: minusTime(currentHours, startHours), minutes: (currentMinutes - startMinutes) });
    const shiftEnd = DateTime.now().plus({ hours: minusTime(endHours, currentHours), minutes: (endMinutes - currentMinutes) });

    return shiftEnd.startOf('minute');
}

const minusTime = (start, end) => {
    if(start >= end){
        return (start - end);
    } else {
        return (start - end + 24);
    }
}
export const addCheckIn = async (employee, res) => {
    const shiftEndDateTime = getShiftEndDateTime(employee.startChecking, employee.endChecking);
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