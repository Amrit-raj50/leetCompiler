/**
 * Analyzes code in various languages to detect if it requires interactive / standard input,
 * and extracts prompt hints/placeholders if available.
 */

export const detectInputRequirements = (code = '', lang = 'javascript') => {
  if (!code || typeof code !== 'string') {
    return { requiresInput: false, prompts: [], suggestedPlaceholder: '' };
  }

  const prompts = [];
  const lines = code.split('\n');

  // Helper to look backwards for preceding print/prompt statements
  const findPrecedingPrompt = (lineIndex) => {
    for (let i = lineIndex; i >= Math.max(0, lineIndex - 3); i--) {
      const line = lines[i];
      // Match System.out.print("..."), console.log("..."), print("..."), cout << "..."
      const printMatch = line.match(/(?:System\.out\.print(?:ln)?|printf|cout\s*<<|print|console\.log)\s*\(\s*["'`](.*?)["'`]/);
      if (printMatch && printMatch[1]) {
        return printMatch[1].replace(/[:?\s]+$/, '').trim();
      }
      const coutMatch = line.match(/cout\s*<<\s*["'](.*?)["']/);
      if (coutMatch && coutMatch[1]) {
        return coutMatch[1].replace(/[:?\s]+$/, '').trim();
      }
    }
    return null;
  };

  // 1. JAVA: Scanner, BufferedReader, Console
  if (lang === 'java' || lang === 'kt' || code.includes('Scanner') || code.includes('BufferedReader')) {
    lines.forEach((line, idx) => {
      // e.g., sc.nextInt(), scanner.nextLine(), sc.next(), reader.readLine()
      const scannerMatch = line.match(/(\w+)\s*=\s*(?:[a-zA-Z0-9_]+)\.(nextInt|nextLine|next|nextDouble|nextFloat|nextLong|readLine)\s*\(/);
      if (scannerMatch) {
        const varName = scannerMatch[1];
        const methodType = scannerMatch[2];
        const promptText = findPrecedingPrompt(idx) || varName;
        let exampleVal = '10';
        if (methodType === 'nextLine' || methodType === 'next' || methodType === 'readLine') exampleVal = 'Alex';
        if (methodType === 'nextDouble' || methodType === 'nextFloat') exampleVal = '3.14';
        prompts.push({ label: promptText, type: methodType, example: exampleVal });
      } else if (line.match(/(?:[a-zA-Z0-9_]+)\.(nextInt|nextLine|next|nextDouble|nextFloat|nextLong|readLine)\s*\(/)) {
        const promptText = findPrecedingPrompt(idx) || `Input ${prompts.length + 1}`;
        prompts.push({ label: promptText, type: 'input', example: '10' });
      }
    });
  }

  // 2. PYTHON: input(), sys.stdin
  if (lang === 'python' || lang === 'py' || code.includes('input(')) {
    lines.forEach((line) => {
      // e.g. name = input("Enter your name: ") or input()
      const inputMatch = line.match(/(?:(\w+)\s*=\s*)?input\s*\(\s*(?:["'`](.*?)["'`])?\s*\)/);
      if (inputMatch) {
        const varName = inputMatch[1];
        const promptStr = inputMatch[2];
        const label = (promptStr ? promptStr.replace(/[:?\s]+$/, '').trim() : varName) || `Input ${prompts.length + 1}`;
        prompts.push({ label, type: 'string', example: label.toLowerCase().includes('age') ? '25' : 'Hello' });
      }
    });
  }

  // 3. C / C++: cin >>, scanf, getline, fgets
  if (lang === 'cpp' || lang === 'c' || lang === 'c++') {
    lines.forEach((line, idx) => {
      // cin >> a >> b;
      if (line.includes('cin >>') || line.includes('cin>>')) {
        const cinVars = line.split('>>').slice(1).map(v => v.replace(/[;{}]/g, '').trim()).filter(Boolean);
        cinVars.forEach(v => {
          const promptText = findPrecedingPrompt(idx) || v;
          prompts.push({ label: promptText, type: 'variable', example: '10' });
        });
      }
      // scanf("%d %s", &a, str)
      if (line.includes('scanf(')) {
        const promptText = findPrecedingPrompt(idx) || `Input ${prompts.length + 1}`;
        prompts.push({ label: promptText, type: 'scanf', example: '10' });
      }
    });
  }

  // 4. JAVASCRIPT: readline, prompt, process.stdin
  if (lang === 'javascript' || lang === 'js') {
    lines.forEach((line) => {
      if (line.includes('prompt(') || line.includes('readline()') || line.includes('question(')) {
        const promptMatch = line.match(/(?:prompt|question)\s*\(\s*["'`](.*?)["'`]\s*\)/);
        const label = promptMatch ? promptMatch[1].replace(/[:?\s]+$/, '').trim() : `Input ${prompts.length + 1}`;
        prompts.push({ label, type: 'input', example: 'Value' });
      }
    });
  }

  // 5. C# / Go / Rust
  if (code.includes('Console.ReadLine') || code.includes('fmt.Scan') || code.includes('read_line')) {
    prompts.push({ label: 'Program Input', type: 'input', example: 'Sample Input' });
  }

  const requiresInput = prompts.length > 0;
  const suggestedPlaceholder = prompts.map(p => `${p.label} (e.g. ${p.example})`).join('\n');

  return {
    requiresInput,
    prompts,
    suggestedPlaceholder: suggestedPlaceholder || 'Enter required inputs, one per line...'
  };
};
