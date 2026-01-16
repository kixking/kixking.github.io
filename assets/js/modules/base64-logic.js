/**
 * Base64 Logic Module (UTF-8 Safe)
 */
export const Base64Logic = {
    /**
     * Encode string to Base64 (UTF-8 safe)
     * @param {string} str 
     * @returns {string} Base64 string
     */
    encode(str) {
        if (!str) return '';
        try {
            // Encode to standard URI format then base64
            // This handles unicode characters correctly
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode('0x' + p1);
                }));
        } catch (e) {
            console.error('Base64 Encode Error:', e);
            throw new Error('Failed to encode.');
        }
    },

    /**
     * Decode Base64 string to original string (UTF-8 safe)
     * @param {string} str Base64 string
     * @returns {string} Decoded string
     */
    decode(str) {
        if (!str) return '';
        try {
            // Decode base64 to bytes then to URI component for unicode
            return decodeURIComponent(atob(str).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        } catch (e) {
            console.error('Base64 Decode Error:', e);
            throw new Error('Invalid Base64 string.');
        }
    }
};
