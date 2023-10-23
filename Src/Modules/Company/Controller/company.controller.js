import { Types } from 'mongoose';
import bcrypt from 'bcryptjs'
import employeeModel from '../../../../DB/Models/Employee.model.js';

export const createEmployee = async (req, res) => {
    // return res.json({ user: req.user });
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

    const createUser = await employeeModel.create(employeeData);
    return res.status(201).json({ message: "Employee added successfuly", createUser });

}