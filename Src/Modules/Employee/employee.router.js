import express from "express";
const app = express();
import * as employeeController from './Controller/employee.controller.js';
import validation from "../../middleware/validation.js";
import * as validationSchema from './employee.validation.js'
import asyncHandler from "../../middleware/errorHandling.js";
import authEmployee from "../../middleware/authEmployee.js";
import scanQR from "./scanQRMiddleware.js";
import { DateTime } from "luxon";

app.post('/checkIn', authEmployee, validation(validationSchema.checkWithoutRejexSchema), asyncHandler(employeeController.checkIn));
app.patch('/checkOut', authEmployee, validation(validationSchema.checkWithoutRejexSchema), asyncHandler(employeeController.checkOut));
app.get('/newCheck', authEmployee, asyncHandler(employeeController.newCheckin));
app.get('/getAllowedCheck', authEmployee, asyncHandler(employeeController.getAllowedCheck));
app.get('/welcome', authEmployee, asyncHandler(employeeController.welcome));

app.get('/accountInformation', authEmployee, asyncHandler(employeeController.getAccountInformation));
app.patch('/updatePassword', authEmployee, validation(validationSchema.updatePasswordSchema), asyncHandler(employeeController.updatePassword));

app.post('/checkInQR', authEmployee, validation(validationSchema.scanQRSchema), scanQR, asyncHandler(employeeController.checkIn));
app.patch('/checkOutQR', authEmployee, validation(validationSchema.scanQRSchema), scanQR, asyncHandler(employeeController.checkOut));

app.get('/ip', asyncHandler(employeeController.getIpAddress));

app.get('/reports', authEmployee, asyncHandler(employeeController.reports));

app.get('/testReports', (req, res)=>{
    const { startDuration, endDuration } = {
        startDuration: "5/5/2023",
        endDuration: "6/5/2023"
    };
    const startDate = DateTime.fromFormat(startDuration, 'd/M/yyyy').setZone('Asia/Jerusalem');
    const endDate = DateTime.fromFormat(endDuration, 'd/M/yyyy');
    const nowJ = DateTime.now().setZone('Asia/Jurusalem');
    const now = DateTime.now();
    return res.json({startDate,endDate,nowJ,now})
})
export default app;