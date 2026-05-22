(function () {
let body;
let themeToggle;
let themeToggleLabel;

function initTheme() {
    body = document.body;
    themeToggle = document.getElementById('theme-toggle');
    themeToggleLabel = document.getElementById('theme-toggle-label');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('user-theme');
    const initialTheme = savedTheme === 'theme-light' || savedTheme === 'theme-dark'
        ? savedTheme
        : (systemPrefersDark ? 'theme-dark' : 'theme-light');

    setTheme(initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTheme(body.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark');
        });
    }
}

function setTheme(themeName) {
    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add(themeName);
    localStorage.setItem('user-theme', themeName);
    if (!themeToggle || !themeToggleLabel) return;
    const isDark = themeName === 'theme-dark';
    themeToggle.classList.toggle('active', isDark);
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    themeToggleLabel.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
}

window.AulaClaraTheme = { initTheme };

})();
