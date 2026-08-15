import React, { useState, useEffect } from 'react';
import { Play, Send, Moon, Code2, Loader2, Home, ListFilter, Zap, Unlock, Save, Download, Smartphone, MessageSquareHeart } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = ({
  mode,
  currentProblem,
  onOpenProblemList,
  onGoHome,
  onRun,
  onSave,
  onOpenFeedback,
  isRunning = false,
  isSaving = false
}) => {
  const isIntegrated = mode === 'integrated';
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        toast.success('🎉 LeetCompiler installed to your home screen!');
      }
      setDeferredPrompt(null);
    } else {
      toast('📱 To install on your phone: Tap browser menu (⋮ or Share) ➔ Add to Home Screen', {
        icon: '📲',
        duration: 5000,
        style: {
          fontFamily: 'var(--font-hand)',
          fontSize: '1rem',
          background: 'var(--paper-bg)',
          border: '2px solid var(--sketch-border)',
          color: 'var(--text-ink)'
        }
      });
    }
  };

  return (
    <nav className="navbar">
      {/* Brand & Navigation */}
      <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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

        {/* Mode Tag (Only for Integrated Mode) */}
        {isIntegrated && (
          <span
            className="mode-tag"
            style={{
              fontSize: '0.85rem',
              fontFamily: 'var(--font-hand)',
              padding: '2px 10px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1.5px solid #16a34a',
              color: '#15803d',
              fontWeight: 700
            }}
          >
            <Zap size={14} />
            <span>{`Integrated: ${currentProblem?.title || 'Problem'}`}</span>
          </span>
        )}

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
        {/* Install App PWA Button */}
        {!isInstalled && (
          <button
            onClick={handleInstallApp}
            className="btn-icon"
            title="Install as Mobile App"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-hand)',
              padding: '4px 10px',
              border: '1.5px solid #2563eb',
              borderRadius: '4px',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              color: '#1d4ed8',
              fontWeight: 600
            }}
          >
            <Smartphone size={16} />
            <span>Install App</span>
          </button>
        )}

        {/* Feedback Button */}
        <button
          onClick={onOpenFeedback}
          className="btn-icon"
          title="Leave feedback for README"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-hand)',
            padding: '4px 10px',
            border: '1.5px solid #dc2626',
            borderRadius: '4px',
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            color: '#b91c1c',
            fontWeight: 600
          }}
        >
          <MessageSquareHeart size={16} />
          <span>Feedback</span>
        </button>

        {/* Save to DB Button (Only in Integrated Mode) */}
        {isIntegrated && (
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
        )}

        {/* Run Button */}
        <button
          className="btn-icon btn-run"
          onClick={onRun}
          disabled={isRunning}
          title="Run code execution"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.7 : 1
          }}
        >
          {isRunning ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
          <span>{isRunning ? 'Running...' : 'Run'}</span>
        </button>

        {/* Execute Button (Only in Integrated Mode) */}
        {isIntegrated && (
          <button
            className="btn btn-submit"
            onClick={onRun}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.7 : 1
            }}
          >
            {isRunning ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            <span>{isRunning ? 'Executing...' : 'Execute'}</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
