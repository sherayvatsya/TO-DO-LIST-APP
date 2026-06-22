'use strict';

const TaskFlowTheme = (() => {
  const themes = ['purple', 'blue', 'green', 'orange'];

  function getSettings() {
    return window.TaskFlowStorage?.getSettings?.() || { theme: 'purple', darkMode: false, highContrast: false };
  }

  function apply(settings = getSettings()) {
    document.documentElement.dataset.theme = settings.theme || 'purple';
    document.documentElement.dataset.mode = settings.darkMode ? 'dark' : 'light';
    document.documentElement.classList.toggle('high-contrast', Boolean(settings.highContrast));
  }

  function setTheme(theme) {
    if (!themes.includes(theme)) return;
    const settings = getSettings();
    window.TaskFlowStorage?.saveSettings?.({ ...settings, theme });
    apply({ ...settings, theme });
  }

  function toggleDarkMode() {
    const settings = getSettings();
    const darkMode = !settings.darkMode;
    window.TaskFlowStorage?.saveSettings?.({ ...settings, darkMode });
    apply({ ...settings, darkMode });
    return darkMode;
  }

  function init() {
    apply();
    document.querySelectorAll('#themeToggle, [data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const isDark = toggleDarkMode();
        window.TaskFlow?.toast?.(isDark ? 'Dark mode enabled' : 'Light mode enabled');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return { themes, apply, setTheme, toggleDarkMode };
})();

window.TaskFlowTheme = TaskFlowTheme;
