const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(bodyParser.json());

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json');

async function ensureDataFiles() {
  await fs.ensureDir(DATA_DIR);
  if (!await fs.pathExists(USERS_FILE)) await fs.writeJson(USERS_FILE, []);
  if (!await fs.pathExists(TASKS_FILE)) await fs.writeJson(TASKS_FILE, []);
  if (!await fs.pathExists(GROUPS_FILE)) await fs.writeJson(GROUPS_FILE, []);
}

ensureDataFiles().catch(err => console.error('Failed to init data files', err));

// Seed demo data via API (convenience endpoint)
app.post('/api/seed', async (req, res) => {
  try {
    await fs.ensureDir(DATA_DIR);
    const users = await fs.readJson(USERS_FILE).catch(() => []);
    const groups = await fs.readJson(GROUPS_FILE).catch(() => []);
    const tasks = await fs.readJson(TASKS_FILE).catch(() => []);

    const now = Date.now();
    const demoUserId = now + 1;
    const demoGroupId = now + 2;
    const demoTaskId = now + 3;

    // create demo user if not exists
    if (!users.find(u => u.email === 'demo@local')) {
      users.push({ id: demoUserId, email: 'demo@local', password: 'demo', points: 50, level: 2, badges: [] });
    }

    // create demo group
    if (!groups.find(g => g.name === 'Demo Group')) {
      groups.push({
        id: demoGroupId,
        name: 'Demo Group',
        adminId: demoUserId,
        passcode: 'demo',
        members: [demoUserId],
        createdAt: new Date().toISOString(),
        tasks: [
          {
            id: demoTaskId,
            title: 'Demo Task',
            description: 'This is a seeded demo task',
            assignedTo: demoUserId,
            dueDate: null,
            timeLimit: '60',
            isCollaborative: false,
            createdAt: new Date().toISOString(),
            status: 'pending',
            completedBy: null,
            collaborators: [],
            comments: [],
            timeSpent: 0,
            lastActiveTime: null,
            timeHistory: []
          }
        ]
      });
    }

    await fs.writeJson(USERS_FILE, users, { spaces: 2 });
    await fs.writeJson(GROUPS_FILE, groups, { spaces: 2 });
    await fs.writeJson(TASKS_FILE, tasks, { spaces: 2 });
    res.json({ ok: true });
  } catch (err) {
    console.error('Seed failed', err);
    res.status(500).json({ error: 'Seed failed' });
  }
});

// Admin endpoints to inspect server data (for local dev/demo only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await fs.readJson(USERS_FILE).catch(() => []);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'failed' });
  }
});

app.get('/api/admin/groups', async (req, res) => {
  try {
    const groups = await fs.readJson(GROUPS_FILE).catch(() => []);
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ error: 'failed' });
  }
});

app.get('/api/admin/tasks', async (req, res) => {
  try {
    const tasks = await fs.readJson(TASKS_FILE).catch(() => []);
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: 'failed' });
  }
});

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Auth: signup (very simple, no hashing - for demo only)
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const users = await fs.readJson(USERS_FILE);
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'User already exists' });

  const newUser = { id: Date.now(), email, password, points: 0, level: 1, badges: [] };
  users.push(newUser);
  await fs.writeJson(USERS_FILE, users);
  res.json({ ok: true, user: { id: newUser.id, email: newUser.email, points: newUser.points, level: newUser.level } });
});

// Auth: login (demo)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const users = await fs.readJson(USERS_FILE);
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ ok: true, user: { id: user.id, email: user.email, points: user.points, level: user.level } });
});

// Tasks endpoints (per-user filtering not implemented in demo)
app.get('/api/tasks', async (req, res) => {
  const tasks = await fs.readJson(TASKS_FILE);
  res.json({ tasks });
});

app.post('/api/tasks', async (req, res) => {
  const task = req.body;
  if (!task || !task.text) return res.status(400).json({ error: 'Task text required' });
  const tasks = await fs.readJson(TASKS_FILE);
  const newTask = { id: Date.now(), ...task, createdAt: new Date().toISOString() };
  tasks.push(newTask);
  await fs.writeJson(TASKS_FILE, tasks);
  res.json({ ok: true, task: newTask });
});

app.put('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  const tasks = await fs.readJson(TASKS_FILE);
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  tasks[idx] = { ...tasks[idx], ...req.body };
  await fs.writeJson(TASKS_FILE, tasks);
  res.json({ ok: true, task: tasks[idx] });
});

app.delete('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  let tasks = await fs.readJson(TASKS_FILE);
  tasks = tasks.filter(t => t.id !== id);
  await fs.writeJson(TASKS_FILE, tasks);
  res.json({ ok: true });
});

// Group Management Endpoints
app.post('/api/groups', async (req, res) => {
  const { name, adminId, passcode } = req.body;
  if (!name || !adminId || !passcode) {
    return res.status(400).json({ error: 'Name, adminId and passcode are required' });
  }

  const groups = await fs.readJson(GROUPS_FILE);
  const newGroup = {
    id: Date.now(),
    name,
    adminId,
    passcode,
    members: [adminId],
    createdAt: new Date().toISOString(),
    tasks: []
  };

  groups.push(newGroup);
  await fs.writeJson(GROUPS_FILE, groups);
  res.json({ ok: true, group: newGroup });
});

app.post('/api/groups/join', async (req, res) => {
  const { groupId, userId, passcode } = req.body;
  if (!groupId || !userId || !passcode) {
    return res.status(400).json({ error: 'GroupId, userId and passcode are required' });
  }

  const groups = await fs.readJson(GROUPS_FILE);
  const group = groups.find(g => g.id === Number(groupId));
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  if (group.passcode !== passcode) {
    return res.status(401).json({ error: 'Invalid passcode' });
  }

  if (group.members.includes(Number(userId))) {
    return res.status(400).json({ error: 'User is already a member' });
  }

  group.members.push(Number(userId));
  await fs.writeJson(GROUPS_FILE, groups);
  res.json({ ok: true, group });
});

