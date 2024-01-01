import joi from "joi";

export const createEmployeeSchema = {
    body: joi.object({
        fullName: joi.string().required(),
        userName: joi.string().alphanum().required(),
        phoneNumber: joi.number().required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(20).required(),
        cPassword: joi.valid(joi.ref('password')).required(),
        // creationDate: joi.string().required(),
        // companyId: joi.string().required(),
        startChecking: joi.string().required().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
        endChecking: joi.string().required().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)

    }),
}

export const editIPAddressSchema = {
    body: joi.object({
        IPAddress: joi.string().required(),
    }),

}

export const checkEmployeeSchema = {
    body: joi.object({
        employeeId: joi.string().required(),
    }),
}

export const updateEmployeeSchema = {
    params: joi.object({
        employeeId: joi.string().required()
    }),

    body: joi.object({
        fullName: joi.string(),
        phoneNumber: joi.number(),
        email: joi.string().email(),
        password: joi.string().min(6).max(20),
        cPassword: joi.valid(joi.ref('password')).when('password', {
            is: joi.exist(),
            then: joi.required(),
            otherwise: joi.forbidden()
        }),
        deviceId: joi.string().max(16),
        startChecking: joi.string(),
        endChecking: joi.string()
    }),
}

export const deleteEmployeeSchema = {
    params: joi.object({
        employeeId: joi.string().required()
    })
}

export const getEmployeesSchema = {
    query: joi.object({
        page: joi.number().min(1),
        perPage: joi.number().min(3).max(20),
        search: joi.string().max(50)
    })
}

export const getEmloyeeSchema = {
    params: joi.object({
        employeeId: joi.string().length(24).required()
    })
}
