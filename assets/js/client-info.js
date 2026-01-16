document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    const copyJsonBtn = document.getElementById('copy-json-btn');
    const toast = document.getElementById('toast');

    const formatBytes = (bytes) => {
        if (!bytes) return '取得不可';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }
        return `${bytes.toFixed(2)} ${units[i]}`;
    };

    const getGpuInfo = () => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return { vendor: '非対応', renderer: '非対応', version: '非対応', maxTex: '---' };

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '取得不可';
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '取得不可';
        const version = gl.getParameter(gl.VERSION);
        const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);

        return { vendor, renderer, version, maxTex };
    };

    const checkPermission = async (name) => {
        try {
            if (!navigator.permissions) return { status: 'unsupported', label: '非対応' };
            const status = await navigator.permissions.query({ name });
            const label = { 'granted': '許可済', 'denied': '拒否', 'prompt': '未設定' }[status.state] || status.state;
            return { status: status.state, label: label };
        } catch (e) { return { status: 'error', label: '取得不可' }; }
    };

    // ... (detectFonts etc unchanged) ...

    const updateDisplay = (info) => {
        const mapping = {
            'info-ip': info.ip,
            'info-isp': info.isp,
            'info-geo': info.geo,
            'info-platform': info.platform,
            'info-language': info.language,
            'info-cookies': info.cookiesEnabled,
            'info-dnt': info.doNotTrack,
            'info-ua': info.userAgent,
            'info-cores': info.cores,
            'info-memory': info.memory,
            'info-touch': info.maxTouchPoints,
            'info-battery': info.battery,
            'info-gamepad': info.gamepad,
            'info-gpu-vendor': info.gpuVendor,
            'info-gpu-renderer': info.gpuRenderer,
            'info-webgl-ver': info.webglVersion,
            'info-max-tex': info.maxTex,
            'info-screen-res': info.screenResolution,
            'info-screen-dpr': info.devicePixelRatio,
            'info-view-size': info.viewportSize,
            'info-color-scheme': info.colorScheme,
            'info-base-font': info.baseFontSize,
            'info-storage-quota': info.storageQuota || '非対応',
            'info-storage-usage': info.storageUsage || '非対応',
            'info-storage-percent': info.storagePercent || '---',
            'info-storage-persist': info.storagePersist || '非対応',
            'info-online': info.isOnline,
            'info-net-type': info.netType || '非対応',
            'info-timezone': info.timezone,
            'info-tz-offset': info.tzOffset,
            'info-env-bot': info.webdriver,
            'info-env-pdf': info.pdfSupport,
            'info-referrer': info.referrer,
            'info-lang-list': info.languages
        };

        for (const [id, val] of Object.entries(mapping)) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        }

        // Direct DOM manipulation for permissions (badges)
        const updatePermBadge = (id, permData) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = ''; // Clear
            const span = document.createElement('span');
            span.className = `status-badge status-${permData.status}`;
            span.textContent = permData.label;
            el.appendChild(span);
        };

        updatePermBadge('perm-geo', info.permGeo);
        updatePermBadge('perm-notifications', info.permNotifications);
        updatePermBadge('perm-camera', info.permCamera);
        updatePermBadge('perm-microphone', info.permMicrophone);

        // Font Tags
        const fontContainer = document.getElementById('font-list');
        fontContainer.innerHTML = '';
        info.detectedFonts.forEach(font => {
            const span = document.createElement('span');
            span.className = 'font-tag';
            span.textContent = font;
            fontContainer.appendChild(span);
        });
    };

    const init = async () => {
        // Clear IP initial state
        document.getElementById('info-ip').textContent = '取得中...';
        document.getElementById('info-isp').textContent = '取得中...';
        document.getElementById('info-geo').textContent = '取得中...';

        const info = await collectInfo();
        updateDisplay(info);
    };

    refreshBtn.addEventListener('click', init);
    copyJsonBtn.addEventListener('click', async () => {
        const info = await collectInfo();
        // Simplify permission objects for JSON
        const cleanInfo = { ...info };
        cleanInfo.permGeo = info.permGeo.label;
        cleanInfo.permNotifications = info.permNotifications.label;
        cleanInfo.permCamera = info.permCamera.label;
        cleanInfo.permMicrophone = info.permMicrophone.label;

        const json = JSON.stringify(cleanInfo, null, 2);
        navigator.clipboard.writeText(json).then(() => {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        });
    });

    init();

    window.addEventListener('resize', async () => {
        const info = await collectInfo();
        document.getElementById('info-view-size').textContent = info.viewportSize;
    });
});
