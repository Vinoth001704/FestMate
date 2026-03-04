import express from "express";
import { createEvent, deleteEvent, getEvent, singleEvent, getMyEvents } from "../controler/events.js";
import { uploadFiles } from '../middleware/multer.js';
import { checkAdmin, isAuth } from "../middleware/isAuth.js";

const router =express.Router();


router.post("/event/new/",isAuth,checkAdmin,uploadFiles,createEvent);
router.get("/event/get/",getEvent);
router.get("/event/my", isAuth, checkAdmin, getMyEvents);
router.get("/event/single/:id",singleEvent);
router.delete("/event/delete/:id",isAuth,checkAdmin,deleteEvent);

export default router;