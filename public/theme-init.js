// Runs before first paint to set the theme with no flash. External file (not inline)
// so it complies with the CSP `script-src 'self'`. Uses the saved choice if present,
// otherwise follows the browser/OS preference (prefers-color-scheme).
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored === 'dark' || (stored !== 'light' && prefersDark);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {
    // If anything fails, fall back to the OS preference (or light).
    var d = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', !!d);
  }
})();
