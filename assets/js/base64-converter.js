document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const clearBtn = document.getElementById('clear-input');
    const copyBtn = document.getElementById('copy-output');
    const toast = document.getElementById('toast');

    let currentMode = 'encode'; // 'encode' or 'decode'

    // --- Conversion Logic ---

    // UTF-8 対応の Base64 エンコード
    const utf8_to_b64 = (str) => {
        return window.btoa(unescape(encodeURIComponent(str)));
    };

    // UTF-8 対応の Base64 デコード
    const b64_to_utf8 = (str) => {
        return decodeURIComponent(escape(window.atob(str)));
    };

    const processConversion = () => {
        const value = inputText.value;
        if (!value) {
            outputText.value = '';
            return;
        }

        try {
            if (currentMode === 'encode') {
                outputText.value = utf8_to_b64(value);
            } else {
                outputText.value = b64_to_utf8(value);
            }
        } catch (e) {
            outputText.value = 'エラー: 無効な形式です。Base64としてデコードできない可能性があります。';
        }
    };

    // --- Mode Switching ---

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            processConversion();
        });
    });

    // --- Event Listeners ---

    inputText.addEventListener('input', processConversion);

    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        inputText.focus();
    });

    copyBtn.addEventListener('click', () => {
        if (!outputText.value) return;
        navigator.clipboard.writeText(outputText.value).then(() => {
            showToast();
        });
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
});
