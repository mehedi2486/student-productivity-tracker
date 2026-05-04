const express = require("express");
const router = express.Router();

const { createNote, getNotes, updateNote, deleteNote } = require("../controllers/note.controller");
const { auth } = require("../middleware/auth.middlewares");

router.post("/note", auth, createNote);
router.get("/notes", auth, getNotes);
router.put("/note/:id", auth, updateNote);
router.delete("/note/:id", auth, deleteNote);

module.exports = {
    noterouter: router
}
