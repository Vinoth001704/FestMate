import mongoose from "mongoose";
import { Task } from "../models/tasks.js";
import { EventForm } from "../models/events.js";
import { RegisterEventForm } from "../models/registerEvent.js";

// Create a new task for an event
export const createTask = async (req, res) => {
  try {
    const { event_id, title, description, assigned_to, due_date } = req.body;

    if (!event_id || !title) {
      return res.status(400).json({ message: "event_id and title are required" });
    }

    // Fetch the event to get creator & coordinator details
    const event = await EventForm.findOne({ event_id }).populate("created_by", "name");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Extract coordinators from the event's coordinator_details Map
    const coordinators = [];
    if (event.coordinator_details) {
      for (const [dept, coord] of event.coordinator_details.entries()) {
        coordinators.push({ name: coord.name, id: coord.id, department: dept });
      }
    }

    const task = new Task({
      event_id,
      event_name: event.event_Name,
      event_creator: {
        name: event.creator_details?.name || event.created_by?.name || "Unknown",
        id: event.created_by._id || event.created_by,
      },
      coordinators,
      title,
      description,
      assigned_to,
      due_date,
      status: "Pending",
      created_by: req.user._id,
    });

    await task.save();
    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: get registration stats for an event_id
const getRegistrationStats = async (eventId) => {
  const [total, pending, approved, rejected] = await Promise.all([
    RegisterEventForm.countDocuments({ event_id: eventId }),
    RegisterEventForm.countDocuments({ event_id: eventId, status: "Pending" }),
    RegisterEventForm.countDocuments({ event_id: eventId, status: "Approved" }),
    RegisterEventForm.countDocuments({ event_id: eventId, status: "Rejected" }),
  ]);
  return { total, pending, approved, rejected };
};

// Get all tasks with registration stats (optionally filter by event_id or status)
export const getTasks = async (req, res) => {
  try {
    const { event_id, status } = req.query;
    const filter = {};
    if (event_id) filter.event_id = event_id;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate("assigned_to", "name email")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });

    // Attach registration stats to each task
    const tasksWithStats = await Promise.all(
      tasks.map(async (task) => {
        const stats = await getRegistrationStats(task.event_id);
        return { ...task.toObject(), registration_stats: stats };
      })
    );

    res.status(200).json({ tasks: tasksWithStats });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get tasks created by or assigned to the logged-in user (with stats)
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await Task.find({
      $or: [{ created_by: userId }, { assigned_to: userId }],
    })
      .populate("assigned_to", "name email")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });

    const tasksWithStats = await Promise.all(
      tasks.map(async (task) => {
        const stats = await getRegistrationStats(task.event_id);
        return { ...task.toObject(), registration_stats: stats };
      })
    );

    res.status(200).json({ tasks: tasksWithStats });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single task by ID (with stats)
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(id)
      .populate("assigned_to", "name email")
      .populate("created_by", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const stats = await getRegistrationStats(task.event_id);
    res.status(200).json({ task: { ...task.toObject(), registration_stats: stats } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update task status (Pending / In Progress / Completed)
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task status updated", task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update task details
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task updated", task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get task + registration counts (for dashboard cards)
export const getTaskCounts = async (req, res) => {
  try {
    const { event_id } = req.query;
    const filter = {};
    if (event_id) filter.event_id = event_id;

    const [all, pending, inProgress, completed] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: "Pending" }),
      Task.countDocuments({ ...filter, status: "In Progress" }),
      Task.countDocuments({ ...filter, status: "Completed" }),
    ]);

    // Also return registration stats if event_id is provided
    let registrationStats = null;
    if (event_id) {
      registrationStats = await getRegistrationStats(event_id);
    }

    res.status(200).json({
      tasks: { all, pending, inProgress, completed },
      registrationStats,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
