import React, { useState, useEffect } from 'react';
import { Users, Award, Archive, Star, Clock } from 'lucide-react';
import './GroupDashboard.css';
import { apiFetch } from '../api';

export default function GroupDashboard({ groupId, userId, isAdmin }) {
  const [groupStats, setGroupStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeMembers: 0,
    avgCompletionTime: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [timeContributions, setTimeContributions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
  const res = await apiFetch(`/api/groups/${groupId}`);
  const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to fetch group data');
        return;
      }

      // Calculate statistics
      const tasks = data.group.tasks || [];
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const activeMembers = new Set(tasks.map(t => t.assignedTo)).size;
      
      const avgTime = completedTasks.length > 0
        ? completedTasks.reduce((acc, task) => {
            const start = new Date(task.createdAt);
            const end = new Date(task.completedAt);
            return acc + (end - start);
          }, 0) / completedTasks.length
        : 0;

      setGroupStats({
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        activeMembers,
        avgCompletionTime: Math.round(avgTime / (1000 * 60)) // Convert to minutes
      });

      // Calculate achievements
      const achievements = calculateAchievements(tasks, data.group.members);
      setAchievements(achievements);

      // Get archived tasks
      setArchivedTasks(tasks.filter(t => t.status === 'archived'));

      // Calculate top performers
      const performers = calculateTopPerformers(tasks, data.group.members);
      setTopPerformers(performers);

  // Calculate time contributions per user
  const contributions = calculateTimeContributions(tasks);
  setTimeContributions(contributions);

    } catch (err) {
      setError('Network error');
    }
  };

  const calculateTimeContributions = (tasks) => {
    const map = new Map();
    tasks.forEach(task => {
      (task.timeHistory || []).forEach(entry => {
        const prev = map.get(entry.userId) || 0;
        map.set(entry.userId, prev + (entry.time || 0));
      });
    });
    return Array.from(map.entries()).map(([userId, seconds]) => ({ userId, minutes: Math.round(seconds / 60) }))
      .sort((a, b) => b.minutes - a.minutes);
  };

  const calculateAchievements = (tasks, members) => {
    const achievements = [];
    
    // Speed achievement
    const fastTasks = tasks.filter(t => {
      if (!t.completedAt) return false;
      const duration = new Date(t.completedAt) - new Date(t.createdAt);
      return duration < t.timeLimit * 60 * 1000;
    });

    if (fastTasks.length >= 5) {
      achievements.push({
        icon: <Clock size={20} />,
        title: 'Speed Demon',
        description: 'Completed 5 tasks before time limit'
      });
    }

    // Streak achievement
    const streakCount = calculateLongestStreak(tasks);
    if (streakCount >= 3) {
      achievements.push({
        icon: <Star size={20} />,
        title: 'Task Streak Master',
        description: `${streakCount} tasks completed in a row`
      });
    }

    // Collaboration achievement
    const collaborativeTasks = tasks.filter(t => 
      t.status === 'completed' && t.collaborators?.length > 1
    );

    if (collaborativeTasks.length >= 3) {
      achievements.push({
        icon: <Users size={20} />,
        title: 'Team Player',
        description: 'Completed 3 collaborative tasks'
      });
    }

    return achievements;
  };

  const calculateTopPerformers = (tasks, members) => {
    const performanceMap = new Map();
    
    members.forEach(memberId => {
      const memberTasks = tasks.filter(t => t.assignedTo === memberId);
      const completed = memberTasks.filter(t => t.status === 'completed').length;
      const onTime = memberTasks.filter(t => {
        if (!t.completedAt) return false;
        const duration = new Date(t.completedAt) - new Date(t.createdAt);
        return duration <= t.timeLimit * 60 * 1000;
      }).length;

      performanceMap.set(memberId, {
        memberId,
        completed,
        onTime,
        score: completed * 10 + onTime * 5
      });
    });

    return Array.from(performanceMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const calculateLongestStreak = (tasks) => {
    const sortedTasks = tasks
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sortedTasks.length; i++) {
      const prevDate = new Date(sortedTasks[i-1].completedAt);
      const currDate = new Date(sortedTasks[i].completedAt);
      
      if (currDate - prevDate <= 24 * 60 * 60 * 1000) { // Within 24 hours
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  return (
    <div className="group-dashboard">
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <div className="stat-value">{groupStats.totalTasks}</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-value">{groupStats.completedTasks}</div>
        </div>
        <div className="stat-card">
          <h3>Active Members</h3>
          <div className="stat-value">{groupStats.activeMembers}</div>
        </div>
        <div className="stat-card">
          <h3>Avg. Completion Time</h3>
          <div className="stat-value">{groupStats.avgCompletionTime} min</div>
        </div>
      </div>

      {/* Achievements Section */}
      <section className="achievements-section">
        <h3><Award size={20} /> Achievements</h3>
        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <div key={index} className="achievement-card">
              <div className="achievement-icon">{achievement.icon}</div>
              <h4>{achievement.title}</h4>
              <p>{achievement.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Performers */}
      <section className="top-performers-section">
        <h3><Star size={20} /> Top Performers</h3>
        <div className="performers-grid">
          {topPerformers.map((performer, index) => (
            <div key={performer.memberId} className={`performer-card rank-${index + 1}`}>
              <div className="rank">{index + 1}</div>
              <div className="performer-details">
                <h4>Member {performer.memberId}</h4>
                <p>{performer.completed} tasks completed</p>
                <p>{performer.onTime} on time</p>
                <div className="score">Score: {performer.score}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Time Contributions */}
      <section className="time-contributions-section">
        <h3><Clock size={20} /> Time Contributions</h3>
        {timeContributions.length === 0 ? (
          <p>No time logged yet</p>
        ) : (
          <ul className="contributions-list">
            {timeContributions.map(tc => (
              <li key={tc.userId}>
                <strong>Member {tc.userId}:</strong> {tc.minutes} min
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Archived Tasks */}
      {isAdmin && (
        <section className="archived-tasks-section">
          <h3><Archive size={20} /> Archived Tasks</h3>
          <div className="archived-tasks-list">
            {archivedTasks.length === 0 ? (
              <p>No archived tasks</p>
            ) : (
              <ul>
                {archivedTasks.map(task => (
                  <li key={task.id} className="archived-task">
                    <h4>{task.title}</h4>
                    <p>Completed by: Member {task.completedBy}</p>
                    <p>Archived on: {new Date(task.archivedAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}