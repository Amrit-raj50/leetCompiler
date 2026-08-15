/**
 * Advanced Error Diagnostic & Analyzer Engine for LeetCompiler
 * Multi-Language support for JS, Python, C++, C, Java, C#, Go, Rust, PHP, Ruby, Swift, Kotlin.
 */

export const analyzeError = (rawStderr = '', language = 'javascript', userCode = '') => {
  if (!rawStderr || typeof rawStderr !== 'string') {
    return null;
  }

  const stderr = rawStderr.trim();
  const lang = (language || 'javascript').toLowerCase();

  let errorType = 'Runtime Error';
  let message = stderr;
  let lineNumber = null;
  let columnNumber = null;
  let explanation = '';
  let suggestions = [];
  let codeSnippet = '';

  // 1. Missing Runtime / PATH Error
  if (stderr.includes('not installed') || stderr.includes('is not in system PATH') || stderr.includes('ENOENT') || stderr.includes('not recognized as an internal')) {
    return {
      type: 'Runtime Environment Notice',
      category: 'Compiler Environment',
      badgeColor: '#d97706',
      icon: '⚙️',
      message: stderr,
      explanation: `The backend execution environment does not currently have the CLI compiler for ${lang.toUpperCase()} installed in its system PATH.`,
      suggestions: [
        `Ensure ${lang.toUpperCase()} compiler/runtime is installed on the host system or Docker container.`,
        'You can also select JavaScript, Python 3, C++, C, or Java which are pre-configured.'
      ],
      raw: stderr
    };
  }

  // 2. Timeout / TLE
  if (stderr.includes('Time Limit Exceeded') || stderr.includes('SIGKILL') || stderr.includes('timed out')) {
    return {
      type: 'Time Limit Exceeded (TLE)',
      category: 'Performance Alert',
      badgeColor: '#d97706',
      icon: '⏳',
      message: 'Your solution exceeded the maximum allowed execution time (6.0s).',
      explanation: 'This usually happens when there is an infinite loop (e.g. while condition never turns false) or time complexity is too high (e.g. O(2^N) or O(N^3)).',
      suggestions: [
        'Check loop terminating conditions (ensure counters like `i++` or `left++` advance).',
        'If using recursion, verify the base case return condition is reached.',
        'Optimize your algorithm using HashMaps, Two Pointers, or Dynamic Programming.'
      ],
      raw: stderr
    };
  }

  // 3. JavaScript / Node.js
  if (lang.includes('js') || lang.includes('javascript')) {
    if (stderr.includes('SyntaxError:')) {
      errorType = 'Syntax Error';
      const match = stderr.match(/SyntaxError:\s*(.+)/);
      if (match) message = match[1];
      explanation = 'The JavaScript engine encountered invalid syntax or unexpected tokens.';
      suggestions = [
        'Check for missing parentheses `()`, braces `{}`, or brackets `[]`.',
        'Verify matching quotes in strings.',
        'Check for trailing commas or misspelled keywords.'
      ];
    } else if (stderr.includes('TypeError:')) {
      errorType = 'TypeError (Type Mismatch)';
      const match = stderr.match(/TypeError:\s*(.+)/);
      if (match) message = match[1];
      explanation = 'Attempted an operation on a variable that is `undefined`, `null`, or of incompatible type.';
      suggestions = [
        'Use optional chaining `obj?.property` or verify the variable exists before accessing.',
        'Check array boundaries before accessing elements.'
      ];
    } else if (stderr.includes('ReferenceError:')) {
      errorType = 'ReferenceError (Undefined Variable)';
      const match = stderr.match(/ReferenceError:\s*(.+)/);
      if (match) message = match[1];
      explanation = 'Referencing a variable that has not been declared in scope.';
      suggestions = [
        'Ensure variables are declared with `let`, `const`, or `var`.',
        'Check for typos in variable names.'
      ];
    }

    const lineMatch = stderr.match(/code_[a-zA-Z0-9_-]+\.js:(\d+):(\d+)/);
    if (lineMatch) {
      lineNumber = parseInt(lineMatch[1], 10);
      columnNumber = parseInt(lineMatch[2], 10);
    }
  }

  // 4. Python 3
  else if (lang.includes('python') || lang.includes('py')) {
    if (stderr.includes('SyntaxError:')) {
      errorType = 'Python Syntax Error';
      const match = stderr.match(/SyntaxError:\s*(.+)/);
      if (match) message = match[1];
      explanation = 'Python encountered invalid code syntax.';
      suggestions = [
        'Check for missing colons `:` after `def`, `if`, `for`, `while`, or `class`.',
        'Verify balanced parentheses and quotes.'
      ];
    } else if (stderr.includes('IndentationError:')) {
      errorType = 'Indentation Error';
      const match = stderr.match(/IndentationError:\s*(.+)/);
      if (match) message = match[1];
      explanation = 'Python code block indentations are misaligned.';
      suggestions = [
        'Use consistent 4 spaces for every block level.',
        'Avoid mixing tabs and spaces.'
      ];
    } else if (stderr.includes('IndexError:')) {
      errorType = 'IndexError (List Out of Bounds)';
      message = 'list index out of range';
      explanation = 'Attempted to access a list element outside its boundary.';
      suggestions = [
        'Check loop boundaries (`len(nums)`).',
        'Verify list is not empty before indexing.'
      ];
    } else if (stderr.includes('KeyError:')) {
      errorType = 'KeyError (Missing Dict Key)';
      const match = stderr.match(/KeyError:\s*(.+)/);
      if (match) message = `Key not found: ${match[1]}`;
      explanation = 'Attempted to access a dictionary key that does not exist.';
      suggestions = [
        'Use `dict.get(key, default)` for safe lookup.',
        'Check `if key in dict:` before indexing.'
      ];
    }

    const pyLineMatch = stderr.match(/File ".*code_[a-zA-Z0-9_-]+\.py", line (\d+)/);
    if (pyLineMatch) {
      lineNumber = parseInt(pyLineMatch[1], 10);
    }
  }

  // 5. Java
  else if (lang === 'java') {
    if (stderr.includes('NullPointerException')) {
      errorType = 'NullPointerException';
      message = 'Attempted to dereference a null object pointer';
      explanation = 'A method or field was called on an uninitialized object reference.';
      suggestions = [
        'Initialize arrays/objects before accessing methods.',
        'Add `if (obj != null)` safety checks.'
      ];
    } else if (stderr.includes('ArrayIndexOutOfBoundsException')) {
      errorType = 'ArrayIndexOutOfBoundsException';
      explanation = 'Array accessed with an invalid index.';
      suggestions = ['Check loop bounds (`i < array.length`).'];
    } else if (stderr.includes('error:')) {
      errorType = 'Java Compilation Error';
      const match = stderr.match(/error:\s*(.+)/);
      if (match) message = match[1];
      explanation = '`javac` compiler failed to compile your Java source.';
      suggestions = [
        'Check for missing semicolons `;` or unclosed braces `{}`.',
        'Ensure method return types match their declarations.'
      ];
    }

    const javaLineMatch = stderr.match(/Solution_[a-zA-Z0-9_]+\.java:(\d+):/);
    if (javaLineMatch) {
      lineNumber = parseInt(javaLineMatch[1], 10);
    }
  }

  // 6. C++ / C
  else if (lang.includes('cpp') || lang.includes('c++') || lang === 'c') {
    errorType = lang === 'c' ? 'C Compilation Error' : 'C++ Compilation Error';
    if (stderr.includes('error:')) {
      const match = stderr.match(/error:\s*(.+)/);
      if (match) message = match[1];
    }
    explanation = 'The compiler (`g++`/`gcc`) encountered invalid code constructs or types.';
    suggestions = [
      'Check for missing semicolons `;` at the end of statements.',
      'Ensure standard headers are included (e.g. `<vector>`, `<unordered_map>`).',
      'Verify pointer and reference types.'
    ];

    const cLineMatch = stderr.match(/code_[a-zA-Z0-9_-]+\.(?:cpp|c):(\d+):(\d+):/);
    if (cLineMatch) {
      lineNumber = parseInt(cLineMatch[1], 10);
      columnNumber = parseInt(cLineMatch[2], 10);
    }
  }

  // 7. Go
  else if (lang === 'go' || lang === 'golang') {
    errorType = 'Go Build/Runtime Error';
    explanation = 'Go compiler (`go run`) failed to build or execute the package.';
    suggestions = [
      'Check variable declarations and unused import errors.',
      'Ensure slice indexing is within bounds.'
    ];
    const goLineMatch = stderr.match(/code_[a-zA-Z0-9_-]+\.go:(\d+):(\d+):/);
    if (goLineMatch) {
      lineNumber = parseInt(goLineMatch[1], 10);
      columnNumber = parseInt(goLineMatch[2], 10);
    }
  }

  // 8. Rust
  else if (lang === 'rust' || lang === 'rs') {
    errorType = 'Rust Compiler Diagnostic';
    explanation = '`rustc` compiler flagged borrow checker, type mismatch, or syntax errors.';
    suggestions = [
      'Check ownership and borrowing (`&mut` vs `&`).',
      'Ensure pattern matching in `match` statements is exhaustive.'
    ];
    const rustLineMatch = stderr.match(/code_[a-zA-Z0-9_-]+\.rs:(\d+):(\d+):/);
    if (rustLineMatch) {
      lineNumber = parseInt(rustLineMatch[1], 10);
      columnNumber = parseInt(rustLineMatch[2], 10);
    }
  }

  // 9. PHP
  else if (lang === 'php') {
    errorType = 'PHP Parse/Runtime Error';
    explanation = 'PHP interpreter encountered invalid syntax or an uncaught exception.';
    suggestions = [
      'Verify variables start with `$` sign.',
      'Check for missing semicolons `;`.'
    ];
    const phpLineMatch = stderr.match(/in .*code_[a-zA-Z0-9_-]+\.php on line (\d+)/);
    if (phpLineMatch) {
      lineNumber = parseInt(phpLineMatch[1], 10);
    }
  }

  // 10. Ruby
  else if (lang === 'ruby' || lang === 'rb') {
    errorType = 'Ruby Exception';
    explanation = 'Ruby interpreter raised an unhandled exception.';
    suggestions = [
      'Check for missing `end` keywords.',
      'Ensure method names are spelled correctly.'
    ];
    const rbLineMatch = stderr.match(/code_[a-zA-Z0-9_-]+\.rb:(\d+):/);
    if (rbLineMatch) {
      lineNumber = parseInt(rbLineMatch[1], 10);
    }
  }

  // 11. C#
  else if (lang === 'csharp' || lang === 'cs' || lang === 'c#') {
    errorType = 'C# Compilation Error';
    explanation = 'C# compiler (`csc`/`dotnet`) encountered type or syntax issues.';
    suggestions = [
      'Check for missing semicolons `;` or matching braces `{}`.',
      'Ensure standard namespaces (`using System;`) are present.'
    ];
    const csLineMatch = stderr.match(/code_[a-zA-Z0-9_-]+\.cs\((\d+),(\d+)\):/);
    if (csLineMatch) {
      lineNumber = parseInt(csLineMatch[1], 10);
      columnNumber = parseInt(csLineMatch[2], 10);
    }
  }

  // Extract snippet from user code if line number is found
  if (lineNumber && userCode) {
    const lines = userCode.split('\n');
    const targetLineIdx = Math.min(lines.length - 1, Math.max(0, lineNumber - 1));
    const targetLine = lines[targetLineIdx];
    if (targetLine) {
      codeSnippet = targetLine.trim();
    }
  }

  // Default suggestions if none matched
  if (suggestions.length === 0) {
    suggestions = [
      'Review the error stack trace below to identify the failing operation.',
      'Add debug print statements to inspect variable states before the crash.'
    ];
  }

  const cleanMessage = message.replace(/\/.*?code_[a-zA-Z0-9_-]+\.[a-z]+:\d+:\d+:\s*/g, '').trim();

  return {
    type: errorType,
    category: 'Diagnostic Analysis',
    badgeColor: '#dc2626',
    icon: '🛑',
    message: cleanMessage || 'An error occurred during execution.',
    lineNumber: lineNumber || undefined,
    columnNumber: columnNumber || undefined,
    codeSnippet,
    explanation: explanation || 'The program encountered an exception during compilation or execution.',
    suggestions,
    raw: stderr
  };
};
