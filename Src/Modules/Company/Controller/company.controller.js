import { Types } from 'mongoose';
import bcrypt from 'bcryptjs'
import employeeModel from '../../../../DB/Models/User.model.js';

export const createEmployee = async (req, res) => {

    let employeeData = req.body;
    let employee = await employeeModel.findOne({ email: employeeData.email });

    if (employee) {
        return res.status(409).json({ message: "Email exists" });
    }
    employee = await employeeModel.findOne({ userName: employeeData.userName });

    if (employee) {
        return res.status(409).json({ message: "userName exists" });
    }

    const hashedPasswored = bcrypt.hashSync(employeeData.password, parseInt(process.env.SALT_ROUND));
    employeeData.password = hashedPasswored;
    employeeData.companyId = new Types.ObjectId('652090d6bbec881d521d7aa8');

    const createUser = await employeeModel.create(employeeData);
    return res.status(201).json({ message: "Employee added successfuly", createUser });

}