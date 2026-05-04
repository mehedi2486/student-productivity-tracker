const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    username : {type:String, unique:true, required:true},
    email : {type:String, unique:true, required:true},
    password: {type:String, required:true}    
})

const userModel = mongoose.model("users", userSchema);

module.exports = {
    userModel
}