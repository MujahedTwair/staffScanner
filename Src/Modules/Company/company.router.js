import express from "express";
const app = express();
import * as companyController from './Controller/company.controller.js';
import authCompany from "../../middleware/authCompany.js";
import validation from "../../middleware/validation.js";
import * as validationSchema from './company.validation.js'

app.post('/createEmployee', authCompany, validation(validationSchema.createEmployeeSchema), companyController.createEmployee);

export default app;