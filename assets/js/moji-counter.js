import { MojiLogic } from './modules/moji-logic.js';

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
    const stats = MojiLogic.calculateStats(text);

    // Update UI
    countTotal.textContent = stats.total.toLocaleString();
    countNoSpace.textContent = stats.noSpace.toLocaleString();
    countNoNewline.textContent = stats.noNewline.toLocaleString();
    countLines.textContent = stats.lines.toLocaleString();
    countWords.textContent = stats.words.toLocaleString();
    readingTime.textContent = `${stats.readingTime}分`;

    // Update Primary Counter
    const primaryValue = MojiLogic.calculatePrimary(
      text,
      excludeSpacesCheck.checked,
      excludeNewlinesCheck.checked
    );
    countPrimary.textContent = primaryValue.toLocaleString();
  };

  const showToast = (message) => {
    if (!toast) return;
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