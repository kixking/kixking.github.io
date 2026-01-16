/**
 * Regex Logic Module
 */
export const RegexLogic = {
    /**
     * Test regex against text
     * @param {string} patternString 
     * @param {string} flags 
     * @param {string} text 
     * @returns {object} { matches: [], error: string|null }
     */
    test(patternString, flags, text) {
        if (!patternString) return { matches: [], error: null };

        try {
            const regex = new RegExp(patternString, flags);
            const matches = [];

            // If global flag is not set, match() only returns first match.
            // matchAll() is standard now but requires 'g' usually or compliant regex.
            // Let's use loop with exec for robustness or matchAll if 'g' is present.

            // Note: infinite loop risk if regex matches empty string and global flag is set without advancing index.
            // JS RegExp handles this but good to be aware.

            if (flags.includes('g')) {
                const results = text.matchAll(regex);
                for (const match of results) {
                    matches.push({
                        text: match[0],
                        index: match.index,
                        groups: match.slice(1) // capture groups
                    });
                }
            } else {
                const match = regex.exec(text);
                if (match) {
                    matches.push({
                        text: match[0],
                        index: match.index,
                        groups: match.slice(1)
                    });
                }
            }

            return { matches, error: null };
        } catch (e) {
            return { matches: [], error: e.message };
        }
    },

    /**
     * Highlight matches in text
     * @param {string} text 
     * @param {Array} matches 
     * @returns {string} HTML
     */
    highlight(text, matches) {
        if (!matches || matches.length === 0) return this._escape(text);

        let html = '';
        let lastIndex = 0;

        // Sort matches by index just in case, though matchAll guarantees order
        matches.sort((a, b) => a.index - b.index);

        for (const match of matches) {
            // Non-overlapping check (simplified)
            if (match.index < lastIndex) continue;

            const before = text.substring(lastIndex, match.index);
            const matchedText = match.text;

            html += this._escape(before);
            html += `<mark>${this._escape(matchedText)}</mark>`;

            lastIndex = match.index + matchedText.length;
        }

        html += this._escape(text.substring(lastIndex));
        return html;
    },

    _escape(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, function (m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }
};
