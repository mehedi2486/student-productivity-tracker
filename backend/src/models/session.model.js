const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const sessionSchema = new Schema({
    subject: { type: String, required: true },
    task: { type: String, required: true },
    duration: { type: Number, required: true }, // in seconds
    date: { type: Date, default: Date.now },
    userId: { type: ObjectId, required: true }
}, { timestamps: true });

const sessionModel = mongoose.model("sessions", sessionSchema);

module.exports = { sessionModel };
