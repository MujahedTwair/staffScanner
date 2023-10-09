import joi from 'joi';

export const createEmployeeSchema = {
    body: joi.object({
        fullName: joi.string().required(),
        userName: joi.string().alphanum().required(),
        phoneNumber: joi.number().required(),
        email: joi.string().email().required(),
        password: joi.string().min(8).max(20).required(),
        cPassword: joi.valid(joi.ref('password')).required(),
        creationDate: joi.string().required(),
        macAddress: joi.string().alphanum().required(),
        companyId: joi.string().required(),
        startChecking: joi.string().alphanum().required(),
        endChecking: joi.string().alphanum().required()

    }),

};