pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('pdf-file');
    const outputText = document.getElementById('output-text');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-txt');
    const stats = document.getElementById('stats');
    const pageCountDisp = document.getElementById('page-count');
    const charCountDisp = document.getElementById('char-count');
    const toast = document.getElementById('toast');

    let currentFileName = '';

    // Event Listeners
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    ['dragleave', 'dragend'].forEach(type => {
        dropZone.addEventListener(type, () => dropZone.classList.remove('drag-over'));
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            processFile(file);
        } else {
            alert('PDFファイルを選択してください。');
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    });

    const processFile = async (file) => {
        currentFileName = file.name;
        progressContainer.style.display = 'block';
        outputText.value = '';
        stats.style.display = 'none';
        updateProgress(0);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

            const numPages = pdf.numPages;
            let fullText = '';

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                let lastY, pageText = '';
                for (let item of textContent.items) {
                    if (lastY !== undefined && Math.abs(item.transform[5] - lastY) > 2) {
                        pageText += '\n';
                    }
                    pageText += item.str;
                    lastY = item.transform[5];
                }

                fullText += `--- Page ${i} ---\n${pageText}\n\n`;
                updateProgress((i / numPages) * 100);
            }

            outputText.value = fullText.trim();
            stats.style.display = 'flex';
            pageCountDisp.textContent = `ページ数: ${numPages}`;
            charCountDisp.textContent = `文字数: ${fullText.length.toLocaleString()}`;

        } catch (error) {
            console.error(error);
            alert('PDFの解析に失敗しました。');
        } finally {
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 500);
        }
    };

    const updateProgress = (percent) => {
        const rounded = Math.round(percent);
        progressBar.style.width = `${rounded}%`;
        progressText.textContent = `解析中... ${rounded}%`;
    };

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    };

    copyBtn.addEventListener('click', () => {
        if (!outputText.value) return;
        navigator.clipboard.writeText(outputText.value).then(() => {
            showToast('コピーしました');
        });
    });

    downloadBtn.addEventListener('click', () => {
        if (!outputText.value) return;
        const blob = new Blob([outputText.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFileName.replace(/\.pdf$/i, '') + '_extracted.txt';
        a.click();
        URL.revokeObjectURL(url);
        showToast('保存しました');
    });
});
