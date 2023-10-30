import express from "express";
const app = express();
import * as holidayController from './Controller/hoilday.controller.js';
import validation from "../../middleware/validation.js";
import * as validationSchema from './holiday.validation.js'
import asyncHandler from "../../middleware/errorHandling.js";
import authCompany from "../../middleware/authCompany.js";
import authEmployee from "../../middleware/authEmployee.js";

app.post('/requestHoliday', authEmployee, validation(validationSchema.requestHolidaySchema), asyncHandler(holidayController.requestHoliday));
app.get('/reviewHolidays', authEmployee, asyncHandler(holidayController.reviewHolidays));
app.delete('/deleteHoliday/:id', authEmployee, validation(validationSchema.deleteHolidaySchema), asyncHandler(holidayController.deleteHoliday));
app.get('/holidayTypes', authEmployee, asyncHandler(holidayController.getHolidayTypes));

app.get('/viewHoliday', authCompany, asyncHandler(holidayController.viewHoliday));
app.get('/viewArchiveHoliday', authCompany, asyncHandler(holidayController.viewArchiveHoliday));
app.patch('/approveHoliday/:hashed_id', authCompany, validation(validationSchema.approveHolidaySchema), asyncHandler(holidayController.approveHoliday));

export default app;