import { CheckCircle2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export function TaskCard({ task, onDelete, onToggle }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 flex flex-col gap-3 hover:border-indigo-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200">
      {/* Top: title + badge */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h3 className={`font-semibold text-base leading-snug ${task.status ? "line-through text-slate-500" : "text-slate-100"}`}>
          {task.title}
        </h3>
        <span className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
          task.status
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
            : "bg-amber-500/15 text-amber-400 border-amber-500/25"
        }`}>
          <CheckCircle2 size={11} />
          {task.status ? "Done" : "Pending"}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-slate-400 leading-relaxed">{task.description}</p>
      )}

      {/* Buttons */}
      <div className="flex gap-2 mt-1 flex-wrap">
        <button
          onClick={() => onToggle(task._id, task.status)}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
        >
          {task.status ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {task.status ? "Mark Pending" : "Mark Done"}
        </button>
        <button
          onClick={() => onDelete(task._id)}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}
