import express from "express";
const app = express();
import * as holidayController from './Controller/hoilday.controller.js';
import validation from "../../middleware/validation.js";
import * as validationSchema from './holiday.validation.js'
import asyncHandler from "../../middleware/errorHandling.js";
import authCompany from "../../middleware/authCompany.js";
import authEmployee from "../../middleware/authEmployee.js";

app.post('/requestHoliday', authEmployee, validation(validationSchema.requestHolidaySchema), asyncHandler(holidayController.requestHoliday));
app.get('/veiwHolidays', authEmployee, asyncHandler(holidayController.veiwHolidays));

app.get('/reviewHoliday', authCompany, asyncHandler(holidayController.reviewHolidays));
app.patch('/approveHoliday', authCompany, validation(validationSchema.approveHolidaySchema), asyncHandler(holidayController.approveHoliday));

export default app;