import Excel from "exceljs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const printExcel = async (data, res) => {
    const workbook = new Excel.Workbook();
    const filePath = join(__dirname, '../../Template/report.xlsx');
    // console.log(filePath);
    await workbook.xlsx.readFile(filePath);
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

    const buffer = await workbook.xlsx.writeBuffer();

    // Set the appropriate headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${data.fullName}-report.xlsx`);
    // Send the buffer in the response
    return res.send(buffer);

}

async function copyRowStyle(sourceRowNum, targetRowNum, worksheet) {
    const sourceRow = worksheet.getRow(sourceRowNum);
    const targetRow = worksheet.getRow(targetRowNum);
    sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        targetRow.getCell(colNumber).style = { ...cell.style };
    });
    targetRow.commit();
}