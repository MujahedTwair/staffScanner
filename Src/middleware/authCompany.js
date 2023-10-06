import jwt from 'jsonwebtoken';
import companyModel from '../../DB/Models/Company.model.js';

const authCompany = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.status(401).json({ message: "token is required" });
    }
    const decoded = jwt.verify(token, process.env.LOGINCOMPANY);
    const company = await companyModel.findById(decoded.id);
    if (!company) {
        return res.status(404).json({ message: "not register account " });
    }
    req.user = company;
    next();
}

export default authCompany;