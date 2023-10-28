import { DateTime } from 'luxon';
import attendanceModel from "../../../../DB/Models/Attendance.model.js";
import companyModel from "../../../../DB/Models/Company.model.js";
import employeeModel from "../../../../DB/Models/Employee.model.js";
//make IPAdress endpoint to change for company
export const checkIn = async (req, res) => {
    const employee = req.user;
    const { macAddress, IPAddress } = req.body;
    if (!employee.macAddress) {
        employee.macAddress = macAddress;
        await employee.save();
    } else {
        if (await checkMacAddress(employee, macAddress, res)) {
            return;
        };
    }
    if (await checkIPAddress(employee, IPAddress, res)) {
        return;
    }

    const { _id, startChecking, endChecking } = employee;
    console.log(`dslds ${startChecking},${endChecking}`);
    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    if (!isWithinTimeRange(startChecking, endChecking, currentTime)) {
        return res.status(409).json({ message: "you are out of range checking, rejected", startChecking, endChecking, currentTime });
    }

    /*let startHours = +employee.startChecking.hours;
    let startMinutes = +employee.startChecking.minutes + (startHours * 60);

    let startChecking = DateTime.now().setZone('Asia/Jerusalem').set({ hour: 0, minute: startMinutes, second: 0, millisecond: 0 });;
    if(startHours > 12){
        startChecking = startChecking.minus({ days: 1 });
    }
    let endHours = employee.endChecking.hours;
    let endMinutes = +employee.endChecking.minutes + (endHours * 60);
    let realEndMinutes = endMinutes - startMinutes ;
    if(realEndMinutes < 0){
        realEndMinutes += (24*60);
    }
    const endChecking = startChecking.plus({minutes: realEndMinutes});*/
    // if( DateTime.now() > startChecking && DateTime.now() < endChecking){
    //     return res.json('allowed')
    // }
    // return res.json('not allowed')
    // const updatedDateTime = startChecking.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });

    // startChecking.setHours(hours)

    const lastCheckIn = await attendanceModel.findOne({ employeeId: _id }).sort({ createdAt: -1 });
    if (lastCheckIn?.isCheckIn && !lastCheckIn?.isCheckOut) {
        return res.status(409).json({ message: "you are already checked in, if you want to check out go to checkOut button" });
    } else if (lastCheckIn?.isCheckIn && lastCheckIn?.isCheckOut || lastCheckIn == null) {
        const newCheckin = await attendanceModel.create({
            isCheckIn: true, isCheckOut: false, enterTime: Date.now(),
            employeeId: _id
        });
        return res.status(201).json({ message: "success check in", newCheckin });

    }
    return res.status(201).json({ message: "nnn success check in" });
}

export const checkOut = async (req, res) => {
    const employee = req.user;
    const { macAddress, IPAddress } = req.body;
    if (await checkMacAddress(employee, macAddress, res) || (await checkIPAddress(employee, IPAddress, res))) {
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

    if (lastCheckIn?.isCheckIn && lastCheckIn?.isCheckOut) {
        return res.status(409).json({ message: "you are not checked in yet, if you want to check in go to checkIn button" });
    } else if (lastCheckIn?.isCheckIn && !lastCheckIn?.isCheckOut) {

        const { createdAt } = lastCheckIn;
        const isOkCheckOut = isAllowedCheckOut(startChecking, endChecking, createdAt, new Date());
        if (!isOkCheckOut) {
            return res.status(409).json({ message: "This is not the same shift that checked in , please check in , Rejected" });
        }

        const newCheckOut = lastCheckIn;
        newCheckOut.isCheckOut = true;
        newCheckOut.leaveTime = Date.now();
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

function isWithinTimeRange(start, end, current) {
    if (start <= end) {
        return current >= start && current <= end;
    } else {
        return current >= start || current <= end;
    }
}

function isAllowedCheckOut(startCheckingTime, endCheckingTime, checkInTime, checkOutTime) {
    const [startHours,startMinutes] = startCheckingTime.split(':');
    const shiftStart = new Date(checkInTime);
    if(shiftStart.getHours() < startHours || shiftStart.getHours() == startHours && shiftStart.getMinutes() < startMinutes){
        shiftStart.setDate(shiftStart.getDate() - 1);
    }
    shiftStart.setHours(+startHours, +startMinutes, 0, 0);  

    const shiftEnd = new Date(checkInTime);
    shiftEnd.setHours(Number(endCheckingTime.split(':')[0]), Number(endCheckingTime.split(':')[1]), 0, 0);

    if (shiftEnd < shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
    }
    // console.log(startCheckingTime, endCheckingTime, checkInTime, checkOutTime, shiftStart, shiftEnd);
    return checkOutTime >= shiftStart && checkOutTime <= shiftEnd;
}

const checkMacAddress = async (employee, macAddress, res) => {
    if (employee.macAddress != macAddress) {
        return res.status(409).json({ message: "illegal attemp: This is not your phone, rejected" });
    }
}

const checkIPAddress = async (employee, IPAddress, res) => {
    const company = await companyModel.findOne({ id: employee.companyId });
    if (IPAddress != company.IPAddress) {
        return res.status(409).json({ message: "illegal attemp: Your not at company, rejected" });
    }
}