/**
 * QR Code Logic Module
 * Uses 'qrious' library via CDN ESM wrapper or Global
 * For this implementation, we assume qrious is loaded globally or passed in.
 */
export const QrLogic = {
    /**
     * Generate QR Code
     * @param {object} lib QRious library instance or class
     * @param {HTMLCanvasElement} canvas 
     * @param {object} options 
     */
    generate(lib, canvas, options) {
        if (!lib) throw new Error('QR Library not loaded');

        // QRious works by instantiating with canvas
        return new lib({
            element: canvas,
            value: options.value || '',
            size: options.size || 200,
            padding: options.padding || 0,
            level: options.level || 'L',
            foreground: options.foreground || '#000000',
            background: options.background || '#ffffff',
            backgroundAlpha: options.transparent ? 0 : 1
        });
    },

    /**
     * Convert canvas to image URL
     * @param {HTMLCanvasElement} canvas 
     * @param {string} format 'image/png'
     */
    toDataURL(canvas, format = 'image/png') {
        return canvas.toDataURL(format);
    }
};
