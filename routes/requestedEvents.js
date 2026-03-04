import express from "express";

// Import your controller functions (you need to implement these)
import {
  getMyRequestedEvents,
  getEventsToVerify,
  approveRequestedEvent,
  rejectRequestedEvent,
  approvedRequestedEvent
} from "../controler/requestedEvents.js";

import { isAuth } from "../middleware/isAuth.js";
import { checkAdmin } from "../middleware/isAuth.js";

const router = express.Router();

// User: Get my requested events
router.get("/requestedEvents/my", isAuth, getMyRequestedEvents);

// Admin: Get all events to verify
router.get("/requestedEvents/toVerify", isAuth, checkAdmin, getEventsToVerify);
// Admin: Get all events to verify
router.get("/requestedEvents/approved", isAuth, checkAdmin, approvedRequestedEvent);  
// Admin: Get all rejected requested events
// router.get("/requestedEvents/rejected", isAuth, checkAdmin, rejectedRequestedEvent);

// Admin: Approve a requested event
router.patch("/requestedEvents/approve/:id", isAuth, checkAdmin, approveRequestedEvent);

// Admin: Reject a requested event
router.patch("/requestedEvents/reject/:id", isAuth, checkAdmin, rejectRequestedEvent);

export default router;