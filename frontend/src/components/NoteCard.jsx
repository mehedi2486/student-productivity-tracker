import { Trash2, Pencil, Pin, Share2 } from "lucide-react";

const colorMap = {
  indigo:  { border: "border-t-indigo-500",  tag: "bg-indigo-500/20 text-indigo-400",  glow: "hover:shadow-indigo-500/10" },
  purple:  { border: "border-t-purple-500",  tag: "bg-purple-500/20 text-purple-400",  glow: "hover:shadow-purple-500/10" },
  emerald: { border: "border-t-emerald-500", tag: "bg-emerald-500/20 text-emerald-400", glow: "hover:shadow-emerald-500/10" },
  amber:   { border: "border-t-amber-500",   tag: "bg-amber-500/20 text-amber-400",   glow: "hover:shadow-amber-500/10" },
  rose:    { border: "border-t-rose-500",    tag: "bg-rose-500/20 text-rose-400",    glow: "hover:shadow-rose-500/10" },
  cyan:    { border: "border-t-cyan-500",    tag: "bg-cyan-500/20 text-cyan-400",    glow: "hover:shadow-cyan-500/10" },
};

export function NoteCard({ note, onDelete, onEdit, onPin, onShare }) {
  const c = colorMap[note.color] || colorMap.indigo;

  const handleShare = (e) => {
    e.stopPropagation();
    const text = `📝 ${note.title}\n\n${note.content}`;
    if (navigator.share) {
      navigator.share({ title: note.title, text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Note copied to clipboard!");
    }
  };

  return (
    <div
      onClick={() => onEdit(note)}
      className={`
        group relative bg-slate-900 border-t-2 ${c.border} border border-white/[0.06]
        rounded-xl p-5 flex flex-col gap-3 cursor-pointer
        transition-all duration-200
        hover:scale-[1.02] hover:shadow-xl ${c.glow} hover:border-white/10
        ${note.pinned ? "ring-1 ring-indigo-500/30" : ""}
      `}
    >
      {/* Pin badge */}
      {note.pinned && (
        <span className="absolute top-3 right-3 text-indigo-400">
          <Pin size={13} className="fill-current" />
        </span>
      )}

      {/* Subject tag */}
      <span className={`self-start text-xs font-medium px-2.5 py-0.5 rounded-full ${c.tag}`}>
        {note.subject}
      </span>

      {/* Title */}
      <h3 className="font-semibold text-white text-base leading-snug pr-4">{note.title}</h3>

      {/* Content preview */}
      {note.content && (
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 flex-1">{note.content}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-slate-600">
          {new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>

        {/* Action icons — visible on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            title={note.pinned ? "Unpin" : "Pin"}
            onClick={(e) => { e.stopPropagation(); onPin(note._id, note.pinned); }}
            className={`p-1.5 rounded-lg transition-colors ${note.pinned ? "text-indigo-400 bg-indigo-500/10" : "text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10"}`}
          >
            <Pin size={14} />
          </button>
          <button
            title="Share / Copy"
            onClick={handleShare}
            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            <Share2 size={14} />
          </button>
          <button
            title="Edit"
            onClick={(e) => { e.stopPropagation(); onEdit(note); }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(note._id); }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
