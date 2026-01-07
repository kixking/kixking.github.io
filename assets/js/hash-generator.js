document.addEventListener('DOMContentLoaded', () => {
    const modeHashBtn = document.getElementById('mode-hash');
    const modeHmacBtn = document.getElementById('mode-hmac');
    const hmacKeyContainer = document.getElementById('hmac-key-container');
    const hmacKeyInput = document.getElementById('hmac-key');
    const algoSelect = document.getElementById('algo-select');
    const formatSelect = document.getElementById('format-select');
    const optTrim = document.getElementById('opt-trim');
    const optNewline = document.getElementById('opt-newline');
    const optBatch = document.getElementById('opt-batch');
    const inputTextBtn = document.getElementById('input-text-btn');
    const inputFileBtn = document.getElementById('input-file-btn');
    const textInputSection = document.getElementById('text-input-section');
    const fileInputSection = document.getElementById('file-input-section');
    const inputText = document.getElementById('input-text');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('file-input-section');
    const fileInfo = document.getElementById('file-info');
    const hashOutput = document.getElementById('hash-output');
    const copyBtn = document.getElementById('copy-btn');
    const compareInput = document.getElementById('compare-input');
    const compareResult = document.getElementById('compare-result');
    const toast = document.getElementById('toast');

    let currentMode = 'hash';
    let inputType = 'text';
    let currentFile = null;

    // --- Core Logic ---

    const bufferToHex = (buffer) => {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    };

    const bufferToBase64 = (buffer) => {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
    };

    const formatOutput = (buffer) => {
        const format = formatSelect.value;
        if (format === 'base64') return bufferToBase64(buffer);
        const hex = bufferToHex(buffer);
        return format === 'hex-upper' ? hex.toUpperCase() : hex;
    };

    const processData = async (data, algo, mode, keyData) => {
        try {
            let resultBuffer;
            if (mode === 'hash') {
                resultBuffer = await crypto.subtle.digest(algo, data);
            } else {
                const key = await crypto.subtle.importKey(
                    'raw',
                    keyData,
                    { name: 'HMAC', hash: { name: algo } },
                    false,
                    ['sign']
                );
                resultBuffer = await crypto.subtle.sign('HMAC', key, data);
            }
            return formatOutput(resultBuffer);
        } catch (e) {
            return 'ERROR';
        }
    };

    const calculateHash = async () => {
        const algo = algoSelect.value;
        const isBatch = optBatch.checked;
        const doTrim = optTrim.checked;
        const doNoNewline = optNewline.checked;

        if (inputType === 'text') {
            let value = inputText.value;
            if (value.length === 0) {
                hashOutput.textContent = '';
                updateComparison();
                return;
            }

            const keyData = new TextEncoder().encode(hmacKeyInput.value);

            if (isBatch) {
                const lines = value.split(/\r?\n/);
                const results = await Promise.all(lines.map(async (line) => {
                    let processed = line;
                    if (doTrim) processed = processed.trim();
                    if (doNoNewline) processed = processed.replace(/[\r\n]/g, '');
                    if (processed.length === 0 && !doTrim) return '';
                    const data = new TextEncoder().encode(processed);
                    return await processData(data, algo, currentMode, keyData);
                }));
                hashOutput.innerHTML = results.join('<br>');
            } else {
                let processed = value;
                if (doTrim) processed = processed.trim();
                if (doNoNewline) processed = processed.replace(/[\r\n]/g, '');
                const data = new TextEncoder().encode(processed);
                hashOutput.textContent = await processData(data, algo, currentMode, keyData);
            }
        } else {
            if (!currentFile) {
                hashOutput.textContent = '(ファイルを選択してください)';
                return;
            }
            const data = await currentFile.arrayBuffer();
            const keyData = new TextEncoder().encode(hmacKeyInput.value);
            hashOutput.textContent = await processData(data, algo, currentMode, keyData);
        }
        updateComparison();
    };

    const updateComparison = () => {
        const current = hashOutput.textContent.trim().toLowerCase();
        const compare = compareInput.value.trim().toLowerCase();

        if (!current || !compare || optBatch.checked) {
            compareResult.textContent = '';
            return;
        }

        if (current === compare) {
            compareResult.textContent = '✓ 一致しています';
            compareResult.style.color = '#10b981';
        } else {
            compareResult.textContent = '✗ 一致していません';
            compareResult.style.color = '#ef4444';
        }
    };

    // --- UI Helpers ---

    const setMode = (mode) => {
        currentMode = mode;
        if (mode === 'hash') {
            modeHashBtn.classList.add('active');
            modeHmacBtn.classList.remove('active');
            hmacKeyContainer.style.display = 'none';
        } else {
            modeHashBtn.classList.remove('active');
            modeHmacBtn.classList.add('active');
            hmacKeyContainer.style.display = 'block';
        }
        calculateHash();
    };

    const setInputType = (type) => {
        inputType = type;
        if (type === 'text') {
            inputTextBtn.classList.add('active');
            inputFileBtn.classList.remove('active');
            textInputSection.style.display = 'block';
            fileInputSection.style.display = 'none';
            optBatch.disabled = false;
        } else {
            inputTextBtn.classList.remove('active');
            inputFileBtn.classList.add('active');
            textInputSection.style.display = 'none';
            fileInputSection.style.display = 'flex';
            optBatch.disabled = true;
            optBatch.checked = false;
        }
        calculateHash();
    };

    // --- Events ---

    modeHashBtn.addEventListener('click', () => setMode('hash'));
    modeHmacBtn.addEventListener('click', () => setMode('hmac'));
    inputTextBtn.addEventListener('click', () => setInputType('text'));
    inputFileBtn.addEventListener('click', () => setInputType('file'));

    inputText.addEventListener('input', calculateHash);
    hmacKeyInput.addEventListener('input', calculateHash);
    algoSelect.addEventListener('change', calculateHash);
    formatSelect.addEventListener('change', calculateHash);
    optTrim.addEventListener('change', calculateHash);
    optNewline.addEventListener('change', calculateHash);
    optBatch.addEventListener('change', calculateHash);
    compareInput.addEventListener('input', updateComparison);

    copyBtn.addEventListener('click', () => {
        const text = hashOutput.innerText || hashOutput.textContent;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        });
    });

    // File Handling
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent)';
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--glass-border)';
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--glass-border)';
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    const handleFile = (file) => {
        currentFile = file;
        fileInfo.style.display = 'block';
        fileInfo.textContent = `選択中: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        calculateHash();
    };

    // Init
    calculateHash();
});
