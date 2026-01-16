/**
 * Markdown Logic Module
 * Wraps 'marked' library logic.
 */
export const MarkdownLogic = {
    /**
     * Convert markdown to HTML
     * @param {object} markedLib marked library instance/function
     * @param {string} text Markdown text
     * @returns {string} HTML
     */
    toHtml(markedLib, text) {
        if (!text) return '';
        if (!markedLib) return text; // fallback

        try {
            // marked() returns string
            // Assuming marked is loaded as `marked.parse` or just `marked` depending on version
            // For ESM: import { marked } from '...'; marked.parse(text);
            return markedLib.parse(text);
        } catch (e) {
            console.error('Markdown parse error', e);
            return '<p style="color:red">Parse Error</p>';
        }
    }
};
