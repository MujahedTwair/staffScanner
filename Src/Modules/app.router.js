import connectDb from "../../DB/connection.js";
import authRouter from "./Auth/auth.router.js";
import companyRouter from "./Company/company.router.js";
import employeeRouter from "./Employee/employee.router.js";
import vacationRouter from "./Vacation/vacation.router.js";
import attendaceRouter from "./Attendance/attendance.router.js";
import cors from "cors";

const initApp = (app, express) => {
    connectDb();

    app.use(cors({
        exposedHeaders: ['Content-Disposition'],
    }));
    app.use(express.json());
    app.use('/auth', authRouter);
    app.use('/company', companyRouter);
    app.use('/employee', employeeRouter);
    app.use('/vacation', vacationRouter);
    app.use('/attendance', attendaceRouter);
    app.get('/', (req, res) => res.json({ message: "Welcome to Dashboard" }));
    app.use('*', (req, res) => res.json({ message: "Page not found, تأكد من نوع الميثود طنيبك" }));
}

export default initApp;