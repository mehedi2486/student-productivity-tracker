const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const noteSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, default: "" },
    subject: { type: String, default: "General" },
    color: { type: String, default: "indigo" },
    pinned: { type: Boolean, default: false },
    userId: { type: ObjectId, required: true }
}, { timestamps: true })

const noteModel = mongoose.model("notes", noteSchema);

module.exports = {
    noteModel
}
