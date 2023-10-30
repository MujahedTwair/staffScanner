import joi from 'joi';

export const requestHolidaySchema = {
    body: joi.object({
        startDate: joi.string().required(),
        endDate: joi.string().required(),
        type: joi.string().valid('Sick', 'Vacation', 'Travelling').required(),
        paid: joi.boolean().required(),
        reason: joi.string().required()
    }),

};

export const approveHolidaySchema = {
    body: joi.object({
        status: joi.string().valid('Accepted', 'Rejected').required(),
        companyNote: joi.string().optional()
    }),
    params: joi.object({
        hashed_id: joi.string().required(),
    }),
};

export const deleteHolidaySchema = {
    params: joi.object({
        id: joi.string().required(),
    }),
};