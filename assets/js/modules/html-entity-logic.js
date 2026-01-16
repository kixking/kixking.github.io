/**
 * HTML Entity Encoding Logic Module
 */
export const HtmlEntityLogic = {
    /**
     * Escape HTML special characters
     * @param {string} str Input string
     * @returns {string} Escaped string
     */
    encode(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, function (m) {
            switch (m) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case "'": return '&#39;';
                default: return m;
            }
        });
    },

    /**
     * Unescape HTML special characters
     * @param {string} str Input string
     * @returns {string} Unescaped string
     */
    decode(str) {
        if (!str) return '';
        return str.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x27;/g, function (m) {
            switch (m) {
                case '&amp;': return '&';
                case '&lt;': return '<';
                case '&gt;': return '>';
                case '&quot;': return '"';
                case '&#39;': return "'";
                case '&#x27;': return "'";
                default: return m;
            }
        });
    }
};
