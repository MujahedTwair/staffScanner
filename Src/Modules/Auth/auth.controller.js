import employeeModel from "../../../DB/Models/Employee.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import companyModel from "../../../DB/Models/Company.model.js";
import vacationModel from "../../../DB/Models/Vacation.model.js";
import { getPagination } from "../../Services/service.controller.js";

export const signupCompany = async (req, res) => {

    const { companyName, email, password, IPAddress } = req.body;
    const company = await companyModel.findOne({ email });

    if (company) {
        return res.status(409).json({ message: "Email exists" });
    }

    let hash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
    const createCompany = await companyModel.create({ companyName, email, password: hash, IPAddress });

    return res.status(201).json({ message: "success", createCompany });

}

export const signinEmpolyee = async (req, res) => {
    const { userName, password, deviceId } = req.body;
    const employee = await employeeModel.findOne({ userName, isDeleted: false });
    if (!employee) {
        return res.status(404).json({ message: "invaild username" });
    }
    const match = bcrypt.compareSync(password, employee.password);
    if (!match) {
        return res.status(404).json({ message: "invaild password" });
    }
    if (!employee.deviceId) {
        if (await employeeModel.findOne({ deviceId, isDeleted: false })) {
            return res.status(404).json({ message: "This device already saved for another employee, please signin by your phone for the first time" });
        }
        employee.deviceId = deviceId;
        await employee.save();
    }
    const token = jwt.sign({ id: employee._id }, process.env.LOGINEMPLOYEE);
    return res.status(200).json({ message: "success you are employee", token });
}

export const signinCompany = async (req, res) => {
    const { email, password } = req.body;
    const company = await companyModel.findOne({ email });
    if (!company) {
        return res.status(404).json({ message: "invaild email" })
    }
    const match = bcrypt.compareSync(password, company.password);
    if (!match) {
        return res.status(404).json({ message: "invaild password" })
    }
    const token = jwt.sign({ id: company._id }, process.env.LOGINCOMPANY);

    return res.status(200).json({ message: "success you are company", token })
}

export const testPage1 = async (req, res) => {
    const { page, perPage } = req.query;
    const vacations = await vacationModel.find().skip((page - 1) * perPage).limit(perPage);
    const totalDocuments = await vacationModel.countDocuments();
    const totalPages = Math.ceil(totalDocuments / perPage);
    return res.json({ vacations, page, totalPages });
}
export const testPage = async (req, res) => {
    const { page, perPage } = req.query;
    const { limit, offset } = getPagination(page, perPage);
    const vacations = await vacationModel.paginate({}, { offset, limit })
    return res.json({
        vacations: vacations.docs,
        page: vacations.page,
        totalPages: vacations.totalPages,
        totalVacations: vacations.totalDocs,
    });
}