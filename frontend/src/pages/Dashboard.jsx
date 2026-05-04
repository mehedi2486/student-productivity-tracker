import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getTask } from "../services/api";
import { getAssignments } from "../services/api";
import { getNotes } from "../services/api";
import { getSessions, getWeeklySummary } from "../services/api";
import {
  ListTodo, ClipboardList, Timer, BookOpen,
  AlertCircle, Clock, CheckCircle2, ArrowRight,
  TrendingUp, Zap, Calendar
} from "lucide-react";

// ── Helpers ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatDuration(seconds) {
  if (!seconds || seconds === 0) return "0m";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function getDaysLeft(dueDate) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
  return Math.round((due - now) / 86400000);
}

// ── Stat Card ──
function StatCard({ label, value, sub, icon: Icon, color, border, bg, to }) {
  const content = (
    <div className={`${bg} border ${border} rounded-xl p-4 sm:p-5 flex flex-col gap-3 hover:scale-[1.02] transition-all duration-200`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
        <Icon size={17} className={color} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${color}`} style={{ fontFamily: "Outfit, sans-serif" }}>{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

// ── Section header ──
function SectionHeader({ title, to, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>{title}</h2>
      {to && (
        <Link to={to} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          {linkLabel || "View all"} <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

export function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("Student");

  // Get username from token if stored
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.username) setUsername(payload.username);
      }
    } catch (_) {}
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [t, a, n, s, w] = await Promise.allSettled([
        getTask(),
        getAssignments(),
        getNotes(),
        getSessions(7),
        getWeeklySummary(),
      ]);
      if (t.status === "fulfilled") setTasks(t.value || []);
      if (a.status === "fulfilled") setAssignments(a.value || []);
      if (n.status === "fulfilled") setNotes(n.value || []);
      if (s.status === "fulfilled") setSessions(s.value || []);
      if (w.status === "fulfilled") setWeeklySummary(w.value || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived data ──
  const pendingTasks = tasks.filter(t => !t.status);
  const doneTasks = tasks.filter(t => t.status);

  const overdue = assignments.filter(a => a.status === "overdue");
  const dueSoon = assignments.filter(a => {
    const d = getDaysLeft(a.dueDate);
    return a.status === "pending" && d >= 0 && d <= 3;
  });
  const upcoming = assignments
    .filter(a => a.status !== "completed")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const recentNotes = [...notes].slice(0, 4);

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySessions = sessions.filter(s => new Date(s.date).toISOString().split("T")[0] === todayStr);
  const todayStudy = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const weeklyTotal = Object.values(weeklySummary).reduce((sum, v) => sum + v, 0);

  const NOTE_COLORS = {
    indigo: "border-t-indigo-500", purple: "border-t-purple-500",
    emerald: "border-t-emerald-500", amber: "border-t-amber-500",
    rose: "border-t-rose-500", cyan: "border-t-cyan-500",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Greeting ── */}
      <div className="mb-8">
        <p className="text-sm text-indigo-400 font-medium mb-1">{getGreeting()},</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white capitalize" style={{ fontFamily: "Outfit, sans-serif" }}>
          {username} 👋
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* ── Overview Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard label="Pending Tasks" value={pendingTasks.length}
          sub={`${doneTasks.length} done`}
          icon={ListTodo} color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20" to="/dashboard" />
        <StatCard label="Due Soon" value={dueSoon.length}
          sub={overdue.length > 0 ? `${overdue.length} overdue` : "assignments"}
          icon={ClipboardList} color={overdue.length > 0 ? "text-red-400" : "text-amber-400"}
          bg={overdue.length > 0 ? "bg-red-500/10" : "bg-amber-500/10"}
          border={overdue.length > 0 ? "border-red-500/20" : "border-amber-500/20"} to="/assignments" />
        <StatCard label="Study Today" value={formatDuration(todayStudy)}
          sub={`${todaySessions.length} session${todaySessions.length !== 1 ? "s" : ""}`}
          icon={Timer} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" to="/study" />
        <StatCard label="Notes" value={notes.length}
          sub="total created"
          icon={BookOpen} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" to="/notes" />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Today's Focus */}
        <div className="bg-slate-900 border border-white/[0.07] rounded-xl p-5">
          <SectionHeader title="Today's Focus" />
          <div className="space-y-3">
            {overdue.length === 0 && dueSoon.length === 0 && pendingTasks.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-500" />
                <p className="text-sm text-slate-400">You're all caught up! 🎉</p>
              </div>
            ) : (
              <>
                {/* Overdue */}
                {overdue.slice(0, 2).map(a => (
                  <Link to={`/assignments/${a._id}`} key={a._id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors">
                    <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{a.title}</p>
                      <p className="text-xs text-red-400">Overdue · {a.subject}</p>
                    </div>
                  </Link>
                ))}

                {/* Due soon */}
                {dueSoon.slice(0, 2).map(a => {
                  const d = getDaysLeft(a.dueDate);
                  return (
                    <Link to={`/assignments/${a._id}`} key={a._id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors">
                      <Clock size={15} className="text-amber-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{a.title}</p>
                        <p className="text-xs text-amber-400">{d === 0 ? "Due today" : `Due in ${d} day${d !== 1 ? "s" : ""}`} · {a.subject}</p>
                      </div>
                    </Link>
                  );
                })}

                {/* Pending tasks */}
                {pendingTasks.slice(0, 2).map(t => (
                  <div key={t._id} className="flex items-start gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <Zap size={15} className="text-indigo-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{t.title}</p>
                      <p className="text-xs text-indigo-400">Task · Pending</p>
                    </div>
                  </div>
                ))}

                {/* Suggested action */}
                {todayStudy === 0 && (
                  <Link to="/study" className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors">
                    <Timer size={15} className="text-emerald-400 shrink-0" />
                    <p className="text-sm text-slate-300">Start a study session today</p>
                    <ArrowRight size={13} className="text-emerald-400 ml-auto" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Study Progress */}
        <div className="bg-slate-900 border border-white/[0.07] rounded-xl p-5">
          <SectionHeader title="Study Progress" to="/study" />

          {/* Today vs weekly */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-emerald-400" style={{ fontFamily: "Outfit, sans-serif" }}>{formatDuration(todayStudy)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Today</p>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-indigo-400" style={{ fontFamily: "Outfit, sans-serif" }}>{formatDuration(weeklyTotal)}</p>
              <p className="text-xs text-slate-500 mt-0.5">This Week</p>
            </div>
          </div>

          {/* Mini weekly bar chart */}
          {Object.keys(weeklySummary).length > 0 && (() => {
            const entries = Object.entries(weeklySummary);
            const max = Math.max(...entries.map(([, v]) => v), 1);
            const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
            return (
              <div className="flex items-end gap-1.5 h-16">
                {entries.map(([date, sec]) => {
                  const pct = (sec / max) * 100;
                  const d = new Date(date + "T00:00:00");
                  const isToday = new Date().toISOString().split("T")[0] === date;
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-slate-800 rounded-t" style={{ height: "44px" }}>
                        <div
                          className={`w-full rounded-t transition-all duration-500 ${isToday ? "bg-gradient-to-t from-indigo-500 to-purple-500" : "bg-indigo-500/30"}`}
                          style={{ height: `${Math.max(pct, 3)}%`, marginTop: `${100 - Math.max(pct, 3)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] ${isToday ? "text-indigo-400" : "text-slate-600"}`}>{days[d.getDay()]}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {sessions.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-4">No study sessions this week</p>
          )}
        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Notes */}
        <div className="bg-slate-900 border border-white/[0.07] rounded-xl p-5">
          <SectionHeader title="Recent Notes" to="/notes" />
          {recentNotes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen size={24} className="mx-auto mb-2 text-slate-700" />
              <p className="text-xs text-slate-500">No notes yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {recentNotes.map(note => (
                <Link to="/notes" key={note._id}
                  className={`bg-slate-800 border-t-2 ${NOTE_COLORS[note.color] || NOTE_COLORS.indigo} border border-white/[0.05] rounded-lg p-3 hover:bg-slate-700 transition-colors`}>
                  <p className="text-xs font-medium text-white truncate">{note.title}</p>
                  {note.content && <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{note.content}</p>}
                  <span className="text-[10px] text-indigo-400 mt-1.5 block">{note.subject}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-slate-900 border border-white/[0.07] rounded-xl p-5">
          <SectionHeader title="Upcoming Deadlines" to="/assignments" />
          {upcoming.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={24} className="mx-auto mb-2 text-slate-700" />
              <p className="text-xs text-slate-500">No upcoming assignments</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map(a => {
                const d = getDaysLeft(a.dueDate);
                const isOverdue = a.status === "overdue";
                const isUrgent = d <= 1 && !isOverdue;
                return (
                  <Link to={`/assignments/${a._id}`} key={a._id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                    <div className={`w-1.5 h-8 rounded-full shrink-0 ${isOverdue ? "bg-red-500" : isUrgent ? "bg-amber-500" : "bg-indigo-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{a.title}</p>
                      <p className="text-xs text-slate-500">{a.subject}</p>
                    </div>
                    <span className={`text-xs font-medium shrink-0 ${isOverdue ? "text-red-400" : isUrgent ? "text-amber-400" : "text-slate-400"}`}>
                      {isOverdue ? "Overdue" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : `${d}d`}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}