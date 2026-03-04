import mongoose from 'mongoose';
import { RegisterEventForm } from "../models/registerEvent.js";
import { User } from "../models/users.js";
import { sendMail } from "../utils/sendMail.js";

export const getRegisterEvents = async (req, res) => {
  try {
    const registerEvents = await RegisterEventForm.find();
    return res.status(200).json({ registerEvents });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const createRegisterEvent = async (req, res) => {
  try {
    // Normalize common incoming field names and validate required fields
    const {
      event_id,
      eventId,
      student_name,
      studentName,
      college_name,
      email,
      phone,
      year,
      department,
      participate_department,
      events_selected,
      additional_notes,
      consent
    } = req.body || {};

    const payload = {
      event_id: event_id || eventId,
      student_id: req.user?._id,
      student_name: student_name || studentName || req.user?.name,
      college_name,
      email,
      phone,
      year,
      department,
      participate_department,
      events_selected,
      additional_notes,
      consent,
      status: "Pending",
      created_by: req.user?._id
    };

    // Server-side validation to return a clear error instead of relying on mongoose validation error
    if (!payload.event_id || !payload.student_name) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          event_id: !!payload.event_id,
          student_name: !!payload.student_name
        }
      });
    }

    const registerEvent = new RegisterEventForm(payload);
    await registerEvent.save();

    // Send confirmation email to the user who created the registration
    try {
      const user = await User.findById(req.user._id);
      if (user?.email) {
        const eventNames = (registerEvent.events_selected || [])
          .map((e) => e.event_name || e.title || "Event")
          .join(", ");

        await sendMail(
          user.email,
          "Event Registration Successful",
          `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
            <h2 style="color:#8b5cf6;margin:0 0 12px;">Registration Successful!</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>You have successfully registered for the event.</p>
            ${eventNames ? `<p><strong>Events:</strong> ${eventNames}</p>` : ""}
            <p><strong>Status:</strong> Pending approval</p>
            <p style="margin-top:20px;color:#64748b;font-size:13px;">You will be notified once your registration is approved.<br/>— FestMate Team</p>
          </div>`
        );
      }
    } catch (mailErr) {
      console.error("Registration saved but email failed:", mailErr.message);
      // Don't fail the request if only the email fails
    }

    res.status(201).json({
      message: "Registration created successfully",
      registerEvent
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating registration",
      error: error.message
    });
  }
};

export const getSingleRegisterEvent = async (req, res) => {
  try {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }
    const registerEvent = await RegisterEventForm.findById(id);
    if (!registerEvent) {
      return res.status(404).json({ message: "Registration not found" });
    }
    return res.status(200).json({ registerEvent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteRegisterEvent = async (req, res) => {
  try {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    // Fetch the registration first so we can notify the user after deletion
    const registration = await RegisterEventForm.findById(id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    await RegisterEventForm.deleteOne({ _id: id });

    // Send deletion email to the user
    try {
      const user = await User.findById(registration.created_by);
      if (user?.email) {
        const eventNames = (registration.events_selected || [])
          .map((e) => e.event_name || e.title || "Event")
          .join(", ");

        await sendMail(
          user.email,
          "Event Registration Deleted",
          `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
            <h2 style="color:#ef4444;margin:0 0 12px;">Registration Deleted</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your event registration has been <strong style="color:#ef4444;">deleted</strong>.</p>
            ${eventNames ? `<p><strong>Events:</strong> ${eventNames}</p>` : ""}
            <p style="margin-top:20px;color:#64748b;font-size:13px;">If you did not request this, please contact the admin.<br/>— FestMate Team</p>
          </div>`
        );
      }
    } catch (mailErr) {
      console.error("Registration deleted but email failed:", mailErr.message);
    }

    return res.status(200).json({ message: "Registration deleted" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};