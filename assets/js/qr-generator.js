document.addEventListener('DOMContentLoaded', () => {
    const qrInput = document.getElementById('qr-input');
    const qrSize = document.getElementById('qr-size');
    const qrPadding = document.getElementById('qr-padding');
    const qrLevel = document.getElementById('qr-level');
    const qrFgColor = document.getElementById('qr-fg-color');
    const qrBgColor = document.getElementById('qr-bg-color');
    const qrTransparent = document.getElementById('qr-transparent');
    const qrCanvas = document.getElementById('qr-canvas');
    const downloadPngBtn = document.getElementById('download-png');
    const downloadSvgBtn = document.getElementById('download-svg');
    const saveHistoryBtn = document.getElementById('save-history-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const toast = document.getElementById('toast');

    let qr = null;

    const generateQR = () => {
        const value = qrInput.value.trim();
        if (!value) return;

        const size = parseInt(qrSize.value) || 300;
        const padding = parseInt(qrPadding.value) || 0;
        const level = qrLevel.value;
        const foreground = qrFgColor.value;
        const background = qrTransparent.checked ? null : qrBgColor.value;

        qr = new QRious({
            element: qrCanvas,
            value: value,
            size: size,
            padding: padding,
            level: level,
            foreground: foreground,
            background: background,
            backgroundAlpha: qrTransparent.checked ? 0 : 1
        });
    };

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    };

    const downloadPNG = () => {
        const link = document.createElement('a');
        link.download = `qrcode-${Date.now()}.png`;
        link.href = qrCanvas.toDataURL('image/png');
        link.click();
        showToast('PNGをダウンロードしました');
        saveToHistory(); // Auto save on download
    };

    // --- History Logic ---

    const saveToHistory = () => {
        const value = qrInput.value.trim();
        if (!value) return;

        const settings = {
            value: value,
            size: qrSize.value,
            padding: qrPadding.value,
            level: qrLevel.value,
            foreground: qrFgColor.value,
            background: qrBgColor.value,
            transparent: qrTransparent.checked,
            preview: qrCanvas.toDataURL('image/png', 0.5), // Lower quality for storage
            timestamp: Date.now()
        };

        const history = JSON.parse(localStorage.getItem('qr_history') || '[]');
        // Avoid duplicates (same value and settings)
        const isDuplicate = history.some(item =>
            item.value === settings.value &&
            item.foreground === settings.foreground &&
            item.background === settings.background &&
            item.transparent === settings.transparent
        );

        if (!isDuplicate) {
            history.unshift(settings);
            if (history.length > 20) history.pop(); // Keep last 20
            localStorage.setItem('qr_history', JSON.stringify(history));
            renderHistory();
        }
    };

    const renderHistory = () => {
        const history = JSON.parse(localStorage.getItem('qr_history') || '[]');
        historyList.innerHTML = ''; // Clear current content safely

        if (history.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.style.cssText = 'color: var(--text-muted); font-size: 0.875rem; text-align: center; margin-top: 2rem;';
            emptyMsg.textContent = '履歴はありません';
            historyList.appendChild(emptyMsg);
            clearHistoryBtn.style.display = 'none';
            return;
        }

        clearHistoryBtn.style.display = 'block';

        history.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'history-item';

            // Header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'history-item-header';

            // Preview
            const previewDiv = document.createElement('div');
            previewDiv.className = 'history-item-preview';
            const img = document.createElement('img');
            img.src = item.preview;
            img.alt = 'QR Preview';
            previewDiv.appendChild(img);

            // Actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'history-item-actions';

            const reuseBtn = document.createElement('button');
            reuseBtn.className = 'history-item-btn reuse-btn';
            reuseBtn.textContent = '再利用';
            reuseBtn.onclick = () => {
                qrInput.value = item.value;
                qrSize.value = item.size;
                qrPadding.value = item.padding;
                qrLevel.value = item.level;
                qrFgColor.value = item.foreground;
                qrBgColor.value = item.background;
                qrTransparent.checked = item.transparent;
                generateQR();
                showToast('履歴から復元しました');
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'history-item-btn delete-btn';
            deleteBtn.textContent = '削除';
            deleteBtn.onclick = () => {
                const currentHistory = JSON.parse(localStorage.getItem('qr_history') || '[]');
                currentHistory.splice(index, 1);
                localStorage.setItem('qr_history', JSON.stringify(currentHistory));
                renderHistory();
            };

            actionsDiv.appendChild(reuseBtn);
            actionsDiv.appendChild(deleteBtn);

            headerDiv.appendChild(previewDiv);
            headerDiv.appendChild(actionsDiv);

            // Content (Safe text rendering)
            const contentDiv = document.createElement('div');
            contentDiv.className = 'history-item-content';
            contentDiv.textContent = item.value;

            itemDiv.appendChild(headerDiv);
            itemDiv.appendChild(contentDiv);
            historyList.appendChild(itemDiv);
        });
    };

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('全ての履歴を削除してもよろしいですか？')) {
            localStorage.removeItem('qr_history');
            renderHistory();
        }
    });

    saveHistoryBtn.addEventListener('click', () => {
        saveToHistory();
        showToast('履歴に保存しました');
    });

    // Events
    [qrInput, qrSize, qrPadding, qrLevel, qrFgColor, qrBgColor, qrTransparent].forEach(el => {
        el.addEventListener('input', generateQR);
    });

    downloadPngBtn.addEventListener('click', downloadPNG);
    downloadSvgBtn.addEventListener('click', () => {
        showToast('SVG形式は現在準備中です。PNGをご利用ください。');
    });

    // Init
    generateQR();
    renderHistory();
});
