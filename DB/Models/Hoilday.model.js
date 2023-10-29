import mongoose, { Schema, Types, model } from "mongoose";
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
        enum: ['Sick', 'Vacation'],
        required: true
    },
    paid: {
        type: Boolean,
        enum: [true, false],
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    companyNote: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const holidayModel = mongoose.model.Holiday || model('Holiday', holidaySchema);

export default holidayModel;