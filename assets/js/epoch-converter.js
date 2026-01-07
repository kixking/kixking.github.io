document.addEventListener('DOMContentLoaded', () => {
    // --- Current Time Display ---
    const currentTsEl = document.getElementById('current-ts');
    const currentDateEl = document.getElementById('current-date');

    const updateCurrentTime = () => {
        const now = new Date();
        const ts = Math.floor(now.getTime() / 1000);
        currentTsEl.textContent = ts;
        currentDateEl.textContent = now.toLocaleString();
    };
    setInterval(updateCurrentTime, 1000);
    updateCurrentTime();

    // --- TS to Date ---
    const tsInput = document.getElementById('ts-input');
    const tsToDateResult = document.getElementById('ts-to-date-result');
    const tsToDateUtcResult = document.getElementById('ts-to-date-utc-result');

    const convertTsToDate = () => {
        let val = tsInput.value.trim();
        if (!val) {
            tsToDateResult.textContent = '---';
            tsToDateUtcResult.textContent = 'UTC: ---';
            return;
        }

        // Remove commas if any
        val = val.replace(/,/g, '');
        let num = parseInt(val);

        if (isNaN(num)) {
            tsToDateResult.textContent = '無効な形式です';
            return;
        }

        // Check if milliseconds (13 digits or more)
        let date;
        if (val.length >= 13) {
            date = new Date(num);
        } else {
            date = new Date(num * 1000);
        }

        if (isNaN(date.getTime())) {
            tsToDateResult.textContent = '無効な日付です';
            return;
        }

        tsToDateResult.textContent = date.toLocaleString();
        tsToDateUtcResult.textContent = `UTC: ${date.toUTCString()}`;
    };

    tsInput.addEventListener('input', convertTsToDate);

    // --- Date to TS ---
    const yearIn = document.getElementById('year');
    const monthIn = document.getElementById('month');
    const dayIn = document.getElementById('day');
    const hourIn = document.getElementById('hour');
    const minuteIn = document.getElementById('minute');
    const secondIn = document.getElementById('second');
    const dateToTsResult = document.getElementById('date-to-ts-result');

    // Init with current date
    const now = new Date();
    yearIn.value = now.getFullYear();
    monthIn.value = now.getMonth() + 1;
    dayIn.value = now.getDate();
    hourIn.value = now.getHours();
    minuteIn.value = now.getMinutes();
    secondIn.value = now.getSeconds();

    const convertDateToTs = () => {
        const y = parseInt(yearIn.value);
        const m = parseInt(monthIn.value) - 1; // 0-indexed
        const d = parseInt(dayIn.value);
        const h = parseInt(hourIn.value) || 0;
        const min = parseInt(minuteIn.value) || 0;
        const s = parseInt(secondIn.value) || 0;

        const date = new Date(y, m, d, h, min, s);
        if (isNaN(date.getTime())) {
            dateToTsResult.textContent = '無効な日時です';
            return;
        }

        dateToTsResult.textContent = Math.floor(date.getTime() / 1000);
    };

    [yearIn, monthIn, dayIn, hourIn, minuteIn, secondIn].forEach(el => {
        el.addEventListener('input', convertDateToTs);
    });
    convertDateToTs(); // Run once

    // --- Copy Buttons ---
    const toast = document.getElementById('toast');
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const text = document.getElementById(targetId).textContent;
            if (text === '---') return;

            navigator.clipboard.writeText(text).then(() => {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2000);
            });
        });
    });
});
