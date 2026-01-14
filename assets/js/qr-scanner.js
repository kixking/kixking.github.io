/**
 * Simple Tools - QR Scanner Logic
 * Uses jsQR library for browser-side decoding
 */

const video = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvas = canvasElement.getContext('2d');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const loadingMsg = document.getElementById('loading-msg');
const resultBox = document.getElementById('result-box');
const outputText = document.getElementById('output-text');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');
const urlAction = document.getElementById('url-action');
const openUrlLink = document.getElementById('open-url');

let scanning = false;
let stream = null;

async function startScanner() {
    try {
        loadingMsg.style.display = 'block';
        startBtn.disabled = true;

        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        video.srcObject = stream;
        video.setAttribute("playsinline", true); // Required for iOS
        video.play();

        scanning = true;
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        stopBtn.disabled = false;
        loadingMsg.style.display = 'none';

        requestAnimationFrame(tick);
    } catch (err) {
        console.error(err);
        alert("カメラの起動に失敗しました。カメラの使用許可を確認してください。");
        startBtn.disabled = false;
        loadingMsg.style.display = 'none';
    }
}

function stopScanner() {
    scanning = false;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    startBtn.style.display = 'block';
    startBtn.disabled = false;
    stopBtn.style.display = 'none';
}

function tick() {
    if (!scanning) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code) {
            handleResult(code.data);
            // Vibrate if supported
            if (navigator.vibrate) navigator.vibrate(200);

            // Optionally stop after first detection
            // stopScanner(); 
        }
    }
    requestAnimationFrame(tick);
}

function handleResult(data) {
    resultBox.style.display = 'block';
    outputText.textContent = data;

    // Check if it's a URL
    try {
        const url = new URL(data);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            urlAction.style.display = 'block';
            openUrlLink.href = data;
        } else {
            urlAction.style.display = 'none';
        }
    } catch (_) {
        urlAction.style.display = 'none';
    }
}

startBtn.addEventListener('click', startScanner);
stopBtn.addEventListener('click', stopScanner);

copyBtn.addEventListener('click', () => {
    const text = outputText.textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    });
});
