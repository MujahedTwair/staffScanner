import bcrypt from 'bcryptjs'
// import { isAllowedCheckOut } from '../../../Services/service.controller.js';
import { DateTime } from 'luxon';
import employeeModel from '../../../../DB/Models/Employee.model.js';
import attendanceModel from '../../../../DB/Models/Attendance.model.js';
import { getCheckOutDateTime } from '../../../Services/service.controller.js';

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

export const getActiveEmployees = async (req, res) => {
    const company = req.user;
    // const active = await attendanceModel.find({ isCheckIn: 'true', isCheckOut: 'false' })
    // .select('enterTime employeeId')
    // .populate({
    //     path: 'employeeId',
    //     select: ' -_id userName',
    //     match: {companyId: company._id}
    // });

    // const activeEmp = await employeeModel.find({companyId: company._id})
    // .select('fullName')
    // .populate({

    // })
    const activeEmployees = [];
    const employees = await employeeModel.find({companyId: company._id});
    for (const employee of employees){
        const lastCheckIn = await attendanceModel.findOne({ employeeId: employee._id}).sort({ createdAt: -1 });
        if (lastCheckIn?.isCheckIn && !lastCheckIn?.isCheckOut){
            if(isAllowedCheckOut(employee.startChecking, employee.endChecking, lastCheckIn.createdAt, new Date())){
                activeEmployees.push(employee);
            }
        }
    }

         

    
    return res.json({activeEmployees})
}
export const getActiveEmployee = async (req, res) => {
    const company = req.user;
    let sss = new String(new Date())
    // Use aggregation to efficiently retrieve active employees
    const activeEmployees = await attendanceModel.aggregate([
        {
          $match: {
            isCheckIn: true,
            isCheckOut: false,
          },
        },
        {
          $group: {
            _id: '$employeeId',
            lastCheckIn: { $max: '$createdAt' , endCheckDateTime: {$gt: new Date()}},
          },
        },
        {
          $lookup: {
            from: 'employees', // Replace with your employee collection name
            localField: '_id',
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
      ],);
    //   const filteredActiveEmployees = activeEmployees.filter((employee)=>{
    //     console.log(employee.endCheckDateTime, new Date());
    //     return new Date(employee.endCheckDateTime) >= new Date()
    //   })
    
    // const activeEmployeesDataOnly = activeEmployees.map((employee) => {
    //     const object = employee.employeeData;
    //     object.employeeId = employee._id;
    //     object.timeCheckIn = DateTime.fromJSDate(employee.lastCheckIn, { zone: 'Asia/Jerusalem'}).toLocaleString(DateTime.DATETIME_MED);
    //     return object;
    // });

    return res.json({ activeEmployees: activeEmployees });
  };
export const getIpAddress = async (req, res) => {
    const remoteAddress = req.connection.remoteAddress;
    const forwardedFor = req.headers['x-forwarded-for'];

    // console.log('Remote Address:', remoteAddress);
    // console.log('Forwarded-For Header:', forwardedFor);

    return res.status(201).json({ message: "success", Public_IP_Address: forwardedFor });
}

//checkin