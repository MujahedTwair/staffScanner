import express from "express";
const app = express();
import * as vacationController from "./vacation.controller.js";
import validation from "../../middleware/validation.js";
import * as validators from "./vacation.validation.js";
import asyncHandler from "../../middleware/errorHandling.js";
import authCompany from "../../middleware/authCompany.js";
import authEmployee from "../../middleware/authEmployee.js";

app.post('/requestVacation', authEmployee, validation(validators.requestVacationSchema), asyncHandler(vacationController.requestVacation));
app.get('/reviewVacations', authEmployee, validation(validators.pageVacationSchema), asyncHandler(vacationController.reviewVacations));
app.delete('/deleteVacation/:id', authEmployee, validation(validators.deleteVacationSchema), asyncHandler(vacationController.deleteVacation));
app.get('/vacationTypes', authEmployee, asyncHandler(vacationController.getVacationTypes));

app.get('/viewVacation', authCompany, validation(validators.pageVacationSchema), asyncHandler(vacationController.viewVacation));
app.get('/viewArchiveVacation', authCompany, validation(validators.pageVacationSchema), asyncHandler(vacationController.viewArchiveVacation));
app.patch('/approveVacation/:id', authCompany, validation(validators.approveVacationSchema), asyncHandler(vacationController.approveVacation));

export default app;