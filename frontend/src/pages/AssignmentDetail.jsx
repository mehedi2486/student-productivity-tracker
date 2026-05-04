import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssignment, updateAssignment, getNotes, createNote, linkNotesToAssignment, unlinkNoteFromAssignment } from "../services/api";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, BookOpen, Plus, Link2, Unlink, X, Search } from "lucide-react";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   icon: Clock,       cls: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  completed: { label: "Completed", icon: CheckCircle2, cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  overdue:   { label: "Overdue",   icon: AlertCircle,  cls: "bg-red-500/15 text-red-400 border-red-500/25" },
};

const SUBJECTS = ["General", "Math", "Science", "English", "History", "Programming", "Other"];

// ── Link Notes Modal ──
function LinkNotesModal({ assignmentId, alreadyLinked, onClose, onLinked }) {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getNotes(filterSubject, search);
        // Exclude already-linked notes
        const linkedIds = alreadyLinked.map(n => n._id);
        setNotes(data.filter(n => !linkedIds.includes(n._id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [filterSubject, search, alreadyLinked]);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleLink = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      const updated = await linkNotesToAssignment(assignmentId, selected);
      onLinked(updated);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <h2 className="font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>Link Existing Notes</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Search + Filter */}
        <div className="px-6 pt-4 space-y-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="w-full bg-slate-800 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
              placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["All", ...SUBJECTS].map(s => (
              <button key={s} onClick={() => setFilterSubject(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 border transition-colors ${
                  filterSubject === s ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
          {loading ? (
            <div className="text-center py-8"><div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin mx-auto" /></div>
          ) : notes.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No notes available to link</p>
          ) : notes.map(note => (
            <label key={note._id}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                selected.includes(note._id) ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              }`}>
              <input type="checkbox" checked={selected.includes(note._id)} onChange={() => toggle(note._id)}
                className="mt-0.5 accent-indigo-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{note.title}</p>
                {note.content && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{note.content}</p>}
                <span className="text-xs text-indigo-400 mt-1 inline-block">{note.subject}</span>
              </div>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] shrink-0">
          <button onClick={handleLink} disabled={selected.length === 0 || saving}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 transition-all">
            {saving ? "Linking..." : `Link ${selected.length} Note${selected.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New Note Modal (for this assignment) ──
function NewNoteModal({ assignmentSubject, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const data = await createNote(title, content, assignmentSubject, "indigo");
      onCreated(data.note);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>New Note for Assignment</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input className="w-full bg-slate-800 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            type="text" placeholder="Note title *" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
          <textarea className="w-full bg-slate-800 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            rows={6} placeholder="Write your study notes..." value={content} onChange={e => setContent(e.target.value)} />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 border border-white/10 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 disabled:opacity-60 transition-all">
              {saving ? "Creating..." : "Create & Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Note Viewer Modal ──
function NoteViewModal({ note, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="font-semibold text-white">{note.title}</h2>
            <span className="text-xs text-indigo-400">{note.subject}</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content || "No content."}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const data = await getAssignment(id);
      setAssignment(data);
    } catch (err) {
      setError("Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignment(); }, [id]);

  const handleUnlink = async (noteId) => {
    try {
      const updated = await unlinkNoteFromAssignment(id, noteId);
      setAssignment(updated);
    } catch (err) {
      setError("Failed to unlink note");
    }
  };

  const handleNewNoteCreated = async (note) => {
    // Link the newly created note to this assignment
    try {
      const updated = await linkNotesToAssignment(id, [note._id]);
      setAssignment(updated);
    } catch (err) {
      setError("Failed to link new note");
    }
  };

  const handleMarkComplete = async () => {
    try {
      await updateAssignment(id, { status: "completed" });
      fetchAssignment();
    } catch (err) {
      setError("Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="max-w-4xl mx-auto text-center py-24">
        <p className="text-red-400 mb-4">{error || "Assignment not found"}</p>
        <button onClick={() => navigate("/assignments")} className="text-indigo-400 hover:underline text-sm">← Back to Assignments</button>
      </div>
    );
  }

  const { label, icon: StatusIcon, cls } = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.pending;
  const linkedNotes = assignment.linkedNotes || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button onClick={() => navigate("/assignments")}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Assignments
      </button>

      {/* Assignment info card */}
      <div className="bg-slate-900 border border-white/[0.07] rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              {assignment.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                {assignment.subject}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={12} />
                Due: {new Date(assignment.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}>
                <StatusIcon size={11} /> {label}
              </span>
            </div>
            {assignment.description && (
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">{assignment.description}</p>
            )}
          </div>

          {assignment.status !== "completed" && (
            <button onClick={handleMarkComplete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors shrink-0">
              <CheckCircle2 size={15} /> Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Linked Notes section */}
      <div className="bg-slate-900 border border-white/[0.07] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <BookOpen size={17} className="text-indigo-400" />
            <h2 className="font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
              Linked Notes
            </h2>
            {linkedNotes.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                {linkedNotes.length}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowLinkModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-colors">
              <Link2 size={13} /> Add Note
            </button>
            <button onClick={() => setShowNewNoteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all">
              <Plus size={13} /> New Note
            </button>
          </div>
        </div>

        {/* Linked notes grid */}
        {linkedNotes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={32} className="mx-auto mb-3 text-slate-700" />
            <p className="text-sm text-slate-500">No notes linked yet</p>
            <p className="text-xs text-slate-600 mt-1">Link existing notes or create a new one for this assignment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {linkedNotes.map(note => (
              <div key={note._id}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-2 hover:border-indigo-500/30 transition-all cursor-pointer"
                onClick={() => setViewingNote(note)}>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-white truncate flex-1">{note.title}</h4>
                  <button
                    title="Unlink"
                    onClick={(e) => { e.stopPropagation(); handleUnlink(note._id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Unlink size={13} />
                  </button>
                </div>
                {note.content && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{note.content}</p>
                )}
                <span className="text-xs text-indigo-400">{note.subject}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showLinkModal && (
        <LinkNotesModal
          assignmentId={id}
          alreadyLinked={linkedNotes}
          onClose={() => setShowLinkModal(false)}
          onLinked={(updated) => setAssignment(updated)}
        />
      )}
      {showNewNoteModal && (
        <NewNoteModal
          assignmentSubject={assignment.subject}
          onClose={() => setShowNewNoteModal(false)}
          onCreated={handleNewNoteCreated}
        />
      )}
      {viewingNote && (
        <NoteViewModal
          note={viewingNote}
          onClose={() => setViewingNote(null)}
        />
      )}
    </div>
  );
}
