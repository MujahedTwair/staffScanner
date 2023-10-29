import jwt from 'jsonwebtoken';
import companyModel from '../../DB/Models/Company.model.js';

const authCompany = async (req, res, next) => {

    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARERKEY)) {
        return res.status(401).json({ message: "invalid authorization" });
    }
    const token = authorization.split(process.env.BEARERKEY)[1];

    let isVerified = true;
    let decoded;

    jwt.verify(token, process.env.LOGINCOMPANY, ((error, decodedToken) => {
        if (error) {
            isVerified = false;
            return res.status(401).json({ message: "invalid authorization", error });
        }
        decoded = decodedToken;
    }));

    if (isVerified) {

        const authCompany = await companyModel.findById(decoded.id).select("companyName email IPAddress");

        if (!authCompany) {
            return res.status(401).json({ message: "not register account" });
        }
        req.user = authCompany;
        next();
    }

}

export default authCompany;