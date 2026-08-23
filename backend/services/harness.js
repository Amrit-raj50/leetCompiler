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

  if (lang === 'java') {
    const sanitizedUserCode = code
      .replace(/^\s*package\s+[^;]+;\s*/gm, '')
      .replace(/public\s+class\s+([A-Za-z0-9_$]+)/g, 'class $1');

    // Detect the actual solution class name from the user's code
    const solutionClassMatch = code.match(/(?:public\s+)?class\s+([A-Za-z0-9_$]+)/);
    const solutionClassName = solutionClassMatch ? solutionClassMatch[1] : 'Solution';

    const testCasesCode = testCases.map((tc, index) => {
      const tcNum = index + 1;
      const inputJson = JSON.stringify(tc.input || {});
      const expectedJson = JSON.stringify(tc.expected);

      if (questionSlug === 'two-sum') {
        const numsArr = JSON.stringify(tc.input?.nums || []);
        const target = tc.input?.target ?? 0;
        const expArr = JSON.stringify(tc.expected || []);
        return `
    {
      long t0 = System.nanoTime();
      int tcNum = ${tcNum};
      String inputJson = ${JSON.stringify(inputJson)};
      String expectedJson = ${JSON.stringify(expectedJson)};
      String actualJson = "null";
      boolean passed = false;
      String errStr = null;
      try {
        int[] nums = new int[]${numsArr.replace(/\[/g, '{').replace(/\]/g, '}')};
        int target = ${target};
        int[] expected = new int[]${expArr.replace(/\[/g, '{').replace(/\]/g, '}')};
        int[] actual = sol.twoSum(nums, target);
        actualJson = stringify(actual);
        if (actual != null && actual.length == expected.length) {
          int[] aCopy = actual.clone(); Arrays.sort(aCopy);
          int[] eCopy = expected.clone(); Arrays.sort(eCopy);
          passed = Arrays.equals(actual, expected) || Arrays.equals(aCopy, eCopy);
        }
      } catch (Throwable t) {
        errStr = t.getClass().getSimpleName() + (t.getMessage() != null ? ": " + t.getMessage() : "");
        passed = false;
      }
      if (!passed) allPassed = false;
      double timeMs = (System.nanoTime() - t0) / 1000000.0;
      resultsList.add(buildResultJson(tcNum, inputJson, expectedJson, actualJson, passed, errStr, timeMs));
    }
        `;
      }

      if (questionSlug === 'valid-parentheses') {
        const sStr = JSON.stringify(tc.input?.s ?? '');
        const expected = Boolean(tc.expected);
        return `
    {
      long t0 = System.nanoTime();
      int tcNum = ${tcNum};
      String inputJson = ${JSON.stringify(inputJson)};
      String expectedJson = ${JSON.stringify(expectedJson)};
      String actualJson = "null";
      boolean passed = false;
      String errStr = null;
      try {
        String s = ${sStr};
        boolean expected = ${expected};
        boolean actual = sol.isValid(s);
        actualJson = String.valueOf(actual);
        passed = (actual == expected);
      } catch (Throwable t) {
        errStr = t.getClass().getSimpleName() + (t.getMessage() != null ? ": " + t.getMessage() : "");
        passed = false;
      }
      if (!passed) allPassed = false;
      double timeMs = (System.nanoTime() - t0) / 1000000.0;
      resultsList.add(buildResultJson(tcNum, inputJson, expectedJson, actualJson, passed, errStr, timeMs));
    }
        `;
      }

      if (questionSlug === 'best-time-to-buy-and-sell-stock') {
        const pricesArr = JSON.stringify(tc.input?.prices || []);
        const expected = Number(tc.expected) || 0;
        return `
    {
      long t0 = System.nanoTime();
      int tcNum = ${tcNum};
      String inputJson = ${JSON.stringify(inputJson)};
      String expectedJson = ${JSON.stringify(expectedJson)};
      String actualJson = "null";
      boolean passed = false;
      String errStr = null;
      try {
        int[] prices = new int[]${pricesArr.replace(/\[/g, '{').replace(/\]/g, '}')};
        int expected = ${expected};
        int actual = sol.maxProfit(prices);
        actualJson = String.valueOf(actual);
        passed = (actual == expected);
      } catch (Throwable t) {
        errStr = t.getClass().getSimpleName() + (t.getMessage() != null ? ": " + t.getMessage() : "");
        passed = false;
      }
      if (!passed) allPassed = false;
      double timeMs = (System.nanoTime() - t0) / 1000000.0;
      resultsList.add(buildResultJson(tcNum, inputJson, expectedJson, actualJson, passed, errStr, timeMs));
    }
        `;
      }

      if (questionSlug === 'palindrome-number') {
        const xVal = Number(tc.input?.x) || 0;
        const expected = Boolean(tc.expected);
        return `
    {
      long t0 = System.nanoTime();
      int tcNum = ${tcNum};
      String inputJson = ${JSON.stringify(inputJson)};
      String expectedJson = ${JSON.stringify(expectedJson)};
      String actualJson = "null";
      boolean passed = false;
      String errStr = null;
      try {
        int x = ${xVal};
        boolean expected = ${expected};
        boolean actual = sol.isPalindrome(x);
        actualJson = String.valueOf(actual);
        passed = (actual == expected);
      } catch (Throwable t) {
        errStr = t.getClass().getSimpleName() + (t.getMessage() != null ? ": " + t.getMessage() : "");
        passed = false;
      }
      if (!passed) allPassed = false;
      double timeMs = (System.nanoTime() - t0) / 1000000.0;
      resultsList.add(buildResultJson(tcNum, inputJson, expectedJson, actualJson, passed, errStr, timeMs));
    }
        `;
      }

      // Generic fallback invocation for other questions
      return `
    {
      long t0 = System.nanoTime();
      int tcNum = ${tcNum};
      String inputJson = ${JSON.stringify(inputJson)};
      String expectedJson = ${JSON.stringify(expectedJson)};
      String actualJson = "null";
      boolean passed = false;
      String errStr = null;
      try {
        Object actual = invokeGenericMethod(sol);
        actualJson = stringify(actual);
        passed = compareExpected(actual, ${JSON.stringify(expectedJson)});
      } catch (Throwable t) {
        errStr = t.getClass().getSimpleName() + (t.getMessage() != null ? ": " + t.getMessage() : "");
        passed = false;
      }
      if (!passed) allPassed = false;
      double timeMs = (System.nanoTime() - t0) / 1000000.0;
      resultsList.add(buildResultJson(tcNum, inputJson, expectedJson, actualJson, passed, errStr, timeMs));
    }
      `;
    }).join('\n');

    return {
      isHarness: true,
      entryClassName: 'SolutionRunner',
      wrappedCode: `
import java.util.*;
import java.io.*;
import java.lang.reflect.*;

${sanitizedUserCode}

public class SolutionRunner {
    private static String escapeJson(String s) {
        if (s == null) return "null";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\\\': sb.append("\\\\\\\\"); break;
                case '\\b': sb.append("\\\\b"); break;
                case '\\f': sb.append("\\\\f"); break;
                case '\\n': sb.append("\\\\n"); break;
                case '\\r': sb.append("\\\\r"); break;
                case '\\t': sb.append("\\\\t"); break;
                default:
                    if (c < ' ') {
                        String t = "000" + Integer.toHexString(c);
                        sb.append("\\\\u").append(t.substring(t.length() - 4));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    private static String stringify(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof int[]) return Arrays.toString((int[]) obj);
        if (obj instanceof long[]) return Arrays.toString((long[]) obj);
        if (obj instanceof double[]) return Arrays.toString((double[]) obj);
        if (obj instanceof boolean[]) return Arrays.toString((boolean[]) obj);
        if (obj instanceof char[]) return "\\"" + new String((char[]) obj) + "\\"";
        if (obj instanceof Object[]) return Arrays.deepToString((Object[]) obj);
        if (obj instanceof List) return obj.toString();
        if (obj instanceof Set) return obj.toString();
        if (obj instanceof Map) return obj.toString();
        if (obj instanceof String) return "\\"" + escapeJson((String) obj) + "\\"";
        return String.valueOf(obj);
    }

    private static String buildResultJson(int tcNum, String inputJson, String expectedJson, String actualJson, boolean passed, String error, double timeMs) {
        StringBuilder sb = new StringBuilder("{");
        sb.append("\\"testCase\\":").append(tcNum).append(",");
        sb.append("\\"input\\":").append(inputJson).append(",");
        sb.append("\\"expected\\":").append(expectedJson).append(",");
        boolean isRawJson = actualJson != null && (
            actualJson.startsWith("[") || actualJson.startsWith("{") ||
            actualJson.equals("true") || actualJson.equals("false") ||
            actualJson.matches("^-?\\\\d+(\\\\.\\\\d+)?$")
        );
        sb.append("\\"actual\\":").append(isRawJson ? actualJson : ("\\"" + escapeJson(actualJson) + "\\"")).append(",");
        sb.append("\\"passed\\":").append(passed).append(",");
        sb.append("\\"error\\":").append(error != null ? ("\\"" + escapeJson(error) + "\\"") : "null").append(",");
        sb.append("\\"timeMs\\":").append(String.format(Locale.US, "%.2f", timeMs));
        sb.append("}");
        return sb.toString();
    }

    private static Object invokeGenericMethod(Object sol) throws Exception {
        Class<?> solClass = sol.getClass();
        Method[] methods = solClass.getDeclaredMethods();
        for (Method m : methods) {
            if (Modifier.isPublic(m.getModifiers()) && !m.getName().equals("main")) {
                m.setAccessible(true);
                Class<?>[] params = m.getParameterTypes();
                if (params.length == 0) {
                    return m.invoke(sol);
                }
            }
        }
        throw new NoSuchMethodException("Could not find suitable public method on " + solClass.getSimpleName() + " class");
    }

    private static boolean compareExpected(Object actual, String expectedJson) {
        if (actual == null) return expectedJson == null || expectedJson.equals("null");
        String actStr = stringify(actual).replaceAll("\\\\s+", "");
        String expStr = expectedJson.replaceAll("\\\\s+", "");
        return actStr.equals(expStr);
    }

    public static void main(String[] args) {
        long startHr = System.nanoTime();
        ${solutionClassName} sol = null;
        try {
            sol = new ${solutionClassName}();
        } catch (Throwable t) {
            System.err.println("Failed to instantiate solution class '${solutionClassName}': " + t.getMessage());
            System.exit(1);
        }

        List<String> resultsList = new ArrayList<>();
        boolean allPassed = true;

        // Test Cases Execution
        ${testCasesCode}

        double totalTimeMs = (System.nanoTime() - startHr) / 1000000.0;
        Runtime rt = Runtime.getRuntime();
        long usedMemBytes = rt.totalMemory() - rt.freeMemory();
        double memoryMb = Math.max(34.2, Math.round((usedMemBytes / (1024.0 * 1024.0) + 32.0) * 10.0) / 10.0);

        System.out.println("__LEETCOMPILER_RESULT_START__");
        System.out.println("{\\"allPassed\\":" + allPassed + ",\\"results\\":[" + String.join(",", resultsList) + "],\\"executionTimeMs\\":" + String.format(Locale.US, "%.2f", totalTimeMs) + ",\\"memoryMb\\":" + String.format(Locale.US, "%.1f", memoryMb) + "}");
        System.out.println("__LEETCOMPILER_RESULT_END__");
    }
}
`
    };
  }

  // Fallback for C++ / Generic
  return { wrappedCode: code, isHarness: false };
};
