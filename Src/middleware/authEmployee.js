import jwt from 'jsonwebtoken';
import employeeModel from '../../DB/Models/User.model.js';

const authEmployee = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.json({ messge: "token is required" });
    }
    const decoded = jwt.verify(authorization, process.env.LOGINEMPLOYEE);
    const employee = await employeeModel.findById((decoded.id));
    if (!employee) {
        return res.status(404).json({ message: "not register account" });
    }
    req.user = employee;
    next();
}

export default authEmployee;