/**
 * JWT Logic Module
 */
export const JwtLogic = {
    /**
     * Decode Base64Url string
     * @param {string} str 
     * @returns {string} Decoded string
     */
    base64UrlDecode(str) {
        // Replace non-url compatible chars
        let output = str.replace(/-/g, '+').replace(/_/g, '/');

        // Pad with standard base64 characters
        switch (output.length % 4) {
            case 0: break;
            case 2: output += '=='; break;
            case 3: output += '='; break;
            default: throw new Error('Illegal base64url string!');
        }

        // Decode - handle UTF-8 correctly
        return decodeURIComponent(atob(output).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    },

    /**
     * Parse JWT string
     * @param {string} token 
     * @returns {object} { header: obj, payload: obj, signature: string }
     */
    parse(token) {
        if (!token) throw new Error('Token is empty');

        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format. Must have 3 parts separated by dots.');
        }

        try {
            const header = JSON.parse(this.base64UrlDecode(parts[0]));
            const payload = JSON.parse(this.base64UrlDecode(parts[1]));
            const signature = parts[2]; // Signature is kept raw

            return {
                header,
                payload,
                signature
            };
        } catch (e) {
            throw new Error('Failed to decode JWT parts: ' + e.message);
        }
    }
};
