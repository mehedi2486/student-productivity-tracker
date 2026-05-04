const express = require("express");
const router = express.Router();

const { createAssignment, getAssignments, getAssignment, updateAssignment, deleteAssignment, linkNotes, unlinkNote } = require("../controllers/assignment.controller");
const { auth } = require("../middleware/auth.middlewares");

router.post("/assignment", auth, createAssignment);
router.get("/assignments", auth, getAssignments);
router.get("/assignment/:id", auth, getAssignment);
router.put("/assignment/:id", auth, updateAssignment);
router.delete("/assignment/:id", auth, deleteAssignment);
router.post("/assignment/:id/link-notes", auth, linkNotes);
router.delete("/assignment/:id/unlink-note/:noteId", auth, unlinkNote);

module.exports = {
    assignmentrouter: router
}
