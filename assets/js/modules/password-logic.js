/**
 * Password Generator Logic Module
 */
export const PasswordLogic = {
    chars: {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        number: '0123456789',
        symbol: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    },

    /**
     * Generate secure random password
     * @param {number} length 
     * @param {object} options { upper, lower, number, symbol }
     */
    generate(length = 12, options = {}) {
        const { upper = true, lower = true, number = true, symbol = true } = options;

        let charset = '';
        if (upper) charset += this.chars.upper;
        if (lower) charset += this.chars.lower;
        if (number) charset += this.chars.number;
        if (symbol) charset += this.chars.symbol;

        if (!charset) return ''; // No char selected

        // Web Crypto API random values
        const buffer = new Uint32Array(length);
        if (typeof crypto !== 'undefined') {
            crypto.getRandomValues(buffer);
        } else {
            // Fallback for non-browser/test env (Math.random is not secure but sufficient for basic logic test)
            for (let i = 0; i < length; i++) {
                buffer[i] = Math.floor(Math.random() * 4294967296);
            }
        }

        let password = '';
        const charsetLen = charset.length;
        for (let i = 0; i < length; i++) {
            password += charset[buffer[i] % charsetLen];
        }

        return password;
    },

    /**
     * Convert ASCII string to Fullwidth
     */
    toFullWidth(str) {
        return str.replace(/[\u0021-\u007E]/g, function (c) {
            return String.fromCharCode(c.charCodeAt(0) + 0xFEE0);
        }).replace(/\u0020/g, "\u3000"); // space
    }
};
