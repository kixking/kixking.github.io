/**
 * Simple Tools - Multi-Page Viewer Logic
 */

const urlInput = document.getElementById('urlInput');
const viewBtn = document.getElementById('viewBtn');
const viewGrid = document.getElementById('viewGrid');

if (viewBtn) {
    viewBtn.addEventListener('click', () => {
        const fullUrls = urlInput.value.split('\n').map(u => u.trim()).filter(u => u !== '');
        const urls = fullUrls.slice(0, 10); // Limit to 10 items

        if (fullUrls.length > 10) {
            alert("最大10件までの制限があるため、最初の10件のみを表示します。");
        }

        viewGrid.innerHTML = '';

        urls.forEach((url, index) => {
            // Ensure protocol
            let targetUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                targetUrl = 'https://' + url;
            }

            const container = document.createElement('div');
            container.className = 'frame-container';
            container.style.animationDelay = `${index * 0.2}s`;

            const header = document.createElement('div');
            header.className = 'frame-header';

            const urlSpan = document.createElement('span');
            urlSpan.textContent = targetUrl;

            const link = document.createElement('a');
            link.href = targetUrl;
            link.target = '_blank';
            link.style.cssText = 'color: var(--primary-soft); text-decoration: none;';
            link.textContent = '別タブで開く ↗';

            header.appendChild(urlSpan);
            header.appendChild(link);

            const iframe = document.createElement('iframe');
            iframe.src = targetUrl;
            iframe.title = `View of ${targetUrl}`;

            container.appendChild(header);
            container.appendChild(iframe);
            viewGrid.appendChild(container);
        });

        if (urls.length > 0) {
            viewGrid.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

if (urlInput) {
    // Save inputs in local storage for convenience
    urlInput.value = localStorage.getItem('multi-view-urls') || '';
    urlInput.addEventListener('input', () => {
        localStorage.setItem('multi-view-urls', urlInput.value);
    });
}
