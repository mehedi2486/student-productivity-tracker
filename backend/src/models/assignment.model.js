const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const assignmentSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    subject: { type: String, default: "General" },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "completed", "overdue"], default: "pending" },
    linkedNotes: [{ type: ObjectId, ref: "notes" }],
    userId: { type: ObjectId, required: true }
}, { timestamps: true })

const assignmentModel = mongoose.model("assignments", assignmentSchema);

module.exports = {
    assignmentModel
}
