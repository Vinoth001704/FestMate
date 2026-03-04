import express from "express";
import {
  createRegisterEvent,
  deleteRegisterEvent,
  getRegisterEvents,
  getSingleRegisterEvent,
} from "../controler/registerEvent.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

// Registration routes
router.post("/registerEvent/new/",isAuth, createRegisterEvent);
router.get("/registerEvent/get/", getRegisterEvents);
router.get("/registerEvent/single/:id", getSingleRegisterEvent);
router.delete("/registerEvent/delete/:id", deleteRegisterEvent);

export default router;