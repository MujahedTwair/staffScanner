import express from "express";
const app = express();
import * as employeeController from './Controller/employee.controller.js';
import validation from "../../middleware/validation.js";
import * as validationSchema from './employee.validation.js'
import asyncHandler from "../../middleware/errorHandling.js";
import authEmployee from "../../middleware/authEmployee.js";

app.post('/checkIn', authEmployee, validation(validationSchema.checkWithoutRejexSchema), asyncHandler(employeeController.checkIn));
app.patch('/checkOut', authEmployee, validation(validationSchema.checkWithoutRejexSchema), asyncHandler(employeeController.checkOut));
app.get('/newCheck', authEmployee, asyncHandler(employeeController.newCheckin));
app.get('/getAllowedCheck', authEmployee, asyncHandler(employeeController.getAllowedCheck));
app.get('/welcome', authEmployee, asyncHandler(employeeController.welcome));

app.get('/accountInformation', authEmployee, asyncHandler(employeeController.getAccountInformation));
app.get('/logOut', authEmployee, asyncHandler(employeeController.logOut));
app.patch('/updatePassword', authEmployee, validation(validationSchema.updatePasswordSchema), asyncHandler(employeeController.updatePassword));

app.get('/ip', asyncHandler(employeeController.getIpAddress));

export default app;