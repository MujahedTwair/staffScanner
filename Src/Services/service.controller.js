export const  getShiftEndDateTime = (startCheckingTime, endCheckingTime) => {
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