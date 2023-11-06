import companyModel from "../../../DB/Models/Company.model.js";

const scanQR = async (req, res, next) => {
    const { QrId } = req.body;
    const company = await companyModel.findById(req.user.companyId);
    if (!(QrId == company.QrId)) {
        return res.status(404).json({ message: "Invalid QR code" });
    }
    next();
}
export default scanQR;