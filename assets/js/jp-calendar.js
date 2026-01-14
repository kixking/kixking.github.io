/**
 * Simple Tools - Japanese Holiday Calendar Logic
 */

const currentMonthEl = document.getElementById('currentMonth');
const calendarGrid = document.getElementById('calendarGrid');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');
const todayBtn = document.getElementById('todayBtn');

let viewDate = new Date();

function updateCalendar() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Set Month Title
    currentMonthEl.textContent = `${year}年 ${month + 1}月`;

    // Clear existing days (keep headers)
    const headers = calendarGrid.querySelectorAll('.day-header');
    calendarGrid.innerHTML = '';
    headers.forEach(h => calendarGrid.appendChild(h));

    // Get Holidays for the year
    const holidays = getHolidays(year);

    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    // Previous month filler
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayDiv = createDayDiv(prevMonthLastDay - i, true);
        calendarGrid.appendChild(dayDiv);
    }

    // Current month days
    const today = new Date();
    for (let d = 1; d <= lastDay; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
        const holiday = holidays[dateStr];
        const dayOfWeek = new Date(year, month, d).getDay();

        const dayDiv = createDayDiv(d, false, isToday, holiday, dayOfWeek);
        calendarGrid.appendChild(dayDiv);
    }

    // Next month filler
    const totalCells = calendarGrid.children.length - 7; // subtract headers
    const remaining = 42 - totalCells;
    for (let i = 1; i <= remaining; i++) {
        const dayDiv = createDayDiv(i, true);
        calendarGrid.appendChild(dayDiv);
    }
}

function createDayDiv(num, isOtherMonth, isToday = false, holiday = null, dayOfWeek = null) {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    if (isOtherMonth) div.classList.add('other-month');
    if (isToday) div.classList.add('today');
    if (holiday) div.classList.add('holiday');
    if (dayOfWeek === 0) div.classList.add('sunday');
    if (dayOfWeek === 6) div.classList.add('saturday');

    const numSpan = document.createElement('span');
    numSpan.className = 'day-number';
    numSpan.textContent = num;
    div.appendChild(numSpan);

    if (holiday) {
        const nameDiv = document.createElement('div');
        nameDiv.className = 'holiday-name';
        nameDiv.textContent = holiday;
        div.appendChild(nameDiv);
    }

    return div;
}

/**
 * Calculate Japanese Holidays
 * @param {number} year 
 * @returns {Object} { "YYYY-MM-DD": "Name" }
 */
function getHolidays(year) {
    const holidays = {};

    function add(m, d, name) {
        const key = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        holidays[key] = name;
    }

    // Fixed Holidays
    add(1, 1, "元日");
    add(2, 11, "建国記念の日");

    // Emperor's Birthday
    if (year >= 2020) {
        add(2, 23, "天皇誕生日");
    } else if (year >= 1989 && year <= 2018) {
        add(12, 23, "天皇誕生日");
    }

    add(4, 29, "昭和の日");
    add(5, 3, "憲法記念日");
    add(5, 4, "みどりの日");
    add(5, 5, "こどもの日");

    // Mountain Day (Established in 2016)
    if (year >= 2016) {
        add(8, 11, "山の日");
    }

    add(11, 3, "文化の日");
    add(11, 23, "勤労感謝の日");

    // Happy Monday
    add(1, getHappyMonday(year, 1, 2), "成人の日");
    add(7, getHappyMonday(year, 7, 3), "海の日");
    add(9, getHappyMonday(year, 9, 3), "敬老の日");
    add(10, getHappyMonday(year, 10, 2), "スポーツの日");

    // Vernal Equinox (Approx)
    const ve = Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
    add(3, ve, "春分の日");

    // Autumnal Equinox (Approx)
    const ae = Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
    add(9, ae, "秋分の日");

    // Substitute Holidays (振替休日)
    const sortedKeys = Object.keys(holidays).sort();
    sortedKeys.forEach(key => {
        const d = new Date(key);
        if (d.getDay() === 0) { // Sunday
            let nextDay = new Date(d);
            let sub = false;
            while (!sub) {
                nextDay.setDate(nextDay.getDate() + 1);
                const nextKey = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
                if (!holidays[nextKey]) {
                    holidays[nextKey] = "振替休日";
                    sub = true;
                }
            }
        }
    });

    // Kokumin no Kyujitsu (Between two holidays)
    // Only happens between Respect for the Aged and Autumnal Equinox usually
    if (holidays[`${year}-09-${ae}`] && holidays[`${year}-09-${getHappyMonday(year, 9, 3)}`]) {
        const gap = ae - getHappyMonday(year, 9, 3);
        if (gap === 2) {
            add(9, ae - 1, "国民の休日");
        }
    }

    return holidays;
}

function getHappyMonday(year, month, nth) {
    const firstDay = new Date(year, month - 1, 1).getDay();
    let day = 1;
    if (firstDay <= 1) {
        day = 1 + (1 - firstDay);
    } else {
        day = 1 + (8 - firstDay);
    }
    return day + (nth - 1) * 7;
}

// Navigation Events
prevBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    updateCalendar();
});

nextBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    updateCalendar();
});

todayBtn.addEventListener('click', () => {
    viewDate = new Date();
    updateCalendar();
});

// Initial load
updateCalendar();
