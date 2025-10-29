import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');

  useEffect(() => {
    try { const s = window.localStorage.getItem('current_user'); if (s) setUser(JSON.parse(s)); } catch (e) {}
  }, []);

  useEffect(() => { if (user) window.localStorage.setItem('current_user', JSON.stringify(user)); else window.localStorage.removeItem('current_user'); }, [user]);

  const navigate = (p) => { setPage(p); window.scrollTo(0,0); };

  return (
    <AuthContext.Provider value={{ user, setUser, navigate }}>
      <div style={{padding:20}}>
        <h3>Safe App Shell</h3>
        <div>
          <button onClick={() => navigate('signup')}>Signup</button>
          <button onClick={() => navigate('login')}>Login</button>
        </div>
        <div style={{marginTop:20}}>
          {page === 'home' && <div>Home content</div>}
          {page === 'signup' && <Signup />}
          {page === 'login' && <Login />}
        </div>
      </div>
    </AuthContext.Provider>
  );
}

function Signup() {
  const { setUser, navigate } = React.useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const submit = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/signup', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pw }) });
      const data = await res.json();
      if (res.ok && data.user) { setUser({ id: data.user.id, email: data.user.email }); navigate('home'); } else alert(data.error||'signup failed');
    } catch (e) { alert('network'); }
  };
  return (<div><h4>Signup</h4><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="password" type="password" value={pw} onChange={e=>setPw(e.target.value)}/><div><button onClick={submit}>Create</button></div></div>);
}

function Login() {
  const { setUser, navigate } = React.useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const submit = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pw }) });
      const data = await res.json();
      if (res.ok && data.user) { setUser({ id: data.user.id, email: data.user.email }); navigate('home'); } else alert(data.error||'login failed');
    } catch (e) { alert('network'); }
  };
  return (<div><h4>Login</h4><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="password" type="password" value={pw} onChange={e=>setPw(e.target.value)}/><div><button onClick={submit}>Login</button></div></div>);
}
