import React, { useState } from 'react';
import { Terminal } from 'lucide-react';

const OutputConsole = () => {
  const [activeTab, setActiveTab] = useState('testcases');

  return (
    <div className="console-pane">
      <div className="pane-header">
        <Terminal />
        <span>Console</span>
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
          Test Result
        </div>
      </div>

      <div className="pane-content console-output">
        {activeTab === 'testcases' ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>nums =</div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                [2,7,11,15]
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>target =</div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                9
              </div>
            </div>
          </div>
        ) : (
          <div className="console-placeholder">
            Run your code to see output
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;
