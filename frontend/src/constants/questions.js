export const PROBLEMS = [
  {
    id: 1,
    slug: 'two-sum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    difficultyColor: '#16a34a',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.

You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
    ],
    templates: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []
`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (seen.count(comp)) {
                return {seen[comp], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`
    }
  },
  {
    id: 2,
    slug: 'valid-parentheses',
    title: '20. Valid Parentheses',
    difficulty: 'Easy',
    difficultyColor: '#16a34a',
    tags: ['String', 'Stack'],
    description: `Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true',
        explanation: 'The brackets are matched in correct order.'
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All matching pairs are valid.'
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Mismatched closing bracket.'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only "()[]{}"'
    ],
    testCases: [
      { input: { s: '()' }, expected: true },
      { input: { s: '()[]{}' }, expected: true },
      { input: { s: '(]' }, expected: false }
    ],
    templates: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if (ch in map) {
      if (stack.pop() !== map[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {")": "(", "}": "{", "]": "["}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack
`,
      cpp: `#include <string>
#include <stack>
#include <unordered_map>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> map = {{')', '('}, {'}', '{'}, {']', '['}};
        for (char c : s) {
            if (map.count(c)) {
                if (st.empty() || st.top() != map[c]) return false;
                st.pop();
            } else {
                st.push(c);
            }
        }
        return st.empty();
    }
};`,
      java: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`
    }
  },
  {
    id: 3,
    slug: 'best-time-to-buy-and-sell-stock',
    title: '121. Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    difficultyColor: '#16a34a',
    tags: ['Array', 'Dynamic Programming'],
    description: `You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i<sup>th</sup></code> day.

You want to maximize your profit by choosing a <strong>single day</strong> to buy one stock and choosing a <strong>different day in the future</strong> to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return <code>0</code>.`,
    examples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.'
      }
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ],
    testCases: [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, expected: 5 },
      { input: { prices: [7, 6, 4, 3, 1] }, expected: 0 }
    ],
    templates: {
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }
  return maxProfit;
}`,
      python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        for price in prices:
            if price < min_price:
                min_price = price
            elif price - min_price > max_profit:
                max_profit = price - min_price
        return max_profit
`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = 1e9;
        int maxProf = 0;
        for (int p : prices) {
            minPrice = min(minPrice, p);
            maxProf = max(maxProf, p - minPrice);
        }
        return maxProf;
    }
};`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else if (price - minPrice > maxProfit) {
                maxProfit = price - minPrice;
            }
        }
        return maxProfit;
    }
}`
    }
  },
  {
    id: 4,
    slug: 'palindrome-number',
    title: '9. Palindrome Number',
    difficulty: 'Easy',
    difficultyColor: '#16a34a',
    tags: ['Math'],
    description: `Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a palindrome, and <code>false</code> otherwise.

An integer is a palindrome when it reads the same forward and backward. For example, <code>121</code> is a palindrome while <code>123</code> is not.`,
    examples: [
      {
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.'
      },
      {
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left it becomes 121-.'
      }
    ],
    constraints: [
      '-2^31 <= x <= 2^31 - 1'
    ],
    testCases: [
      { input: { x: 121 }, expected: true },
      { input: { x: -121 }, expected: false },
      { input: { x: 10 }, expected: false }
    ],
    templates: {
      javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
  if (x < 0) return false;
  const s = x.toString();
  return s === s.split('').reverse().join('');
}`,
      python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0:
            return False
        return str(x) == str(x)[::-1]
`,
      cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        if (x < 0) return false;
        long rev = 0, temp = x;
        while (temp > 0) {
            rev = rev * 10 + (temp % 10);
            temp /= 10;
        }
        return rev == x;
    }
};`,
      java: `class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0) return false;
        int rev = 0, temp = x;
        while (temp > 0) {
            rev = rev * 10 + (temp % 10);
            temp /= 10;
        }
        return rev == x;
    }
}`
    }
  }
];

export const STANDALONE_DEFAULT_CODE = {
  javascript: `// ⚡ LeetCompiler Standalone Scratchpad
// Write and execute any code instantly!

function solve() {
  console.log("Hello from Standalone Compiler!");
  const array = [1, 2, 3, 4, 5];
  const doubled = array.map(x => x * 2);
  console.log("Doubled values:", doubled);
}

solve();`,
  python: `# ⚡ LeetCompiler Standalone Scratchpad
# Write and execute any Python code instantly!

def main():
    print("Hello from Standalone Compiler!")
    nums = [1, 2, 3, 4, 5]
    squares = [x**2 for x in nums]
    print(f"Squared values: {squares}")

if __name__ == "__main__":
    main()
`,
  cpp: `// ⚡ LeetCompiler Standalone Scratchpad
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "Hello from Standalone C++ Compiler!\\n";
    std::vector<int> v = {1, 2, 3, 4, 5};
    int sum = std::accumulate(v.begin(), v.end(), 0);
    std::cout << "Sum of elements: " << sum << "\\n";
    return 0;
}`,
  java: `// ⚡ LeetCompiler Standalone Scratchpad
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Standalone Java Compiler!");
        int a = 10, b = 20;
        System.out.println("Sum = " + (a + b));
    }
}`
};
