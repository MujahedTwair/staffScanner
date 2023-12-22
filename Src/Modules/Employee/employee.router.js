import express from "express";
const app = express();
import * as employeeController from './Controller/employee.controller.js';
import validation from "../../middleware/validation.js";
import * as validationSchema from './employee.validation.js'
import asyncHandler from "../../middleware/errorHandling.js";
import authEmployee from "../../middleware/authEmployee.js";
import scanQR from "./scanQRMiddleware.js";
import ExcelJS from 'exceljs'
import { DateTime } from "luxon";
import employeeModel from "../../../DB/Models/Employee.model.js";
import attendanceModel from "../../../DB/Models/Attendance.model.js";
import { calculateHours, defulatDuration } from "../../Services/service.controller.js";

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

app.get('/reports', authEmployee, validation(validationSchema.reportsSchema), asyncHandler(employeeController.reports));

app.get('/testReports222', async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('First Sheet');


    //------------------------------------------------------------------------------------------------------------
    const _id = '654b85c70a456b470a39d310';
    let { startDuration, endDuration } = req.query;
    ({ startDuration, endDuration } = defulatDuration(startDuration, endDuration));

    const employee = await employeeModel.findOne({ _id, isDeleted: false, })
        .populate({
            path: 'attendance',
            match: {
                createdAt: {
                    $gte: startDuration,
                    $lte: endDuration,
                },
            },
        });
    let allMilliSeconds = 0;
    let days = [];
    let notCorrectChecks = [];
    const { attendance } = employee;
    for (const element of attendance) {
        if (element.leaveTime) {
            const milliseconds = element.leaveTime - element.enterTime;
            const hours = calculateHours(milliseconds);
            const day = DateTime.fromJSDate(element.createdAt, { zone: "Asia/Jerusalem" }).toFormat('d/M/yyyy');
            const enterTime = DateTime.fromMillis(element.enterTime, { zone: "Asia/Jerusalem" }).toFormat('h:mm a, d/M/yyyy');
            const leaveTime = DateTime.fromMillis(element.leaveTime, { zone: "Asia/Jerusalem" }).toFormat('h:mm a, d/M/yyyy');
            days.push({ day, enterTime, leaveTime, hours, enterTimestamp: element.enterTime });
            allMilliSeconds += milliseconds;

        } else {
            const day = DateTime.fromJSDate(element.createdAt, { zone: "Asia/Jerusalem" }).toFormat('d/M/yyyy');
            const enterTime = DateTime.fromMillis(element.enterTime, { zone: 'Asia/Jerusalem' }).toFormat('h:mm a, d/M/yyyy');
            const shiftEnd = DateTime.fromJSDate(element.shiftEndDateTime, { zone: "Asia/Jerusalem" }).toFormat('h:mm a, d/M/yyyy');
            const attendaceId = req.role == 'company' ? element.id : undefined;
            notCorrectChecks.push({ day, enterTime, shiftEnd, attendaceId, enterTimestamp: element.enterTime });
        }
    }

    days = [...days].sort((a, b) => a.enterTimestamp - b.enterTimestamp);
    days.forEach(ele => delete ele.enterTimestamp);
    notCorrectChecks = [...notCorrectChecks].sort((a, b) => a.enterTimestamp - b.enterTimestamp);
    notCorrectChecks.forEach(ele => delete ele.enterTimestamp);
    const hours = calculateHours(allMilliSeconds);
    const { userName, fullName } = req.role == 'company' ? employee : { userName: 'nawas', fullName: 'ahmad khaled' };
    return res.status(200).json({
        message: "success",
        userName,
        fullName,
        days,
        totalHours: hours,
        notCorrectChecks,
        startDuration: startDuration.toFormat('d/M/yyyy'),
        endDuration: endDuration.toFormat('d/M/yyyy'),
        allMilliSeconds
    });
    worksheet.columns = [
        { header: 'Day', key: 'day', width: 12 },
        { header: 'Enter Time', key: 'enterTime', width: 20 },
        { header: 'Leave Time', key: 'leaveTime', width: 20 },
        { header: 'Hours', key: 'hours', width: 10 },
    ];


    // Add data to the worksheet
    worksheet.addRow(); // Add an empty row for spacing

    // Merge cells and add user information
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Attendance Report';
    titleCell.alignment = { horizontal: 'center' };
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
        fgColor: { argb: '4F81BD' }, // Background color
    };
    const userInformation = [
        ['Username:', userName],
        ['Full Name:', fullName],
        ['Start Duration:', startDuration.toFormat('d/M/yyyy')],
        ['End Duration:', endDuration.toFormat('d/M/yyyy')],
        ['Total Hours:', hours],
    ];
    userInformation.forEach((info) => {
        worksheet.addRow(info).font = { color: { argb: '4F81BD' } }; // Font color
    });

    worksheet.addRow();


    for (const day of days) {
        worksheet.addRow([day.day, day.enterTime, day.leaveTime, day.hours]);
    }


    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=mujahed.xlsx');

    // Write the workbook to the response stream
    await workbook.xlsx.write(res);
    /*  res.status(200).json({
         message: "success",
         userName,
         fullName,
         days,
         totalHours: hours,
         notCorrectChecks,
         startDuration: startDuration.toFormat('d/M/yyyy'),
         endDuration: endDuration.toFormat('d/M/yyyy'),
         allMilliSeconds
     });*/
    return res.end();


    //------------------------------------------------------------------------------------------------------------

    // const startDuration = DateTime.fromFormat('5/11/2023', 'd/M/yyyy').setZone('Asia/Jerusalem').startOf('day');
    // const endDuration = DateTime.fromFormat('15/11/2023', 'd/M/yyyy').setZone('Asia/Jerusalem').startOf('day');
    // const employee = await employeeModel.findOne({
    //     _id: '654b85c70a456b470a39d310',
    //     isDeleted: false,
    // }).populate({
    //     path: 'attendance',
    //     match: {
    //       createdAt: {
    //         $gte: startDuration.toJSDate(),
    //         $lte: endDuration.toJSDate(),
    //       },
    //     },
    //   });

    // const employee = await employeeModel.findOne({ _id: '654b85c70a456b470a39d310', isDeleted: false }).populate('attendance');
    // const { attendance } = employee;

    // return res.json({ employee })
    // // const { startDuration, endDuration } = {
    //     startDuration: "5/5/2023",
    //     endDuration: "6/5/2023"
    // };
    // const startDate = DateTime.fromFormat(startDuration, 'd/M/yyyy').setZone('Asia/Jerusalem');
    // const endDate = DateTime.fromFormat(endDuration, 'd/M/yyyy');
    // const nowJ = DateTime.now().setZone('Asia/Jerusalem');
    // const now = DateTime.now();
    // const jsDate = new Date();
    // const jsDateJ = new Date()
    // return res.json({ startDate, endDate, nowJ, now, jsDate, jsDateJ })
})

