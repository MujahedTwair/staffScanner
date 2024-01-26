import vacationModel from "../../../DB/Models/Vacation.model.js";
import { getPagination } from "../../Services/service.controller.js";


export const requestVacation = async (req, res) => {
    const { startDate, endDate, type, paid, reason } = req.body;
    const vacation = await vacationModel.findOne({ employeeId: req.user._id, startDate, endDate, type, paid, reason });
    if (vacation) {
        return res.status(409).json({ message: "Duplicate vacation, Rejected" });
    }
    await vacationModel.create({ employeeId: req.user._id, startDate, endDate, type, paid, reason });

    return res.status(201).json({ message: "Vacation created successfully" });
}

export const reviewVacations = async (req, res) => {
    const { page, perPage } = req.query;
    const { limit, offset } = getPagination(page, perPage);
    const vacations = await vacationModel.paginate({ employeeId: req.user._id, isDeleted: false },
        {
            limit,
            offset,
            sort: { createdAt: -1 },
            select: '_id startDate endDate type paid reason companyNote status isDeleted isRead'
        })

    if (!vacations.totalDocs) {
        return res.status(404).json({ message: "No vacation requests found" });
    }
    const originalVacations = JSON.parse(JSON.stringify(vacations.docs));

    for (const vacation of vacations.docs) {
        if (!vacation.isRead && vacation.status != 'Waiting for approval') {
            // console.log(vacation);
            vacation.isRead = true;
            await vacation.save();
        }
    }

    return res.status(200).json({
        message: "success",
        originalVacations,
        page: vacations.page,
        totalPages: vacations.totalPages,
        totalVacations: vacations.totalDocs
    });
}

export const viewVacation = async (req, res) => {
    const { page, perPage } = req.query;
    const { limit, offset } = getPagination(page, perPage);
    const vacations = await vacationModel.paginate({ status: 'Waiting for approval', isDeleted: false },
        {
            limit,
            offset,
            select: '_id startDate endDate type paid reason status',
            populate: {
                path: 'employeeId',
                select: '-_id userName fullName'
            }
        })

    if (!vacations.totalDocs) {
        return res.status(404).json({ message: 'No vacation found ' });
    }

    return res.status(200).json({
        message: "success",
        allVacations: vacations.docs,
        page: vacations.page,
        totalPages: vacations.totalPages,
        totalVacations: vacations.totalDocs
    });
}

export const viewArchiveVacation = async (req, res) => {
    const { page, perPage } = req.query;
    const { limit, offset } = getPagination(page, perPage);
    const vacations = await vacationModel.paginate({ status: { $in: ['Accepted', 'Rejected'] } },
        {
            limit,
            offset,
            sort: { createdAt: -1 },
            select: '-_id startDate endDate type paid reason status',
            populate: {
                path: 'employeeId',
                select: '-_id userName fullName'
            }
        })
    if (!vacations.totalDocs) {
        return res.status(404).json({ message: 'No vacation found ' });
    }

    return res.status(200).json({
        message: "success",
        allVacations: vacations.docs,
        page: vacations.page,
        totalPages: vacations.totalPages,
        totalVacations: vacations.totalDocs
    });

}

export const approveVacation = async (req, res) => {
    const { status, companyNote } = req.body;
    const { id } = req.params;
    const vacation = await vacationModel.findByIdAndUpdate({ _id: id }, { status, companyNote }, { new: true })
        .select('-_id startDate endDate type paid reason status companyNote')
        .populate({
            path: 'employeeId',
            select: '-_id userName fullName'
        }
        )
    if (!vacation) {
        return res.status(404).json({ message: "No vacation found" });
    }
    return res.status(200).json({ message: "success the response is send" });
}

export const deleteVacation = async (req, res) => {
    const { id } = req.params;

    const vacation = await vacationModel.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });
    if (!vacation) {
        return res.status(404).json({ message: "No vacation found" });
    }
    return res.status(200).json({ message: "Vacation is deleted", id });
}

export const getVacationTypes = async (req, res) => {
    const types = ['Annual', 'Sick', 'Travelling'];
    return res.status(201).json({ message: "success", types });
}