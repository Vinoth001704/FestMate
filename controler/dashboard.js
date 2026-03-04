import express from "express";
import { EventForm } from "../models/events.js";
import { RegisterEventForm } from "../models/registerEvent.js";
import { User } from "../models/users.js";

export const dashboardData =async (req, res) => {
	try {
        
		const userId = req.user && req.user.id;
		const roleRaw = req.user && req.user.role;
		const role = (roleRaw || "").toString().toLowerCase();

		// STUDENT
		if (role === "student") {
			const now = new Date();

			const availableEvents = await EventForm.countDocuments({
				event_schedule: { $gte: now },
			});

			const myRegistrations = await RegisterEventForm.countDocuments({
				created_by: userId,
			});

			const upcomingEvents = await EventForm.countDocuments({
				event_schedule: { $gte: now },
			});

			const trending = await RegisterEventForm.aggregate([
				{ $group: { _id: "$event_id", total: { $sum: 1 } } },
				{ $sort: { total: -1 } },
				{ $limit: 3 },
			]);

			const activityGraph = await RegisterEventForm.aggregate([
				{ $match: { created_by: userId } },
				{ $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
				{ $sort: { _id: 1 } },
			]);

			return res.json({
				role: roleRaw,
				availableEvents,
				myRegistrations,
				upcomingEvents,
				trending,
				activityGraph,
			});
		}

		// COORDINATOR
		if (role === "coordinator") {
			const myEvents = await EventForm.countDocuments({ created_by: userId });

			const approvedEvents = await EventForm.countDocuments({ created_by: userId });

			const studentsPerEvent = await RegisterEventForm.aggregate([
				{ $group: { _id: "$event_id", total: { $sum: 1 } } },
			]);

			return res.json({
				role: roleRaw,
				myEvents,
				approvedEvents,
				studentsPerEvent,
			});
		}

		// ADMIN
		if (role === "admin") {
			const totalUsers = await User.countDocuments();
			const totalEvents = await EventForm.countDocuments();
			const pendingRequests = await RegisterEventForm.countDocuments({ status: "Pending" });
			const totalRegistrations = await RegisterEventForm.countDocuments();

			const trending = await RegisterEventForm.aggregate([
				{ $group: { _id: "$event_id", total: { $sum: 1 } } },
				{ $sort: { total: -1 } },
				{ $limit: 3 },
			]);

			return res.json({
				role: roleRaw,
				totalUsers,
				totalEvents,
				pendingRequests,
				totalRegistrations,
				trending,
			});
		}

		res.status(403).json({ message: "Invalid role" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};