app.get('/test', (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Adding headers
    worksheet.addRow(['ID', 'Name', 'Email']);

    // Adding some data
    for (let i = 1; i <= 10; i++) {
        worksheet.addRow([i, `Name ${i}`, `Email ${i}@example.com`]);
    }

    // Set header styles
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'lightGray',
            fgColor: { argb: 'FFFFFF00' },
            bgColor: { argb: 'FF0000FF' },
        };
        cell.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' },
            size: 14,
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // Generate and download the excel file
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=Excel.xlsx'
    );

    workbook.xlsx.write(res).then(() => {
        res.end();
    });
})

app.get('/testReports', async (req, res) => {
    const userName = 'nawas';
    const fullName = 'ahmad khaled';
    const days = [
        {
            day: "1/11/2023",
            enterTime: "8:00 AM, 1/11/2023",
            leaveTime: "4:00 PM, 1/11/2023",
            hours: "8.00"
        },
        {
            day: "2/11/2023",
            enterTime: "8:00 AM, 2/11/2023",
            leaveTime: "4:00 PM, 2/11/2023",
            hours: "8.00"
        },
        {
            day: "3/11/2023",
            enterTime: "8:00 AM, 3/11/2023",
            leaveTime: "4:00 PM, 3/11/2023",
            hours: "8.00"
        },
        {
            day: "4/11/2023",
            enterTime: "8:00 AM, 4/11/2023",
            leaveTime: "4:00 PM, 4/11/2023",
            hours: "8.00"
        },
        {
            day: "5/11/2023",
            enterTime: "8:00 AM, 5/11/2023",
            leaveTime: "4:00 PM, 5/11/2023",
            hours: "8.00"
        },
        {
            day: "6/11/2023",
            enterTime: "8:00 AM, 6/11/2023",
            leaveTime: "4:00 PM, 6/11/2023",
            hours: "8.00"
        },
        {
            day: "7/11/2023",
            enterTime: "8:00 AM, 7/11/2023",
            leaveTime: "4:00 PM, 7/11/2023",
            hours: "8.00"
        },
        {
            day: "8/11/2023",
            enterTime: "8:00 AM, 8/11/2023",
            leaveTime: "4:00 PM, 8/11/2023",
            hours: "8.00"
        },
        {
            day: "9/11/2023",
            enterTime: "8:00 AM, 9/11/2023",
            leaveTime: "4:00 PM, 9/11/2023",
            hours: "8.00"
        },
        {
            day: "10/11/2023",
            enterTime: "8:00 AM, 10/11/2023",
            leaveTime: "4:00 PM, 10/11/2023",
            hours: "8.00"
        },
        {
            day: "12/11/2023",
            enterTime: "8:00 AM, 12/11/2023",
            leaveTime: "4:00 PM, 12/11/2023",
            hours: "8.00"
        },
        {
            day: "13/11/2023",
            enterTime: "8:00 AM, 13/11/2023",
            leaveTime: "4:00 PM, 13/11/2023",
            hours: "8.00"
        }
    ];
    const totalHours = "96.00";
    const notCorrectChecks = [
        {
            day: "10/11/2023",
            enterTime: "8:00 AM, 10/11/2023",
            shiftEnd: "1:55 AM, 13/11/2023"
        },
        {
            day: "17/11/2023",
            enterTime: "11:37 PM, 17/11/2023",
            shiftEnd: "4:00 AM, 18/11/2023"
        },
        {
            day: "19/11/2023",
            enterTime: "1:54 AM, 19/11/2023",
            shiftEnd: "4:00 AM, 19/11/2023"
        }
    ];
    const startDuration = "1/11/2023";
    const endDuration = "26/11/2023";

    //----------------------------------------------

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.addRow(['REPORT']);
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').style = { font: { bold: true, name: 'Felix Titling', size: 18, underline: true, color: { argb: 'FF244062' } }, alignment: { vertical: 'bottom', horizontal: 'center' } };
    worksheet.addRow();
    worksheet.addRow(['', 'userName', userName]);
    worksheet.getCell('B3').style = { font: { bold: true, name: 'Bell MT', size: 16, underline: true, color: { argb: 'FF215967' } } };
    worksheet.getCell('C3').style = { font: { bold: true, name: 'Bell MT', size: 16, color: { argb: 'FF000000' } }, alignment: { vertical: 'bottom', horizontal: 'center' } };
    worksheet.getColumn('A').width = 2.67;
    worksheet.getColumn('B').width = 23.78;
    worksheet.getColumn('C').width = 23.78;
    worksheet.getColumn('D').width = 23.78;
    worksheet.getColumn('F').width = 7;
    worksheet.getColumn('E').width = 4.67;
    worksheet.addRow(['', 'fullName', fullName]);
    worksheet.getCell('B4').style = { font: { bold: true, name: 'Bell MT', size: 16, underline: true, color: { argb: 'FF215967' } } };
    worksheet.getCell('C4').style = { font: { bold: true, name: 'Bell MT', size: 16, color: { argb: 'FF000000' } }, alignment: { vertical: 'bottom', horizontal: 'center' } };
    worksheet.addRow();
    worksheet.addRow(['', 'startDuration', startDuration]);
    worksheet.mergeCells('C6:E6');
    worksheet.addRow(['', 'endDuration', endDuration]);
    worksheet.mergeCells('C7:E7');
    worksheet.getCell('B6').style = {
        font: { bold: true, name: 'Bell MT', size: 16, underline: true, color: { argb: 'FF215967' } }, border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' }, bgColor: { argb: 'FFF2F2F2' } }
    };
    worksheet.getCell('B7').style = {
        font: { bold: true, name: 'Bell MT', size: 16, underline: true, color: { argb: 'FF215967' } }, border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' }, bgColor: { argb: 'FFF2F2F2' } }
    };
    worksheet.getCell('C6').style = {
        font: { bold: true, name: 'Bell MT', size: 16, color: { argb: 'FF000000' } }, border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }, alignment: { vertical: 'bottom', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' }, bgColor: { argb: 'FFF2F2F2' } }
    };
    worksheet.getCell('C7').style = {
        font: { bold: true, name: 'Bell MT', size: 16, color: { argb: 'FF000000' } }, border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }, alignment: { vertical: 'bottom', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' }, bgColor: { argb: 'FFF2F2F2' } }
    };
    const borderStyle = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    worksheet.getCell('D6').style.border = borderStyle;
    worksheet.getCell('D7').style.border = borderStyle;
    worksheet.getCell('E6').style.border = borderStyle;
    worksheet.getCell('E7').style.border = borderStyle;

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=Excel.xlsx'
    );

    workbook.xlsx.write(res).then(() => {
        res.end();
    });

})


