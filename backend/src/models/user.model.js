const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    username : String,
    email : String,
    password: String
})

const userModel = mongoose.model("users", userSchema);

module.exports = {
    userModel
}