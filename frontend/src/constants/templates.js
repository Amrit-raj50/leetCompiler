export const CODE_TEMPLATES = {
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your C++ code here
        return {};
    }
};`,
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your JavaScript code here
  return [];
}

// Example test
console.log(twoSum([2, 7, 11, 15], 9));`,
  python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your Python code here
        pass
`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your Java code here
        return new int[]{};
    }
}`,
  c: `#include <stdio.h>
#include <stdlib.h>
#include <stddef.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your C code here
    *returnSize = 0;
    return NULL;
}`,
  csharp: `public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        // Write your C# code here
        return new int[0];
    }
}`,
  ruby: `# @param {Integer[]} nums
# @param {Integer} target
# @return {Integer[]}
def two_sum(nums, target)
  # Write your Ruby code here
end`,
  swift: `class Solution {
    func twoSum(_ nums: [Int], _ target: Int) -> [Int] {
        // Write your Swift code here
        return []
    }
}`,
  go: `func twoSum(nums []int, target int) []int {
    // Write your Go code here
    return []int{}
}`,
  kotlin: `class Solution {
    fun twoSum(nums: IntArray, target: Int): IntArray {
        // Write your Kotlin code here
        return intArrayOf()
    }
}`,
  rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // Write your Rust code here
        vec![]
    }
}`,
  php: `class Solution {
    /**
     * @param Integer[] $nums
     * @param Integer $target
     * @return Integer[]
     */
    function twoSum($nums, $target) {
        // Write your PHP code here
        return [];
    }
}`
};

export const LANGUAGE_LABELS = {
  cpp: 'C++',
  java: 'Java',
  python: 'Python 3',
  javascript: 'JavaScript',
  c: 'C',
  csharp: 'C#',
  ruby: 'Ruby',
  swift: 'Swift',
  go: 'Go',
  kotlin: 'Kotlin',
  rust: 'Rust',
  php: 'PHP'
};

export const MONACO_LANG_MAP = {
  cpp: 'cpp',
  java: 'java',
  python: 'python',
  javascript: 'javascript',
  c: 'c',
  csharp: 'csharp',
  ruby: 'ruby',
  swift: 'swift',
  go: 'go',
  kotlin: 'kotlin',
  rust: 'rust',
  php: 'php'
};
