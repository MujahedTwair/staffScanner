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
        type: String,
        required: true
    },
    leaveTime: {
        type: String,
    },
    date: {
        type: String,
    },
    employeeId: {
        type: Types.ObjectId,
        ref: 'Employee',
        required: true
    }
},{
    timestamps:true,
});

const attendanceModel = mongoose.model.Attendance || model('Attendance', attendanceSchema);

export default attendanceModel;