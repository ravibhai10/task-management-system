const fs = require('fs-extra');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

async function seed() {
  await fs.ensureDir(DATA_DIR);

  const users = await fs.readJson(USERS_FILE).catch(() => []);
  const groups = await fs.readJson(GROUPS_FILE).catch(() => []);
  const tasks = await fs.readJson(TASKS_FILE).catch(() => []);

  // id base
  const now = Date.now();
  const demoUserId = now + 1;
  const demoGroupId = now + 2;
  const demoTaskId = now + 3;

  // add demo user if not exists
  const existing = users.find(u => u.email === 'demo@local');
  if (!existing) {
    const demoUser = { id: demoUserId, email: 'demo@local', password: 'demo', points: 0, level: 1, badges: [] };
    users.push(demoUser);
    console.log('Created demo user:', demoUser.email, demoUser.id);
  } else {
    console.log('Demo user already exists:', existing.email, existing.id);
  }

  // create demo group if not exists
  const existingGroup = groups.find(g => g.name === 'Demo Group');
  if (!existingGroup) {
    const newGroup = {
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
    };
    groups.push(newGroup);
    console.log('Created demo group:', newGroup.name, newGroup.id);
  } else {
    console.log('Demo group already exists:', existingGroup.name, existingGroup.id);
  }

  // no global tasks required; keep tasks.json as-is

  await fs.writeJson(USERS_FILE, users, { spaces: 2 });
  await fs.writeJson(GROUPS_FILE, groups, { spaces: 2 });
  await fs.writeJson(TASKS_FILE, tasks, { spaces: 2 });

  console.log('Seeding complete.');
}

seed().catch(err => { console.error('Seed failed', err); process.exit(1); });
