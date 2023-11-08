import express from "express";
const app = express();
import * as authController from './Controller/auth.controller.js';
import validation from "../../middleware/validation.js";
import * as validationSchema from './auth.validation.js'
import asyncHandler from "../../middleware/errorHandling.js";

app.post('/signinEmployee', validation(validationSchema.signinEmployeeSchema), asyncHandler(authController.signinEmpolyee));
app.post('/signinCompany', validation(validationSchema.signinCompanySchema), asyncHandler(authController.signinCompany));
app.post('/signupCompany', asyncHandler(authController.signupCompany));
app.post('/array', validation(validationSchema.testSchema), asyncHandler(authController.testPage));


export default app;