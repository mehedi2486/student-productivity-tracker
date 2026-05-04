const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const taskSchema = new Schema({
    title : {type:String, required:true},
    description : {type:String, required:true},
    status: {type:Boolean, default:false},
    userId: {type:ObjectId}
})

const taskModel = mongoose.model("tasks", taskSchema);

module.exports = {
    taskModel
}