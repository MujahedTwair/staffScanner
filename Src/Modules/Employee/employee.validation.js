import joi from 'joi';

export const checkInSchema = {
    body: joi.object({
        macAddress: joi.string().required(),
        IPAddress: joi.string().required(),
        subnetMask: joi.string().required()
    }),

};

export const checkOutSchema = {
    body: joi.object({
        macAddress: joi.string().required(),
        IPAddress: joi.string().required(),
        subnetMask: joi.string().required()
    }),
};