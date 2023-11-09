import express from "express";
const app = express();
import * as companyController from './Controller/company.controller.js';
import authCompany from "../../middleware/authCompany.js";
import validation from "../../middleware/validation.js";
import * as validationSchema from './company.validation.js'
import asyncHandler from "../../middleware/errorHandling.js";

app.post('/createEmployee', authCompany, validation(validationSchema.createEmployeeSchema), asyncHandler(companyController.createEmployee));
app.patch('/editIP', authCompany, validation(validationSchema.editIPAddressSchema), asyncHandler(companyController.editIPAddress));
app.get('/activeEmployees', authCompany, validation(validationSchema.getEmployeesSchema), asyncHandler(companyController.getActiveEmployee));
app.post('/checkInEmployee', authCompany, validation(validationSchema.checkEmployeeSchema), asyncHandler(companyController.checkInEmployee));
app.post('/checkOutEmployee', authCompany, validation(validationSchema.checkEmployeeSchema), asyncHandler(companyController.checkOutEmployee));
app.patch('/solveCheckOut', authCompany, validation(validationSchema.solveCheckOutSchema), asyncHandler(companyController.solveCheckOut));
app.get('/ip', authCompany, asyncHandler(companyController.getIpAddress));

app.get('/getEmployees', authCompany, validation(validationSchema.getEmployeesSchema), asyncHandler(companyController.getEmployees));
app.get('/getEmployee/:id', authCompany, asyncHandler(companyController.getSpeceficEmployee));
app.put('/updateEmployee/:employeeId', authCompany, validation(validationSchema.updateEmployeeSchema), asyncHandler(companyController.updateEmployee))
app.delete('/deleteEmployee/:employeeId', authCompany, validation(validationSchema.deleteEmployeeSchema), asyncHandler(companyController.deleteEmployee))

app.get('/generateQR', authCompany, asyncHandler(companyController.generateQr));
app.get('/QRImage', authCompany, asyncHandler(companyController.getQrImage));

export default app;
