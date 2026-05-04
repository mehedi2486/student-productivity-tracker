import { useEffect, useState, useRef, useCallback } from "react";
import { createSession, getSessions, getWeeklySummary, deleteSession } from "../services/api";
import { Plus, Play, Pause, Square, Trash2, Timer, X, BookOpen } from "lucide-react";

const SUBJECTS = ["General", "Math", "Science", "English", "History", "Programming", "Other"];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

// ── Today's Plan ──
function TodaysPlan({ tasks, onAdd, onRemove, onStart, activeTask }) {
  const [showAdd, setShowAdd] = useState(false);
  const [subject, setSubject] = useState("General");
  const [taskName, setTaskName] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    onAdd({ subject, task: taskName.trim() });
    setTaskName("");
    setShowAdd(false);
  };

  return (
    <div className="bg-slate-900 border border-white/[0.07] rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white text-base" style={{ fontFamily: "Outfit, sans-serif" }}>Today's Plan</h2>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
          <Plus size={13} /> Add
        </button>
      </div>

      {/* Add task form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="mb-4 space-y-2">
          <select className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
            value={subject} onChange={e => setSubject(e.target.value)}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-2">
            <input className="flex-1 bg-slate-800 border border-white/10 rounded-lg py-2 px-3 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
              placeholder="Task name..." value={taskName} onChange={e => setTaskName(e.target.value)} required autoFocus />
            <button type="submit" className="px-3 py-2 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors">Save</button>
          </div>
        </form>
      )}

      {/* Task list */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-8">No tasks planned. Add one to get started.</p>
        ) : tasks.map((t, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
            activeTask === i ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
          }`}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{t.task}</p>
              <span className="text-xs text-indigo-400">{t.subject}</span>
            </div>
            <button onClick={() => onStart(i)} title="Start"
              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors shrink-0">
              <Play size={13} />
            </button>
            <button onClick={() => onRemove(i)} title="Remove"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Study Timer ──
function StudyTimer({ activeTaskInfo, elapsed, running, onStart, onPause, onStop }) {
  const progress = Math.min((elapsed / 3600) * 100, 100); // up to 1 hour = 100%

  return (
    <div className="bg-slate-900 border border-white/[0.07] rounded-xl p-5 flex flex-col items-center justify-center h-full">
      <h2 className="font-semibold text-white text-base mb-6 self-start" style={{ fontFamily: "Outfit, sans-serif" }}>Study Timer</h2>

      {/* Active task label */}
      {activeTaskInfo ? (
        <div className="text-center mb-4">
          <p className="text-xs text-indigo-400 font-medium">{activeTaskInfo.subject}</p>
          <p className="text-sm text-slate-300">{activeTaskInfo.task}</p>
        </div>
      ) : (
        <p className="text-xs text-slate-500 mb-4">Select a task to start studying</p>
      )}

      {/* Timer ring */}
      <div className="relative w-44 h-44 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(30,41,59)" strokeWidth="4" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#timerGrad)" strokeWidth="4"
            strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="transition-all duration-1000" />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white tabular-nums tracking-wider" style={{ fontFamily: "Outfit, sans-serif" }}>
            {formatTime(elapsed)}
          </span>
          {running && <span className="text-xs text-emerald-400 mt-1 animate-pulse">Recording...</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!running ? (
          <button onClick={onStart} disabled={!activeTaskInfo}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 transition-all">
            <Play size={15} /> Start
          </button>
        ) : (
          <button onClick={onPause}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
            <Pause size={15} /> Pause
          </button>
        )}
        <button onClick={onStop} disabled={elapsed === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40 transition-colors">
          <Square size={15} /> Stop
        </button>
      </div>
    </div>
  );
}

// ── Weekly Summary Bar Chart ──
function WeeklySummary({ summary }) {
  if (!summary) return null;

  const entries = Object.entries(summary);
  const maxSeconds = Math.max(...entries.map(([, v]) => v), 1);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-slate-900 border border-white/[0.07] rounded-xl p-5">
      <h2 className="font-semibold text-white text-base mb-5" style={{ fontFamily: "Outfit, sans-serif" }}>Weekly Summary</h2>
      <div className="flex items-end gap-2 h-32">
        {entries.map(([date, seconds]) => {
          const pct = (seconds / maxSeconds) * 100;
          const d = new Date(date + "T00:00:00");
          const dayLabel = days[d.getDay()];
          const isToday = new Date().toISOString().split("T")[0] === date;

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-500">{seconds > 0 ? formatDuration(seconds) : ""}</span>
              <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-800" style={{ height: "80px" }}>
                <div
                  className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${
                    isToday ? "bg-gradient-to-t from-indigo-500 to-purple-500" : "bg-indigo-500/40"
                  }`}
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${isToday ? "text-indigo-400" : "text-slate-500"}`}>{dayLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──
export function StudyTracker() {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Load saved plan from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("studyPlan");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("studyPlan", JSON.stringify(tasks));
  }, [tasks]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sessData, summData] = await Promise.all([getSessions(7), getWeeklySummary()]);
      setSessions(sessData);
      setSummary(summData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const addTask = (t) => setTasks(prev => [...prev, t]);
  const removeTask = (i) => {
    if (activeTask === i) { setRunning(false); setActiveTask(null); setElapsed(0); }
    setTasks(prev => prev.filter((_, idx) => idx !== i));
    if (activeTask !== null && i < activeTask) setActiveTask(a => a - 1);
  };
  const startTask = (i) => {
    setActiveTask(i);
    setElapsed(0);
    setRunning(true);
  };
  const handleStart = () => { if (activeTask !== null) setRunning(true); };
  const handlePause = () => setRunning(false);
  const handleStop = async () => {
    setRunning(false);
    if (elapsed > 0 && activeTask !== null) {
      const t = tasks[activeTask];
      try {
        await createSession(t.subject, t.task, elapsed);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
    setElapsed(0);
    setActiveTask(null);
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const activeTaskInfo = activeTask !== null ? tasks[activeTask] : null;
  const totalToday = sessions
    .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
          Study Tracker
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Today: <span className="text-indigo-400 font-medium">{formatDuration(totalToday)}</span> studied
        </p>
      </div>

      {/* Top: Plan + Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TodaysPlan tasks={tasks} onAdd={addTask} onRemove={removeTask} onStart={startTask} activeTask={activeTask} />
        <StudyTimer activeTaskInfo={activeTaskInfo} elapsed={elapsed} running={running}
          onStart={handleStart} onPause={handlePause} onStop={handleStop} />
      </div>

      {/* Weekly Summary */}
      <div className="mb-6">
        <WeeklySummary summary={summary} />
      </div>

      {/* Study History */}
      <div className="bg-slate-900 border border-white/[0.07] rounded-xl p-5">
        <h2 className="font-semibold text-white text-base mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
          Recent Sessions
          {sessions.length > 0 && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">{sessions.length}</span>
          )}
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10">
            <Timer size={28} className="mx-auto mb-2 text-slate-700" />
            <p className="text-sm text-slate-500">No sessions yet. Start studying to build your history.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessions.map(s => (
              <div key={s._id} className="group flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.task}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-indigo-400">{s.subject}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">
                      {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-medium text-emerald-400 tabular-nums">{formatDuration(s.duration)}</span>
                <button onClick={() => handleDeleteSession(s._id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-red-400 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
