/**
 * JSON Formatter/Fixer Logic
 */
export const JsonFormatterLogic = {
    /**
     * Format JSON String
     * @param {string} jsonString 
     * @param {string|number|null} indent 
     * @returns {object} { success: boolean, result: string, error: string }
     */
    format(jsonString, indent = 2) {
        if (!jsonString || !jsonString.trim()) {
            return { success: true, result: '' };
        }

        try {
            const obj = JSON.parse(jsonString);
            const result = JSON.stringify(obj, null, indent);
            return { success: true, result };
        } catch (e) {
            return { success: false, result: '', error: e.message };
        }
    },

    /**
     * Attempt to fix invalid JSON (naive implementation)
     * @param {string} text 
     * @returns {string} cleaned text
     */
    repair(text) {
        let cleaned = text.trim();

        // 1. Replace single quotes with double quotes
        // Note: This is a heuristic and might replace quotes inside strings incorrectly
        // A more robust parser would be needed for perfect results, but consistent with original logic
        cleaned = cleaned.replace(/'/g, '"');

        // 2. Remove trailing commas
        cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

        // 3. Remove comments (single line and multi-line)
        cleaned = cleaned.replace(/\/\/.*$/gm, '');
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

        return cleaned;
    }
};
