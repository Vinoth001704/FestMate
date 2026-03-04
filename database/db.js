import mongoose from "mongoose";
const connectDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 20000,
            socketTimeoutMS: 30000,
            tls: true,
            maxPoolSize: 10,
        };

        // Allow overriding database name via env (if URI omits it)
        if (process.env.DB_NAME) {
            options.dbName = process.env.DB_NAME;
        }

        await mongoose.connect(process.env.DB, options);
        console.log(`DB connected! Using DB: ${mongoose.connection.name}`);
    } catch (error) {
        console.log(error);
    }
};

export default connectDB;
