const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const taskSchema = new Schema({
    title : String,
    description : String,
    status: Boolean,
    userId: ObjectId
})

const taskModel = mongoose.model("tasks", taskSchema);

module.exports = {
    taskModel
}