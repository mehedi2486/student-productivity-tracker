const { sessionModel } = require("../models/session.model");

// Save a completed study session
exports.createSession = async (req, res) => {
    const userId = req.userId;
    const { subject, task, duration, date } = req.body;

    try {
        const session = await sessionModel.create({
            subject, task, duration, date: date || new Date(), userId
        });
        res.status(201).json({ message: "Session saved", session });
    } catch (error) {
        res.status(500).json({ message: "Failed to save session" });
    }
};

// Get all sessions (optionally filtered by date range)
exports.getSessions = async (req, res) => {
    const userId = req.userId;
    const { days } = req.query; // e.g. days=7 for last 7 days

    try {
        const filter = { userId };

        if (days) {
            const since = new Date();
            since.setDate(since.getDate() - parseInt(days));
            filter.date = { $gte: since };
        }

        const sessions = await sessionModel.find(filter).sort({ date: -1 });
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch sessions" });
    }
};

// Get weekly summary (total seconds per day for last 7 days)
exports.getWeeklySummary = async (req, res) => {
    const userId = req.userId;

    try {
        const since = new Date();
        since.setDate(since.getDate() - 6);
        since.setHours(0, 0, 0, 0);

        const sessions = await sessionModel.find({
            userId,
            date: { $gte: since }
        });

        // Build a map: "YYYY-MM-DD" -> totalSeconds
        const summary = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split("T")[0];
            summary[key] = 0;
        }

        sessions.forEach(s => {
            const key = new Date(s.date).toISOString().split("T")[0];
            if (summary[key] !== undefined) {
                summary[key] += s.duration;
            }
        });

        res.json({ summary });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch weekly summary" });
    }
};

// Delete a session
exports.deleteSession = async (req, res) => {
    const sessionId = req.params.id;
    const userId = req.userId;

    try {
        const deleted = await sessionModel.findOneAndDelete({ _id: sessionId, userId });
        if (!deleted) return res.status(404).json({ message: "Session not found" });
        res.json({ message: "Session deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete session" });
    }
};
