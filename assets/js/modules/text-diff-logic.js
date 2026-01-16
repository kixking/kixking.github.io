/**
 * Text Diff Logic Module
 * Implements a basic LCS (Longest Common Subsequence) algorithm for line-based diff.
 */
export const TextDiffLogic = {
    /**
     * Compute diff between two texts
     * @param {string} text1 Original text
     * @param {string} text2 New text
     * @returns {Array<{type: 'same'|'add'|'del', text: string}>}
     */
    computeDiff(text1, text2) {
        const lines1 = text1.split(/\r?\n/);
        const lines2 = text2.split(/\r?\n/);

        // 1. Compute LCS Matrix
        const matrix = this._computeLCSMatrix(lines1, lines2);

        // 2. Backtrack to find diff parts
        return this._backtrack(matrix, lines1, lines2);
    },

    _computeLCSMatrix(arr1, arr2) {
        const rows = arr1.length;
        const cols = arr2.length;
        const matrix = Array(rows + 1).fill(null).map(() => Array(cols + 1).fill(0));

        for (let i = 1; i <= rows; i++) {
            for (let j = 1; j <= cols; j++) {
                if (arr1[i - 1] === arr2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1] + 1;
                } else {
                    matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
                }
            }
        }
        return matrix;
    },

    _backtrack(matrix, arr1, arr2) {
        let i = arr1.length;
        let j = arr2.length;
        const result = [];

        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && arr1[i - 1] === arr2[j - 1]) {
                // Same line
                result.unshift({ type: 'same', text: arr1[i - 1] });
                i--;
                j--;
            } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
                // Added in arr2
                result.unshift({ type: 'add', text: arr2[j - 1] });
                j--;
            } else {
                // Removed from arr1
                result.unshift({ type: 'del', text: arr1[i - 1] });
                i--;
            }
        }

        return result;
    }
};
