import { DateTime } from "luxon";
import attendanceModel from "../../DB/Models/Attendance.model.js";

export const getShiftEndDateTime = (startCheckingTime, endCheckingTime, currentTime) => {
    const [startHours, startMinutes] = startCheckingTime.split(':').map(ele => +ele);
    const [currentHours, currentMinutes] = currentTime.split(':').map(ele => +ele);
    const [endHours, endMinutes] = endCheckingTime.split(':').map(ele => +ele);

    // const shiftStart = DateTime.now().minus({ hours: minusTime(currentHours, startHours), minutes: (currentMinutes - startMinutes) });
    const shiftEnd = DateTime.now().plus({ hours: minusTime(endHours, currentHours), minutes: (endMinutes - currentMinutes) });

    return shiftEnd.startOf('minute');
}

const minusTime = (timeOne, timeTwo) => {
    if(timeOne >= timeTwo){
        return (timeOne - timeTwo);
    } else {
        return (timeOne - timeTwo + 24);
    }
}
export const addCheckIn = async (employee, currentTime, res) => {
    const shiftEndDateTime = getShiftEndDateTime(employee.startChecking, employee.endChecking, currentTime);
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