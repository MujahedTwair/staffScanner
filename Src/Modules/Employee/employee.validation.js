import joi from "joi";

export const checkWithRejexSchema = {
    body: joi.object({
        deviceId: joi.string().regex(/^(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})$/).required(),
    }),

}

export const checkWithoutRejexSchema = {
    body: joi.object({
        deviceId: joi.string().required().max(16),
    }),
}

export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: joi.string().min(6).max(20).required(),
        newPassword: joi.string().min(6).max(20).required(),
        cPassword: joi.valid(joi.ref('newPassword')).required(),
    }),
}

export const scanQRSchema = {
    body: joi.object({
        deviceId: joi.string().required().max(16),
        QrId: joi.string().required().max(36)
    })
}
