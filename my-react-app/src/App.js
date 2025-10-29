import React, { useState, useEffect } from "react";
import { apiFetch } from './api';
import { AuthContext } from "./AuthContext";
import GroupManagement from "./components/GroupManagement";
import GroupTasks from "./components/GroupTasks";
import Hero from "./components/Hero";
import About from "./components/About";
import Pricing from "./components/Pricing";
import Logos from "./components/Logos";
import Testimonial from "./components/Testimonial";
import Footer from "./components/Footer";
import { Dashboard } from "./Dashboard";
import "./index.css";
import ApiStatus from "./components/ApiStatus";

import { API_BASE } from "./api";



// storage abstraction: use existing window.storage if present, otherwise localStorage
const storage = window.storage || {
  async get(k) {
    const v = window.localStorage.getItem(k);
    if (v === null) throw new Error("not found");
    return { value: v };
  },
  async set(k, v) {
    window.localStorage.setItem(k, v);
  },
  async delete(k) {
    window.localStorage.removeItem(k);
  },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return window.localStorage.getItem('theme') || 'light'; } catch (e) { return 'light'; }
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await storage.get("current_user");
        if (res && res.value) setUser(JSON.parse(res.value));
      } catch (e) {}
      setDataLoaded(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    if (user) storage.set("current_user", JSON.stringify(user));
    else storage.delete("current_user").catch(() => {});
  }, [user, dataLoaded]);

  const navigate = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    try { window.localStorage.setItem('theme', theme); } catch (e) {}
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (!dataLoaded) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, navigate, theme, setTheme }}>
      <div className="app-root">
        <Navbar page={page} navigate={navigate} />
        <main className="container">
          {page === "home" && (
            <>
              <Hero navigate={navigate} />
              <Logos />
              <About />
              <Testimonial />
              <Pricing />
              <Footer />
            </>
          )}
          {page === "about" && <><About /><Footer /></>}
          {page === "pricing" && <><Pricing /><Footer /></>}
          {page === "groups" && user && <GroupManagement userId={user.id} />}
          {page === "group-tasks" && user && (
            <GroupTasks groupId={user.currentGroupId} userId={user.id} isAdmin={user.currentGroupRole === "admin"} />
          )}
          {page === "admin" && <AdminPanel />}
          {page === "dashboard" && (user ? <Dashboard /> : <Login />)}
          {page === "signup" && <Signup />}
          {page === "login" && <Login />}
        </main>
      </div>
    </AuthContext.Provider>
  );
}

function Navbar({ page, navigate }) {
  const { user, setUser, theme, setTheme } = React.useContext(AuthContext);

  const logout = () => {
    setUser(null);
    navigate("home");
  };

  return (
    <header className="navbar" style={{ padding: 12, borderBottom: "1px solid #eee", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong style={{ fontSize: 18, cursor: "pointer" }} onClick={() => navigate("home")}>TaskMaster</strong>
          {/* Company marquee showing who uses the system */}
          <div className="company-marquee" aria-hidden>
            <div className="marquee-track">
              <span>Acme Co.</span>
              <span>Fintech Labs</span>
              <span>Green Energy</span>
              <span>EduWorks</span>
              <span>HealthPlus</span>
              <span>Studio42</span>
              {/* duplicate for smooth loop */}
              <span>Acme Co.</span>
              <span>Fintech Labs</span>
              <span>Green Energy</span>
              <span>EduWorks</span>
              <span>HealthPlus</span>
              <span>Studio42</span>
            </div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 8 }}>
          <button onClick={() => navigate("home")} className={`btn btn-sm ${page === "home" ? 'btn-primary' : 'btn-outline-secondary'}`}>Home</button>
          <button onClick={() => navigate("groups")} className={`btn btn-sm ${page === "groups" ? 'btn-primary' : 'btn-outline-secondary'}`}>Groups</button>
          <button onClick={() => navigate("about")} className={`btn btn-sm ${page === "about" ? 'btn-primary' : 'btn-outline-secondary'}`}>About</button>
          <button onClick={() => navigate("pricing")} className={`btn btn-sm ${page === "pricing" ? 'btn-primary' : 'btn-outline-secondary'}`}>Pricing</button>
          <button onClick={() => navigate("admin")} className={`btn btn-sm ${page === "admin" ? 'btn-primary' : 'btn-outline-secondary'}`}>Admin</button>
          {user && user.currentGroupId && <button onClick={() => navigate("group-tasks")} className="btn btn-sm btn-outline-secondary">My Group</button>}
          <button onClick={() => navigate("dashboard")} className={`btn btn-sm ${page === "dashboard" ? 'btn-primary' : 'btn-outline-secondary'}`}>Dashboard</button>
        </nav>
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 8 }} className="me-2">{user.email}</span>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="btn btn-sm btn-outline-secondary me-2">{theme === 'light' ? '🌙' : '☀️'}</button>
            <button onClick={logout} className="btn btn-sm btn-outline-danger">Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate("login")} className="btn btn-sm btn-outline-primary me-2">Login</button>
            <button onClick={() => navigate("signup")} className="btn btn-sm btn-primary">Sign up</button>
          </>
        )}
      </div>
    </header>
  );
}



