import { JsonFormatterLogic } from './modules/json-formatter-logic.js';

document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const indentSelect = document.getElementById('indent-select');
    const prettifyBtn = document.getElementById('prettify-btn');
    const minifyBtn = document.getElementById('minify-btn');
    const fixBtn = document.getElementById('fix-btn');
    const clearBtn = document.getElementById('clear-input');
    const copyBtn = document.getElementById('copy-output');
    const errorMessage = document.getElementById('error-message');
    const toast = document.getElementById('toast');

    const showError = (msg) => {
        if (msg) {
            errorMessage.textContent = msg;
            errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
        }
    };

    const getIndent = () => {
        const val = indentSelect.value;
        if (val === 'tab') return '\t';
        return parseInt(val);
    };

    const formatJSON = (prettify = true) => {
        const input = inputText.value;
        const indent = prettify ? getIndent() : 0;

        const res = JsonFormatterLogic.format(input, indent);

        if (res.success) {
            outputText.value = res.result;
            showError(null);
        } else {
            showError(`エラー: ${res.error}`);
            outputText.value = '';
        }
    };

    // --- Events ---
    prettifyBtn.addEventListener('click', () => formatJSON(true));
    minifyBtn.addEventListener('click', () => formatJSON(false));

    fixBtn.addEventListener('click', () => {
        const input = inputText.value;
        const sanitized = JsonFormatterLogic.repair(input);
        inputText.value = sanitized;
        formatJSON(true);
    });

    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        showError(null);
    });

    copyBtn.addEventListener('click', () => {
        if (!outputText.value) return;
        navigator.clipboard.writeText(outputText.value).then(() => {
            if (toast) {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2000);
            }
        });
    });

    // Auto-indent/validate on selection change
    indentSelect.addEventListener('change', () => {
        if (outputText.value) formatJSON(true);
    });
});
