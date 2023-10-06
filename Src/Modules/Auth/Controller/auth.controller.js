import employeeModel from '../../../../DB/Models/User.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import companyModel from '../../../../DB/Models/Company.model.js';


export const signupCompany=async(req,res)=>{
    const {companyName,email,password,IPAddress}=req.body;
    var hash = await bcrypt.hash(password,8);
    const company=await  new companyModel({companyName,email,password:hash,IPAddress})
    const user=await company.save(); 
    if(!user){
        return res.status(404).json({error:error.stack })
              }
    
}




export const signinEmpolyee = async (req, res) => {
    const { userName, password } = req.body;
    const employee = await employeeModel.findOne({ userName })
    if (!employee) {
        return res.status(404).json({ message: "invaild userName" });
    }
    const match = bcrypt.compareSync(password, employee.password);
    if (!match) {
        return res.status(404).json({ message: "invaild password" });
    }
    const token = jwt.sign({ id: employee._id }, process.env.LOGINEMPLOYEE);
    return res.status(200).json({ message: "success you are employee", token });
}



export const singinCompany = async (req, res) => {
    const { email, password } = req.body
    const company = companyModel.findOne({ email })
    if (!company) {
        return res.status(404).json({ message: "invaild email" })
    }
    const match = bcrypt.compareSync(password, company.password)
    if (!match) {
        return res.status(404).json({ message: "invaild password" })
    }
    const token = jwt.sign({ id: company._id }, process.env.LOGINCOMPANY)

    return res.status(200).json({ message: "success you are admin", token })

}
