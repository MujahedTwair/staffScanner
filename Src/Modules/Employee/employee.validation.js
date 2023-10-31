import joi from 'joi';

export const checkWithRejexSchema = {
    body: joi.object({
        macAddress: joi.string().regex(/^(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})$/).required(),
        IPAddress: joi.string().ip({ version: ['ipv4'] }).required(),
        subnetMask: joi.string().ip({ version: ['ipv4'] }).required()
    }),

};

export const checkWithoutRejexSchema = {
    body: joi.object({
        macAddress: joi.string().required(),
        IPAddress: joi.string().required(),
        subnetMask: joi.string().required()
    }),
};