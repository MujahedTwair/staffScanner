import express from "express";
const app = express();
import * as companyController from "./company.controller.js";
import authCompany from "../../middleware/authCompany.js";
import validation from "../../middleware/validation.js";
import * as validators from "./company.validation.js";
import asyncHandler from "../../middleware/errorHandling.js";

app.post('/createEmployee', authCompany, validation(validators.createEmployeeSchema), asyncHandler(companyController.createEmployee));
app.patch('/editIP', authCompany, validation(validators.editIPAddressSchema), asyncHandler(companyController.editIPAddress));
app.get('/activeEmployees', authCompany, validation(validators.getEmployeesSchema), asyncHandler(companyController.getActiveEmployee));
app.post('/checkInEmployee', authCompany, validation(validators.checkEmployeeSchema), asyncHandler(companyController.checkInEmployee));
app.post('/checkOutEmployee', authCompany, validation(validators.checkEmployeeSchema), asyncHandler(companyController.checkOutEmployee));
app.get('/ip', authCompany, asyncHandler(companyController.getIpAddress));

app.get('/getEmployees', authCompany, validation(validators.getEmployeesSchema), asyncHandler(companyController.getEmployees));
app.get('/getEmployee/:employeeId', authCompany, validation(validators.getEmloyeeSchema), asyncHandler(companyController.getSpeceficEmployee));
app.put('/updateEmployee/:employeeId', authCompany, validation(validators.updateEmployeeSchema), asyncHandler(companyController.updateEmployee));
app.delete('/deleteEmployee/:employeeId', authCompany, validation(validators.deleteEmployeeSchema), asyncHandler(companyController.deleteEmployee));

app.get('/generateQR', authCompany, asyncHandler(companyController.generateQr));
app.get('/QRImage', authCompany, asyncHandler(companyController.getQrImage));


export default app;
