import React from 'react';
import { Play, Send, Settings, Moon, ChevronDown, Code2 } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Code2 size={24} />
        <span>LeetCompiler</span>
      </div>

      <div className="nav-actions">


        <button className="btn-icon" title="Theme">
          <Moon size={18} />
        </button>

        <button className="btn-icon" title="Settings">
          <Settings size={18} />
        </button>

        <button className="btn-icon btn-run" title="Run">
          <Play size={20} fill="currentColor" />
        </button>

        <button className="btn btn-submit">
          <Send size={16} />
          Submit
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
