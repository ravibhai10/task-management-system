import React from 'react';

export default function Hero({ navigate }) {
  return (
    <section className="hero">
      <div className="hero-inner container d-flex align-items-center">
        <div className="hero-copy">
          <h1 className="hero-title">Organize work. Ship faster. Grow together.</h1>
          <p className="hero-sub">TaskMaster is a lightweight task management system built for teams and classrooms — collaborate on tasks, track time, and celebrate wins.</p>
          <div className="hero-ctas" style={{ marginTop: 18 }}>
            <button className="btn btn-lg btn-primary me-2" onClick={() => navigate('signup')}>Get started</button>
            <button className="btn btn-lg btn-outline-light" onClick={() => navigate('login')}>Login</button>
          </div>
        </div>
        <div className="hero-visual d-none d-md-block">
          <div className="mock-card">
            <h4>Team Sprint</h4>
            <ul>
              <li>Design review - 20m</li>
              <li>Implement API - 60m</li>
              <li>QA & deploy - 30m</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