import Excel from 'exceljs';
const printExcel=async(req,res,next)=>{
    
    const data={
        "userName":"sondos",
        "fullName":"sondosammar",
        "days": [
            {
                "day": "1/11/2023",
                "enterTime": "8:00 AM, 1/11/2023",
                "leaveTime": "4:00 PM, 1/11/2023",
                "hours": "8.00"
            },
            {
                "day": "2/11/2023",
                "enterTime": "8:00 AM, 2/11/2023",
                "leaveTime": "4:00 PM, 2/11/2023",
                "hours": "8.00"
            },
            {
                "day": "3/11/2023",
                "enterTime": "8:00 AM, 3/11/2023",
                "leaveTime": "4:00 PM, 3/11/2023",
                "hours": "8.00"
            },
            {
                "day": "4/11/2023",
                "enterTime": "8:00 AM, 4/11/2023",
                "leaveTime": "4:00 PM, 4/11/2023",
                "hours": "8.00"
            },
            
            {
                "day": "8/11/2023",
                "enterTime": "8:00 AM, 8/11/2023",
                "leaveTime": "4:00 PM, 8/11/2023",
                "hours": "8.00"
            },
            {
                "day": "9/11/2023",
                "enterTime": "8:00 AM, 9/11/2023",
                "leaveTime": "4:00 PM, 9/11/2023",
                "hours": "8.00"
            },
            {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "leaveTime": "4:00 PM, 10/11/2023",
                "hours": "8.00"
            },
            {
                "day": "12/11/2023",
                "enterTime": "8:00 AM, 12/11/2023",
                "leaveTime": "4:00 PM, 12/11/2023",
                "hours": "8.00"
            },
            {
                "day": "13/11/2023",
                "enterTime": "8:00 AM, 13/11/2023",
                "leaveTime": "4:00 PM, 13/11/2023",
                "hours": "8.00"
            },  {
                "day": "1/11/2023",
                "enterTime": "8:00 AM, 1/11/2023",
                "leaveTime": "4:00 PM, 1/11/2023",
                "hours": "8.00"
            },
            {
                "day": "2/11/2023",
                "enterTime": "8:00 AM, 2/11/2023",
                "leaveTime": "4:00 PM, 2/11/2023",
                "hours": "8.00"
            },
            {
                "day": "3/11/2023",
                "enterTime": "8:00 AM, 3/11/2023",
                "leaveTime": "4:00 PM, 3/11/2023",
                "hours": "8.00"
            },
            {
                "day": "4/11/2023",
                "enterTime": "8:00 AM, 4/11/2023",
                "leaveTime": "4:00 PM, 4/11/2023",
                "hours": "8.00"
            },
            
            {
                "day": "8/11/2023",
                "enterTime": "8:00 AM, 8/11/2023",
                "leaveTime": "4:00 PM, 8/11/2023",
                "hours": "8.00"
            },
            {
                "day": "9/11/2023",
                "enterTime": "8:00 AM, 9/11/2023",
                "leaveTime": "4:00 PM, 9/11/2023",
                "hours": "8.00"
            },
            {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "leaveTime": "4:00 PM, 10/11/2023",
                "hours": "8.00"
            },
            {
                "day": "12/11/2023",
                "enterTime": "8:00 AM, 12/11/2023",
                "leaveTime": "4:00 PM, 12/11/2023",
                "hours": "8.00"
            },
            {
                "day": "13/11/2023",
                "enterTime": "8:00 AM, 13/11/2023",
                "leaveTime": "4:00 PM, 13/11/2023",
                "hours": "8.00"
            },  {
                "day": "1/11/2023",
                "enterTime": "8:00 AM, 1/11/2023",
                "leaveTime": "4:00 PM, 1/11/2023",
                "hours": "8.00"
            },
            {
                "day": "2/11/2023",
                "enterTime": "8:00 AM, 2/11/2023",
                "leaveTime": "4:00 PM, 2/11/2023",
                "hours": "8.00"
            },
            {
                "day": "3/11/2023",
                "enterTime": "8:00 AM, 3/11/2023",
                "leaveTime": "4:00 PM, 3/11/2023",
                "hours": "8.00"
            },
            {
                "day": "4/11/2023",
                "enterTime": "8:00 AM, 4/11/2023",
                "leaveTime": "4:00 PM, 4/11/2023",
                "hours": "8.00"
            },
            
            {
                "day": "8/11/2023",
                "enterTime": "8:00 AM, 8/11/2023",
                "leaveTime": "4:00 PM, 8/11/2023",
                "hours": "8.00"
            },
            {
                "day": "9/11/2023",
                "enterTime": "8:00 AM, 9/11/2023",
                "leaveTime": "4:00 PM, 9/11/2023",
                "hours": "8.00"
            },
            {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "leaveTime": "4:00 PM, 10/11/2023",
                "hours": "8.00"
            },
            {
                "day": "12/11/2023",
                "enterTime": "8:00 AM, 12/11/2023",
                "leaveTime": "4:00 PM, 12/11/2023",
                "hours": "8.00"
            },
            {
                "day": "13/11/2023",
                "enterTime": "8:00 AM, 13/11/2023",
                "leaveTime": "4:00 PM, 13/11/2023",
                "hours": "8.00"
            },
            {
                "day": "8/11/2023",
                "enterTime": "8:00 AM, 8/11/2023",
                "leaveTime": "4:00 PM, 8/11/2023",
                "hours": "8.00"
            },
            {
                "day": "9/11/2023",
                "enterTime": "8:00 AM, 9/11/2023",
                "leaveTime": "4:00 PM, 9/11/2023",
                "hours": "8.00"
            },
            {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "leaveTime": "4:00 PM, 10/11/2023",
                "hours": "8.00"
            },
            {
                "day": "12/11/2023",
                "enterTime": "8:00 AM, 12/11/2023",
                "leaveTime": "4:00 PM, 12/11/2023",
                "hours": "8.00"
            },
            {
                "day": "13/11/2023",
                "enterTime": "8:00 AM, 13/11/2023",
                "leaveTime": "4:00 PM, 13/11/2023",
                "hours": "8.00"
            },
        ],
        "totalHours": "96.00",
        "notCorrectChecks": [
            {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "shiftEnd": "1:55 AM, 13/11/2023"
            }, {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "shiftEnd": "1:55 AM, 13/11/2023"
            }, {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "shiftEnd": "1:55 AM, 13/11/2023"
            }, {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "shiftEnd": "1:55 AM, 13/11/2023"
            }, {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "shiftEnd": "1:55 AM, 13/11/2023"
            }, {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "shiftEnd": "1:55 AM, 13/11/2023"
            }, {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "shiftEnd": "1:55 AM, 13/11/2023"
            }, {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "shiftEnd": "1:55 AM, 13/11/2023"
            }, {
                "day": "10/11/2023",
                "enterTime": "8:00 AM, 10/11/2023",
                "shiftEnd": "1:55 AM, 13/11/2023"
            }
        ],
        "startDuration": "1/11/2023",
        "endDuration": "16/11/2023",
        
    }
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile('./f.xlsx');
    const mainWorksheet = workbook.getWorksheet('Correct') || workbook.addWorksheet('Correct');
    let notCorrectChecksWorksheet = workbook.getWorksheet('Not Correct');
    if (!notCorrectChecksWorksheet) {
        notCorrectChecksWorksheet = workbook.addWorksheet('Not Correct');
    }
    mainWorksheet.getCell('C4').value = data.userName;
    mainWorksheet.getCell('C5').value = data.fullName;
    mainWorksheet.getCell('C7').value = data.startDuration;
    mainWorksheet.getCell('C8').value = data.endDuration;
    mainWorksheet.getCell('C9').value = data.totalHours;
    
    let daysRow = 13; 
    data.days.forEach(day => {
        copyRowStyle(daysRow, daysRow + 1, mainWorksheet);
        mainWorksheet.getCell(`B${daysRow}`).value = day.day;
        mainWorksheet.getCell(`C${daysRow}`).value = day.enterTime;
        mainWorksheet.getCell(`D${daysRow}`).value = day.leaveTime;
        mainWorksheet.getCell(`E${daysRow}`).value = day.hours;
        daysRow++;
    });
    let notCorrectChecksRow = 4; 
    data.notCorrectChecks.forEach(check => {
        copyRowStyle(notCorrectChecksRow, notCorrectChecksRow + 1, notCorrectChecksWorksheet);
        notCorrectChecksWorksheet.getCell(`B${notCorrectChecksRow}`).value = check.day;
        notCorrectChecksWorksheet.getCell(`C${notCorrectChecksRow}`).value = check.enterTime;
        notCorrectChecksWorksheet.getCell(`D${notCorrectChecksRow}`).value = check.shiftEnd;
        notCorrectChecksRow++;
    });

    await workbook.xlsx.writeFile('filled_template.xlsx');
    return res.json({ message: "Excel file created successfully." });
    
}

