import React, { useState, useEffect, useCallback } from "react";
import { Clock, Play, Pause, RotateCcw, X, Edit2, Save, XCircle, Calendar, Settings, Bell, Download, Upload, Trash2, Star, Search, BarChart3, Archive, Plus, Volume2, VolumeX, Repeat, Trophy, Award, Send, ChevronsDown, ChevronsUp, Tag, Flag, Users, Moon, Flame } from "lucide-react";
import { AuthContext } from "./AuthContext";

// Achievement Component
function AchievementsPanel({ onClose }) {
  const achievements = [
    {
      id: 1,
      title: "Task Master",
      description: "Complete 50 tasks",
      icon: <Trophy size={24} />,
      progress: 15,
      total: 50
    },
    {
      id: 2,
      title: "Early Bird",
      description: "Complete 10 tasks before 9 AM",
      icon: <Award size={24} />,
      progress: 3,
      total: 10
    },
    {
      id: 3,
      title: "Team Player",
      description: "Collaborate on 20 group tasks",
      icon: <Users size={24} />,
      progress: 8,
      total: 20
    },
    {
      id: 4,
      title: "Streak Master",
      description: "Maintain a 7-day streak",
      icon: <Flame size={24} />,
      progress: 5,
      total: 7
    }
  ];

  return (
    <ModalPanel title="Achievements" icon={<Trophy size={20} />} onClose={onClose}>
      <div className="achievements-container">
        {achievements.map(achievement => (
          <div key={achievement.id} className="achievement-card">
            <div className="achievement-icon">
              {achievement.icon}
            </div>
            <div className="achievement-info">
              <h4>{achievement.title}</h4>
              <p>{achievement.description}</p>
              <div className="achievement-progress">
                <div 
                  className="achievement-progress-bar" 
                  style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                />
              </div>
              <p className="achievement-stats">
                {achievement.progress} / {achievement.total}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ModalPanel>
  );
}

// Settings Panel Component
// (Removed duplicate SettingsPanel — using the main SettingsPanel implementation lower in the file)

// (Removed duplicate ArchivePanel — using the main ArchivePanel implementation lower in the file)

// Reusable Modal Panel Component
function ModalPanel({ title, icon, onClose, children }) {
  return (
    <div className="settings-panel-backdrop">
      <div className="settings-panel">
        <div className="settings-header">
          <h3>{icon} {title}</h3>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        <div className="settings-content">
          {children}
        </div>
      </div>
    </div>
  );
}

// 1. Dashboard Header Component
function DashboardHeader({ user, onShowLeaderboard, onShowAnalytics, onShowArchive, onShowSettings, onShowAchievements, onExportData, onImportData }) {
  const displayName = user?.username || user?.email || 'User';
  const level = user?.level || 1;
  const points = user?.points || 0;
  return (
    <div className="dashboard-header">
      <div>
        <h2>Welcome back, {displayName}! 👋</h2>
        <p className="dashboard-subtitle">Let's make today productive</p>
        <div className="user-level">
          <Trophy size={18} /> Level {level} | {points} XP
        </div>
      </div>
      <div className="header-actions">
        <button className="icon-btn" onClick={onShowAchievements} title="Achievements">
          <Trophy size={20} />
        </button>
        <button className="icon-btn" onClick={onShowLeaderboard} title="Leaderboard">
          <Award size={20} />
        </button>
        <button className="icon-btn" onClick={onShowAnalytics} title="Analytics">
          <BarChart3 size={20} />
        </button>
        <button className="icon-btn" onClick={onShowArchive} title="Archive">
          <Archive size={20} />
        </button>
        <button className="icon-btn" onClick={onShowSettings} title="Settings">
          <Settings size={20} />
        </button>
        <button className="icon-btn" onClick={onExportData} title="Export Data">
          <Download size={20} />
        </button>
        <label className="icon-btn" title="Import Data">
          <Upload size={20} />
          <input type="file" accept=".json" onChange={onImportData} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
}

// 2. Pomodoro Timer Component
function PomodoroTimer({ settings, onSessionComplete }) {
  const [timerSeconds, setTimerSeconds] = useState(settings.workDuration * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState("work");

  // Sync timer with settings when they change
  useEffect(() => {
    if (!isTimerRunning) {
      setTimerSeconds(timerMode === "work" ? settings.workDuration * 60 : settings.breakDuration * 60);
    }
  }, [settings, timerMode, isTimerRunning]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timerSeconds === 0) {
      setIsTimerRunning(false);
      onSessionComplete(timerMode, timerMode === "work" ? settings.workDuration : settings.breakDuration);
      
      if (settings.autoStartBreak) {
        switchMode();
        setIsTimerRunning(true);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, settings, onSessionComplete, timerMode]);

  const switchMode = () => {
    const newMode = timerMode === "work" ? "break" : "work";
    const newSeconds = newMode === "work" ? settings.workDuration * 60 : settings.breakDuration * 60;
    setTimerMode(newMode);
    setTimerSeconds(newSeconds);
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(timerMode === "work" ? settings.workDuration * 60 : settings.breakDuration * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`timer-widget ${timerMode}`}>
      <div className="timer-modes">
        <button onClick={switchMode} className={timerMode === "work" ? "active" : ""}>Work</button>
        <button onClick={switchMode} className={timerMode === "break" ? "active" : ""}>Break</button>
      </div>
      <div className="timer-display">{formatTime(timerSeconds)}</div>
      <div className="timer-controls">
        <button className="timer-btn-main" onClick={() => setIsTimerRunning(!isTimerRunning)}>
          {isTimerRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button className="timer-btn-side" onClick={resetTimer}>
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}

// 3. Task Input Component
function TaskInput({ onAddTask }) {
  const [taskInput, setTaskInput] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("medium");
  const [selectedCategory, setSelectedCategory] = useState("personal");
  const [dueDate, setDueDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("daily");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskInput.trim() === "") return;
    
    onAddTask({
      text: taskInput,
      priority: selectedPriority,
      category: selectedCategory,
      dueDate: dueDate || null,
      recurring: isRecurring ? recurringPattern : null,
    });
    
    // Reset form
    setTaskInput("");
    setSelectedPriority("medium");
    setSelectedCategory("personal");
    setDueDate("");
    setIsRecurring(false);
  };

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <Plus size={20} className="input-icon" />
        <input
          type="text"
          placeholder="Add a new task..."
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <button type="submit" className="btn-primary">Add Task</button>
      </div>
      <div className="task-options">
        <div className="option-item">
          <Flag size={16} />
          <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="option-item">
          <Tag size={16} />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="shopping">Shopping</option>
            <option value="study">Study</option>
          </select>
        </div>
        <div className="option-item">
          <Calendar size={16} />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="option-item">
          <Repeat size={16} />
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          <label htmlFor="recurring">Recurring</label>
          {isRecurring && (
            <select value={recurringPattern} onChange={(e) => setRecurringPattern(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>
      </div>
    </form>
  );
}

// 4. Task Filters Component
function TaskFilters({ filter, setFilter, searchQuery, setSearchQuery }) {
  return (
    <div className="filter-controls">
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="filter-buttons">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
        <button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>Active</button>
        <button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>Completed</button>
        <button className={filter === "starred" ? "active" : ""} onClick={() => setFilter("starred")}>Starred</button>
      </div>
    </div>
  );
}

// 5. Task List Component
function TaskList({ tasks, handlers }) {
  if (tasks.length === 0) {
    return <div className="empty-state">No tasks found. Time to add some!</div>;
  }
  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} handlers={handlers} />
      ))}
    </div>
  );
}

// 6. Task Item Component
function TaskItem({ task, handlers }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [isSubtasksOpen, setIsSubtasksOpen] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  const handleSaveEdit = () => {
    handlers.onSaveEdit(task.id, editText);
    setIsEditing(false);
  };

  const handleAddSubtask = () => {
    handlers.onAddSubtask(task.id, subtaskInput);
    setSubtaskInput("");
  };

  const handleAddComment = () => {
    handlers.onAddComment(task.id, commentInput);
    setCommentInput("");
  };

  const isOverdue = (dueDate) => {
    if (!dueDate || task.completed) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#6b7280";
    }
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}`}>
      <div className="task-item-main">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed}
          onChange={() => handlers.onToggleComplete(task.id)}
        />
        <div className="task-content">
          {isEditing ? (
            <input
              type="text"
              className="edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
            />
          ) : (
            <span className="task-text">{task.text}</span>
          )}
          <div className="task-tags">
            <span className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
              {task.priority}
            </span>
            <span className="task-category">{task.category}</span>
            {task.dueDate && (
              <span className={`task-duedate ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="task-actions">
          {isEditing ? (
            <>
              <button className="icon-btn" onClick={handleSaveEdit} title="Save"><Save size={18} /></button>
              <button className="icon-btn" onClick={() => setIsEditing(false)} title="Cancel"><XCircle size={18} /></button>
            </>
          ) : (
            <>
              <button className="icon-btn" onClick={() => handlers.onToggleStar(task.id)} title="Star">
                <Star size={18} style={{ fill: task.starred ? 'var(--color-primary)' : 'none', color: task.starred ? 'var(--color-primary)' : 'currentColor' }} />
              </button>
              <button className="icon-btn" onClick={() => setIsEditing(true)} title="Edit"><Edit2 size={18} /></button>
              <button className="icon-btn" onClick={() => handlers.onDeleteTask(task.id)} title="Delete"><Trash2 size={18} /></button>
              <button className="icon-btn" onClick={() => handlers.onArchiveTask(task.id)} title="Archive"><Archive size={18} /></button>
            </>
          )}
        </div>
      </div>
      
      {(task.subtasks.length > 0 || task.comments.length > 0 || !isEditing) && (
        <div className="task-extras-toggle">
          {task.subtasks.length > 0 && (
            <button className="link-btn" onClick={() => setIsSubtasksOpen(!isSubtasksOpen)}>
              {isSubtasksOpen ? <ChevronsUp size={16} /> : <ChevronsDown size={16} />}
              Subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
            </button>
          )}
          {task.comments.length > 0 && (
             <button className="link-btn" onClick={() => setIsCommentsOpen(!isCommentsOpen)}>
              {isCommentsOpen ? <ChevronsUp size={16} /> : <ChevronsDown size={16} />}
              Comments ({task.comments.length})
            </button>
          )}
        </div>
      )}

      {isSubtasksOpen && (
        <div className="subtask-section">
          <ul className="subtask-list">
            {task.subtasks.map(st => (
              <li key={st.id} className={st.completed ? 'completed' : ''}>
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => handlers.onToggleSubtask(task.id, st.id)}
                />
                <span>{st.text}</span>
              </li>
            ))}
          </ul>
          <div className="add-subtask-form">
            <input
              type="text"
              placeholder="Add subtask..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
            />
            <button onClick={handleAddSubtask}><Plus size={16} /></button>
          </div>
        </div>
      )}

      {isCommentsOpen && (
        <div className="comment-section">
          <ul className="comment-list">
            {task.comments.map(comment => (
              <li key={comment.id}>
                <strong>{comment.author}</strong>
                <p>{comment.text}</p>
                <small>{new Date(comment.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
          <div className="add-comment-form">
            <input
              type="text"
              placeholder="Add comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <button onClick={handleAddComment}><Send size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// 7. Settings Panel Component
function SettingsPanel({ settings, setSettings, onClose }) {
  return (
    <ModalPanel title="Settings" icon={<Settings size={20} />} onClose={onClose}>
      <div className="setting-item">
        <label>
          <Bell size={18} />
          <span>Notifications</span>
        </label>
        <input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })} />
      </div>
      <div className="setting-item">
        <label>
          {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span>Sound Effects</span>
        </label>
        <input type="checkbox" checked={settings.soundEnabled} onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })} />
      </div>
      <div className="setting-item">
        <label>
          <Clock size={18} />
          <span>Work Duration (minutes)</span>
        </label>
        <input type="number" min="1" max="60" value={settings.workDuration} onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) })} className="setting-input" />
      </div>
      <div className="setting-item">
        <label>
          <Clock size={18} />
          <span>Break Duration (minutes)</span>
        </label>
        <input type="number" min="1" max="30" value={settings.breakDuration} onChange={(e) => setSettings({ ...settings, breakDuration: parseInt(e.target.value) })} className="setting-input" />
      </div>
      <div className="setting-item">
        <label>
          <Play size={18} />
          <span>Auto-start Breaks</span>
        </label>
        <input type="checkbox" checked={settings.autoStartBreak} onChange={(e) => setSettings({ ...settings, autoStartBreak: e.target.checked })} />
      </div>
      <div className="setting-item">
        <label>
          <Trophy size={18} />
          <span>Daily Goal (sessions)</span>
        </label>
        <input type="number" min="1" max="20" value={settings.dailyGoal} onChange={(e) => setSettings({ ...settings, dailyGoal: parseInt(e.target.value) })} className="setting-input" />
      </div>
    </ModalPanel>
  );
}

// 8. Analytics Panel Component
function AnalyticsPanel({ stats, categoryStats, timerHistory, onClose }) {
  const totalFocusMinutes = timerHistory
    .filter(s => s.type === "work")
    .reduce((acc, s) => acc + s.duration, 0);
  
  const sessionsByDay = timerHistory.reduce((acc, session) => {
    const day = new Date(session.completedAt).toDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  
  const days = Object.keys(sessionsByDay).length;
  
  return (
    <ModalPanel title="Analytics" icon={<BarChart3 size={20} />} onClose={onClose}>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Completion Rate</h4>
          <div className="analytics-stat">{stats.completionRate}%</div>
          <p>{stats.completed} / {stats.total} tasks</p>
        </div>
        <div className="analytics-card">
          <h4>Total Focus</h4>
          <div className="analytics-stat">{totalFocusMinutes}</div>
          <p>minutes</p>
        </div>
         <div className="analytics-card">
          <h4>Active Streak</h4>
          <div className="analytics-stat">{days}</div>
          <p>day(s)</p>
        </div>
        <div className="analytics-card">
          <h4>Starred Tasks</h4>
          <div className="analytics-stat">{stats.starred}</div>
          <p>important tasks</p>
        </div>
      </div>
      <h4 className="analytics-subtitle">Tasks by Category</h4>
      <div className="category-stats">
        {Object.keys(categoryStats).length > 0 ? Object.entries(categoryStats).map(([name, count]) => (
          <div key={name} className="category-item">
            <span className="category-name">{name}</span>
            <span className="category-count">{count}</span>
          </div>
        )) : <p>No category data yet.</p>}
      </div>
    </ModalPanel>
  );
}

// 9. Archive Panel Component
function ArchivePanel({ archivedTasks, onRestoreTask, onClose }) {
  return (
    <ModalPanel title="Archived Tasks" icon={<Archive size={20} />} onClose={onClose}>
      {archivedTasks.length === 0 && <p>Your archive is empty.</p>}
      <div className="archived-task-list">
        {archivedTasks.map(task => (
          <div key={task.id} className="archived-task-item">
            <span className="archived-task-text">{task.text}</span>
            <small>Archived: {new Date(task.archivedAt).toLocaleDateString()}</small>
            <button className="icon-btn" onClick={() => onRestoreTask(task.id)} title="Restore">
              <RotateCcw size={16} />
            </button>
          </div>
        ))}
      </div>
    </ModalPanel>
  );
}

// 10. Leaderboard/Achievements Panel Component
function LeaderboardPanel({ user, tasks, totalFocusMinutes, onClose }) {
  const badges = [
    { id: 'first_10', icon: '🏅', title: 'First 10', desc: 'Complete 10 tasks', unlocked: user.badges?.includes('first_10') },
    { id: 'centurion', icon: '💯', title: 'Centurion', desc: 'Complete 100 tasks', unlocked: user.badges?.includes('centurion') },
    { id: 'focused', icon: '🎯', title: 'Focused Mind', desc: 'Complete 50 focus sessions', unlocked: user.badges?.includes('focused') },
    { id: 'level_5', icon: '⭐', title: 'Rising Star', desc: 'Reach level 5', unlocked: user.level >= 5 },
    { id: 'superstar', icon: '🌟', title: 'Superstar', desc: 'Star 20 tasks', unlocked: tasks.filter(t => t.starred).length >= 20 },
    { id: 'time_master', icon: '⏰', title: 'Time Master', desc: 'Focus for 500 minutes', unlocked: totalFocusMinutes >= 500 },
  ];

  return (
    <ModalPanel title="Achievements & Badges" icon={<Award size={20} />} onClose={onClose}>
      <div className="badges-grid">
        {badges.map(badge => (
          <div key={badge.id} className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}>
            <div className="badge-icon">{badge.icon}</div>
            <h4>{badge.title}</h4>
            <p>{badge.desc}</p>
          </div>
        ))}
      </div>
    </ModalPanel>
  );
}


// ######################################################################
// ## MAIN DASHBOARD COMPONENT (Now much cleaner!)
// ######################################################################
export function Dashboard() {
  const { user, setUser } = React.useContext(AuthContext);
  // Normalize user fields to avoid runtime errors when backend returns only email/id
  const username = user?.username || user?.email || (user && `user_${user.id}`) || 'guest';
  const displayName = user?.username || user?.email || 'User';
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [timerHistory, setTimerHistory] = useState([]);
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    theme: 'light',
    workDuration: 25,
    breakDuration: 5,
    autoStartBreak: false,
    dailyGoal: 8
  });

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");
  const [celebration, setCelebration] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const tasksResult = await window.storage.get(`tasks_${username}`);
        if (tasksResult) setTasks(JSON.parse(tasksResult.value));

        const archivedResult = await window.storage.get(`archived_${username}`);
        if (archivedResult) setArchivedTasks(JSON.parse(archivedResult.value));

        const timerResult = await window.storage.get(`timer_${username}`);
        if (timerResult) setTimerHistory(JSON.parse(timerResult.value));

        const settingsResult = await window.storage.get(`settings_${username}`);
        if (settingsResult) setSettings(JSON.parse(settingsResult.value));
      } catch (error) {
        // No saved data found for this user yet — that's fine
      }
    };
    if (username && username !== 'guest') loadData();
  }, [username]);

  // Save data
  useEffect(() => {
    if (!username || username === 'guest') return;
    try {
      window.storage.set(`tasks_${username}`, JSON.stringify(tasks));
      window.storage.set(`archived_${username}`, JSON.stringify(archivedTasks));
      window.storage.set(`timer_${username}`, JSON.stringify(timerHistory));
      window.storage.set(`settings_${username}`, JSON.stringify(settings));
    } catch (e) {
      // ignore storage write errors
    }
  }, [tasks, archivedTasks, timerHistory, settings, username]);

  const showNotification = useCallback((msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  }, []);

  const awardPoints = useCallback((points) => {
    const newPoints = user.points + points;
    const newLevel = Math.floor(newPoints / 100) + 1;
    
    if (newLevel > user.level) {
      showNotification(`🎉 Level Up! You're now level ${newLevel}!`);
      setCelebration(true);
      setTimeout(() => setCelebration(false), 3000);
    }
    
    setUser({ ...user, points: newPoints, level: newLevel });
  }, [user, setUser, showNotification]);

  const checkAchievements = useCallback(() => {
    const badges = [...(user.badges || [])];
    
    if (tasks.filter(t => t.completed).length >= 10 && !badges.includes('first_10')) {
      badges.push('first_10');
      showNotification("🏆 Achievement Unlocked: First 10 Tasks!");
    }
    
    if (tasks.filter(t => t.completed).length >= 100 && !badges.includes('centurion')) {
      badges.push('centurion');
      showNotification("🏆 Achievement Unlocked: Centurion!");
    }
    
    if (timerHistory.filter(s => s.type === "work").length >= 50 && !badges.includes('focused')) {
      badges.push('focused');
      showNotification("🏆 Achievement Unlocked: Focused Mind!");
    }
    
    setUser({ ...user, badges });
  }, [tasks, timerHistory, user, setUser, showNotification]);

  const handleSessionComplete = useCallback((timerMode, duration) => {
    const sessionData = {
      type: timerMode,
      duration: duration,
      completedAt: new Date().toISOString()
    };
    setTimerHistory(prev => [sessionData, ...prev]);
    
    if (timerMode === "work") {
      awardPoints(5);
    }
    
    if (settings.soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGGS56+yhUhgLTKXh8bllHgU2jdXvzn0pBSl+zPLaizsKF2K36OyrWBUIR6Dg8r1sIAUsgs/y2Ik2Bxhns+Psn1AfC0ym4fK4Zh4FNo3V8M58KQVZ');
      audio.play();
    }
    
    showNotification(timerMode === "work" ? "✅ Work session complete! +5 points" : "✅ Break over! Back to work.");
  }, [settings.soundEnabled, awardPoints, showNotification]);

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
      starred: false,
      subtasks: [],
      timeSpent: 0,
      comments: []
    };
    setTasks([newTask, ...tasks]);
    awardPoints(2);
    showNotification("✅ Task added! +2 points");
  };

  const toggleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      const priorityPoints = { high: 10, medium: 5, low: 3 };
      awardPoints(priorityPoints[task.priority]);
      showNotification(`✅ Task completed! +${priorityPoints[task.priority]} points`);
      checkAchievements();
    }
    setTasks(tasks.map((task) => {
      if (task.id !== id) return task;
      const completed = !task.completed;
      return { ...task, completed, completedAt: completed ? new Date().toISOString() : null };
    }));
  };

  const toggleStar = (id) => {
    setTasks(tasks.map((task) => task.id === id ? { ...task, starred: !task.starred } : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
    showNotification("🗑️ Task deleted");
  };

  const archiveTask = (id) => {
    const taskToArchive = tasks.find(task => task.id === id);
    if (taskToArchive) {
      setArchivedTasks([...archivedTasks, { ...taskToArchive, archivedAt: new Date().toISOString() }]);
      setTasks(tasks.filter(task => task.id !== id));
      showNotification("📦 Task archived");
    }
  };

  const restoreTask = (id) => {
    const taskToRestore = archivedTasks.find(task => task.id === id);
    if (taskToRestore) {
      setTasks([...tasks, taskToRestore]);
      setArchivedTasks(archivedTasks.filter(task => task.id !== id));
      showNotification("♻️ Task restored");
    }
  };

  const addSubtask = (taskId, subtaskText) => {
    if (!subtaskText.trim()) return;
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, subtasks: [...task.subtasks, { id: Date.now(), text: subtaskText, completed: false }] }
        : task
    ));
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            subtasks: task.subtasks.map(st => 
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            )
          }
        : task
    ));
  };

  const addComment = (taskId, commentText) => {
    if (!commentText.trim()) return;
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            comments: [...task.comments, { 
              id: Date.now(), 
              text: commentText, 
              author: user.username,
              createdAt: new Date().toISOString() 
            }] 
          }
        : task
    ));
  };

  const saveEdit = (id, newText) => {
    if (newText.trim() === "") return;
    setTasks(tasks.map((task) => task.id === id ? { ...task, text: newText } : task));
    showNotification("💾 Task updated");
  };

  const exportData = () => {
    const data = { tasks, archivedTasks, timerHistory, settings, user, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskmaster-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showNotification("💾 Data exported successfully!");
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          setTasks(data.tasks || []);
          setArchivedTasks(data.archivedTasks || []);
          setTimerHistory(data.timerHistory || []);
          setSettings(data.settings || settings);
          showNotification("✅ Data imported successfully!");
        } catch (error) {
          showNotification("❌ Failed to import data");
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      if (filter === "starred") return task.starred;
      return true;
    })
    .filter(task => task.text.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.starred !== b.starred) return b.starred - a.starred;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
    starred: tasks.filter(t => t.starred).length
  };

  const categoryStats = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  const totalFocusMinutes = timerHistory
    .filter(s => s.type === "work")
    .reduce((acc, s) => acc + s.duration, 0);

  const taskHandlers = {
    onToggleComplete: toggleComplete,
    onToggleStar: toggleStar,
    onDeleteTask: deleteTask,
    onArchiveTask: archiveTask,
    onAddSubtask: addSubtask,
    onToggleSubtask: toggleSubtask,
    onAddComment: addComment,
    onSaveEdit: saveEdit,
  };

  return (
    <div className="dashboard">
      {notification && <div className="notification">{notification}</div>}
      {celebration && <div className="celebration">🎉 LEVEL UP! 🎉</div>}
      
      <DashboardHeader 
        user={user}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        onShowAnalytics={() => setShowAnalytics(true)}
        onShowArchive={() => setShowArchive(true)}
        onShowSettings={() => setShowSettings(true)}
        onShowAchievements={() => setShowAchievements(true)}
        onExportData={exportData}
        onImportData={importData}
      />

      {showLeaderboard && (
        <LeaderboardPanel 
          user={user}
          tasks={tasks}
          totalFocusMinutes={totalFocusMinutes}
          onClose={() => setShowLeaderboard(false)} 
        />
      )}

      {showAchievements && (
        <AchievementsPanel onClose={() => setShowAchievements(false)} />
      )}

      {showSettings && (
        <SettingsPanel 
          settings={settings}
          setSettings={setSettings}
          onClose={() => setShowSettings(false)}
          theme={settings.theme}
          onThemeChange={(theme) => setSettings({ ...settings, theme })}
          soundEnabled={settings.soundEnabled}
          onSoundToggle={(enabled) => setSettings({ ...settings, soundEnabled: enabled })}
        />
      )}

      {showAnalytics && (
        <AnalyticsPanel 
          stats={stats}
          categoryStats={categoryStats}
          timerHistory={timerHistory}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {showArchive && (
        <ArchivePanel 
          archivedTasks={archivedTasks}
          onRestoreTask={restoreTask}
          onClose={() => setShowArchive(false)}
        />
      )}

      <div className="dashboard-main-layout">
        <div className="dashboard-tasks">
          <TaskInput onAddTask={addTask} />
          <TaskFilters 
            filter={filter} 
            setFilter={setFilter} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
          <TaskList tasks={filteredTasks} handlers={taskHandlers} />
        </div>
        <div className="dashboard-sidebar">
          {/* Personal progress chart for admins / user */}
          <ProgressChart tasks={tasks} />
          <PomodoroTimer 
            settings={settings} 
            onSessionComplete={handleSessionComplete}
          />
        </div>
      </div>
    </div>
  );
}

// Personal progress chart (last 7 days) - simple SVG sparkline
function ProgressChart({ tasks }) {
  // compute completed tasks per day for last 7 days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const counts = days.map(d => {
    const day = d.toDateString();
    return tasks.filter(t => {
      if (!t.completed) return false;
      const dateToCheck = t.completedAt ? new Date(t.completedAt) : (t.createdAt ? new Date(t.createdAt) : null);
      if (!dateToCheck) return false;
      return dateToCheck.toDateString() === day;
    }).length;
  });

  const max = Math.max(...counts, 1);
  const width = 260;
  const height = 72;
  const padding = 6;

  const points = counts.map((c, i) => {
    const x = padding + (i * (width - padding * 2) / (counts.length - 1 || 1));
    const y = padding + (height - padding * 2) * (1 - c / max);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="progress-chart" aria-hidden>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <small style={{ color: 'var(--muted)' }}>Last 7 days</small>
        <small style={{ color: 'var(--muted)' }}>{counts.reduce((a,b)=>a+b,0)} tasks</small>
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline points={points} fill="none" stroke="var(--accent-start)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {counts.map((c, i) => {
          const x = padding + (i * (width - padding * 2) / (counts.length - 1 || 1));
          const y = padding + (height - padding * 2) * (1 - c / max);
          return <circle key={i} cx={x} cy={y} r={3} fill="var(--accent-end)" />;
        })}
      </svg>
    </div>
  );
}