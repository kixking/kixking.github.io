document.addEventListener('DOMContentLoaded', () => {
    const lengthSlider = document.getElementById('length-slider');
    const lengthNumber = document.getElementById('length-number');
    const generateCount = document.getElementById('generate-count');
    const includeUpper = document.getElementById('include-upper');
    const includeLower = document.getElementById('include-lower');
    const includeNumber = document.getElementById('include-number');
    const includeSymbol = document.getElementById('include-symbol');
    const useFullwidth = document.getElementById('use-fullwidth');
    const generateBtn = document.getElementById('generate-btn');
    const resultsList = document.getElementById('results-list');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const toast = document.getElementById('toast');

    const CHARSETS = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        number: '0123456789',
        symbol: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    // --- Zenkaku conversion ---
    const toFullWidth = (str) => {
        return str.replace(/[!-~]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
        });
    };

    // --- Sync Slider and Number Input ---
    lengthSlider.addEventListener('input', () => {
        lengthNumber.value = lengthSlider.value;
    });
    lengthNumber.addEventListener('input', () => {
        let val = parseInt(lengthNumber.value);
        if (isNaN(val)) val = 4;
        if (val < 4) val = 4;
        if (val > 24) val = 24;
        lengthSlider.value = val;
    });

    // --- Password Generation Logic ---
    const generatePassword = (length, options) => {
        let charset = '';
        if (options.upper) charset += CHARSETS.upper;
        if (options.lower) charset += CHARSETS.lower;
        if (options.number) charset += CHARSETS.number;
        if (options.symbol) charset += CHARSETS.symbol;

        if (charset === '') {
            return '文字種を選択してください';
        }

        let password = '';
        const randomValues = new Uint32Array(length);
        window.crypto.getRandomValues(randomValues);

        for (let i = 0; i < length; i++) {
            password += charset[randomValues[i] % charset.length];
        }

        if (options.fullwidth) {
            password = toFullWidth(password);
        }

        return password;
    };

    const handleGenerate = () => {
        const length = parseInt(lengthSlider.value);
        const count = parseInt(generateCount.value) || 1;
        const options = {
            upper: includeUpper.checked,
            lower: includeLower.checked,
            number: includeNumber.checked,
            symbol: includeSymbol.checked,
            fullwidth: useFullwidth.checked
        };

        resultsList.innerHTML = '';

        for (let i = 0; i < Math.min(count, 100); i++) {
            const pwd = generatePassword(length, options);
            const item = document.createElement('div');
            item.className = 'result-item';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.style.padding = '0.75rem';
            item.style.background = 'rgba(255, 255, 255, 0.05)';
            item.style.borderRadius = '8px';
            item.style.marginBottom = '0.5rem';
            item.style.fontFamily = 'monospace';
            item.style.fontSize = '1.1rem';

            const pwdText = document.createElement('span');
            pwdText.textContent = pwd;
            pwdText.style.wordBreak = 'break-all';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'コピー';
            copyBtn.style.flexShrink = '0';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(pwd).then(() => {
                    showToast('コピーしました！');
                });
            });

            item.appendChild(pwdText);
            item.appendChild(copyBtn);
            resultsList.appendChild(item);
        }
    };

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    };

    // --- Events ---
    generateBtn.addEventListener('click', handleGenerate);

    copyAllBtn.addEventListener('click', () => {
        const passwords = Array.from(resultsList.querySelectorAll('.result-item span'))
            .map(span => span.textContent)
            .join('\n');

        if (!passwords) return;

        navigator.clipboard.writeText(passwords).then(() => {
            showToast('すべてコピーしました！');
        });
    });

    // Initial generate
    // handleGenerate();
});
