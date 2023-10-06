import express from "express";
const app = express();
import * as authcontroller from '../Auth/Controller/auth.controller.js';

app.post('/signinEmployee', authcontroller.signinEmpolyee);
app.post('/singinCompany', authcontroller.singinCompany);
app.post('/singupCompany',authcontroller.signupCompany);


export default app;