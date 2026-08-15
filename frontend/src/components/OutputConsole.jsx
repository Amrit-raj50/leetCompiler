import React, { useState } from 'react';
import { Terminal, Trash2, CheckCircle2, XCircle, AlertTriangle, Loader2, Zap, Unlock, Flame, Clock, HardDrive } from 'lucide-react';

const OutputConsole = ({
  activeTab,
  setActiveTab,
  output,
  setOutput,
  execResult,
  isRunning,
  testCases = [],
  onUpdateTestCase
}) => {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);

  const currentCase = testCases[selectedCaseIndex] || testCases[0];
  const isIntegrated = execResult?.mode === 'integrated';

  return (
    <div className="console-pane sketch-box" style={{ borderRadius: '0 0 4px 4px', borderTop: 'none' }}>
      <div className="pane-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={20} />
          <span>Console</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mode Indicator Badge */}
          {execResult?.mode && (
            <span
              style={{
                fontSize: '0.85rem',
                fontFamily: 'var(--font-hand)',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: isIntegrated ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.06)',
                border: `1px solid ${isIntegrated ? '#22c55e' : 'var(--sketch-border)'}`,
                color: isIntegrated ? '#15803d' : 'var(--text-muted)'
              }}
            >
              {isIntegrated ? <Zap size={13} /> : <Unlock size={13} />}
              {isIntegrated ? 'Integrated Mode' : 'Standalone Mode'}
            </span>
          )}

          {activeTab === 'output' && (output || execResult) && (
            <button
              onClick={() => {
                setOutput('');
              }}
              className="btn-icon"
              style={{ fontSize: '0.9rem', gap: '4px', opacity: 0.7 }}
              title="Clear output"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'testcases' ? 'active' : ''}`}
          onClick={() => setActiveTab('testcases')}
        >
          Testcases
        </div>
        <div 
          className={`tab ${activeTab === 'output' ? 'active' : ''}`}
          onClick={() => setActiveTab('output')}
        >
          Test Result {isRunning && '⏳'}
        </div>
      </div>

      <div className="pane-content console-output" style={{ padding: '16px 24px 16px 80px' }}>
        {activeTab === 'testcases' ? (
          <div>
            {/* Case selector buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {testCases.map((tc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCaseIndex(idx)}
                  style={{
                    padding: '4px 12px',
                    fontFamily: 'var(--font-hand)',
                    fontSize: '1.1rem',
                    fontWeight: selectedCaseIndex === idx ? 700 : 500,
                    backgroundColor: selectedCaseIndex === idx ? 'rgba(0,0,0,0.08)' : 'transparent',
                    border: '1.5px solid var(--sketch-border)',
                    borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
                    cursor: 'pointer',
                    color: 'var(--text-ink)'
                  }}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>

            {currentCase ? (
              <div style={{ lineHeight: 'var(--grid-size)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>nums = </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {JSON.stringify(currentCase.input?.nums ?? [2, 7, 11, 15])}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>target = </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {JSON.stringify(currentCase.input?.target ?? 9)}
                  </span>
                </div>
                {currentCase.expected !== undefined && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>expected = </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#16a34a', fontWeight: 600 }}>
                      {JSON.stringify(currentCase.expected)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="console-placeholder">No test cases configured</div>
            )}
          </div>
        ) : (
          <div>
            {isRunning ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0', color: 'var(--text-ink)' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: '#0284c7' }} />
                <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-hand)' }}>
                  Executing code on LeetCompiler server...
                </span>
              </div>
            ) : execResult || output ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Result header banner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {execResult?.allPassed !== undefined && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 12px',
                      borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
                      backgroundColor: execResult.allPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `2px solid ${execResult.allPassed ? '#16a34a' : '#dc2626'}`,
                      color: execResult.allPassed ? '#15803d' : '#b91c1c',
                      fontWeight: 700,
                      width: 'fit-content'
                    }}>
                      {execResult.allPassed ? (
                        <>
                          <CheckCircle2 size={20} />
                          <span>Accepted / All Tests Passed</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={20} />
                          <span>Tests Failed / Wrong Answer</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Streak bonus in integrated mode */}
                  {execResult?.revisionUpdate?.streak && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(249, 115, 22, 0.12)',
                      border: '1.5px solid #f97316',
                      color: '#c2410c',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      <Flame size={16} fill="#f97316" color="#f97316" />
                      <span>{execResult.revisionUpdate.streak} Day Streak!</span>
                    </div>
                  )}

                  {/* Performance Benchmarks: Runtime & Space */}
                  {(execResult?.executionTimeMs !== undefined || execResult?.memoryMb !== undefined) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {execResult.executionTimeMs !== undefined && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(2, 132, 199, 0.08)',
                          border: '1.5px solid #0284c7',
                          color: '#0369a1',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-hand)'
                        }}>
                          <Clock size={15} />
                          <span>Time: <strong style={{ fontFamily: 'var(--font-mono)' }}>{execResult.executionTimeFormatted || `${execResult.executionTimeMs} ms`}</strong></span>
                        </div>
                      )}

                      {execResult.memoryMb !== undefined && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(147, 51, 234, 0.08)',
                          border: '1.5px solid #9333ea',
                          color: '#7e22ce',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-hand)'
                        }}>
                          <HardDrive size={15} />
                          <span>Space: <strong style={{ fontFamily: 'var(--font-mono)' }}>{execResult.memoryFormatted || `${execResult.memoryMb} MB`}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Server Mode Notification Message */}
                {execResult?.message && (
                  <div style={{
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-hand)',
                    color: isIntegrated ? '#15803d' : 'var(--text-muted)',
                    fontStyle: 'italic'
                  }}>
                    {execResult.message}
                  </div>
                )}

                {execResult?.error && !execResult.allPassed && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 12px',
                    borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    border: '2px solid #d97706',
                    color: '#b45309',
                    fontWeight: 700,
                    width: 'fit-content'
                  }}>
                    <AlertTriangle size={20} />
                    <span>Runtime / Compilation Alert</span>
                  </div>
                )}

                {/* Main Raw Output / Logs */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>
                    Output:
                  </div>
                  <pre style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    border: '1px dashed var(--sketch-border)',
                    color: execResult?.error ? '#b91c1c' : 'var(--text-ink)',
                    lineHeight: '1.6'
                  }}>
                    {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
                  </pre>
                </div>

                {/* Breakdown of individual test cases */}
                {Array.isArray(execResult?.results) && execResult.results.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>
                      Test Case Details:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {execResult.results.map((res, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '8px 12px',
                            border: `1.5px solid ${res.passed ? '#86efac' : '#fca5a5'}`,
                            backgroundColor: res.passed ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                            borderRadius: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600, color: res.passed ? '#15803d' : '#b91c1c' }}>
                              {res.passed ? '✓' : '✗'} Test Case {i + 1}
                            </span>
                            {res.timeMs !== undefined && (
                              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                {res.timeMs} ms
                              </span>
                            )}
                          </div>
                          {res.input && (
                            <div style={{ fontSize: '0.9rem' }}>
                              Input: <code style={{ fontFamily: 'var(--font-mono)' }}>{JSON.stringify(res.input)}</code>
                            </div>
                          )}
                          {res.expected !== undefined && (
                            <div style={{ fontSize: '0.9rem' }}>
                              Expected: <code style={{ fontFamily: 'var(--font-mono)' }}>{JSON.stringify(res.expected)}</code>
                            </div>
                          )}
                          {res.actual !== undefined && (
                            <div style={{ fontSize: '0.9rem' }}>
                              Actual: <code style={{ fontFamily: 'var(--font-mono)' }}>{JSON.stringify(res.actual)}</code>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="console-placeholder">
                ▶️ Click "Run" or press Ctrl+Enter to execute your solution
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;
