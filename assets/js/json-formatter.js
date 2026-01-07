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
        const input = inputText.value.trim();
        if (!input) {
            outputText.value = '';
            showError(null);
            return;
        }

        try {
            const obj = JSON.parse(input);
            const indent = prettify ? getIndent() : null;
            outputText.value = JSON.stringify(obj, null, indent);
            showError(null);
        } catch (e) {
            showError(`エラー: ${e.message}`);
            outputText.value = '';
        }
    };

    const sanitizeJSON = (text) => {
        let cleaned = text.trim();

        // 1. Replace single quotes with double quotes (approximated)
        // This is naive but covers basic cases where keys/values are 'quoted'
        cleaned = cleaned.replace(/'/g, '"');

        // 2. Remove trailing commas
        cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

        // 3. Remove comments (single line and multi-line)
        cleaned = cleaned.replace(/\/\/.*$/gm, '');
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

        return cleaned;
    };

    // --- Events ---
    prettifyBtn.addEventListener('click', () => formatJSON(true));
    minifyBtn.addEventListener('click', () => formatJSON(false));

    fixBtn.addEventListener('click', () => {
        const input = inputText.value;
        const sanitized = sanitizeJSON(input);
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
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        });
    });

    // Auto-indent/validate on selection change
    indentSelect.addEventListener('change', () => {
        if (outputText.value) formatJSON(true);
    });
});
