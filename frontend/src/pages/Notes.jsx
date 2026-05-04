import { useEffect, useState, useCallback } from "react";
import { createNote, getNotes, updateNote, deleteNote, pinNote } from "../services/api";
import { NoteCard } from "../components/NoteCard";
import { Plus, X, BookOpen, Search, Pin } from "lucide-react";

const COLORS = ["indigo", "purple", "emerald", "amber", "rose", "cyan"];
const SUBJECTS = ["General", "Math", "Science", "English", "History", "Programming", "Other"];

const colorDot = {
  indigo: "bg-indigo-500", purple: "bg-purple-500", emerald: "bg-emerald-500",
  amber: "bg-amber-500", rose: "bg-rose-500", cyan: "bg-cyan-500",
};

// Empty state component
function EmptyState({ search, subject }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <BookOpen size={28} className="text-slate-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-400 mb-1">
        {search ? "No notes match your search" : subject !== "All" ? `No notes in "${subject}"` : "No notes yet"}
      </h3>
      <p className="text-sm text-slate-600">
        {search ? "Try a different keyword" : "Click \"New Note\" to create your first note"}
      </p>
    </div>
  );
}

// Create/Edit Modal
function NoteModal({ note, onClose, onSave }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [subject, setSubject] = useState(note?.subject || "General");
  const [color, setColor] = useState(note?.color || "indigo");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title, content, subject, color });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            {note ? "Edit Note" : "New Note"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <input
            className="w-full bg-slate-800 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            type="text" placeholder="Note title *"
            value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus
          />

          {/* Subject + Color row */}
          <div className="flex gap-3">
            <select
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all"
              value={subject} onChange={(e) => setSubject(e.target.value)}
            >
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Color dots */}
            <div className="flex items-center gap-2 px-3 bg-slate-800 border border-white/10 rounded-xl">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full ${colorDot[c]} transition-all ${
                    color === c ? "ring-2 ring-white ring-offset-1 ring-offset-slate-800 scale-110" : "opacity-50 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <textarea
            className="w-full bg-slate-800 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            rows={8} placeholder="Start writing your note..."
            value={content} onChange={(e) => setContent(e.target.value)}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-white/10 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 transition-all">
              {saving ? "Saving..." : note ? "Save Changes" : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Notes Page ──
export function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotes(filterSubject, search);
      setNotes(data);
    } catch (err) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [filterSubject, search]);

  // Debounced search — fetch after user stops typing 400ms
  useEffect(() => {
    const timer = setTimeout(fetchNotes, 400);
    return () => clearTimeout(timer);
  }, [fetchNotes]);

  const openCreate = () => { setEditingNote(null); setShowModal(true); };
  const openEdit = (note) => { setEditingNote(note); setShowModal(true); };

  const handleSave = async (fields) => {
    try {
      if (editingNote) {
        await updateNote(editingNote._id, fields);
      } else {
        await createNote(fields.title, fields.content, fields.subject, fields.color);
      }
      setShowModal(false);
      fetchNotes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      setError("Failed to delete note");
    }
  };

  const handlePin = async (noteId, currentPinned) => {
    try {
      await pinNote(noteId, !currentPinned);
      fetchNotes();
    } catch (err) {
      setError("Failed to pin note");
    }
  };

  const pinnedNotes = notes.filter((n) => n.pinned);
  const unpinnedNotes = notes.filter((n) => !n.pinned);

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            My Notes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
            {pinnedNotes.length > 0 && ` · ${pinnedNotes.length} pinned`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shrink-0"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* ── Search + Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full bg-slate-900 border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Subject filter tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {["All", ...SUBJECTS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterSubject(s)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all border ${
              filterSubject === s
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07] hover:text-slate-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 mb-6 p-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20">
          {error}
          <button onClick={() => setError("")} className="ml-auto text-xs opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState search={search} subject={filterSubject} />
      ) : (
        <>
          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Pin size={13} className="text-indigo-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pinned</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard key={note._id} note={note} onDelete={handleDelete} onEdit={openEdit} onPin={handlePin} />
                ))}
              </div>
            </div>
          )}

          {/* Other notes */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">All Notes</span>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinnedNotes.map((note) => (
                  <NoteCard key={note._id} note={note} onDelete={handleDelete} onEdit={openEdit} onPin={handlePin} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <NoteModal
          note={editingNote}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
