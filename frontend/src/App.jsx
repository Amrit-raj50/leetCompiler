import React from 'react';
import Navbar from './components/Navbar';
import ProblemDescription from './components/ProblemDescription';
import CodeEditor from './components/CodeEditor';
import OutputConsole from './components/OutputConsole';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="workspace">
        <ProblemDescription />
        
        <div className="spiral-binding">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="ring"></div>
          ))}
        </div>

        <div className="right-pane">
          <CodeEditor />
          <OutputConsole />
        </div>
      </div>
    </div>
  );
}

export default App;
