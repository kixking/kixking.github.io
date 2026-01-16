/**
 * UUID Generation Logic Module
 * Uses Web Crypto API for secure random number generation
 */
export const UuidLogic = {
    /**
     * Generate a UUID v4 string
     * @returns {string} UUID string (e.g., "550e8400-e29b-41d4-a716-446655440000")
     */
    generateV4() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback for environments without crypto.randomUUID (e.g., old browsers or non-secure contexts)
        // Note: For this project standard, we prefer crypto.randomUUID
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    },

    /**
     * Generate multiple UUIDs
     * @param {number} count Number of UUIDs to generate
     * @param {object} options { uppercase: boolean, removeHyphens: boolean }
     * @returns {string[]} Array of UUID strings
     */
    generateBulk(count = 1, options = {}) {
        const result = [];
        const max = Math.min(Math.max(1, count), 1000); // Limit to 1000

        for (let i = 0; i < max; i++) {
            let uuid = this.generateV4();

            if (options.uppercase) {
                uuid = uuid.toUpperCase();
            }
            if (options.removeHyphens) {
                uuid = uuid.replace(/-/g, '');
            }
            result.push(uuid);
        }
        return result;
    }
};
