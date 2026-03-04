import express from "express";

import { dashboardData } from "../controler/dashboard.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /dashboard
router.get("/dashboard", verifyToken, dashboardData);

export default router;