import bcrypt from 'bcryptjs'
import { DateTime } from 'luxon';
import employeeModel from '../../../../DB/Models/Employee.model.js';
import attendanceModel from '../../../../DB/Models/Attendance.model.js';

export const createEmployee = async (req, res) => {
  let employeeData = req.body;
  const { email, userName, phoneNumber, startChecking, endChecking } = employeeData;
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

//checkin
