document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('emoji-canvas');
    const ctx = canvas.getContext('2d');

    // Inputs
    const textInput = document.getElementById('input-text');
    const textColorInput = document.getElementById('text-color');
    const bgColorInput = document.getElementById('bg-color');
    const transparentBgCheck = document.getElementById('transparent-bg');
    const fontFamilyInput = document.getElementById('font-family');
    const fontSizeInput = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    const outputSizeSelect = document.getElementById('output-size');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const formatSelect = document.getElementById('file-format');
    const historyList = document.getElementById('history-list');

    // Constants
    const HISTORY_KEY = 'emoji_generator_history';
    const MAX_HISTORY = 5;

    // --- Drawing Logic ---

    const drawEmoji = () => {
        const text = textInput.value || '';
        const textColor = textColorInput.value;
        const bgColor = bgColorInput.value;
        const fontFamily = fontFamilyInput.value;
        const sizePercentage = parseInt(fontSizeInput.value);
        const canvasSize = parseInt(outputSizeSelect.value);

        // Update display
        fontSizeValue.textContent = sizePercentage;

        // Resize canvas if needed
        if (canvas.width !== canvasSize || canvas.height !== canvasSize) {
            canvas.width = canvasSize;
            canvas.height = canvasSize;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvasSize, canvasSize);

        // Fill Background
        if (!transparentBgCheck.checked) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvasSize, canvasSize);
        }

        if (!text) return;

        // Text Configuration
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = text.split('\n');
        const lineCount = lines.length;

        // Dynamic Font Scaling
        // We want the text block to fit within padding
        const padding = canvasSize * 0.05; // 5% padding
        const maxWidth = canvasSize - (padding * 2);
        const maxHeight = canvasSize - (padding * 2);

        let lineHeight;

        // Binary search or iterative reduction for font size
        // Simple iterative approach for multiple lines
        let fontSize = canvasSize; // Start with canvas size
        for (; fontSize > 5; fontSize--) {
            ctx.font = `${fontSize}px ${fontFamily}`;
            lineHeight = fontSize * 1.1; // 1.1 line-height factor
            const totalHeight = lineHeight * lineCount;

            // Check width of longest line
            const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));

            if (maxLineWidth <= maxWidth && totalHeight <= maxHeight) {
                break;
            }
        }

        // Apply user size adjustment
        fontSize = Math.max(5, Math.floor(fontSize * (sizePercentage / 100)));

        // Draw Text
        ctx.font = `${fontSize}px ${fontFamily}`;
        const totalBlockHeight = (fontSize * 1.1) * lineCount;
        const startY = (canvasSize - totalBlockHeight) / 2 + (fontSize * 1.1) / 2;
        // Correction for textBaseline 'middle' usually centers on the line, but we have multiple lines.
        // Let's use simple positioning.

        lines.forEach((line, i) => {
            const y = (canvasSize / 2) - (totalBlockHeight / 2) + (fontSize * 1.1 * i) + (fontSize * 1.1 / 2);
            // Adjust y slightly for visual centering depending on baseline artifacts
            // For 'middle', it's center of the em square.
            ctx.fillText(line, canvasSize / 2, y + (fontSize * 0.05)); // slight offset
        });
    };

    // --- History Management ---

    const getHistory = () => {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        } catch (e) {
            return [];
        }
    };

    const saveHistory = () => {
        const item = {
            text: textInput.value,
            textColor: textColorInput.value,
            bgColor: bgColorInput.value,
            transparentBg: transparentBgCheck.checked,
            fontFamily: fontFamilyInput.value,
            fontSize: fontSizeInput.value,
            outputSize: outputSizeSelect.value,
            timestamp: Date.now(),
            preview: canvas.toDataURL('image/png') // Save small preview
        };

        let history = getHistory();
        // Remove duplicate if identical content exists to avoid spam
        history = history.filter(h =>
            h.text !== item.text ||
            h.textColor !== item.textColor ||
            h.bgColor !== item.bgColor ||
            h.fontFamily !== item.fontFamily
        );

        history.unshift(item); // Add to top
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistory();
    };

    const loadHistoryItem = (item) => {
        textInput.value = item.text;
        textColorInput.value = item.textColor;
        bgColorInput.value = item.bgColor;
        transparentBgCheck.checked = item.transparentBg || false;
        fontFamilyInput.value = item.fontFamily;
        fontSizeInput.value = item.fontSize || 100;
        outputSizeSelect.value = item.outputSize || '512';
        drawEmoji();
    };

    const renderHistory = () => {
        const history = getHistory();
        historyList.innerHTML = '';

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.title = item.text;

            const img = document.createElement('img');
            img.src = item.preview;

            div.onclick = () => loadHistoryItem(item);
            div.appendChild(img);
            historyList.appendChild(div);
        });
    };

    // --- Event Listeners ---

    // Real-time update
    [textInput, textColorInput, bgColorInput, fontFamilyInput, fontSizeInput, outputSizeSelect].forEach(el => {
        el.addEventListener('input', drawEmoji);
    });

    transparentBgCheck.addEventListener('change', drawEmoji);

    // Disable bg color when transparent is checked
    transparentBgCheck.addEventListener('change', () => {
        bgColorInput.disabled = transparentBgCheck.checked;
    });

    generateBtn.addEventListener('click', () => {
        drawEmoji();
        saveHistory(); // Save on explicit generate click
    });

    downloadBtn.addEventListener('click', () => {
        drawEmoji(); // Ensure current state
        const format = formatSelect.value;
        const link = document.createElement('a');
        link.download = `emoji_${Date.now()}.${format.split('/')[1]}`;
        link.href = canvas.toDataURL(format);
        link.click();

        // Also save to history on download
        saveHistory();

        // Toast
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    });

    // Initial Draw & Render
    drawEmoji();
    renderHistory();
});
