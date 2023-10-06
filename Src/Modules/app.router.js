import connectDb from "../../DB/connection.js";
import authrouter from './Auth/auth.router.js';

 const initApp=(app,express)=>{
app.use(express.json());
connectDb();

app.use('/auth',authrouter)
 }

 
 export default initApp