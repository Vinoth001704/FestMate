import mongoose from "mongoose";
import { EventForm } from "../models/events.js";
import { Task } from "../models/tasks.js";

export const getEvent = async (req, res) => {
  try {
    const events = await EventForm.find();
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    // Basic required-field validation
    const required = [
      'coordinator_details',
      'creator_details',
      'event_Name',
      'event',
      'venue',
      'event_schedule',
      'event_categories',
      'participant_mode',
      'Department',
      'event_categories_doc_flags'
    ];

    const missing = required.filter((f) => req.body[f] === undefined || req.body[f] === '');
    if (missing.length) {
      return res.status(400).json({ message: `Missing requi red fields: ${missing.join(', ')}` });
    }

    // Parse common fields that may arrive as JSON strings (when using form-data)
    const parsed = { ...req.body };
    const tryParse = (key) => {
      if (parsed[key] && typeof parsed[key] === 'string') {
        try { parsed[key] = JSON.parse(parsed[key]); } catch (e) { /* leave as string */ }
      }
    };

    ['coordinator_details','creator_details','event_categories','event_categories_doc_flags','event_location','Department','venue'].forEach(tryParse);

    // Parse date
    const schedule = new Date(parsed.event_schedule);
    if (Number.isNaN(schedule.getTime())) {
      return res.status(400).json({ message: 'Invalid event_schedule date' });
    }
    parsed.event_schedule = schedule;

    // Handle uploaded banner (multer .single('image'))
    if (req.file && req.file.filename) {
      parsed.event_banner_url = `/uploads/${req.file.filename}`;
    }

    const event = new EventForm({ ...parsed, created_by: req.user._id });
    await event.save();

    // Auto-create a task for this event with coordinator details
    try {
      const coordinators = [];
      if (event.coordinator_details) {
        for (const [dept, coord] of event.coordinator_details.entries()) {
          coordinators.push({ name: coord.name, id: coord.id, department: dept });
        }
      }

      const task = new Task({
        event_id: event.event_id,
        event_name: event.event_Name,
        event_creator: {
          name: event.creator_details?.name || req.user.name || "Unknown",
          id: req.user._id,
        },
        coordinators,
        title: `Manage registrations - ${event.event_Name}`,
        description: `Track student registrations for ${event.event_Name}`,
        status: "Pending",
        due_date: event.event_schedule,
        created_by: req.user._id,
      });
      await task.save();
    } catch (taskErr) {
      console.error("Event created but task auto-creation failed:", taskErr.message);
    }

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

export const singleEvent = async (req, res) => {
  try {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const event = await EventForm.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.status(200).json({ event });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const deleted = await EventForm.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const events = await EventForm.find({ created_by: userId });
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};