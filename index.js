import * as dotenv from 'dotenv';
dotenv.config();
import  express  from "express";
const app = express();
const PORT = 3000;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));


const x=5;
const y=10
