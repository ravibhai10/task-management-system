import React from 'react';

export default function About() {
  return (
    <section className="about container">
      <div className="row align-items-center">
        <div className="col-md-6">
          <h2>Built for teams, trusted by companies</h2>
          <p className="lead">TaskMaster helps teams stay focused. From small student groups to growing startups — see why organizations choose TaskMaster.</p>
          <ul>
            <li>Collaborative tasks with comments & time tracking</li>
            <li>Simple group management and access controls</li>
            <li>Insightful dashboards and performance metrics</li>
          </ul>
        </div>
        <div className="col-md-6">
          <div className="about-stats">
            <div className="stat">
              <div className="stat-value">120+</div>
              <div className="stat-label">Companies using TaskMaster</div>
            </div>
            <div className="stat">
              <div className="stat-value">1,800+</div>
              <div className="stat-label">Active teams</div>
            </div>
            <div className="stat">
              <div className="stat-value">40k+</div>
              <div className="stat-label">Tasks created</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
