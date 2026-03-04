import express from "express";
import {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTaskCounts,
} from "../controler/tasks.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

// Get task + registration counts (dashboard)
router.get("/tasks/counts", isAuth, getTaskCounts);

// Get my tasks (created by or assigned to me)
router.get("/tasks/my", isAuth, getMyTasks);

// Get all tasks (with optional ?event_id=&status= filters)
router.get("/tasks", isAuth, getTasks);

// Get single task
router.get("/tasks/:id", isAuth, getTaskById);

// Create a new task
router.post("/tasks", isAuth, createTask);

// Update task status only
router.patch("/tasks/:id/status", isAuth, updateTaskStatus);

// Update task details
router.put("/tasks/:id", isAuth, updateTask);

// Delete a task
router.delete("/tasks/:id", isAuth, deleteTask);

export default router;
