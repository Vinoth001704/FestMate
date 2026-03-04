import { RegisterEventForm } from "../models/registerEvent.js";
import { User } from "../models/users.js";
import { sendMail } from "../utils/sendMail.js";

// Get all requested events for the logged-in user
export const getMyRequestedEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await RegisterEventForm.find({ created_by: userId });
    res.status(200).json({ requests });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all events that need admin verification
export const getEventsToVerify = async (req, res) => {
  try {
    const requests = await RegisterEventForm.find({ status: "Pending" });
    res.status(200).json({ requests });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all events that need admin verificated and Approved
export const approvedRequestedEvent = async (req, res) => {
  try {
    const requests = await RegisterEventForm.find({ status: "Approved" });
    res.status(200).json({ requests });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve a requested event (admin)
export const approveRequestedEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await RegisterEventForm.findByIdAndUpdate(
      id,
      { status: "Approved" },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Send approval email to the student
    try {
      const user = await User.findById(updated.created_by);
      if (user?.email) {
        const eventNames = (updated.events_selected || [])
          .map((e) => e.event_name || e.title || "Event")
          .join(", ");

        await sendMail(
          user.email,
          "Event Registration Approved",
          `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
            <h2 style="color:#22c55e;margin:0 0 12px;">Registration Approved!</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your event registration has been <strong style="color:#22c55e;">approved</strong>.</p>
            ${eventNames ? `<p><strong>Events:</strong> ${eventNames}</p>` : ""}
            <p><strong>Status:</strong> Approved</p>
            <p style="margin-top:20px;color:#64748b;font-size:13px;">You're all set! Get ready for the event.<br/>— FestMate Team</p>
          </div>`
        );
      }
    } catch (mailErr) {
      console.error("Approval saved but email failed:", mailErr.message);
    }

    res.status(200).json({ message: "Request approved", updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Reject a requested event (admin)
export const rejectRequestedEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await RegisterEventForm.findByIdAndUpdate(
      id,
      { status: "Rejected" },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Send rejection email to the student
    try {
      const user = await User.findById(updated.created_by);
      if (user?.email) {
        const eventNames = (updated.events_selected || [])
          .map((e) => e.event_name || e.title || "Event")
          .join(", ");

        await sendMail(
          user.email,
          "Event Registration Rejected",
          `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
            <h2 style="color:#ef4444;margin:0 0 12px;">Registration Rejected</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your event registration has been <strong style="color:#ef4444;">rejected</strong>.</p>
            ${eventNames ? `<p><strong>Events:</strong> ${eventNames}</p>` : ""}
            <p><strong>Status:</strong> Rejected</p>
            <p style="margin-top:20px;color:#64748b;font-size:13px;">If you have any questions, please contact the admin.<br/>— FestMate Team</p>
          </div>`
        );
      }
    } catch (mailErr) {
      console.error("Rejection saved but email failed:", mailErr.message);
    }

    res.status(200).json({ message: "Request rejected", updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};