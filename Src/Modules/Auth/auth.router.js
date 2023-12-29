import express from "express";
const app = express();
import * as authController from "./auth.controller.js";
import validation from "../../middleware/validation.js";
import * as validators from "./auth.validation.js";
import asyncHandler from "../../middleware/errorHandling.js";

app.post('/signinEmployee', validation(validators.signinEmployeeSchema), asyncHandler(authController.signinEmpolyee));
app.post('/signinCompany', validation(validators.signinCompanySchema), asyncHandler(authController.signinCompany));
app.post('/signupCompany', asyncHandler(authController.signupCompany));
app.post('/array', validation(validators.testSchema), asyncHandler(authController.testPage));


export default app;