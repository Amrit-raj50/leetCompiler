import React from 'react';
import { Play, Send, Moon, Code2, Loader2, Home, ListFilter, Zap, Unlock, Save } from 'lucide-react';

const Navbar = ({
  mode,
  currentProblem,
  onOpenProblemList,
  onGoHome,
  onRun,
  onSave,
  isRunning = false,
  isSaving = false
}) => {
  const isIntegrated = mode === 'integrated';

  return (
    <nav className="navbar">
      {/* Brand & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onGoHome}
          className="btn-icon"
          title="Back to Mode Selector"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '1rem',
            fontFamily: 'var(--font-hand)',
            padding: '4px 10px',
            border: '1.5px solid var(--sketch-border)',
            borderRadius: '4px',
            backgroundColor: 'rgba(255,255,255,0.6)'
          }}
        >
          <Home size={16} />
          <span>Home</span>
        </button>

        <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={onGoHome}>
          <Code2 size={28} />
          <span>LeetCompiler</span>
        </div>

        {/* Mode Tag */}
        <span
          style={{
            fontSize: '0.85rem',
            fontFamily: 'var(--font-hand)',
            padding: '2px 10px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: isIntegrated ? 'rgba(34, 197, 94, 0.12)' : 'rgba(2, 132, 199, 0.12)',
            border: `1.5px solid ${isIntegrated ? '#16a34a' : '#0284c7'}`,
            color: isIntegrated ? '#15803d' : '#0369a1',
            fontWeight: 700
          }}
        >
          {isIntegrated ? <Zap size={14} /> : <Unlock size={14} />}
          {isIntegrated ? `Integrated: ${currentProblem?.title || 'Problem'}` : 'Standalone Compiler (VS Code)'}
        </span>

        {/* Quick Problem Switcher for Integrated Mode */}
        {isIntegrated && (
          <button
            onClick={onOpenProblemList}
            className="btn-icon"
            style={{
              fontSize: '0.9rem',
              fontFamily: 'var(--font-hand)',
              padding: '4px 10px',
              border: '1.5px solid var(--sketch-border)',
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Change problem"
          >
            <ListFilter size={16} />
            <span>Switch Problem</span>
          </button>
        )}
      </div>

      {/* Action Controls */}
      <div className="nav-actions">
        {/* Save to DB Button */}
        <button
          onClick={onSave}
          disabled={isSaving || isRunning}
          className="btn-icon"
          title="Save code to database"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '1rem',
            fontFamily: 'var(--font-hand)',
            padding: '4px 12px',
            border: '1.5px solid var(--sketch-border)',
            borderRadius: '4px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            cursor: (isSaving || isRunning) ? 'not-allowed' : 'pointer',
            opacity: (isSaving || isRunning) ? 0.6 : 1
          }}
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Code'}</span>
        </button>

        <button
          className="btn-icon btn-run"
          onClick={onRun}
          disabled={isRunning}
          title="Run Code (Ctrl + Enter)"
          style={{
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1
          }}
        >
          {isRunning ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
        </button>

        <button
          className="btn btn-submit"
          onClick={onRun}
          disabled={isRunning}
          style={{
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.7 : 1
          }}
        >
          {isRunning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>{isIntegrated ? 'Submit' : 'Execute'}</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
