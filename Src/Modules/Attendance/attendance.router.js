import express from "express";
const app = express();
import * as attendanceController from "./attendance.controller.js";
import * as validators from "./attendance.validation.js"
import authEmployee from "../../middleware/authEmployee.js";
import validation from "../../middleware/validation.js";
import asyncHandler from "../../middleware/errorHandling.js";
import authCompany from "../../middleware/authCompany.js";


app.get('/reportEmp', authEmployee, validation(validators.reportEmpSchema), asyncHandler(attendanceController.reportEmp));

app.get('/allReportsComp', authCompany, validation(validators.allReportsCompSchema), asyncHandler(attendanceController.allReportsComp));
app.get('/reportComp/:employeeId', authCompany, validation(validators.reportCompSchema), asyncHandler(attendanceController.reportComp),
    asyncHandler(attendanceController.reportEmp));
    
app.patch('/solveCheckOut', authCompany, validation(validators.solveCheckOutSchema), asyncHandler(attendanceController.solveCheckOut));

export default app;
