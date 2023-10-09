import express from "express";
const app = express();
import * as companyController from './Controller/company.controller.js';
import authCompany from "../../middleware/authCompany.js";

app.post('/createEmployee', authCompany, companyController.createEmployee);

export default app;