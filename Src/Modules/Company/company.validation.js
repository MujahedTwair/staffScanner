import joi from 'joi';
import { DateTime } from 'luxon';

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
};

export const editIPAddressSchema = {
    body: joi.object({
        IPAddress: joi.string().required(),
    }),

};

export const checkEmployeeSchema = {
    body: joi.object({
        employeeId: joi.string().required(),
    }),
};

export const solveCheckOutSchema = {
    body: joi.object({
        attendanceId: joi.string().length(24).required(),
        checkOutTime: joi.string().required()
    }),
};

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
        perPage: joi.number().min(3).max(20)
    })
}

export const getEmloyeeSchema = {
    params: joi.object({
        employeeId: joi.string().length(24).required()
    })
}

export const allReportsSchema = {
    query: joi.object({
        page: joi.number().min(1),
        perPage: joi.number().min(3).max(20),
        startDuration: joi.string(),
        endDuration: joi.string().when('startDuration', {
            is: joi.exist(),
            then: joi.required(),
            otherwise: joi.forbidden()
        })
    }).custom((value, helpers) => {
        if (value && value.startDuration && value.endDuration) {
            const startDuration = DateTime.fromFormat(value.startDuration, 'd/M/yyyy').setZone('Asia/Jerusalem').toMillis();
            const endDuration = DateTime.fromFormat(value.endDuration, 'd/M/yyyy').setZone('Asia/Jerusalem').toMillis();
            const now = DateTime.now().setZone('Asia/Jerusalem').startOf('day').toMillis();
            if (startDuration && endDuration && now >= endDuration && endDuration >= startDuration) {
                return value;
            } else {
                return helpers.error('End date must be a valid date and after the start date and not in the future');
            }
        }
    })
}

export const reportSchema = {
    query: joi.object({
        startDuration: joi.string(),
        endDuration: joi.string().when('startDuration', {
            is: joi.exist(),
            then: joi.required(),
            otherwise: joi.forbidden()
        })
    }).custom((value, helpers) => {
        if (value && value.startDuration && value.endDuration) {
            const startDuration = DateTime.fromFormat(value.startDuration, 'd/M/yyyy').setZone('Asia/Jerusalem').toMillis();
            const endDuration = DateTime.fromFormat(value.endDuration, 'd/M/yyyy').setZone('Asia/Jerusalem').toMillis();
            const now = DateTime.now().startOf('day').setZone('Asia/Jerusalem').toMillis();
            if (startDuration && endDuration && now >= endDuration && endDuration >= startDuration) {
                return value;
            } else {
                return helpers.error('End date must be a valid date and after the start date and not in the future');
            }
        }
    }),
    
    params: joi.object({
        employeeId: joi.string().length(24).required()
    })
}