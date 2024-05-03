import mongoose from "mongoose";

const SimulatedRequestSchema = new mongoose.Schema({
  method: String,
  url: String,
  bodyResponse: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default SimulatedRequestSchema;