import { UrlEncoderLogic } from './modules/url-encoder-logic.js';

document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const clearBtn = document.getElementById('clear-input');
    const copyBtn = document.getElementById('copy-output');
    const toast = document.getElementById('toast');

    let currentMode = 'encode'; // 'encode' or 'decode'

    // --- Conversion Logic ---

    const processConversion = () => {
        const value = inputText.value;

        if (currentMode === 'encode') {
            outputText.value = UrlEncoderLogic.encode(value);
        } else {
            const res = UrlEncoderLogic.decode(value);
            if (res.success) {
                outputText.value = res.result;
            } else {
                outputText.value = res.error;
            }
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
        if (!toast) return;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
});