function Signup() {
  const { setUser, navigate } = React.useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e && e.preventDefault();
    
    // Validation
    if (!email || !password) { 
      setStatus("Please enter both email and password"); 
      return; 
    }
    if (password.length < 6) {
      setStatus("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch("/api/auth/signup", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email, password }) 
      });
      const data = await res.json();
      
      if (!res.ok) { 
        setStatus(data.error || "Signup failed"); 
        return; 
      }
      
      const u = data.user;
      const userObj = { id: u.id, email: u.email };
      setUser(userObj);
      
      // auto-select if exactly one group
      try {
  const gres = await apiFetch(`/api/groups/user/${u.id}`);
        if (gres.ok) {
          const gdata = await gres.json();
          if (Array.isArray(gdata.groups) && gdata.groups.length === 1) {
            const grp = gdata.groups[0];
            setUser(prev => ({ 
              ...prev, 
              currentGroupId: grp.id, 
              currentGroupRole: grp.adminId === u.id ? 'admin' : 'member' 
            }));
          }
        }
      } catch (e) {}
      
      navigate("dashboard");
    } catch (err) { 
      setStatus("Network error. Please check your connection and try again."); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={submit}>
        <h2>Create Account</h2>
        {status && <div className="error-message">{status}</div>}
        
        <div className="form-group">
          <label htmlFor="signup-email">Email</label>
          <input 
            id="signup-email"
            type="email" 
            required
            value={email} 
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
          <input 
            id="signup-password"
            type="password" 
            required
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="Create a password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input 
            id="confirm-password"
            type="password" 
            required
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="helper-text">
          Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate("login"); }}>Login</a>
        </p>
      </form>
    </div>
  );
}

function AdminPanel() {
  const [data, setData] = useState({ users: [], groups: [], tasks: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, gRes, tRes] = await Promise.all([
          apiFetch('/api/admin/users'),
          apiFetch('/api/admin/groups'),
          apiFetch('/api/admin/tasks')
        ]);
        const [u, g, t] = await Promise.all([uRes.json(), gRes.json(), tRes.json()]);
        setData({ users: u.users || [], groups: g.groups || [], tasks: t.tasks || [] });
      } catch (e) {
        // ignore - server may be offline
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2>Server Data (admin)</h2>
      <section>
        <h4>Users</h4>
        <ul>
          {data.users.map(u => <li key={u.id}>{u.email} (id: {u.id})</li>)}
        </ul>
      </section>
      <section>
        <h4>Groups</h4>
        <ul>
          {data.groups.map(g => <li key={g.id}>{g.name} — members: {g.members.length}</li>)}
        </ul>
      </section>
      <section>
        <h4>Global Tasks</h4>
        <ul>
          {data.tasks.map(t => <li key={t.id}>{t.text || t.title || 'task'} — {t.status || (t.completed ? 'completed' : 'pending')}</li>)}
        </ul>
      </section>
    </div>
  );
}

function Login() {
  const { setUser, navigate } = React.useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e && e.preventDefault();
    if (!email || !password) { setStatus("Please enter both email and password"); return; }
    
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/auth/login", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email, password }) 
      });
      const data = await res.json();
      
      if (!res.ok) { 
        setStatus(data.error || "Login failed"); 
        return; 
      }
      
      const u = data.user;
      setUser({ id: u.id, email: u.email });
      
      try {
  const gres = await apiFetch(`/api/groups/user/${u.id}`);
        if (gres.ok) {
          const gdata = await gres.json();
          if (Array.isArray(gdata.groups) && gdata.groups.length === 1) {
            const grp = gdata.groups[0];
            setUser(prev => ({ 
              ...prev, 
              currentGroupId: grp.id, 
              currentGroupRole: grp.adminId === u.id ? 'admin' : 'member' 
            }));
          }
        }
      } catch (e) {}
      
      navigate("dashboard");
    } catch (err) { 
      setStatus("Network error. Please check your connection and try again."); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={submit}>
        <h2>Welcome Back</h2>
        {status && <div className="error-message">{status}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email" 
            required
            value={email} 
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            required
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-full"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {/* Demo helpers: try seeding server demo, then login; fallback to local demo if server not available */}
        <button type="button" className="btn btn-outline-secondary btn-full" style={{ marginTop: 8 }} onClick={async () => {
          // Try to seed server demo data and login via API
          try {
            await apiFetch('/api/seed', { method: 'POST' });
            const res = await apiFetch('/api/auth/login', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'demo@local', password: 'demo' })
            });
            if (res.ok) {
              const body = await res.json();
              setUser({ id: body.user.id, email: body.user.email, level: body.user.level, points: body.user.points });
              navigate('dashboard');
              return;
            }
          } catch (e) {
            // ignore and fallback to local demo
          }

          // Fallback: local demo (client-only)
          const demoUser = { id: 'demo', email: 'demo@taskmaster.local', username: 'Demo User', level: 2, points: 42, badges: [], currentGroupRole: 'admin', currentGroupId: 'demo-group' };
          setUser(demoUser);
          navigate('dashboard');
        }}>
          Use demo account
        </button>

        <p className="helper-text">
          Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate("signup"); }}>Sign up</a>
        </p>
      </form>
    </div>
  );
}
