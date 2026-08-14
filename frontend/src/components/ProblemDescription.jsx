import React from 'react';
import { AlignLeft } from 'lucide-react';

const ProblemDescription = () => {
  return (
    <div className="pane left-pane">
      <div className="pane-header">
        <AlignLeft />
        <span>Description</span>
      </div>
      <div className="pane-content prose">
        <h1>1. Two Sum</h1>
        <div className="difficulty-badge">Easy</div>
        
        <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
        
        <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
        
        <p>You can return the answer in any order.</p>

        <h3 style={{ marginTop: '24px', marginBottom: '8px', fontSize: '1.1rem' }}>Example 1:</h3>
        <pre>
          <strong>Input:</strong> nums = [2,7,11,15], target = 9<br />
          <strong>Output:</strong> [0,1]<br />
          <strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
        </pre>

        <h3 style={{ marginTop: '24px', marginBottom: '8px', fontSize: '1.1rem' }}>Constraints:</h3>
        <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
          <li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>
          <li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>
          <li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>
        </ul>
      </div>
    </div>
  );
};

export default ProblemDescription;
