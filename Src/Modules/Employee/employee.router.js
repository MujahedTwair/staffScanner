import express from "express";
const app = express();
import * as employeeController from "./employee.controller.js";
import validation from "../../middleware/validation.js";
import * as validators from "./employee.validation.js";
import asyncHandler from "../../middleware/errorHandling.js";
import authEmployee from "../../middleware/authEmployee.js";
import scanQR from "./scanQRMiddleware.js";

app.post('/checkIn', authEmployee, validation(validators.checkWithoutRejexSchema), asyncHandler(employeeController.checkIn));
app.patch('/checkOut', authEmployee, validation(validators.checkWithoutRejexSchema), asyncHandler(employeeController.checkOut));
app.get('/newCheck', authEmployee, asyncHandler(employeeController.newCheckin));
app.get('/getAllowedCheck', authEmployee, asyncHandler(employeeController.getAllowedCheck));
app.get('/welcome', authEmployee, asyncHandler(employeeController.welcome));

app.get('/accountInformation', authEmployee, asyncHandler(employeeController.getAccountInformation));
app.patch('/updatePassword', authEmployee, validation(validators.updatePasswordSchema), asyncHandler(employeeController.updatePassword));

app.post('/checkInQR', authEmployee, validation(validators.scanQRSchema), scanQR, asyncHandler(employeeController.checkIn));
app.patch('/checkOutQR', authEmployee, validation(validators.scanQRSchema), scanQR, asyncHandler(employeeController.checkOut));

app.get('/ip', asyncHandler(employeeController.getIpAddress));


export default app;