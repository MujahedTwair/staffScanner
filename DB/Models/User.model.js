import mongoose, { model, Schema, Types } from "mongoose";

const employeeSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    macAddress: {
        type: String,
    },
    companyId: {
        type: Types.ObjectId,
        ref: 'Company',
        required: true
    },
    startChecking: {
        type: String
    },
    endChecking: {
        type: String,
    }
}, {
    timestamps: true
});

const employeeModel = /*mongoose.model.Employee ||*/ model('Employee', employeeSchema); //to prevent create new model when exists already

export default employeeModel;