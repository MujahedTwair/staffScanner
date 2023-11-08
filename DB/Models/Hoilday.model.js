import mongoose, { Schema, Types, model } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';
const holidaySchema = new Schema({
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Waiting for approval',
        enum: ['Waiting for approval', 'Accepted', 'Rejected'],
        required: true,
    },
    employeeId: {
        type: Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    type: {
        type: String,
        default: 'Vacation',
        enum: ['Sick', 'Vacation', 'Travelling'],
        required: true
    },
    paid: {
        type: Boolean,
        enum: [true, false],
        required: true,
    },
    reason: {
        type: String,
    },
    companyNote: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});
holidaySchema.plugin(mongoosePaginate);

const holidayModel = mongoose.models.Holiday || model('Holiday', holidaySchema);

export default holidayModel;