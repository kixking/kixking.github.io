const textarea = document.getElementById('text');
const count = document.getElementById('count');

textarea.addEventListener('input', () => {
  count.textContent = textarea.value.length.toString();
});