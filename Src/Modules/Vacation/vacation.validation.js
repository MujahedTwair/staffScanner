import joi from "joi";
import { DateTime } from "luxon";

export const requestVacationSchema = {
  body: joi.object({
    startDate: joi.string().required(),
    endDate: joi.string().required(),
    type: joi.string().valid('Sick', 'Annual', 'Travelling').required(),
    paid: joi.boolean().required(),
    reason: joi.string(),
  }).custom((value, helpers) => {
    const startDate = DateTime.fromFormat(value.startDate, 'd/M/yyyy');
    const endDate = DateTime.fromFormat(value.endDate, 'd/M/yyyy');
    const now = DateTime.now().setZone('Asia/Jerusalem').startOf('day');
    if (startDate.isValid && endDate.isValid && startDate >= now && endDate >= startDate) {
      return value;
    } else {
      return helpers.error('End date must be a valid date and after the start date and not in the past');
    }
  }),
}

export const approveVacationSchema = {
  body: joi.object({
    status: joi.string().valid('Accepted', 'Rejected').required(),
    companyNote: joi.string().optional()
  }),
  params: joi.object({
    id: joi.string().required(),
  }),
}

export const deleteVacationSchema = {
  params: joi.object({
    id: joi.string().required(),
  }),
}

export const pageVacationSchema = {
  query: joi.object({
    page: joi.number().min(1),
    perPage: joi.number().min(3).max(20)
  })
}