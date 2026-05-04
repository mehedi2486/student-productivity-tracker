const { assignmentModel } = require("../models/assignment.model");

exports.createAssignment = async (req, res) => {
    const userId = req.userId;
    const { title, description, subject, dueDate } = req.body;

    try {
        const assignment = await assignmentModel.create({
            title, description, subject, dueDate, userId
        });
        res.status(201).json({ message: "Assignment created", assignment });
    } catch (error) {
        res.status(500).json({ message: "Failed to create assignment" });
    }
};

exports.getAssignments = async (req, res) => {
    const userId = req.userId;
    const { status, subject, search } = req.query;

    try {
        const filter = { userId };
        if (subject && subject !== "All") filter.subject = subject;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        let assignments = await assignmentModel.find(filter).sort({ dueDate: 1 });

        // Auto-mark overdue
        const now = new Date();
        for (let a of assignments) {
            if (a.status === "pending" && new Date(a.dueDate) < now) {
                a.status = "overdue";
                await a.save();
            }
        }

        if (status && status !== "all") {
            assignments = assignments.filter(a => a.status === status);
        }

        res.json({ assignments });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch assignments" });
    }
};

// Get single assignment with populated linked notes
exports.getAssignment = async (req, res) => {
    const assignmentId = req.params.id;
    const userId = req.userId;

    try {
        const assignment = await assignmentModel
            .findOne({ _id: assignmentId, userId })
            .populate("linkedNotes");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Auto-mark overdue
        if (assignment.status === "pending" && new Date(assignment.dueDate) < new Date()) {
            assignment.status = "overdue";
            await assignment.save();
        }

        res.json({ assignment });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch assignment" });
    }
};

exports.updateAssignment = async (req, res) => {
    const assignmentId = req.params.id;
    const userId = req.userId;
    const { title, description, subject, dueDate, status } = req.body;

    try {
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (subject !== undefined) updateData.subject = subject;
        if (dueDate !== undefined) updateData.dueDate = dueDate;
        if (status !== undefined) updateData.status = status;

        const updated = await assignmentModel.findOneAndUpdate(
            { _id: assignmentId, userId },
            updateData,
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Assignment not found" });
        res.json({ message: "Assignment updated", assignment: updated });
    } catch (error) {
        res.status(500).json({ message: "Failed to update assignment" });
    }
};

exports.deleteAssignment = async (req, res) => {
    const assignmentId = req.params.id;
    const userId = req.userId;

    try {
        const deleted = await assignmentModel.findOneAndDelete({ _id: assignmentId, userId });
        if (!deleted) return res.status(404).json({ message: "Assignment not found" });
        res.json({ message: "Assignment deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete assignment" });
    }
};

// Link notes to assignment
exports.linkNotes = async (req, res) => {
    const assignmentId = req.params.id;
    const userId = req.userId;
    const { noteIds } = req.body; 

    try {
        const assignment = await assignmentModel.findOne({ _id: assignmentId, userId });
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        // Add new note IDs without duplicates
        const existing = assignment.linkedNotes.map(id => id.toString());
        const toAdd = noteIds.filter(id => !existing.includes(id));
        assignment.linkedNotes.push(...toAdd);
        await assignment.save();

        // Return populated assignment
        const populated = await assignmentModel.findById(assignmentId).populate("linkedNotes");
        res.json({ message: "Notes linked", assignment: populated });
    } catch (error) {
        res.status(500).json({ message: "Failed to link notes" });
    }
};

// Unlink a single note from assignment
exports.unlinkNote = async (req, res) => {
    const assignmentId = req.params.id;
    const noteId = req.params.noteId;
    const userId = req.userId;

    try {
        const assignment = await assignmentModel.findOne({ _id: assignmentId, userId });
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        assignment.linkedNotes = assignment.linkedNotes.filter(
            id => id.toString() !== noteId
        );
        await assignment.save();

        const populated = await assignmentModel.findById(assignmentId).populate("linkedNotes");
        res.json({ message: "Note unlinked", assignment: populated });
    } catch (error) {
        res.status(500).json({ message: "Failed to unlink note" });
    }
};
