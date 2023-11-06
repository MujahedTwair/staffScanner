import mongoose, { model, Schema } from "mongoose";
const companySchema = new Schema({
    companyName: {
        type: String,
        required: true
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
    IPAddress: {
        type: String
    },
    QrImage: {
        type: Object,
    },
    QrId: {
        type: String,
    }
});

const companyModel = mongoose.models.Company || model('Company', companySchema);

export default companyModel;