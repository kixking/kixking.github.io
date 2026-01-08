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
        if (history.length === 0) {
            historyList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem; text-align: center; margin-top: 2rem;">履歴はありません</p>';
            clearHistoryBtn.style.display = 'none';
            return;
        }

        clearHistoryBtn.style.display = 'block';
        historyList.innerHTML = history.map((item, index) => `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-item-preview">
                        <img src="${item.preview}" alt="QR Preview">
                    </div>
                    <div class="history-item-actions">
                        <button class="history-item-btn reuse-btn" data-index="${index}">再利用</button>
                        <button class="history-item-btn delete-btn" data-index="${index}">削除</button>
                    </div>
                </div>
                <div class="history-item-content">${item.value}</div>
            </div>
        `).join('');

        // Re-attach event listeners
        document.querySelectorAll('.reuse-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.getAttribute('data-index');
                const item = history[index];
                qrInput.value = item.value;
                qrSize.value = item.size;
                qrPadding.value = item.padding;
                qrLevel.value = item.level;
                qrFgColor.value = item.foreground;
                qrBgColor.value = item.background;
                qrTransparent.checked = item.transparent;
                generateQR();
                showToast('履歴から復元しました');
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.getAttribute('data-index');
                const history = JSON.parse(localStorage.getItem('qr_history') || '[]');
                history.splice(index, 1);
                localStorage.setItem('qr_history', JSON.stringify(history));
                renderHistory();
            });
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
