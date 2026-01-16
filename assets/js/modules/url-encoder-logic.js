/**
 * URL Encoder/Decoder Logic
 */
export const UrlEncoderLogic = {
    /**
     * Encode text to URL format
     * @param {string} text 
     * @returns {string}
     */
    encode(text) {
        if (!text) return '';
        return encodeURIComponent(text);
    },

    /**
     * Decode URL encoded text
     * @param {string} text 
     * @returns {object} { success: boolean, result: string, error: string }
     */
    decode(text) {
        if (!text) return { success: true, result: '' };
        try {
            return { success: true, result: decodeURIComponent(text) };
        } catch (e) {
            return { success: false, result: '', error: 'エラー: 無効な形式です。デコードできない可能性があります。' };
        }
    }
};
