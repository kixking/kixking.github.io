/**
 * Unix Time Logic Module
 */
export const UnixTimeLogic = {
    /**
     * Convert Unix Timestamp to various string formats
     * @param {number|string} timestamp Unix timestamp (can be seconds or ms)
     * @returns {object} Formatted strings { iso, local, utc }
     */
    fromUnix(timestamp) {
        let ts = parseInt(timestamp);
        if (isNaN(ts)) return null;

        // Guess if seconds or milliseconds (cutoff at year 1973/2286 if treating as seconds)
        // If < 10000000000, treat as seconds.
        if (ts < 10000000000) {
            ts *= 1000;
        }

        const date = new Date(ts);

        return {
            iso: date.toISOString(),
            local: date.toLocaleString(),
            utc: date.toUTCString(),
            rawMs: ts
        };
    },

    /**
     * Convert Date string to Unix Timestamp
     * @param {string} dateStr 
     * @returns {object} { seconds, milliseconds }
     */
    toUnix(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;

        return {
            seconds: Math.floor(date.getTime() / 1000),
            milliseconds: date.getTime()
        };
    },

    /**
     * Get current time info
     */
    now() {
        const now = new Date();
        return {
            seconds: Math.floor(now.getTime() / 1000),
            milliseconds: now.getTime(),
            iso: now.toISOString()
        };
    }
};
