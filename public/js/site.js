// Theme toggle for the generated static pages. Shares the "darkMode" key with the React app.
(function () {
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  var root = document.documentElement;
  var icon = document.getElementById('theme-icon');
  function sync() {
    var dark = root.classList.contains('dark');
    var label = dark ? 'Switch to light theme' : 'Switch to dark theme';
    btn.setAttribute('aria-label', label);
    btn.title = label;
    if (icon) icon.textContent = dark ? '🌞' : '🌙';
  }
  btn.addEventListener('click', function () {
    var dark = !root.classList.contains('dark');
    root.classList.toggle('dark', dark);
    root.classList.toggle('light', !dark);
    try { localStorage.setItem('darkMode', dark); } catch (e) { /* storage blocked */ }
    sync();
  });
  sync();
})();
