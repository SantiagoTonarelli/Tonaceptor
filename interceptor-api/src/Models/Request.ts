import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  method: String,
  url: String,
  headers: mongoose.Schema.Types.Mixed,
  body: mongoose.Schema.Types.Mixed,
  query: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default RequestSchema;
