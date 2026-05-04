import { useEffect, useState, useCallback } from "react";
import { createAssignment, getAssignments, updateAssignment, deleteAssignment } from "../services/api";
import { AssignmentCard } from "../components/AssignmentCard";
import { Plus, Search, ClipboardList, X } from "lucide-react";

const SUBJECTS = ["General", "Math", "Science", "English", "History", "Programming", "Other"];
const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

// ── Modal ──
function AssignmentModal({ assignment, onClose, onSave }) {
  const [title, setTitle] = useState(assignment?.title || "");
  const [description, setDescription] = useState(assignment?.description || "");
  const [subject, setSubject] = useState(assignment?.subject || "General");
  const [dueDate, setDueDate] = useState(
    assignment?.dueDate ? new Date(assignment.dueDate).toISOString().split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    setSaving(true);
    await onSave({ title, description, subject, dueDate });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            {assignment ? "Edit Assignment" : "New Assignment"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            className="w-full bg-slate-800 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            type="text" placeholder="Assignment title *" value={title}
            onChange={(e) => setTitle(e.target.value)} required autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Subject</label>
              <select
                className="w-full bg-slate-800 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all"
                value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date *</label>
              <input
                className="w-full bg-slate-800 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required
              />
            </div>
          </div>

          <textarea
            className="w-full bg-slate-800 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            rows={4} placeholder="Description (optional)" value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-white/10 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 transition-all">
              {saving ? "Saving..." : assignment ? "Save Changes" : "Add Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──
export function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAssignments(statusFilter, subjectFilter, search);
      setAssignments(data);
    } catch (err) {
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, subjectFilter, search]);

  useEffect(() => {
    const timer = setTimeout(fetchAssignments, 300);
    return () => clearTimeout(timer);
  }, [fetchAssignments]);

  const openCreate = () => { setEditingAssignment(null); setShowModal(true); };
  const openEdit = (a) => { setEditingAssignment(a); setShowModal(true); };

  const handleSave = async (fields) => {
    try {
      if (editingAssignment) {
        await updateAssignment(editingAssignment._id, fields);
      } else {
        await createAssignment(fields.title, fields.description, fields.subject, fields.dueDate);
      }
      setShowModal(false);
      fetchAssignments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError("Failed to delete assignment");
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await updateAssignment(id, { status: "completed" });
      fetchAssignments();
    } catch (err) {
      setError("Failed to update assignment");
    }
  };

  // Quick stats
  const total = assignments.length;
  const pending = assignments.filter(a => a.status === "pending").length;
  const overdue = assignments.filter(a => a.status === "overdue").length;
  const completed = assignments.filter(a => a.status === "completed").length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            Assignments
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {total} total · <span className="text-amber-400">{pending} pending</span>
            {overdue > 0 && <> · <span className="text-red-400">{overdue} overdue</span></>}
            {completed > 0 && <> · <span className="text-emerald-400">{completed} done</span></>}
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shrink-0">
          <Plus size={16} /> New Assignment
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="w-full bg-slate-900 border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          placeholder="Search assignments..."
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Status tabs + Subject filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_TABS.map(({ value, label }) => (
            <button key={value} onClick={() => setStatusFilter(value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
                statusFilter === value
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <select
          className="bg-slate-900 border border-white/[0.08] rounded-xl py-1.5 px-3 text-xs text-slate-400 outline-none focus:border-indigo-500 transition-all"
          value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          {["All", ...SUBJECTS].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 mb-6 p-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20">
          {error}
          <button onClick={() => setError("")} className="ml-auto text-xs opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <ClipboardList size={28} className="text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-400 mb-1">
            {search ? "No assignments match your search" : "No assignments yet"}
          </h3>
          <p className="text-sm text-slate-600">
            {search ? "Try a different keyword" : "Add one to stay on track."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <AssignmentCard key={a._id} assignment={a}
              onDelete={handleDelete} onEdit={openEdit} onMarkComplete={handleMarkComplete} />
          ))}
        </div>
      )}

      {showModal && (
        <AssignmentModal assignment={editingAssignment} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
