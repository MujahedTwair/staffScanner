import mongoose, { model, Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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
    phoneNumber: {
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
    deviceId: {
        type: String,
        unique: true,
        sparse: true,
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
        type: String
    },
    isDeleted: {
        type: Boolean
    }
}, {
    timestamps: true,
    toJSON:{ virtuals:true},
    toObject:{ virtuals: true}
});
employeeSchema.plugin(mongoosePaginate);
employeeSchema.virtual('attendance',{
    localField:'_id',
    foreignField:'employeeId',
    ref:'Attendance'
})
const employeeModel = mongoose.models.Employee || model('Employee', employeeSchema); //to prevent create new model when exists already

export default employeeModel;