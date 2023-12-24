import mongoose, { Schema,Types,model } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

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

attendanceSchema.plugin(mongoosePaginate);


const attendanceModel = mongoose.models.Attendance || model('Attendance', attendanceSchema);

export default attendanceModel;