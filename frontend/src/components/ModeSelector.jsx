import React, { useState } from 'react';
import { Zap, KeyRound, ArrowRight, Code2, ShieldCheck, PlayCircle, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const ModeSelector = ({ onSelectMode, initialToken = '' }) => {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [isHoveringIntegrated, setIsHoveringIntegrated] = useState(false);
  const [isHoveringStandalone, setIsHoveringStandalone] = useState(false);

  const handleEnterIntegrated = (e) => {
    e.preventDefault();
    const token = tokenInput.trim();
    if (!token) {
      toast.error('Please enter a JWT token or user pass to enter integrated mode', {
        style: {
          fontFamily: 'var(--font-hand)',
          fontSize: '1rem',
          border: '2px solid #dc2626',
          background: 'var(--paper-bg)',
          color: 'var(--text-ink)'
        }
      });
      return;
    }
    localStorage.setItem('token', token);
    toast.success('🔑 Token accepted! Choose a revision problem.', {
      style: {
        fontFamily: 'var(--font-hand)',
        fontSize: '1rem',
        border: '2px solid #16a34a',
        background: 'var(--paper-bg)',
        color: 'var(--text-ink)'
      }
    });
    onSelectMode('problem-list', token);
  };

  const handleEnterStandalone = () => {
    onSelectMode('standalone', '');
  };

  return (
    <div className="mode-selector-container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      backgroundColor: 'var(--paper-bg)',
      backgroundImage: 'linear-gradient(var(--line-color) 1px, transparent 1px)',
      backgroundSize: '100% var(--grid-size)',
      backgroundPosition: '0 0'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Code2 size={42} style={{ color: 'var(--text-ink)' }} />
          <h1 className="mode-selector-title" style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-hand)', color: 'var(--text-ink)' }}>
            LeetCompiler
          </h1>
        </div>
        <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)' }}>
          Choose your compilation workspace mode
        </p>
      </div>

      {/* Two Option Cards */}
      <div className="mode-selector-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 440px))',
        gap: '32px',
        maxWidth: '960px',
        width: '100%'
      }}>
        
        {/* Card 1: Integrated Mode */}
        <div
          className="sketch-box"
          onMouseEnter={() => setIsHoveringIntegrated(true)}
          onMouseLeave={() => setIsHoveringIntegrated(false)}
          style={{
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transform: isHoveringIntegrated ? 'translateY(-4px) rotate(-0.5deg)' : 'none',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            boxShadow: isHoveringIntegrated ? '4px 8px 16px rgba(0,0,0,0.1)' : '2px 3px 6px rgba(0,0,0,0.05)',
            border: '2.5px solid var(--sketch-border)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(22, 163, 74, 0.12)',
                  border: '1.5px solid #16a34a',
                  color: '#15803d'
                }}>
                  <Zap size={24} />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-hand)' }}>
                  Integrated Mode
                </h2>
              </div>
              <span style={{
                fontSize: '0.85rem',
                padding: '2px 8px',
                border: '1.5px solid #16a34a',
                borderRadius: '12px',
                color: '#15803d',
                fontWeight: 600
              }}>
                MongoDB Sync
              </span>
            </div>

            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              Connected to your <strong>LeetTracker ecosystem</strong>. Solves revision questions, updates MongoDB status, and tracks your daily streak.
            </p>

            {/* Token / Pass Input Form */}
            <form onSubmit={handleEnterIntegrated} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <label style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={16} />
                Enter JWT Token / User Pass:
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste token (e.g. eyJhbGciOi... or user pass)"
                style={{
                  padding: '10px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.95rem',
                  border: '2px solid var(--sketch-border)',
                  borderRadius: '4px 8px 3px 6px / 7px 4px 6px 3px',
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  outline: 'none',
                  color: 'var(--text-ink)'
                }}
              />
              <button
                type="submit"
                className="btn btn-submit"
                style={{
                  marginTop: '8px',
                  justifyContent: 'center',
                  padding: '10px 20px',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <span>Select Revision Problem</span>
                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '12px' }}>
            <ShieldCheck size={16} style={{ color: '#16a34a' }} />
            <span>Updates revision status & streaks in database upon passing tests</span>
          </div>
        </div>

        {/* Card 2: Standalone Compiler */}
        <div
          className="sketch-box"
          onMouseEnter={() => setIsHoveringStandalone(true)}
          onMouseLeave={() => setIsHoveringStandalone(false)}
          onClick={handleEnterStandalone}
          style={{
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transform: isHoveringStandalone ? 'translateY(-4px) rotate(0.5deg)' : 'none',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            boxShadow: isHoveringStandalone ? '4px 8px 16px rgba(0,0,0,0.1)' : '2px 3px 6px rgba(0,0,0,0.05)',
            border: '2.5px solid var(--sketch-border)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(2, 132, 199, 0.12)',
                  border: '1.5px solid #0284c7',
                  color: '#0369a1'
                }}>
                  <PlayCircle size={24} />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-hand)' }}>
                  Standalone Compiler
                </h2>
              </div>
              <span style={{
                fontSize: '0.85rem',
                padding: '2px 8px',
                border: '1.5px solid #0284c7',
                borderRadius: '12px',
                color: '#0369a1',
                fontWeight: 600
              }}>
                VS Code Scratchpad
              </span>
            </div>

            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              Full-width, distraction-free code editor for pure practice. No side description, no login required. Just pick a language and execute code instantly.
            </p>

            <div style={{
              padding: '14px',
              backgroundColor: 'rgba(0,0,0,0.03)',
              borderRadius: '6px',
              border: '1.5px dashed var(--sketch-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              color: 'var(--text-ink)',
              marginBottom: '24px'
            }}>
              <div>✓ JavaScript, Python, C++, Java, Rust, Go</div>
              <div>✓ Standard Output & Error capture</div>
              <div>✓ Keyboard shortcut: Ctrl + Enter to run</div>
            </div>
          </div>

          <div>
            <button
              onClick={handleEnterStandalone}
              style={{
                width: '100%',
                padding: '10px 20px',
                fontFamily: 'var(--font-hand)',
                fontSize: '1.3rem',
                fontWeight: 700,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: '2px solid var(--sketch-border)',
                borderRadius: '4px 8px 3px 6px / 7px 4px 6px 3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Code2 size={20} />
              <span>Launch Standalone Editor</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '12px' }}>
              <BookOpen size={16} />
              <span>Open to all without saving or database dependencies</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModeSelector;
