import joi from 'joi';

export const createEmployeeSchema = {
    body: joi.object({
        fullName: joi.string().required(),
        userName: joi.string().alphanum().required(),
        phoneNumber: joi.number().required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(20).required(),
        cPassword: joi.valid(joi.ref('password')).required(),
        // creationDate: joi.string().required(),
        macAddress: joi.string(),
        // companyId: joi.string().required(),
        startChecking: joi.string().required(),
        endChecking: joi.string().required()

    }),
};

export const editIPAddressSchema = {
    body: joi.object({
        IPAddress: joi.string().required(),
    }),

};
