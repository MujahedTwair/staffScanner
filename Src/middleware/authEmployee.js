import jwt from 'jsonwebtoken';
import employeeModel from '../../DB/Models/Employee.model.js';

const authEmployee = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARERKEY)) {
        return res.status(401).json({ message: "invalid authorization" });
    }
    const token = authorization.split(process.env.BEARERKEY)[1];

    let isVerified = true;
    let decoded;

    jwt.verify(token, process.env.LOGINEMPLOYEE, ((error, decodedToken) => {
        if (error) {
            isVerified = false;
            return res.status(401).json({ message: "invalid authorization", error });
        }
        decoded = decodedToken;
    }));
    
    if (isVerified) {

        const authEmployee = await employeeModel.findOne({ _id:decoded.id, isDeleted: false }).select("startChecking endChecking fullName email deviceId companyId");

        if (!authEmployee) {
            return res.status(401).json({ message: "not register account" })
        }
        req.user = authEmployee;
        next();
    }

}

export default authEmployee;