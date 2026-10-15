import React from 'react';
import { ShieldCheck, Moon, Sun, BookOpen, Cpu } from 'lucide-react';

export default function Navbar({ theme, onToggleTheme, onOpenVivaGuide }) {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">
          <ShieldCheck size={26} strokeWidth={2.2} />
        </div>
        <div className="brand-text">
          <h1>Banker's Algorithm Simulator</h1>
          <p>Deadlock Avoidance & Resource Allocation Analysis</p>
        </div>
      </div>

      <div className="nav-actions">
        <button
          className="btn btn-secondary"
          onClick={onOpenVivaGuide}
          title="Open Viva & Theory Reference"
        >
          <BookOpen size={17} />
          <span>Viva Guide</span>
        </button>

        <button
          className="btn btn-icon"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
    </header>
  );
}
