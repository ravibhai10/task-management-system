import React from 'react';
import { API_BASE } from "../api";
import ApiStatus from "./ApiStatus";


export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container d-flex justify-content-between align-items-center">
        <div>© {new Date().getFullYear()} TaskMaster</div>
        <div className="footer-links">
          <ApiStatus apiBase={API_BASE} />

          <a href="#">Privacy</a>
          <a href="#" style={{ marginLeft: 12 }}>Terms</a>
        </div>
      </div>
    </footer>
  );
}

