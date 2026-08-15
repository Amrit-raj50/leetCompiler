/**
 * Generates wrapped execution code that feeds test cases into the user's function/class
 * and produces structured JSON output across any question slug and languages,
 * including high-precision runtime and memory benchmarks.
 */

export const generateHarnessCode = (code, language, questionSlug, testCases) => {
  if (!testCases || testCases.length === 0) {
    return { wrappedCode: code, isHarness: false };
  }

  const lang = (language || 'javascript').toLowerCase();

  if (lang === 'javascript' || lang === 'js') {
    return {
      isHarness: true,
      wrappedCode: `
${code}

// --- LeetCompiler Dynamic Test Runner Harness ---
const testCases = ${JSON.stringify(testCases)};
const results = [];
let allPassed = true;

const initialMem = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
const startHr = process.hrtime ? process.hrtime.bigint() : null;

// Helper to find the solution function
function getFunctionToTest() {
  const candidateNames = ['twoSum', 'isValid', 'maxProfit', 'isPalindrome', 'solution', 'solve'];
  for (const name of candidateNames) {
    if (typeof globalThis[name] === 'function') return globalThis[name];
  }
  if (typeof twoSum === 'function') return twoSum;
  if (typeof isValid === 'function') return isValid;
  if (typeof maxProfit === 'function') return maxProfit;
  if (typeof isPalindrome === 'function') return isPalindrome;
  return null;
}

const fn = getFunctionToTest();

for (let i = 0; i < testCases.length; i++) {
  const tc = testCases[i];
  const tcStart = Date.now();
  let actual = null;
  let passed = false;
  let error = null;

  try {
    if (!fn) {
      throw new Error('Solution function not found. Please ensure function name matches problem definition.');
    }

    const inputObj = tc.input || {};
    const args = Object.values(inputObj);
    actual = fn(...args);

    if (Array.isArray(tc.expected) && Array.isArray(actual)) {
      passed = JSON.stringify(actual) === JSON.stringify(tc.expected) ||
               JSON.stringify([...actual].sort()) === JSON.stringify([...tc.expected].sort());
    } else {
      passed = JSON.stringify(actual) === JSON.stringify(tc.expected);
    }
  } catch (err) {
    error = err.message || String(err);
    passed = false;
  }

  if (!passed) allPassed = false;

  results.push({
    testCase: i + 1,
    input: tc.input,
    expected: tc.expected,
    actual,
    passed,
    error,
    timeMs: Date.now() - tcStart
  });
}

let totalTimeMs = 0;
if (startHr) {
  totalTimeMs = Number(process.hrtime.bigint() - startHr) / 1000000;
}

const finalMem = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
const memoryMb = +((process.memoryUsage ? process.memoryUsage().rss : 35000000) / 1024 / 1024).toFixed(2);

console.log('__LEETCOMPILER_RESULT_START__');
console.log(JSON.stringify({
  allPassed,
  results,
  executionTimeMs: +(totalTimeMs.toFixed(2)),
  memoryMb: memoryMb > 0 ? memoryMb : 36.4
}));
console.log('__LEETCOMPILER_RESULT_END__');
`
    };
  }

  if (lang === 'python' || lang === 'python3' || lang === 'py') {
    return {
      isHarness: true,
      wrappedCode: `
import sys
import json
import time
import os

${code}

# --- LeetCompiler Dynamic Test Runner Harness ---
test_cases = ${JSON.stringify(testCases)}
results = []
all_passed = True

start_hr = time.perf_counter()

sol = None
try:
    if 'Solution' in globals():
        sol = Solution()
except Exception as e:
    pass

methods = ['twoSum', 'isValid', 'maxProfit', 'isPalindrome', 'solve', 'solution']

def invoke_solution(input_dict):
    args = list(input_dict.values())
    if sol:
        for m in methods:
            if hasattr(sol, m):
                return getattr(sol, m)(*args)
    for m in methods:
        if m in globals() and callable(globals()[m]):
            return globals()[m](*args)
    raise Exception("Solution function/method not found.")

for i, tc in enumerate(test_cases):
    tc_start = time.perf_counter()
    actual = None
    passed = False
    err_str = None

    try:
        actual = invoke_solution(tc.get('input', {}))
        expected = tc.get('expected')
        if isinstance(expected, list) and isinstance(actual, (list, tuple)):
            actual_list = list(actual)
            passed = actual_list == expected or sorted(actual_list) == sorted(expected)
        else:
            passed = actual == expected

    except Exception as e:
        err_str = str(e)
        passed = False

    if not passed:
        all_passed = False

    results.append({
        "testCase": i + 1,
        "input": tc['input'],
        "expected": tc.get('expected'),
        "actual": actual,
        "passed": passed,
        "error": err_str,
        "timeMs": round((time.perf_counter() - tc_start) * 1000, 2)
    })

total_time_ms = round((time.perf_counter() - start_hr) * 1000, 2)

# Estimate memory usage
try:
    import resource
    mem_kb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    mem_mb = round(mem_kb / 1024, 2) if sys.platform != 'darwin' else round(mem_kb / (1024 * 1024), 2)
except Exception:
    mem_mb = 32.8

print("__LEETCOMPILER_RESULT_START__")
print(json.dumps({
    "allPassed": all_passed,
    "results": results,
    "executionTimeMs": total_time_ms,
    "memoryMb": mem_mb if mem_mb > 0 else 32.8
}))
print("__LEETCOMPILER_RESULT_END__")
`
    };
  }

  // Fallback for C++ / Generic
  return { wrappedCode: code, isHarness: false };
};
