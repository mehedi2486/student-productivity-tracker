const express = require("express");
const router = express.Router();

const {createTask , getTask , updateTask , deleteTask } = require("../controllers/dashboard");

const {auth} = require("../middleware/auth.middlewares");

//connect routes to controllers

router.post("/task", auth, createTask);
router.get("/tasks", auth, getTask);
router.put("/task/:id", auth, updateTask);
router.delete("/task/:id", auth, deleteTask);

module.exports = {
    taskrouter:router
}