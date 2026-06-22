'use strict';

function profileToast(message) {
  if (window.TaskFlow?.toast) {
    window.TaskFlow.toast(message);
    return;
  }
  const region = document.getElementById('toastRegion');
  if (!region) return;
  const item = document.createElement('div');
  item.className = 'toast visible';
  item.textContent = message;
  region.appendChild(item);
  window.setTimeout(() => item.remove(), 2400);
}

function initProfile() {
  if (document.body.dataset.page !== 'profile') return;
  const session = TaskFlowStorage.getSession();
  if (!session) return;
  const user = TaskFlowStorage.getCurrentUser();
  const settings = TaskFlowStorage.getSettings();
  const tasks = TaskFlowStorage.getTasks();
  const streaks = TaskFlowStorage.getStreaks();
  const name = user?.fullName || session.name || 'Guest';
  const email = session.email || 'guest@taskflow.local';

  document.getElementById('profileAvatar').textContent = name.trim().charAt(0).toUpperCase();
  document.getElementById('profileNameLabel').textContent = name;
  document.getElementById('profileEmailLabel').textContent = email;
  document.getElementById('profileName').value = name;
  document.getElementById('profileEmail').value = email;
  document.getElementById('profileDailyGoal').value = settings.dailyGoal;
  document.getElementById('joinedAt').textContent = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Guest mode';
  document.getElementById('profileTaskCount').textContent = tasks.length;
  document.getElementById('profileBestStreak').textContent = streaks.best;

  document.getElementById('profileForm').addEventListener('submit', event => {
    event.preventDefault();
    const fullName = document.getElementById('profileName').value.trim() || name;
    const dailyGoal = Math.max(1, Number(document.getElementById('profileDailyGoal').value) || 5);
    TaskFlowStorage.saveSettings({ dailyGoal });
    if (!session.isGuest) TaskFlowStorage.updateCurrentUser({ fullName });
    const nextSession = { ...session, name: fullName };
    localStorage.setItem(TaskFlowStorage.KEYS.session, JSON.stringify(nextSession));
    document.getElementById('profileNameLabel').textContent = fullName;
    document.getElementById('profileAvatar').textContent = fullName.charAt(0).toUpperCase();
    profileToast('Profile saved');
  });
}

document.addEventListener('DOMContentLoaded', initProfile);
