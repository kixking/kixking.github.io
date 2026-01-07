document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const outputText = document.getElementById('output-text');
    const copyBtn = document.getElementById('copy-output');
    const downloadBtn = document.getElementById('download-output');

    // ... (rest of controls)

    // Controls
    const useFirstColHeadingCheck = document.getElementById('use-first-col-heading');
    const useH2Check = document.getElementById('use-h2');
    const trimValuesCheck = document.getElementById('trim-values');
    const missingValueHandlingSelect = document.getElementById('missing-value-handling');
    const enableThresholdCheck = document.getElementById('enable-threshold');
    const emptyThresholdInput = document.getElementById('empty-threshold');
    const delimiterOverrideSelect = document.getElementById('delimiter-override');
    const recordSeparatorInput = document.getElementById('record-separator');

    // Stats
    const statsArea = document.getElementById('stats-area');
    const processedCountEl = document.getElementById('processed-count');
    const skippedCountEl = document.getElementById('skipped-count');

    const toast = document.getElementById('toast');

    let currentFileRawContent = null;
    let currentParsedData = null;

    // --- State management ---
    const toggleThresholdState = () => {
        emptyThresholdInput.style.opacity = enableThresholdCheck.checked ? '1' : '0.5';
        emptyThresholdInput.disabled = !enableThresholdCheck.checked;
    };
    enableThresholdCheck.addEventListener('change', toggleThresholdState);
    toggleThresholdState(); // Init

    // --- CSV Parsing ---
    const parseCSV = (text) => {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) return null;

        const firstLine = lines[0];
        let delimiter = delimiterOverrideSelect.value;

        if (delimiter === 'auto') {
            if (firstLine.includes('\t')) delimiter = '\t';
            else if (firstLine.includes(';')) delimiter = ';';
            else delimiter = ',';
        } else if (delimiter === '\\t') {
            delimiter = '\t';
        }

        const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
        const rows = lines.slice(1).map(line => {
            return line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
        });

        return { headers, rows };
    };

    // --- Markdown Generation ---
    const generateMarkdown = (data) => {
        if (!data) return '';

        let markdown = '';
        const { headers, rows } = data;
        let processedCount = 0;
        let skippedCount = 0;

        const isThresholdEnabled = enableThresholdCheck.checked;
        const threshold = parseInt(emptyThresholdInput.value) || 0;
        const separator = recordSeparatorInput.value || '';
        const trimEnabled = trimValuesCheck.checked;
        const missingHandling = missingValueHandlingSelect.value;
        const useFirstColHeading = useFirstColHeadingCheck.checked;
        const headingLevel = useH2Check.checked ? '##' : '###';

        rows.forEach((row, rowIndex) => {
            // Filter: Threshold for empty columns (ignoring whitespace)
            if (isThresholdEnabled) {
                const emptyCount = row.filter(cell => cell.trim().replace(/\s/g, '') === '').length;
                if (emptyCount >= threshold) {
                    skippedCount++;
                    return;
                }
            }

            processedCount++;

            // 1. Heading Setup
            if (useFirstColHeading && headers.length > 0) {
                const firstHeader = headers[0];
                const firstValue = row[0] || '';
                markdown += `${headingLevel} ${firstHeader}: ${firstValue}\n`;
            } else {
                markdown += `${headingLevel} Record ${rowIndex + 1}\n`;
            }

            // 2. Pair List (Self-descriptive)
            headers.forEach((header, colIndex) => {
                let value = row[colIndex] !== undefined ? row[colIndex] : '';
                if (trimEnabled) value = value.trim();

                const isEmpty = value === '' || value.toLowerCase() === 'nan';

                if (isEmpty) {
                    if (missingHandling === 'remove') return;
                    value = 'なし';
                }

                markdown += `- **${header}**: ${value}\n`;
            });

            // 3. Separator
            if (separator) {
                markdown += `\n${separator}\n\n`;
            } else {
                markdown += '\n';
            }
        });

        statsArea.style.display = 'block';
        processedCountEl.textContent = processedCount;
        skippedCountEl.textContent = skippedCount;

        return markdown.trim();
    };

    const updateConversion = () => {
        if (!currentFileRawContent) return;
        currentParsedData = parseCSV(currentFileRawContent);
        if (currentParsedData) {
            outputText.value = generateMarkdown(currentParsedData);
        }
    };

    const handleFile = (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            currentFileRawContent = e.target.result;
            updateConversion();
        };
        reader.readAsText(file);
    };

    // --- UI Events ---
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Watch all inputs for changes
    [
        useFirstColHeadingCheck, useH2Check, trimValuesCheck,
        missingValueHandlingSelect, enableThresholdCheck, emptyThresholdInput,
        delimiterOverrideSelect, recordSeparatorInput
    ].forEach(el => {
        if (!el) return;
        el.addEventListener('change', updateConversion);
        if (el.tagName === 'INPUT' && (el.type === 'number' || el.type === 'text')) {
            el.addEventListener('input', updateConversion);
        }
    });

    copyBtn.addEventListener('click', () => {
        if (!outputText.value) return;
        navigator.clipboard.writeText(outputText.value).then(() => {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        });
    });

    downloadBtn.addEventListener('click', () => {
        if (!outputText.value) return;

        const blob = new Blob([outputText.value], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Try to get a decent filename
        let filename = 'rag-context.md';
        if (fileInput.files.length > 0) {
            const originalName = fileInput.files[0].name;
            filename = originalName.replace(/\.[^/.]+$/, "") + "-rag.md";
        }

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