async function copyRowStyle(sourceRowNum, targetRowNum, worksheet) {
    const sourceRow = worksheet.getRow(sourceRowNum);
    const targetRow = worksheet.getRow(targetRowNum);
    sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        targetRow.getCell(colNumber).style = { ...cell.style };
    });
    targetRow.commit();
}


export const variables = () => {
    const userName = 'nawas';
    const fullName = 'ahmad khaled';
    const days = [
        {
            day: "1/11/2023",
            enterTime: "8:00 AM, 1/11/2023",
            leaveTime: "4:00 PM, 1/11/2023",
            hours: "8.00"
        },
        {
            day: "2/11/2023",
            enterTime: "8:00 AM, 2/11/2023",
            leaveTime: "4:00 PM, 2/11/2023",
            hours: "8.00"
        },
        {
            day: "3/11/2023",
            enterTime: "8:00 AM, 3/11/2023",
            leaveTime: "4:00 PM, 3/11/2023",
            hours: "8.00"
        },
        {
            day: "4/11/2023",
            enterTime: "8:00 AM, 4/11/2023",
            leaveTime: "4:00 PM, 4/11/2023",
            hours: "8.00"
        },
        {
            day: "5/11/2023",
            enterTime: "8:00 AM, 5/11/2023",
            leaveTime: "4:00 PM, 5/11/2023",
            hours: "8.00"
        },
        {
            day: "6/11/2023",
            enterTime: "8:00 AM, 6/11/2023",
            leaveTime: "4:00 PM, 6/11/2023",
            hours: "8.00"
        },
        {
            day: "7/11/2023",
            enterTime: "8:00 AM, 7/11/2023",
            leaveTime: "4:00 PM, 7/11/2023",
            hours: "8.00"
        },
        {
            day: "8/11/2023",
            enterTime: "8:00 AM, 8/11/2023",
            leaveTime: "4:00 PM, 8/11/2023",
            hours: "8.00"
        },
        {
            day: "9/11/2023",
            enterTime: "8:00 AM, 9/11/2023",
            leaveTime: "4:00 PM, 9/11/2023",
            hours: "8.00"
        },
        {
            day: "10/11/2023",
            enterTime: "8:00 AM, 10/11/2023",
            leaveTime: "4:00 PM, 10/11/2023",
            hours: "8.00"
        },
        {
            day: "12/11/2023",
            enterTime: "8:00 AM, 12/11/2023",
            leaveTime: "4:00 PM, 12/11/2023",
            hours: "8.00"
        },
        {
            day: "13/11/2023",
            enterTime: "8:00 AM, 13/11/2023",
            leaveTime: "4:00 PM, 13/11/2023",
            hours: "8.00"
        }
    ];
    const totalHours = "96.00";
    const notCorrectChecks = [
        {
            day: "10/11/2023",
            enterTime: "8:00 AM, 10/11/2023",
            shiftEnd: "1:55 AM, 13/11/2023"
        },
        {
            day: "17/11/2023",
            enterTime: "11:37 PM, 17/11/2023",
            shiftEnd: "4:00 AM, 18/11/2023"
        },
        {
            day: "19/11/2023",
            enterTime: "1:54 AM, 19/11/2023",
            shiftEnd: "4:00 AM, 19/11/2023"
        }
    ];
    const startDuration = "1/11/2023";
    const endDuration = "26/11/2023";
    
}

app.get('/sss', asyncHandler(printExcel));
export default app;