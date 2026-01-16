/**
 * Meta Tag Generator Logic Module
 */
export const MetaGeneratorLogic = {
    /**
     * Generate meta tags HTML
     * @param {object} data
     * @returns {string} HTML string of meta tags
     */
    generate(data) {
        const lines = [];

        // Basic
        lines.push('<!-- Basic Meta Tags -->');
        lines.push('<meta charset="UTF-8">');
        lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
        if (data.title) lines.push(`<title>${this._escape(data.title)}</title>`);
        if (data.description) lines.push(`<meta name="description" content="${this._escape(data.description)}">`);

        // OGP
        lines.push('\n<!-- Open Graph Protocol -->');
        if (data.url) lines.push(`<meta property="og:url" content="${this._escape(data.url)}">`);
        lines.push(`<meta property="og:type" content="${data.type || 'website'}">`);
        if (data.title) lines.push(`<meta property="og:title" content="${this._escape(data.title)}">`);
        if (data.description) lines.push(`<meta property="og:description" content="${this._escape(data.description)}">`);
        if (data.image) lines.push(`<meta property="og:image" content="${this._escape(data.image)}">`);
        if (data.siteName) lines.push(`<meta property="og:site_name" content="${this._escape(data.siteName)}">`);

        // Twitter Card
        lines.push('\n<!-- Twitter Card -->');
        lines.push(`<meta name="twitter:card" content="${data.cardType || 'summary_large_image'}">`);
        if (data.twitterSite) lines.push(`<meta name="twitter:site" content="${this._escape(data.twitterSite)}">`);
        if (data.title) lines.push(`<meta name="twitter:title" content="${this._escape(data.title)}">`);
        if (data.description) lines.push(`<meta name="twitter:description" content="${this._escape(data.description)}">`);
        if (data.image) lines.push(`<meta name="twitter:image" content="${this._escape(data.image)}">`);

        return lines.join('\n');
    },

    _escape(str) {
        if (!str) return '';
        return str.replace(/"/g, '&quot;');
    }
};
