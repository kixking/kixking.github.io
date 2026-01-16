/**
 * 文字数カウントのコアロジック
 */
export const MojiLogic = {
    /**
     * 統計情報を計算する
     * @param {string} text 
     * @returns {object}
     */
    calculateStats(text) {
        if (!text) {
            return {
                total: 0,
                noSpace: 0,
                noNewline: 0,
                lines: 0,
                words: 0,
                readingTime: 0
            };
        }

        const total = text.length;
        const noSpace = text.replace(/\s/g, '').length;
        const noNewline = text.replace(/\n/g, '').length;
        const lines = text.split('\n').length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const readingTime = Math.ceil(total / 400);

        return { total, noSpace, noNewline, lines, words, readingTime };
    },

    /**
     * 特定の条件で文字数を計算する
     * @param {string} text 
     * @param {boolean} excludeSpaces 
     * @param {boolean} excludeNewlines 
     * @returns {number}
     */
    calculatePrimary(text, excludeSpaces, excludeNewlines) {
        if (!text) return 0;

        if (excludeSpaces && excludeNewlines) {
            return text.replace(/\s/g, '').length;
        } else if (excludeSpaces) {
            return text.replace(/[ 　\t]/g, '').length;
        } else if (excludeNewlines) {
            return text.replace(/[\r\n]/g, '').length;
        }
        return text.length;
    }
};
