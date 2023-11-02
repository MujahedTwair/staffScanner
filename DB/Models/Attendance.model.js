import mongoose, { Schema,Types,model } from "mongoose";

const attendanceSchema = new Schema({

    isCheckIn: {
        type: Boolean,
        required: true
    },
    isCheckOut: {
        type: Boolean,
    },
    enterTime: {
        type: Number,
        required: true
    },
    leaveTime: {
        type: Number,
    },
    employeeId: {
        type: Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    shiftEndDateTime:{
        type: Date,
    }
},{
    timestamps:true,
});

const attendanceModel = mongoose.model.Attendance || model('Attendance', attendanceSchema);

export default attendanceModel;