app.post('/api/groups/:groupId/tasks', async (req, res) => {
  const { groupId } = req.params;
  const { adminId, task } = req.body;
  if (!task || !adminId) {
    return res.status(400).json({ error: 'Task details and adminId are required' });
  }

  const groups = await fs.readJson(GROUPS_FILE);
  const group = groups.find(g => g.id === Number(groupId));
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  if (group.adminId !== Number(adminId)) {
    return res.status(403).json({ error: 'Only group admin can assign tasks' });
  }

  const newTask = {
    id: Date.now(),
    ...task,
    createdAt: new Date().toISOString(),
    status: 'pending',
     completedBy: null,
     isCollaborative: task.isCollaborative || false,
     collaborators: task.isCollaborative ? [Number(task.assignedTo)] : [],
     comments: [],
     timeSpent: 0,
     lastActiveTime: null,
     timeHistory: []
  };

  group.tasks.push(newTask);
  await fs.writeJson(GROUPS_FILE, groups);
  res.json({ ok: true, task: newTask });
});

// Update task status
app.put('/api/groups/:groupId/tasks/:taskId', async (req, res) => {
  const { groupId, taskId } = req.params;
  const updates = req.body;

  const groups = await fs.readJson(GROUPS_FILE);
  const group = groups.find(g => g.id === Number(groupId));
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const task = group.tasks.find(t => t.id === Number(taskId));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

   // Validate permissions for status updates
   if (updates.status === 'completed') {
     if (task.isCollaborative) {
       if (!task.collaborators.includes(Number(updates.completedBy))) {
         return res.status(403).json({ error: 'Only collaborators can complete this task' });
       }
     } else if (task.assignedTo !== Number(updates.completedBy)) {
       return res.status(403).json({ error: 'Only assigned user can complete this task' });
     }
  }

  // Add archiving functionality
  if (updates.status === 'archived' && !isAdmin) {
    return res.status(403).json({ error: 'Only admin can archive tasks' });
  }

  Object.assign(task, updates);
  if (updates.status === 'completed' && !task.completedAt) {
    task.completedAt = new Date().toISOString();
  } else if (updates.status === 'archived' && !task.archivedAt) {
    task.archivedAt = new Date().toISOString();
  }

  await fs.writeJson(GROUPS_FILE, groups);
  res.json({ ok: true, task });
});

app.get('/api/groups/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const groups = await fs.readJson(GROUPS_FILE);
  const userGroups = groups.filter(g => g.members.includes(Number(userId)));
  res.json({ groups: userGroups });
});

app.get('/api/groups/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const groups = await fs.readJson(GROUPS_FILE);
  const group = groups.find(g => g.id === Number(groupId));
  if (!group) return res.status(404).json({ error: 'Group not found' });
  res.json({ group });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// Join collaborative task
app.post('/api/groups/:groupId/tasks/:taskId/join', async (req, res) => {
  const { groupId, taskId } = req.params;
  const { userId } = req.body;

  const groups = await fs.readJson(GROUPS_FILE);
  const group = groups.find(g => g.id === Number(groupId));
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const task = group.tasks.find(t => t.id === Number(taskId));
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (!task.isCollaborative) {
    return res.status(400).json({ error: 'This is not a collaborative task' });
  }

  if (!group.members.includes(Number(userId))) {
    return res.status(403).json({ error: 'User is not a member of this group' });
  }

  if (task.collaborators.includes(Number(userId))) {
    return res.status(400).json({ error: 'User is already collaborating on this task' });
  }

  task.collaborators.push(Number(userId));
  await fs.writeJson(GROUPS_FILE, groups);
  res.json({ ok: true, task });
});

// Add comment to task
app.post('/api/groups/:groupId/tasks/:taskId/comments', async (req, res) => {
  const { groupId, taskId } = req.params;
  const { userId, comment } = req.body;

  if (!comment || !userId) {
    return res.status(400).json({ error: 'Comment and userId are required' });
  }

  const groups = await fs.readJson(GROUPS_FILE);
  const group = groups.find(g => g.id === Number(groupId));
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const task = group.tasks.find(t => t.id === Number(taskId));
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (!group.members.includes(Number(userId))) {
    return res.status(403).json({ error: 'User is not a member of this group' });
  }

  const newComment = {
    id: Date.now(),
    userId,
    text: comment,
    createdAt: new Date().toISOString()
  };

  task.comments.push(newComment);
  await fs.writeJson(GROUPS_FILE, groups);
  res.json({ ok: true, comment: newComment });
});

// Update task time tracking
app.put('/api/groups/:groupId/tasks/:taskId/time', async (req, res) => {
  const { groupId, taskId } = req.params;
  const { userId, timeSpent } = req.body;

  const groups = await fs.readJson(GROUPS_FILE);
  const group = groups.find(g => g.id === Number(groupId));
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const task = group.tasks.find(t => t.id === Number(taskId));
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (task.assignedTo !== Number(userId) && !task.collaborators.includes(Number(userId))) {
    return res.status(403).json({ error: 'User is not assigned to this task' });
  }

  const timeEntry = {
    userId,
    time: timeSpent,
    recordedAt: new Date().toISOString()
  };

  task.timeHistory.push(timeEntry);
  task.timeSpent = task.timeHistory.reduce((total, entry) => total + entry.time, 0);
  task.lastActiveTime = timeEntry.recordedAt;

  await fs.writeJson(GROUPS_FILE, groups);
  res.json({ ok: true, task });
});
