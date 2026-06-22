'use strict';

function settingsToast(message) {
  const region = document.getElementById('toastRegion');
  if (!region) return;
  const item = document.createElement('div');
  item.className = 'toast visible';
  item.textContent = message;
  region.appendChild(item);
  window.setTimeout(() => item.remove(), 2400);
}

function escapeSettingsHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSettingsTrash() {
  const list = document.getElementById('settingsTrashList');
  if (!list) return;
  const deletedTasks = TaskFlowStorage.getDeletedTasks();
  list.innerHTML = deletedTasks.length ? deletedTasks.map(task => `
    <li>
      <span>${escapeSettingsHtml(task.text)}</span>
      <div>
        <button class="icon-action" type="button" data-restore="${task.id}" aria-label="Restore task">Restore</button>
        <button class="icon-action" type="button" data-delete="${task.id}" aria-label="Permanently delete task">Delete</button>
      </div>
    </li>
  `).join('') : '<li class="muted">Trash is empty</li>';

  list.querySelectorAll('[data-restore]').forEach(button => {
    button.addEventListener('click', () => {
      const deleted = TaskFlowStorage.getDeletedTasks();
      const index = deleted.findIndex(task => task.id === button.dataset.restore);
      if (index === -1) return;
      const [task] = deleted.splice(index, 1);
      delete task.deletedAt;
      TaskFlowStorage.saveDeletedTasks(deleted);
      TaskFlowStorage.saveTasks([task, ...TaskFlowStorage.getTasks()]);
      renderSettingsTrash();
      settingsToast('Task restored');
    });
  });

  list.querySelectorAll('[data-delete]').forEach(button => {
    button.addEventListener('click', () => {
      const deleted = TaskFlowStorage.getDeletedTasks().filter(task => task.id !== button.dataset.delete);
      TaskFlowStorage.saveDeletedTasks(deleted);
      renderSettingsTrash();
      settingsToast('Task permanently deleted');
    });
  });
}

function initSettings() {
  if (document.body.dataset.page !== 'settings') return;
  const session = TaskFlowStorage.getSession();
  if (!session) return;
  const settings = TaskFlowStorage.getSettings();
  const user = TaskFlowStorage.getCurrentUser();

  const dark = document.getElementById('darkModeSetting');
  const contrast = document.getElementById('contrastSetting');
  const notifications = document.getElementById('notificationsSetting');
  dark.checked = settings.darkMode;
  contrast.checked = settings.highContrast;
  notifications.checked = settings.notifications;
  document.getElementById('settingsSecurityQuestion').value = user?.securityQuestion || settings.securityQuestion || '';
  document.getElementById('settingsSecurityAnswer').value = user?.securityAnswer || settings.securityAnswer || '';

  dark.addEventListener('change', () => {
    TaskFlowStorage.saveSettings({ darkMode: dark.checked });
    TaskFlowTheme.apply(TaskFlowStorage.getSettings());
  });
  contrast.addEventListener('change', () => {
    TaskFlowStorage.saveSettings({ highContrast: contrast.checked });
    TaskFlowTheme.apply(TaskFlowStorage.getSettings());
  });
  notifications.addEventListener('change', () => {
    TaskFlowStorage.saveSettings({ notifications: notifications.checked });
    settingsToast('Notification settings saved');
  });

  document.querySelectorAll('.swatch').forEach(button => {
    button.classList.toggle('active', button.dataset.theme === settings.theme);
    button.addEventListener('click', () => {
      TaskFlowTheme.setTheme(button.dataset.theme);
      document.querySelectorAll('.swatch').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      settingsToast('Theme saved');
    });
  });

  document.getElementById('changePasswordForm').addEventListener('submit', event => {
    event.preventDefault();
    if (session.isGuest) {
      settingsToast('Guest accounts do not use passwords');
      return;
    }
    const current = document.getElementById('currentPassword').value;
    const next = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmNewPassword').value;
    const currentUser = TaskFlowStorage.getCurrentUser();
    if (!currentUser || currentUser.password !== current) return settingsToast('Current password is incorrect');
    if (next.length < 8) return settingsToast('Password must be at least 8 characters');
    if (next !== confirm) return settingsToast('Passwords do not match');
    TaskFlowStorage.updateCurrentUser({ password: next, passwordUpdatedAt: new Date().toISOString() });
    event.target.reset();
    settingsToast('Password changed');
  });

  document.getElementById('securityForm').addEventListener('submit', event => {
    event.preventDefault();
    const securityQuestion = document.getElementById('settingsSecurityQuestion').value;
    const securityAnswer = document.getElementById('settingsSecurityAnswer').value.trim();
    if (!securityQuestion || !securityAnswer) return settingsToast('Security question and answer are required');
    TaskFlowStorage.saveSettings({ securityQuestion, securityAnswer });
    if (!session.isGuest) TaskFlowStorage.updateCurrentUser({ securityQuestion, securityAnswer });
    settingsToast('Security question saved');
  });

  document.getElementById('settingsBackupBtn').addEventListener('click', () => {
    TaskFlowStorage.backupAll();
    settingsToast('Backup saved');
  });
  document.getElementById('settingsRestoreBtn').addEventListener('click', () => {
    const restored = TaskFlowStorage.restoreBackup();
    if (restored) renderSettingsTrash();
    settingsToast(restored ? 'Backup restored' : 'No backup found');
  });
  document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (!window.confirm('Reset all local TaskFlow data for this profile?')) return;
    TaskFlowStorage.resetUserData();
    renderSettingsTrash();
    settingsToast('All data reset');
  });

  renderSettingsTrash();
}

document.addEventListener('DOMContentLoaded', initSettings);
