import express from "express";
const app = express();
import * as authController from './Controller/auth.controller.js';

app.post('/signinEmployee', authController.signinEmpolyee);
app.post('/signinCompany', authController.signinCompany);
app.post('/signupCompany', authController.signupCompany);


export default app;