import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProblemDescription from './components/ProblemDescription';
import CodeEditor from './components/CodeEditor';
import OutputConsole from './components/OutputConsole';
import ModeSelector from './components/ModeSelector';
import ProblemList from './components/ProblemList';
import { runCodeApi, saveCodeApi } from './services/compilerService';
import { parseFrontendError } from './utils/errorParser';
import { PROBLEMS, STANDALONE_DEFAULT_CODE } from './constants/questions';
import { CODE_TEMPLATES } from './constants/templates';

function App() {
  // Views: 'mode-select' | 'problem-list' | 'editor'
  const [currentView, setCurrentView] = useState('mode-select');
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
  const handleRunCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setActiveConsoleTab('output');
    setOutput('⏳ Running code on LeetCompiler server...');
    setExecResult(null);

    const questionSlug = mode === 'integrated' ? currentProblem.slug : 'scratchpad';
    const testCases = mode === 'integrated' ? currentProblem.testCases : [];

    try {
      const result = await runCodeApi({
        code,
        language: lang,
        questionSlug,
        testCases
      });

      setExecResult(result);

      const outputText = result?.output || result?.stdout || (result?.error ? `❌ ${result.error}` : '✅ Code executed successfully.');
      setOutput(outputText);

      if (result?.allPassed || (mode === 'standalone' && !result?.error)) {
        toast.success(result?.message || '🎉 Execution successful!', {
          id: 'run-status',
          icon: '✅',
          style: {
            fontFamily: 'var(--font-hand)',
            fontSize: '1.1rem',
            border: '2px solid #16a34a',
            background: 'var(--paper-bg)',
            color: 'var(--text-ink)'
          }
        });
      } else if (result?.error || result?.allPassed === false) {
        toast.error(result?.error || '❌ Some test cases failed', {
          id: 'run-status',
          icon: '❌',
          style: {
            fontFamily: 'var(--font-hand)',
            fontSize: '1.1rem',
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
      
      toast.error(`Execution failed: ${diagnostics?.type || errorMsg}`, {
        id: 'run-status',
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
      <Toaster position="top-right" />

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

      {/* 3. Editor View (Integrated vs. Standalone) */}
      {currentView === 'editor' && (
        <>
          <Navbar
            mode={mode}
            currentProblem={currentProblem}
            onOpenProblemList={() => setCurrentView('problem-list')}
            onGoHome={() => setCurrentView('mode-select')}
            onRun={handleRunCode}
            onSave={handleSaveCode}
            isRunning={isRunning}
            isSaving={isSaving}
          />

          {mode === 'integrated' ? (
            /* Integrated Mode: 2-Page Spiral Notebook with Problem Description */
            <div className="workspace">
              <ProblemDescription problem={currentProblem} />

              <div className="spiral-binding">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="ring"></div>
                ))}
              </div>

              <div className="right-pane">
                <CodeEditor
                  code={code}
                  setCode={setCode}
                  lang={lang}
                  setLang={handleLanguageChange}
                  onRun={handleRunCode}
                  isRunning={isRunning}
                />
                <OutputConsole
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
              <div className="full-editor-pane">
                <CodeEditor
                  code={code}
                  setCode={setCode}
                  lang={lang}
                  setLang={handleLanguageChange}
                  onRun={handleRunCode}
                  isRunning={isRunning}
                />
                <OutputConsole
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
