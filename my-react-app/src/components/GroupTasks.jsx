import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import TimeTracker from './TimeTracker';
import GroupDashboard from './GroupDashboard';
import './TimeTracker.css';
import './ViewToggle.css';
import { apiFetch } from '../api';

export default function GroupTasks({ groupId, userId, isAdmin }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    timeLimit: '',
    isCollaborative: false
  });
  const [commentInputs, setCommentInputs] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const lastLogRef = React.useRef({});

  // fetchGroupDetails is intentionally not included in deps to avoid recreating the function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
  const res = await apiFetch(`/api/groups/${groupId}`);
  const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch group details');
        return;
      }
      setTasks(data.group.tasks);
      setGroupMembers(data.group.members);
    } catch (err) {
      setError('Network error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Only group admin can create tasks');
      return;
    }

    try {
      const res = await apiFetch(`/api/groups/${groupId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: userId,
          task: newTask
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create task');
        return;
      }

      setSuccess('Task created successfully!');
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        timeLimit: '',
        isCollaborative: false
      });
      fetchGroupDetails();
    } catch (err) {
      setError('Network error');
    }
  };

  const handleJoinTask = async (taskId) => {
    try {
      const res = await apiFetch(`/api/groups/${groupId}/tasks/${taskId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Failed to join task');
      setSuccess('Joined task');
      fetchGroupDetails();
    } catch (err) {
      setError('Network error');
    }
  };

  const handleAddComment = async (taskId) => {
    const comment = (commentInputs[taskId] || '').trim();
    if (!comment) return;
    try {
      const res = await apiFetch(`/api/groups/${groupId}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, comment })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Failed to add comment');
      setCommentInputs(prev => ({ ...prev, [taskId]: '' }));
      fetchGroupDetails();
    } catch (err) {
      setError('Network error');
    }
  };

  const handleAddTimeEntry = async (taskId, minutes) => {
    // Debounce duplicate logs per task (ignore logs within 5s)
    const now = Date.now();
    const last = lastLogRef.current[taskId] || 0;
    if (now - last < 5000) return; // ignore
    lastLogRef.current[taskId] = now;

    try {
      const res = await apiFetch(`/api/groups/${groupId}/tasks/${taskId}/time`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, timeSpent: minutes })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Failed to record time');
      // show confirmation
      setSuccess(`Logged ${minutes} minute${minutes > 1 ? 's' : ''}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchGroupDetails();
    } catch (err) {
      setError('Network error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleTimeUp = async (taskId) => {
    try {
      const res = await apiFetch(`/api/groups/${groupId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          completedBy: userId
        })
      });
      if (res.ok) {
        fetchGroupDetails();
      }
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const renderTasksView = () => (
    <>
      {isAdmin && (
        <div className="create-task">
          <h3>Create New Task</h3>
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                required
              >
                <option value="">Select member</option>
                {groupMembers.map(memberId => (
                  <option key={memberId} value={memberId}>
                    Member {memberId}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Time Limit (minutes)</label>
              <input
                type="number"
                value={newTask.timeLimit}
                onChange={(e) => setNewTask({ ...newTask, timeLimit: e.target.value })}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={newTask.isCollaborative}
                  onChange={(e) => setNewTask({ ...newTask, isCollaborative: e.target.checked })}
                />{' '}
                Collaborative task (multiple contributors)
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </form>
        </div>
      )}

      <div className="tasks-list">
        <h3>Group Tasks</h3>
        {tasks.length === 0 ? (
          <p>No tasks in this group yet.</p>
        ) : (
          <ul>
            {tasks.map(task => (
              <li key={task.id} className={`task-item ${task.status}`}>
                <h4>{task.title} {task.isCollaborative ? <span className="tag">Collaborative</span> : null}</h4>
                <p>{task.description}</p>
                <div className="task-details">
                  <span>Assigned to: Member {task.assignedTo}</span>
                  <span>Due: {formatDate(task.dueDate)}</span>
                  <span>Time Limit: {task.timeLimit} minutes</span>
                  <span>Status: {task.status}</span>
                </div>

                {task.isCollaborative && (
                  <div className="collaboration">
                    <strong>Collaborators:</strong>{' '}
                    {(task.collaborators || []).length === 0 ? 'None' : (
                      (task.collaborators || []).map(id => `Member ${id}`).join(', ')
                    )}
                    {!task.collaborators?.includes(userId) && groupMembers.includes(userId) && (
                      <div>
                        <button className="btn btn-secondary" onClick={() => handleJoinTask(task.id)}>Join Task</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Time tracker: show for assigned user OR collaborators on collaborative tasks */}
                {(Number(task.assignedTo) === userId || (task.isCollaborative && (task.collaborators || []).includes(userId))) && task.status !== 'completed' && (
                  <TimeTracker
                    task={task}
                    onTimeUpdate={(taskId, timeLeft, minutesRecorded) => {
                      if (typeof minutesRecorded === 'number') {
                        handleAddTimeEntry(taskId, minutesRecorded);
                      }
                      if (timeLeft === 0) handleTimeUp(taskId);
                    }}
                  />
                )}

                {/* Comments */}
                <div className="comments">
                  <h5>Comments</h5>
                  {(task.comments || []).length === 0 ? <p>No comments</p> : (
                    <ul className="comments-list">
                      {(task.comments || []).map(c => (
                        <li key={c.id}><strong>Member {c.userId}:</strong> {c.text} <em className="muted">{new Date(c.createdAt).toLocaleString()}</em></li>
                      ))}
                    </ul>
                  )}
                  {groupMembers.includes(userId) && (
                    <div className="add-comment">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[task.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                      />
                      <button className="btn" onClick={() => handleAddComment(task.id)}>Add</button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className="group-tasks">
      <div className="view-toggle">
        <button
          className={`toggle-btn ${!showDashboard ? 'active' : ''}`}
          onClick={() => setShowDashboard(false)}
        >
          Tasks
        </button>
        <button
          className={`toggle-btn ${showDashboard ? 'active' : ''}`}
          onClick={() => setShowDashboard(true)}
        >
          <BarChart2 size={18} />
          Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showDashboard ? (
        <GroupDashboard groupId={groupId} userId={userId} isAdmin={isAdmin} />
      ) : (
        renderTasksView()
      )}
    </div>
  );
}
