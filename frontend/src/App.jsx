import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProblemDescription from './components/ProblemDescription';
import CodeEditor from './components/CodeEditor';
import OutputConsole from './components/OutputConsole';
import SubmissionDetails from './components/SubmissionDetails';
import ModeSelector from './components/ModeSelector';
import ProblemList from './components/ProblemList';
import FeedbackModal from './components/FeedbackModal';
import { runCodeApi, saveCodeApi } from './services/compilerService';
import { parseFrontendError } from './utils/errorParser';
import { PROBLEMS, STANDALONE_DEFAULT_CODE } from './constants/questions';
import { CODE_TEMPLATES } from './constants/templates';

function App() {
  // Views: 'mode-select' | 'problem-list' | 'editor'
  // Views: 'mode-select' | 'problem-list' | 'editor'
  const [currentView, setCurrentView] = useState('mode-select');
  // Left pane tabs for integrated mode
  const [leftPaneTab, setLeftPaneTab] = useState('description');
  // Mode: 'standalone' | 'integrated'
  const [mode, setMode] = useState('standalone');
  
  const [currentProblem, setCurrentProblem] = useState(PROBLEMS[0]);
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState(STANDALONE_DEFAULT_CODE.javascript);
  const [userToken, setUserToken] = useState(() => localStorage.getItem('token') || '');

  const [output, setOutput] = useState('');
  const [execResult, setExecResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState('output');

  const [editorFlex, setEditorFlex] = useState(66); // Default to 2/3 ratio (similar to original flex: 2 vs flex: 1)
  const workspaceRef = useRef(null);

  const startResizing = (e) => {
    e.preventDefault();
    const handleMouseMove = (mouseMoveEvent) => {
      if (!workspaceRef.current) return;
      const containerRect = workspaceRef.current.getBoundingClientRect();
      const top = mouseMoveEvent.clientY - containerRect.top;
      let newEditorFlex = (top / containerRect.height) * 100;
      newEditorFlex = Math.max(15, Math.min(newEditorFlex, 85));
      setEditorFlex(newEditorFlex);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Feedback on every 10 runs
  const [runCount, setRunCount] = useState(() => {
    return parseInt(localStorage.getItem('leetcompiler_run_count') || '0', 10);
  });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Handle Mode Selection from Landing Screen
  const handleSelectMode = (targetView, token = '') => {
    if (targetView === 'problem-list') {
      setMode('integrated');
      setUserToken(token);
      setCurrentView('problem-list');
    } else if (targetView === 'standalone') {
      setMode('standalone');
      setUserToken('');
      localStorage.removeItem('token');
      setCode(STANDALONE_DEFAULT_CODE[lang] || STANDALONE_DEFAULT_CODE.javascript);
      setCurrentView('editor');
      setOutput('');
      setExecResult(null);
    }
  };

  // Handle Problem Selection in Integrated Mode
  const handleSelectProblem = (problem) => {
    setCurrentProblem(problem);
    setMode('integrated');
    const problemTemplate = problem.templates?.[lang] || CODE_TEMPLATES[lang] || '';
    setCode(problemTemplate);
    setOutput('');
    setExecResult(null);
    setLeftPaneTab('description');
    setActiveConsoleTab('testcases');
    setCurrentView('editor');
  };

  // Handle Language Change
  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    if (mode === 'integrated' && currentProblem?.templates?.[newLang]) {
      setCode(currentProblem.templates[newLang]);
    } else if (mode === 'standalone' && STANDALONE_DEFAULT_CODE[newLang]) {
      setCode(STANDALONE_DEFAULT_CODE[newLang]);
    } else if (CODE_TEMPLATES[newLang]) {
      setCode(CODE_TEMPLATES[newLang]);
    }
  };

  // Save Code to Database Handler
  const handleSaveCode = async () => {
    if (isSaving || !code) return;

    setIsSaving(true);
    const questionSlug = mode === 'integrated' ? currentProblem.slug : 'scratchpad';

    try {
      const saveRes = await saveCodeApi({
        code,
        language: lang,
        questionSlug,
        executionTimeMs: execResult?.executionTimeMs,
        memoryMb: execResult?.memoryMb,
        allPassed: execResult?.allPassed || false
      });

      if (saveRes?.success) {
        toast.success('💾 Code saved successfully to MongoDB Atlas!', {
          id: 'save-status',
          icon: '☁️',
          style: {
            fontFamily: 'var(--font-hand)',
            fontSize: '1.1rem',
            border: '2px solid #16a34a',
            background: 'var(--paper-bg)',
            color: 'var(--text-ink)'
          }
        });
      } else {
        toast.error(saveRes?.error || 'Failed to save code to database', {
          id: 'save-status',
          style: {
            fontFamily: 'var(--font-hand)',
            fontSize: '1rem',
            border: '2px solid #dc2626',
            background: 'var(--paper-bg)',
            color: 'var(--text-ink)'
          }
        });
      }
    } catch (error) {
      toast.error(`Save error: ${error.response?.data?.error || error.message}`, {
        id: 'save-status',
        style: {
          fontFamily: 'var(--font-hand)',
          fontSize: '1rem',
          border: '2px solid #dc2626',
          background: 'var(--paper-bg)',
          color: 'var(--text-ink)'
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Run Code Handler
  const handleRunCode = async (options = {}) => {
    const isSubmit = options?.isSubmit === true;

    if (isRunning) return;

    setIsRunning(true);
    setActiveConsoleTab('output');
    setOutput('⏳ Running code on LeetCompiler server...');
    setExecResult(null);

    const questionSlug = mode === 'integrated' ? currentProblem.slug : 'scratchpad';
    const testCases = mode === 'integrated' ? currentProblem.testCases : [];
    
    // Track execution count for feedback milestone
    const newCount = runCount + 1;
    setRunCount(newCount);
    localStorage.setItem('leetcompiler_run_count', String(newCount));

    // Pop up feedback modal on every 5th run milestone
    if (newCount > 0 && newCount % 5 === 0) {
      setTimeout(() => {
        setIsFeedbackOpen(true);
      }, 1500);
    }

    try {
      const result = await runCodeApi({
        code,
        language: lang,
        questionSlug,
        testCases
      });

      setExecResult(result);

      if (isSubmit) {
        setLeftPaneTab('submission');
      }

      const outputText = result?.output || result?.stdout || (result?.error ? `❌ ${result.error}` : '✅ Code executed successfully.');
      setOutput(outputText);

      if (result?.allPassed || (mode === 'standalone' && !result?.error)) {
        toast.success('🎉 Execution completed successfully!', {
          id: 'run-status',
          icon: '✅',
          duration: 2500,
          style: {
            fontFamily: 'var(--font-hand)',
            fontSize: '1rem',
            border: '2px solid #16a34a',
            background: 'var(--paper-bg)',
            color: 'var(--text-ink)'
          }
        });
      } else if (result?.error || result?.allPassed === false) {
        toast.error(result?.diagnostics?.type || '❌ Execution failed. See console below.', {
          id: 'run-status',
          icon: '❌',
          duration: 2500,
          style: {
            fontFamily: 'var(--font-hand)',
            fontSize: '1rem',
            border: '2px solid #dc2626',
            background: 'var(--paper-bg)',
            color: 'var(--text-ink)'
          }
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to communicate with compiler backend';
      const diagnostics = error.response?.data?.diagnostics || parseFrontendError(error, lang, code);
      
      setOutput(errorMsg);
      setExecResult({
        error: errorMsg,
        allPassed: false,
        mode,
        diagnostics
      });

      if (isSubmit) {
        setLeftPaneTab('submission');
      }
      
      toast.error(diagnostics?.type || '❌ Execution error. See details below.', {
        id: 'run-status',
        duration: 2500,
        style: {
          fontFamily: 'var(--font-hand)',
          fontSize: '1rem',
          border: '2px solid #dc2626',
          background: 'var(--paper-bg)',
          color: 'var(--text-ink)'
        }
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="app-container">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            maxWidth: '360px',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-hand)',
            background: 'var(--paper-bg)',
            border: '1.5px solid var(--sketch-border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }
        }}
      />

      {/* Feedback Modal on every 10th run */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        mode={mode}
        runCount={runCount}
      />

      {/* 1. Landing Screen: Mode Selector */}
      {currentView === 'mode-select' && (
        <ModeSelector
          onSelectMode={handleSelectMode}
          initialToken={userToken}
        />
      )}

      {/* 2. Problem Selector Screen for Integrated Mode */}
      {currentView === 'problem-list' && (
        <ProblemList
          onSelectProblem={handleSelectProblem}
          onBackToModeSelect={() => setCurrentView('mode-select')}
          userToken={userToken}
        />
      )}

      {/* 3. Editor Workspace Screen */}
      {currentView === 'editor' && (
        <>
          <Navbar
            mode={mode}
            currentProblem={currentProblem}
            onOpenProblemList={() => setCurrentView('problem-list')}
            onGoHome={() => setCurrentView('mode-select')}
            onRun={handleRunCode}
            onSave={handleSaveCode}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
            isRunning={isRunning}
            isSaving={isSaving}
          />

          {mode === 'integrated' ? (
            /* Integrated Mode: 2-Page Spiral Notebook Workspace */
            <div className="workspace">
              {/* Left Page: Problem Description & Submissions */}
              <div className="left-pane">
                <div className="tabs-container" style={{ borderBottom: '2px solid var(--sketch-border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <button
                    className={`tab ${leftPaneTab === 'description' ? 'active' : ''}`}
                    onClick={() => setLeftPaneTab('description')}
                  >
                    Description
                  </button>
                  <button
                    className={`tab ${leftPaneTab === 'submission' ? 'active' : ''}`}
                    onClick={() => setLeftPaneTab('submission')}
                  >
                    Submission
                  </button>
                </div>
                
                {leftPaneTab === 'description' ? (
                  <ProblemDescription problem={currentProblem} />
                ) : (
                  <SubmissionDetails 
                    execResult={execResult} 
                    code={code} 
                    lang={lang} 
                    problem={currentProblem} 
                  />
                )}
              </div>

              {/* Center Spiral Binding */}
              <div className="spiral-binding">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="ring" />
                ))}
              </div>

              {/* Right Page: Split Monaco Editor + Console */}
              <div className="right-pane" ref={workspaceRef}>
                <CodeEditor
                  style={{ flex: `${editorFlex} 1 0%` }}
                  code={code}
                  setCode={setCode}
                  lang={lang}
                  setLang={handleLanguageChange}
                  onRun={handleRunCode}
                  isRunning={isRunning}
                />
                <div 
                  onMouseDown={startResizing}
                  style={{
                    height: '8px',
                    cursor: 'row-resize',
                    backgroundColor: 'var(--sketch-border)',
                    opacity: 0.15,
                    margin: '2px 0',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.5'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.15'}
                  title="Drag to resize"
                >
                  <div style={{ width: '40px', height: '2px', backgroundColor: '#334155', borderRadius: '1px' }} />
                </div>
                <OutputConsole
                  style={{ flex: `${100 - editorFlex} 1 0%` }}
                  activeTab={activeConsoleTab}
                  setActiveTab={setActiveConsoleTab}
                  output={output}
                  setOutput={setOutput}
                  execResult={execResult}
                  isRunning={isRunning}
                  testCases={currentProblem?.testCases || []}
                />
              </div>
            </div>
          ) : (
            /* Standalone Mode: Full-Width VS Code-like Scratchpad (No Left Desc / No Spiral) */
            <div className="workspace standalone-workspace">
              <div className="full-editor-pane" ref={workspaceRef}>
                <CodeEditor
                  style={{ flex: `${editorFlex} 1 0%` }}
                  code={code}
                  setCode={setCode}
                  lang={lang}
                  setLang={handleLanguageChange}
                  onRun={handleRunCode}
                  isRunning={isRunning}
                />
                <div 
                  onMouseDown={startResizing}
                  style={{
                    height: '8px',
                    cursor: 'row-resize',
                    backgroundColor: 'var(--sketch-border)',
                    opacity: 0.15,
                    margin: '2px 0',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.5'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.15'}
                  title="Drag to resize"
                >
                  <div style={{ width: '40px', height: '2px', backgroundColor: '#334155', borderRadius: '1px' }} />
                </div>
                <OutputConsole
                  style={{ flex: `${100 - editorFlex} 1 0%` }}
                  activeTab={activeConsoleTab}
                  setActiveTab={setActiveConsoleTab}
                  output={output}
                  setOutput={setOutput}
                  execResult={execResult}
                  isRunning={isRunning}
                  testCases={[]}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
