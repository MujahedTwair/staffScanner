import { DateTime, Duration } from "luxon";
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
    if (timeOne >= timeTwo) {
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

export const calculateHours = (milliseconds) => {
    const duration = Duration.fromObject({ milliseconds });
    const { hours } = duration.shiftTo('hours').toObject();
    return hours.toFixed(2);
}

export const defulatDuration = (startDuration, endDuration) => {
    if (startDuration && endDuration) {
        startDuration = DateTime.fromFormat(startDuration, 'd/M/yyyy').setZone('Asia/Jerusalem').startOf('day');
        endDuration = DateTime.fromFormat(endDuration, 'd/M/yyyy').setZone('Asia/Jerusalem').endOf('day');
    } else {
        startDuration = DateTime.now().setZone('Asia/Jerusalem').startOf('month');
        endDuration = DateTime.now().setZone('Asia/Jerusalem').endOf('day');
    }
    return { startDuration, endDuration };
}

export const convertToAMPM = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);

    const formattedTime = date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
    return formattedTime;
}