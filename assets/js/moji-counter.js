document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('text');
  const countTotal = document.getElementById('count-total');
  const countNoSpace = document.getElementById('count-no-space');
  const countNoNewline = document.getElementById('count-no-newline');
  const countLines = document.getElementById('count-lines');
  const countWords = document.getElementById('count-words');
  const readingTime = document.getElementById('reading-time');
  const countPrimary = document.getElementById('count-primary');

  const excludeSpacesCheck = document.getElementById('exclude-spaces');
  const excludeNewlinesCheck = document.getElementById('exclude-newlines');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const toast = document.getElementById('toast');

  const updateStats = () => {
    const text = textarea.value;

    // Basic Stats
    const total = text.length;
    const noSpace = text.replace(/\s/g, '').length;
    const noNewline = text.replace(/\n/g, '').length;
    const lines = text ? text.split('\n').length : 0;

    // Word count (Simple implementation for EN/JP mix)
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    // Reading time (Approx 400 chars per min for JP)
    const time = Math.ceil(total / 400);

    // Update UI
    countTotal.textContent = total.toLocaleString();
    countNoSpace.textContent = noSpace.toLocaleString();
    countNoNewline.textContent = noNewline.toLocaleString();
    countLines.textContent = lines.toLocaleString();
    countWords.textContent = words.toLocaleString();
    readingTime.textContent = `${time}分`;

    // Update Primary Counter
    let primaryValue = total;
    if (excludeSpacesCheck.checked && excludeNewlinesCheck.checked) {
      primaryValue = noSpace; // Regex \s handles both
    } else if (excludeSpacesCheck.checked) {
      primaryValue = text.replace(/[ 　\t]/g, '').length;
    } else if (excludeNewlinesCheck.checked) {
      primaryValue = noNewline;
    }
    countPrimary.textContent = primaryValue.toLocaleString();
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  };

  // Events
  textarea.addEventListener('input', updateStats);
  excludeSpacesCheck.addEventListener('change', updateStats);
  excludeNewlinesCheck.addEventListener('change', updateStats);

  clearBtn.addEventListener('click', () => {
    if (textarea.value && confirm('内容をクリアしますか？')) {
      textarea.value = '';
      updateStats();
    }
  });

  copyBtn.addEventListener('click', () => {
    if (!textarea.value) return;
    navigator.clipboard.writeText(textarea.value).then(() => {
      showToast('コピーしました');
    });
  });

  // Initial call
  updateStats();
});