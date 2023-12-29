import joi from "joi";
import { DateTime } from "luxon";

const dateValidation = (value, helpers) => {
    if (value && value.startDuration && value.endDuration) {
        const startDuration = DateTime.fromFormat(value.startDuration, 'd/M/yyyy').setZone('Asia/Jerusalem').startOf('day').toMillis();
        const endDuration = DateTime.fromFormat(value.endDuration, 'd/M/yyyy').setZone('Asia/Jerusalem').startOf('day').toMillis();
        const now = DateTime.now().setZone('Asia/Jerusalem').startOf('day').toMillis();
        if (startDuration && endDuration && now >= endDuration && endDuration >= startDuration) {
            return value;
        } else {
            return helpers.error('End date must be a valid date and after the start date and not in the future');
        }
    }
}

export const reportEmpSchema = {
    query: joi.object({
        startDuration: joi.string(),
        endDuration: joi.string().when('startDuration', {
            is: joi.exist(),
            then: joi.required(),
            otherwise: joi.forbidden()
        }),
        excel: joi.boolean()
    }).custom(dateValidation)
}

export const allReportsCompSchema = {
    query: joi.object({
        page: joi.number().min(1),
        perPage: joi.number().min(3).max(20),
        startDuration: joi.string(),
        endDuration: joi.string().when('startDuration', {
            is: joi.exist(),
            then: joi.required(),
            otherwise: joi.forbidden()
        })
    }).custom(dateValidation)
}

export const reportCompSchema = {
    query: reportEmpSchema.query,

    params: joi.object({
        employeeId: joi.string().length(24).required()
    })
}

export const solveCheckOutSchema = {
    body: joi.object({
        attendanceId: joi.string().length(24).required(),
        checkOutTime: joi.string().required()
    }),
}