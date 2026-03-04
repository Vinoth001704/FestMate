import mongoose from 'mongoose';

const EventSelectedSchema = new mongoose.Schema({
  category: String,
  event_name: String,
  title: String,
  mode: String,
  team_size: Number,
  team_members: [String],
  file_type: String
}, { _id: false });

const RegisterEvent = new mongoose.Schema({
  // EventForm defines `event_id` as a unique string code; accept string here
  event_id: { type: String, ref: 'EventForm', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  student_name: { type: String, required: true },
  college_name: String,
  email: String,
  phone: String,
  year: String,
  department: String,
  participate_department: String,
  events_selected: [EventSelectedSchema],
  additional_notes: String,
  consent: Boolean,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: "Pending" }
}, { timestamps: true });

export const RegisterEventForm = mongoose.model("registerEvent", RegisterEvent);