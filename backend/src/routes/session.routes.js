const express = require("express");
const router = express.Router();

const { createSession, getSessions, getWeeklySummary, deleteSession } = require("../controllers/session.controller");
const { auth } = require("../middleware/auth.middlewares");

router.post("/session", auth, createSession);
router.get("/sessions", auth, getSessions);
router.get("/sessions/weekly", auth, getWeeklySummary);
router.delete("/session/:id", auth, deleteSession);

module.exports = { sessionrouter: router };
