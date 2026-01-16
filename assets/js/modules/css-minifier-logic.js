/**
 * CSS Minifier Logic Module
 */
export const CssMinifierLogic = {
    /**
     * Minify CSS string
     * @param {string} css 
     * @returns {string} Minified CSS
     */
    minify(css) {
        if (!css) return '';

        return css
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove newlines and tabs
            .replace(/\n/g, '')
            .replace(/\t/g, '')
            // Remove space around separators
            .replace(/\s*([{}:;,>])\s*/g, '$1')
            // Remove last semicolon in block
            .replace(/;}/g, '}')
            // Trim
            .trim();
    }
};
