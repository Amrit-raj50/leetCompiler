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
        <div className="select-wrapper">
          <select className="lang-select" defaultValue="cpp">
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript</option>
          </select>
          <ChevronDown className="select-icon" size={16} />
        </div>

        <button className="btn-icon" title="Theme">
          <Moon size={18} />
        </button>

        <button className="btn-icon" title="Settings">
          <Settings size={18} />
        </button>

        <button className="btn btn-run">
          <Play size={16} fill="currentColor" />
          Run
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
