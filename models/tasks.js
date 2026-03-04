import mongoose from "mongoose";

const CoordinatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    id: { type: String, required: true },
    department: { type: String },
  },
  { _id: false }
);

const TaskSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      ref: "EventForm",
      required: true,
    },
    event_name: {
      type: String,
      required: true,
    },
    event_creator: {
      name: { type: String, required: true },
      id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    },
    coordinators: [CoordinatorSchema],
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    due_date: {
      type: Date,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", TaskSchema);
