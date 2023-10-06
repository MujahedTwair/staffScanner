import dotenv from 'dotenv';
dotenv.config();
import  express  from "express";
import initApp from "./Src/Modules/app.router.js";
const app = express();
initApp(app, express)
const PORT = 8000;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
