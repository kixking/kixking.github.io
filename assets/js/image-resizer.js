document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const originalInfo = document.getElementById('original-info');

    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const aspectLock = document.getElementById('aspect-lock');
    const formatSelect = document.getElementById('format-select');
    const downloadBtn = document.getElementById('download-btn');
    const toast = document.getElementById('toast');

    let originalWidth = 0;
    let originalHeight = 0;
    let originalAspectRatio = 1;

    // --- Image Handling ---

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
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        const file = files[0];
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalWidth = img.width;
                originalHeight = img.height;
                originalAspectRatio = img.width / img.height;

                previewImage.src = e.target.result;
                originalInfo.textContent = `元のサイズ: ${originalWidth} x ${originalHeight}`;

                // 初期の値をセット
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;

                dropZone.style.display = 'none';
                previewContainer.style.display = 'block';
                downloadBtn.disabled = false;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // --- Resizing Controls ---

    widthInput.addEventListener('input', () => {
        if (aspectLock.checked) {
            heightInput.value = Math.round(widthInput.value / originalAspectRatio);
        }
    });

    heightInput.addEventListener('input', () => {
        if (aspectLock.checked) {
            widthInput.value = Math.round(heightInput.value * originalAspectRatio);
        }
    });

    // --- Resize & Download Logic ---

    downloadBtn.addEventListener('click', () => {
        const targetWidth = parseInt(widthInput.value);
        const targetHeight = parseInt(heightInput.value);
        const format = formatSelect.value;

        if (!targetWidth || !targetHeight) return;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(previewImage, 0, 0, targetWidth, targetHeight);

        const dataUrl = canvas.toDataURL(format, 0.9);
        const link = document.createElement('a');

        const ext = format.split('/')[1];
        link.download = `resized-image.${ext}`;
        link.href = dataUrl;
        link.click();

        showToast();
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
});
