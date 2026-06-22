'use strict';

const TaskFlowStorage = (() => {
  const KEYS = {
    users: 'taskflow_users',
    session: 'taskflow_session',
    backup: 'taskflow_backup',
    settings: 'taskflow_settings',
    theme: 'taskflow_theme',
    pomodoro: 'taskflow_pomodoro',
    focusHistory: 'taskflow_focus_history',
    reset: 'taskflow_password_reset'
  };

  const defaults = {
    settings: {
      darkMode: false,
      theme: 'purple',
      highContrast: false,
      notifications: true,
      dailyGoal: 5,
      securityQuestion: '',
      securityAnswer: ''
    },
    categories: ['Work', 'Study', 'Personal', 'Shopping', 'Health'],
    streaks: {
      currentStreak: 0,
      bestStreak: 0,
      completionHistory: {}
    }
  };

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn(`Could not read ${key}:`, error);
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getSession() {
    return read(KEYS.session, null);
  }

  function userKey(kind) {
    const session = getSession();
    const email = session?.email || 'guest@taskflow.local';
    return `taskflow_${kind}_${email.toLowerCase()}`;
  }

  function todayKey(date = new Date()) {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toISOString().slice(0, 10);
  }

  function getTasks() {
    return read(userKey('tasks'), []);
  }

  function saveTasks(tasks) {
    write(userKey('tasks'), tasks);
  }

  function getDeletedTasks() {
    return read(userKey('deleted_tasks'), []);
  }

  function saveDeletedTasks(tasks) {
    write(userKey('deleted_tasks'), tasks);
  }

  function getArchivedTasks() {
    return read(userKey('archived_tasks'), []);
  }

  function saveArchivedTasks(tasks) {
    write(userKey('archived_tasks'), tasks);
  }

  function getCategories() {
    const saved = read(userKey('categories'), null);
    return saved && saved.length ? saved : [...defaults.categories];
  }

  function saveCategories(categories) {
    write(userKey('categories'), [...new Set(categories.filter(Boolean))]);
  }

  function getFocusHistory() {
    return read(userKey('focus_history'), []);
  }

  function saveFocusHistory(history) {
    write(userKey('focus_history'), history);
  }

  function recordFocusSession(taskId, minutes, date = new Date()) {
    const history = getFocusHistory();
    history.push({ taskId, minutes, date: date.toISOString().slice(0, 10), createdAt: new Date().toISOString() });
    saveFocusHistory(history);
    return history;
  }

  function getSettings() {
    return { ...defaults.settings, ...read(userKey('settings'), read(KEYS.settings, {})) };
  }

  function saveSettings(settings) {
    write(userKey('settings'), { ...getSettings(), ...settings });
  }

  function getStreaks() {
    const saved = read(userKey('streaks'), {});
    const completionHistory = { ...(saved.completionHistory || {}) };

    if (Array.isArray(saved.completedDates)) {
      saved.completedDates.forEach(date => {
        completionHistory[date] = true;
      });
    }

    return {
      currentStreak: Number(saved.currentStreak ?? saved.current ?? defaults.streaks.currentStreak) || 0,
      bestStreak: Number(saved.bestStreak ?? saved.best ?? defaults.streaks.bestStreak) || 0,
      completionHistory
    };
  }

  function saveStreaks(streaks) {
    const next = { ...getStreaks(), ...streaks };
    write(userKey('streaks'), {
      currentStreak: Number(next.currentStreak) || 0,
      bestStreak: Number(next.bestStreak) || 0,
      completionHistory: next.completionHistory || {}
    });
  }

  function getUsers() {
    return read(KEYS.users, []);
  }

  function saveUsers(users) {
    write(KEYS.users, users);
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session || session.isGuest) return null;
    return getUsers().find(user => String(user.email).toLowerCase() === String(session.email).toLowerCase()) || null;
  }

  function updateCurrentUser(updates) {
    const session = getSession();
    if (!session || session.isGuest) return null;
    const users = getUsers();
    const index = users.findIndex(user => String(user.email).toLowerCase() === String(session.email).toLowerCase());
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    saveUsers(users);
    localStorage.setItem(KEYS.session, JSON.stringify({
      ...session,
      name: users[index].fullName || users[index].name || session.name
    }));
    return users[index];
  }

  function backupAll() {
    const payload = {
      createdAt: new Date().toISOString(),
      session: getSession(),
      tasks: getTasks(),
      deletedTasks: getDeletedTasks(),
      archivedTasks: getArchivedTasks(),
      categories: getCategories(),
      settings: getSettings(),
      streaks: getStreaks()
    };
    write(KEYS.backup, payload);
    return payload;
  }

  function restoreBackup() {
    const backup = read(KEYS.backup, null);
    if (!backup) return false;
    saveTasks(backup.tasks || []);
    saveDeletedTasks(backup.deletedTasks || []);
    saveArchivedTasks(backup.archivedTasks || []);
    saveCategories(backup.categories || defaults.categories);
    saveSettings(backup.settings || defaults.settings);
    saveStreaks(backup.streaks || defaults.streaks);
    return true;
  }

  function resetUserData() {
    localStorage.removeItem(userKey('tasks'));
    localStorage.removeItem(userKey('deleted_tasks'));
    localStorage.removeItem(userKey('archived_tasks'));
    localStorage.removeItem(userKey('categories'));
    localStorage.removeItem(userKey('settings'));
    localStorage.removeItem(userKey('streaks'));
    localStorage.removeItem(KEYS.pomodoro);
  }

  return {
    KEYS,
    read,
    write,
    todayKey,
    getSession,
    getTasks,
    saveTasks,
    getDeletedTasks,
    saveDeletedTasks,
    getArchivedTasks,
    saveArchivedTasks,
    getCategories,
    saveCategories,
    getFocusHistory,
    saveFocusHistory,
    recordFocusSession,
    getSettings,
    saveSettings,
    getStreaks,
    saveStreaks,
    getUsers,
    saveUsers,
    getCurrentUser,
    updateCurrentUser,
    backupAll,
    restoreBackup,
    resetUserData
  };
})();

window.TaskFlowStorage = TaskFlowStorage;
