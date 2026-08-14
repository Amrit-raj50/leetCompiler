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
            <div>
              <div style={{ color: 'var(--text-muted)' }}>nums =</div>
              <div style={{ paddingLeft: '24px' }}>
                [2,7,11,15]
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>target =</div>
              <div style={{ paddingLeft: '24px' }}>
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
