import express from "express";
const app = express();
import * as companyController from './Controller/company.controller.js';
import authCompany from "../../middleware/authCompany.js";
import validation from "../../middleware/validation.js";
import * as validationSchema from './company.validation.js'
import asyncHandler from "../../middleware/errorHandling.js";

app.post('/createEmployee', authCompany, validation(validationSchema.createEmployeeSchema), asyncHandler(companyController.createEmployee));
app.patch('/editIP', authCompany, validation(validationSchema.editIPAddressSchema), asyncHandler(companyController.editIPAddress));
app.get('/activeEmployees', authCompany, asyncHandler(companyController.getActiveEmployee));

app.get('/ip', authCompany, asyncHandler(companyController.getIpAddress));

export default app;
