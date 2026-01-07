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
            if (!navigator.permissions) return '非対応';
            const status = await navigator.permissions.query({ name });
            const label = { 'granted': '許可済', 'denied': '拒否', 'prompt': '未設定' }[status.state] || status.state;
            const cls = `status-${status.state}`;
            return `<span class="status-badge ${cls}">${label}</span>`;
        } catch (e) { return '取得不可'; }
    };

    const detectFonts = () => {
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const fontList = [
            'Arial', 'Arial Black', 'Comic Sans MS', 'Courier', 'Courier New', 'Georgia', 'Helvetica', 'Impact',
            'Lucida Console', 'Lucida Sans Unicode', 'Palatino Linotype', 'Tahoma', 'Times New Roman', 'Trebuchet MS',
            'Verdana', 'MS Gothic', 'MS PGothic', 'Meiryo', 'Yu Gothic', 'Hiragino Kaku Gothic Pro', 'Osaka'
        ];

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const text = 'abcdefghijklmnopqrstuvwxyz0123456789';
        context.font = '72px monospace';
        const baselineSize = context.measureText(text).width;

        return fontList.filter(font => {
            context.font = `72px "${font}", monospace`;
            return context.measureText(text).width !== baselineSize;
        });
    };

    const fetchIpInfo = async () => {
        try {
            // Using ipify for IP and ipapi.co for Geo/ISP
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();

            const geoRes = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
            const geoData = await geoRes.json();

            return {
                ip: ipData.ip,
                isp: geoData.org || '取得失敗',
                geo: `${geoData.city || ''}, ${geoData.region || ''} (${geoData.country_name || ''})`
            };
        } catch (e) {
            return { ip: '取得失敗', isp: '取得失敗', geo: '取得失敗' };
        }
    };

    const collectInfo = async () => {
        const info = {};

        // IP / Geo
        const ipInfo = await fetchIpInfo();
        info.ip = ipInfo.ip;
        info.isp = ipInfo.isp;
        info.geo = ipInfo.geo;

        // Browser/OS
        info.platform = navigator.platform;
        info.language = navigator.language;
        info.cookiesEnabled = navigator.cookieEnabled ? '有効' : '無効';
        info.doNotTrack = navigator.doNotTrack || '未設定';
        info.userAgent = navigator.userAgent;

        // Permissions
        info.permGeo = await checkPermission('geolocation');
        info.permNotifications = await checkPermission('notifications');
        info.permCamera = await checkPermission('camera');
        info.permMicrophone = await checkPermission('microphone');

        // Hardware
        info.cores = navigator.hardwareConcurrency || '取得不可';
        info.memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB以上` : '取得不可';
        info.maxTouchPoints = navigator.maxTouchPoints || 0;

        // Gamepad
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const connectedGamepads = Array.from(gamepads).filter(g => g !== null);
        info.gamepad = connectedGamepads.length > 0 ? `${connectedGamepads.length}台接続中 (${connectedGamepads[0].id})` : '未接続';

        // Battery
        try {
            if (navigator.getBattery) {
                const b = await navigator.getBattery();
                info.battery = `${Math.round(b.level * 100)}% (${b.charging ? '充電中' : '放電中'})`;
            } else {
                info.battery = '非対応';
            }
        } catch (e) { info.battery = '取得失敗'; }

        // GPU
        const gpu = getGpuInfo();
        info.gpuVendor = gpu.vendor;
        info.gpuRenderer = gpu.renderer;
        info.webglVersion = gpu.version;
        info.maxTex = gpu.maxTex;

        // Screen
        info.screenResolution = `${screen.width} x ${screen.height}`;
        info.screenAvailable = `${screen.availWidth} x ${screen.availHeight}`;
        info.colorDepth = `${screen.colorDepth} bit`;
        info.devicePixelRatio = window.devicePixelRatio;

        // Viewport
        info.viewportSize = `${window.innerWidth} x ${window.innerHeight}`;
        info.windowSize = `${window.outerWidth} x ${window.outerHeight}`;
        info.colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'ダーク' : 'ライト';
        info.baseFontSize = getComputedStyle(document.documentElement).fontSize;

        // Storage
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const est = await navigator.storage.estimate();
                info.storageQuota = formatBytes(est.quota);
                info.storageUsage = formatBytes(est.usage);
                info.storagePercent = est.quota ? `${((est.usage / est.quota) * 100).toFixed(4)}%` : '---';
                info.storagePersist = (await navigator.storage.persisted()) ? '永続化済み' : '一時的';
            } catch (e) { /* ignore */ }
        }

        // Network
        info.isOnline = navigator.onLine ? 'オンライン' : 'オフライン';
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
            info.netType = conn.effectiveType || '不明';
        }

        // Misc
        info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        info.tzOffset = `${new Date().getTimezoneOffset()} 分`;
        info.webdriver = navigator.webdriver ? 'はい' : 'いいえ';
        info.pdfSupport = navigator.pdfViewerEnabled ? '対応' : '非対応';
        info.languages = navigator.languages ? navigator.languages.join(', ') : info.language;
        info.referrer = document.referrer || '(なし)';

        // Fonts
        info.detectedFonts = detectFonts();

        return info;
    };

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
            if (el) el.innerHTML = val; // Use innerHTML to support badges
        }

        // Direct innerHTML for permissions (badges)
        document.getElementById('perm-geo').innerHTML = info.permGeo;
        document.getElementById('perm-notifications').innerHTML = info.permNotifications;
        document.getElementById('perm-camera').innerHTML = info.permCamera;
        document.getElementById('perm-microphone').innerHTML = info.permMicrophone;

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
        // Remove HTML from permissions for JSON
        const cleanInfo = { ...info };
        const strip = (s) => s.replace(/<[^>]*>?/gm, '');
        cleanInfo.permGeo = strip(info.permGeo);
        cleanInfo.permNotifications = strip(info.permNotifications);
        cleanInfo.permCamera = strip(info.permCamera);
        cleanInfo.permMicrophone = strip(info.permMicrophone);

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
