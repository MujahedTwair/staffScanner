import attendanceModel from "../../DB/Models/Attendance.model.js";

export const getShiftEndDateTime = (startCheckingTime, endCheckingTime) => {
    const [startHours, startMinutes] = startCheckingTime.split(':');
    const shiftStart = new Date();
    if (shiftStart.getHours() < startHours || shiftStart.getHours() == startHours && shiftStart.getMinutes() < startMinutes) {
        shiftStart.setDate(shiftStart.getDate() - 1);
    }
    shiftStart.setHours(+startHours, +startMinutes, 0, 0);

    const shiftEnd = new Date();
    shiftEnd.setHours(Number(endCheckingTime.split(':')[0]), Number(endCheckingTime.split(':')[1]), 0, 0);

    if (shiftEnd < shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
    }
    // console.log(startCheckingTime, endCheckingTime, checkInTime, checkOutTime, shiftStart, shiftEnd);
    // return checkOutTime >= shiftStart && checkOutTime <= shiftEnd;
    // console.log(shiftStart,shiftEnd);
    return shiftEnd;
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