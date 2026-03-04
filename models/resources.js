import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalQuantity: { type: Number, default: 0 },
  availableQuantity: { type: Number, default: 0 },
  unit: { type: String, default: "unit" },
  location: { type: String },
  unitCost: { type: Number, default: 0 },
  meta: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export const Resource = mongoose.model("resources", ResourceSchema);
