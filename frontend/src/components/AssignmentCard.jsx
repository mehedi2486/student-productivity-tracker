import { useNavigate } from "react-router-dom";
import { Trash2, Pencil, CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react";

const SUBJECT_COLORS = {
  Math: "bg-blue-500/20 text-blue-400",
  Science: "bg-emerald-500/20 text-emerald-400",
  English: "bg-violet-500/20 text-violet-400",
  History: "bg-amber-500/20 text-amber-400",
  Programming: "bg-cyan-500/20 text-cyan-400",
  General: "bg-slate-500/20 text-slate-400",
  Other: "bg-rose-500/20 text-rose-400",
};

const STATUS_CONFIG = {
  pending:   { label: "Pending",   icon: Clock,         classes: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  completed: { label: "Completed", icon: CheckCircle2,  classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  overdue:   { label: "Overdue",   icon: AlertCircle,   classes: "bg-red-500/15 text-red-400 border-red-500/25" },
};

function getDaysLeft(dueDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - now) / (1000 * 60 * 60 * 24));
}

export function AssignmentCard({ assignment, onDelete, onEdit, onMarkComplete }) {
  const navigate = useNavigate();
  const { label, icon: StatusIcon, classes } = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.pending;
  const subjectColor = SUBJECT_COLORS[assignment.subject] || SUBJECT_COLORS.General;
  const daysLeft = getDaysLeft(assignment.dueDate);
  const isCompleted = assignment.status === "completed";
  const linkedCount = assignment.linkedNotes?.length || 0;

  const dueDateLabel = () => {
    if (isCompleted) return `Due ${new Date(assignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    if (daysLeft < 0) return `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? "s" : ""} overdue`;
    if (daysLeft === 0) return "Due today!";
    if (daysLeft === 1) return "Due tomorrow";
    return `${daysLeft} days left`;
  };

  const urgencyBorder = () => {
    if (isCompleted) return "border-l-emerald-500";
    if (daysLeft < 0) return "border-l-red-500";
    if (daysLeft <= 2) return "border-l-amber-500";
    return "border-l-indigo-500";
  };

  return (
    <div className={`
      group bg-slate-900 border border-white/[0.07] border-l-2 ${urgencyBorder()}
      rounded-xl p-5 flex flex-col gap-3
      hover:border-white/[0.14] hover:shadow-lg transition-all duration-200
      ${isCompleted ? "opacity-70" : ""}
    `}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base leading-snug ${isCompleted ? "line-through text-slate-500" : "text-white"}`}>
            {assignment.title}
          </h3>
        </div>
        <span className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${classes}`}>
          <StatusIcon size={11} />
          {label}
        </span>
      </div>

      {/* Subject + due date row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${subjectColor}`}>
          {assignment.subject}
        </span>
        <span className={`flex items-center gap-1 text-xs font-medium ${
          isCompleted ? "text-slate-500" :
          daysLeft < 0 ? "text-red-400" :
          daysLeft <= 2 ? "text-amber-400" : "text-slate-400"
        }`}>
          <Clock size={11} />
          {dueDateLabel()}
        </span>
        {/* Linked notes count badge */}
        {linkedCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400">
            📝 {linkedCount} note{linkedCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Description */}
      {assignment.description && (
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{assignment.description}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-1 flex-wrap">
        {/* View Details — primary action */}
        <button
          onClick={() => navigate(`/assignments/${assignment._id}`)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
        >
          View Details <ChevronRight size={12} />
        </button>

        {!isCompleted && (
          <button
            onClick={() => onMarkComplete(assignment._id)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <CheckCircle2 size={13} /> Done
          </button>
        )}
        <button
          onClick={() => onEdit(assignment)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(assignment._id)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
