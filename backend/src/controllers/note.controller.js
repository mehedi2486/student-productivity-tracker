const { noteModel } = require("../models/note.model");

exports.createNote = async (req, res) => {
    const userId = req.userId;
    const { title, content, subject, color } = req.body;

    try {
        const note = await noteModel.create({
            title, content, subject, color, userId
        });

        res.status(201).json({ message: "Note created", note });
    } catch (error) {
        res.status(500).json({ message: "Failed to create note" });
    }
};

exports.getNotes = async (req, res) => {
    const userId = req.userId;
    const { subject, search } = req.query;

    try {
        const filter = { userId };
        if (subject && subject !== "All") {
            filter.subject = subject;
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } }
            ];
        }

        // Pinned notes first, then by updatedAt
        const notes = await noteModel.find(filter).sort({ pinned: -1, updatedAt: -1 });

        res.json({ notes });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notes" });
    }
};

exports.updateNote = async (req, res) => {
    const noteId = req.params.id;
    const userId = req.userId;
    const { title, content, subject, color, pinned } = req.body;

    try {
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (subject !== undefined) updateData.subject = subject;
        if (color !== undefined) updateData.color = color;
        if (pinned !== undefined) updateData.pinned = pinned;

        const updatedNote = await noteModel.findOneAndUpdate(
            { _id: noteId, userId },
            updateData,
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json({ message: "Note updated", note: updatedNote });
    } catch (error) {
        res.status(500).json({ message: "Failed to update note" });
    }
};

exports.deleteNote = async (req, res) => {
    const noteId = req.params.id;
    const userId = req.userId;

    try {
        const deletedNote = await noteModel.findOneAndDelete({
            _id: noteId, userId
        });

        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json({ message: "Note deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete note" });
    }
};
