import mongoose from "mongoose";

const connectDb = async () => {
    return await mongoose.connect()
    .then(() => {
        console.log('db connected successfully');
    })
    .catch((error) =>{
        console.log(`error to connect db : ${error}`);
    })
}

export default connectDb;