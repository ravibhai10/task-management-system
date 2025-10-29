import React, { useState } from "react";
import { apiFetch } from '../api';

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    let msg = "";
    if (!email.includes("@")) msg += "Enter a valid email. ";
    if (password.length < 6) msg += "Password must be at least 6 characters. ";
    if (password !== confirmPassword) msg += "Passwords do not match. ";
    if (msg) {
      setError(msg);
      return;
    }

    try {
      const res = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }
      setError('');
      alert('Signup successful 🚀');
    } catch (err) {
      setError('Network error. Is the backend running?');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required />
        </div>
        {error && <span className="error-message">{error}</span>}
        <button type="submit" className="btn btn-primary w-100">Sign Up</button>
      </form>
    </div>
  );
}
