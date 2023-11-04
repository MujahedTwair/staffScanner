import bcrypt from 'bcryptjs'
import { DateTime } from 'luxon';
import employeeModel from '../../../../DB/Models/Employee.model.js';
import attendanceModel from '../../../../DB/Models/Attendance.model.js';
import { addCheckIn, isWithinTimeRange } from '../../../Services/service.controller.js';

export const createEmployee = async (req, res) => {
  let employeeData = req.body;
  const { email, userName, phoneNumber } = employeeData;
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
  employeeData.isDeleted = false;
  const createUser = await employeeModel.create(employeeData);
  return res.status(201).json({ message: "Employee added successfuly", createUser });

}

export const editIPAddress = async (req, res) => {
  const company = req.user;
  const { IPAddress } = req.body;
  company.IPAddress = IPAddress;
  await company.save();
  return res.status(201).json({ message: "IP Address edited successfully", newIPAddress: company.IPAddress });
}

export const getActiveEmployee = async (req, res) => {
  const company = req.user;

  const activeEmployees = await attendanceModel.aggregate([
    {
      $match: {
        isCheckIn: true,
        isCheckOut: false,
        shiftEndDateTime: { $gte: new Date() }
      },
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employeeData',
      },
    },
    {
      $unwind: '$employeeData',
    },
    {
      $match: {
        'employeeData.companyId': company._id,
        'employeeData.isDeleted': false,
      },
    },
    {
      $project: {
        enterTime: 1,
        employeeId: 1,
        shiftEndDateTime: 1,
        'employeeData._id': 1,
        'employeeData.fullName': 1,
        'employeeData.userName': 1,
        'employeeData.phoneNumber': 1,
      },
    },
  ]);

  //ISP - can give you a service : Fixed IP

  const filteredActiveEmployees = activeEmployees.map((employee) => {
    delete employee._id;
    delete employee.employeeData._id;
    employee.enterTime = DateTime.fromMillis(employee.enterTime, { zone: 'Asia/Jerusalem' }).toFormat('d/M/yyyy, h:mm a');
    employee.shiftEndDateTime = DateTime.fromJSDate(employee.shiftEndDateTime, { zone: 'Asia/Jerusalem' }).toFormat('d/M/yyyy, h:mm a');
    return employee;
  });
  return res.json({ activeEmployees: filteredActiveEmployees });
}

export const getIpAddress = async (req, res) => {
  const remoteAddress = req.connection.remoteAddress;
  const forwardedFor = req.headers['x-forwarded-for'];

  // console.log('Remote Address:', remoteAddress);
  // console.log('Forwarded-For Header:', forwardedFor);

  return res.status(201).json({ message: "success", Public_IP_Address: forwardedFor });
}

export const checkInEmployee = async (req, res) => {
  const company = req.user;
  const { employeeId } = req.body;
  const employee = await employeeModel.findOne({ _id: employeeId, companyId: company._id, isDeleted: false });
  const { startChecking, endChecking } = employee;
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, });
  if (!isWithinTimeRange(startChecking, endChecking, currentTime)) {
    return res.status(409).json({ message: `The employee ${employee.fullName} out of range checking, rejected`, startChecking, endChecking, currentTime });
  }
  const lastCheckIn = await attendanceModel.findOne({ employeeId }).sort({ createdAt: -1 });
  if (!lastCheckIn) {
    return await addCheckIn(employee, res);
  } else if (lastCheckIn.isCheckIn && !lastCheckIn.isCheckOut) {
    if (new Date() <= lastCheckIn.shiftEndDateTime) {
      return res.status(409).json({ message: `The employee ${employee.fullName} already checked in, if you want to check out go to checkOut button` });
    } else {
      return await addCheckIn(employee, res);
    }
  } else if (lastCheckIn.isCheckIn && lastCheckIn.isCheckOut) {
    return await addCheckIn(employee, res);
  }
  return res.status(201).json({ message: "Nothing allowed, maybe something wrong, rejected" });

}

export const checkOutEmployee = async (req, res) => {
  const company = req.user;
  const { employeeId } = req.body;
  const employee = await employeeModel.findOne({ _id: employeeId, companyId: company._id, isDeleted: false });
  const { startChecking, endChecking } = employee;
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, });

  if (!(isWithinTimeRange(startChecking, endChecking, currentTime))) {
    return res.status(409).json({ message: `The employee ${employee.fullName} out of range checking, rejected`, startChecking, endChecking, currentTime });
  }

  const lastCheckIn = await attendanceModel.findOne({ employeeId }).sort({ createdAt: -1 });

  if (!lastCheckIn || (lastCheckIn.isCheckIn && lastCheckIn.isCheckOut)) {
    return res.status(409).json({ message: `The employee ${employee.fullName} is not checked in yet, if you want to check in go to checkIn button` });
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

export const solveCheckOut = async (req, res) => {
  const { attendanceId, checkOutDate } = req.body;
  const leaveTime = new Date(checkOutDate);
  const attendance = await attendanceModel.findById(attendanceId);
  if(!attendance){
    return res.status(400).json({ message: "Attendance not found" });
  }
  if (attendance.isCheckOut) {
    return res.status(409).json({ message: "This attendace is already checked out, rejected" });
  }
  if (leaveTime > attendance.shiftEndDateTime) {
    return res.status(409).json({ message: "It's not allowed to check out after this employee shift end" });
  }
  attendance.leaveTime = leaveTime.getTime();
  attendance.isCheckOut = true;
  attendance.shiftEndDateTime = undefined;
  await attendance.save();
  return res.status(201).json({ message: "The check-out done successfully ", attendance });
}

export const getEmployee = async (req, res) => {
  const employees = await employeeModel.find({ isDeleted: false }).select('fullName _id userName')
  if (!employees) {
    return res.status(400).json({ message: "Employees not found" });
  }

  return res.status(201).json({ message: "success", employees });

}

export const updateEmployee = async (req, res) => {
  const { employeeId } = req.params;
  const { password, ...updatedData } = req.body;
  if (password) {
    const hashNewPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
    updatedData.password = hashNewPassword;
  }
  const updatedEmployee = await employeeModel.findOneAndUpdate({ _id: employeeId, isDeleted: false }, updatedData, { new: true });

  if (!updatedEmployee) {
    return res.status(400).json({ message: "Employee not found" });
  }
  return res.status(200).json({ message: "Successfully updated", updatedEmployee });
}

export const deleteEmployee = async (req, res) => {
  const { employeeId } = req.params;
  const employee = await employeeModel.findOneAndUpdate({ _id: employeeId, isDeleted: false }, { isDeleted: true }, { new: true });

  if (!employee) {
    return res.status(402).json({ message: "Employees not found" });
  }
  return res.status(201).json({ message: "success", employee });
}
//checkin
