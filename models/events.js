// models/EventModel.js
import mongoose from 'mongoose';

// Coordinator schema for each department
const DepartmentCoordinatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true }
}, { _id: false });

// Creator of the event
const CreatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true }
}, { _id: false });

// Location schema
const CoordinateSchema = new mongoose.Schema({
  latitude: { type: String, required: true },
  longitude: { type: String, required: true }
}, { _id: false });

// Event categories schema
const EventCategoriesSchema = new mongoose.Schema({
  Technical: [String],
  'Non-Technical': [String]
}, { _id: false });


const EventSchema = new mongoose.Schema({
  coordinator_details: {
    type: Map,
    of: DepartmentCoordinatorSchema,
    required: true
  },

  creator_details: { type: CreatorSchema, required: true },

  event_Name: { type: String, required: true },
  event: { type: String, required: true },

  // ✅ ADD THIS
  venue: {
    type: String,
    required: true
  },

  event_schedule: { type: Date, required: true },

  event_categories: { type: EventCategoriesSchema, required: true },
  participant_mode: { type: String, required: true },

  Department: [{ type: String, required: true }],

  event_location: { type: CoordinateSchema }, // optional ah vechikalam

  event_banner_url: { type: String },
  event_description: { type: String, required: true },

  event_categories_doc_flags: {
    type: Map,
    of: Boolean,
    required: true
  },

  event_id: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2,10);
    }
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });
// Create and export EventForm model
export const EventForm = mongoose.model("EventForm", EventSchema);



