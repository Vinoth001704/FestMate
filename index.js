import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './database/db.js';

dotenv.config()

const app=express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
let port=process.env.PORT;

import userRoutes from "./routes/user.js";
app.use("/api",userRoutes);

import eventRoutes from "./routes/events.js";
 app.use("/api",eventRoutes);

import eventRegisterRoutes from "./routes/registerEvents.js";
 app.use("/api", eventRegisterRoutes);

import requestedEventsRoutes from "./routes/requestedEvents.js";
 app.use("/api", requestedEventsRoutes);

import dashboardRoute from "./routes/dashboard.js";
app.use("/api", dashboardRoute);

import taskRoutes from "./routes/tasks.js";
app.use("/api", taskRoutes);




app.get("/",(req,res)=>{
    res.send("FestMate Backend Side")
})


app.listen(port,()=>{   
    console.log(`Server is running http://localhost:${port}`)
    connectDB();
})