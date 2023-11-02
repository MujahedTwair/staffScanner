import joi from 'joi';

export const checkWithRejexSchema = {
    body: joi.object({
        macAddress: joi.string().regex(/^(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})$/).required(),
    }),

};

export const checkWithoutRejexSchema = {
    body: joi.object({
        macAddress: joi.string().required(),
    }),
};