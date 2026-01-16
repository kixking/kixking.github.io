document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const colorPreview = document.getElementById('selected-color-preview');
    const hexValue = document.getElementById('value-hex');
    const rgbValue = document.getElementById('value-rgb');
    const paletteGrid = document.getElementById('palette-grid');
    const toast = document.getElementById('toast');

    let currentImg = null;

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
                currentImg = img;
                renderImage();
                dropZone.style.display = 'none';
                previewContainer.style.display = 'block';
                extractInitialColors(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function renderImage() {
        // 固定の表示幅に対してスケールを計算（CSSで100%にしているが内部解像度を確保）
        const displayWidth = previewContainer.clientWidth;
        const scale = displayWidth / currentImg.width;

        canvas.width = currentImg.width;
        canvas.height = currentImg.height;
        ctx.drawImage(currentImg, 0, 0);
    }

    // --- Color Picking ---

    canvas.addEventListener('mousemove', (e) => {
        if (!currentImg) return;
        pickColor(e);
    });

    canvas.addEventListener('click', (e) => {
        if (!currentImg) return;
        const color = pickColor(e);
        updatePalette(color);
    });

    function pickColor(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

        updateUI(hex, rgb);
        return { r: pixel[0], g: pixel[1], b: pixel[2], hex };
    }

    function updateUI(hex, rgb) {
        colorPreview.style.backgroundColor = hex;
        colorPreview.textContent = hex.toUpperCase();
        hexValue.textContent = hex.toUpperCase();
        rgbValue.textContent = rgb;

        // テキスト色を背景の明るさに合わせる
        const brightness = getBrightness(hex);
        colorPreview.style.color = brightness > 180 ? '#0f172a' : '#ffffff';
    }

    // --- Logic Utils ---

    function rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    function getBrightness(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    // --- Palette Generation ---

    function extractInitialColors(img) {
        // 画像から代表的な色を簡易的に抽出（中心付近などをサンプリング）
        const samples = [
            [img.width * 0.5, img.height * 0.5],
            [img.width * 0.2, img.height * 0.2],
            [img.width * 0.8, img.height * 0.2],
            [img.width * 0.2, img.height * 0.8],
            [img.width * 0.8, img.height * 0.8],
        ];

        const colors = samples.map(([x, y]) => {
            const p = ctx.getImageData(x, y, 1, 1).data;
            return rgbToHex(p[0], p[1], p[2]);
        });

        renderPalette(colors);
    }

    function updatePalette(baseColor) {
        // 類似色や補色を生成
        const colors = generateVariations(baseColor);
        renderPalette(colors);
    }

    function generateVariations(color) {
        const { r, g, b } = color;
        const variations = [color.hex];

        // 補色
        variations.push(rgbToHex(255 - r, 255 - g, 255 - b));

        // 明るさ違い
        variations.push(rgbToHex(Math.min(255, r + 40), Math.min(255, g + 40), Math.min(255, b + 40)));
        variations.push(rgbToHex(Math.max(0, r - 40), Math.max(0, g - 40), Math.max(0, b - 40)));

        // 彩度違い的なモドキ
        variations.push(rgbToHex(g, b, r));

        return variations;
    }

    function renderPalette(colors) {
        paletteGrid.textContent = '';
        colors.forEach(col => {
            const div = document.createElement('div');
            div.className = 'palette-item';
            div.style.backgroundColor = col;
            div.title = col.toUpperCase();
            div.addEventListener('click', () => {
                const r = parseInt(col.slice(1, 3), 16);
                const g = parseInt(col.slice(3, 5), 16);
                const b = parseInt(col.slice(5, 7), 16);
                updateUI(col, `rgb(${r}, ${g}, ${b})`);
            });
            paletteGrid.appendChild(div);
        });
    }

    // --- Clipboard ---

    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const text = document.getElementById(targetId).textContent;
            navigator.clipboard.writeText(text).then(() => {
                showToast();
            });
        });
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
});
