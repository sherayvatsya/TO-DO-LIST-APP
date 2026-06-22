'use strict';

const TaskFlow = (() => {
  let tasks = [];
  let deletedTasks = [];
  let categories = [];
  let currentFilter = 'all';
  let currentSort = 'newest';
  let selectedTaskId = null;
  let currentFocusTaskId = null;

  const priorityRank = { high: 3, medium: 2, low: 1 };
  const priorityLabel = { high: 'High', medium: 'Medium', low: 'Low' };
  const streakMilestones = [3, 7, 30, 100];

  function $(selector) {
    return document.querySelector(selector);
  }

  function toast(message) {
    const region = $('#toastRegion');
    if (!region) return;
    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    region.appendChild(item);
    window.setTimeout(() => item.classList.add('visible'), 10);
    window.setTimeout(() => {
      item.classList.remove('visible');
      window.setTimeout(() => item.remove(), 220);
    }, 2600);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function load() {
    tasks = TaskFlowStorage.getTasks();
    deletedTasks = TaskFlowStorage.getDeletedTasks();
    categories = TaskFlowStorage.getCategories();
  }

  function save() {
    TaskFlowStorage.saveTasks(tasks);
    TaskFlowStorage.saveDeletedTasks(deletedTasks);
    TaskFlowStorage.saveCategories(categories);
  }

  function init() {
    if (document.body.dataset.page !== 'dashboard') return;
    const session = window.auth?.getSession?.();
    if (!session) return;
    load();
    setupDateAndGreeting(session);
    renderCategoryOptions();
    bindEvents();
    syncTodayActivity();
    render();
  }

  function setupDateAndGreeting(session) {
    const now = new Date();
    const date = $('#appDate');
    const greeting = $('#userGreeting');
    if (date) {
      date.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
    if (greeting) {
      const hour = now.getHours();
      const salutation = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      greeting.textContent = `${salutation}, ${(session.name || 'User').split(' ')[0]}`;
    }
  }

  function bindEvents() {
    $('#taskForm')?.addEventListener('submit', handleAdd);
    $('#searchInput')?.addEventListener('input', renderTasks);
    $('#sortSelect')?.addEventListener('change', event => {
      currentSort = event.target.value;
      renderTasks();
    });
    $('#categoryInput')?.addEventListener('change', event => {
      $('#customCategoryInput').hidden = event.target.value !== '__custom';
      if (event.target.value === '__custom') $('#customCategoryInput').focus();
    });
    $('#durationInput')?.addEventListener('change', event => {
      $('#customDurationInput').hidden = event.target.value !== 'custom';
      if (event.target.value === 'custom') $('#customDurationInput').focus();
    });
    $('#clearCompletedBtn')?.addEventListener('click', clearCompleted);
    $('#archiveCompletedBtn')?.addEventListener('click', archiveCompleted);
    $('#startFocusSession')?.addEventListener('click', startFocusSession);
    $('#closeTaskDetails')?.addEventListener('click', closeTaskDetails);
    $('#taskDetailsBackdrop')?.addEventListener('click', event => {
      if (event.target === event.currentTarget) closeTaskDetails();
    });

    document.querySelectorAll('.filter-btn').forEach(button => {
      button.addEventListener('click', () => {
        currentFilter = button.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        renderTasks();
      });
    });

    document.addEventListener('keydown', handleShortcuts);
  }

  function handleShortcuts(event) {
    const active = document.activeElement;
    const isTyping = active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName);

    if (event.ctrlKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      $('#searchInput')?.focus();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      const isDark = TaskFlowTheme.toggleDarkMode();
      toast(isDark ? 'Dark mode enabled' : 'Light mode enabled');
      return;
    }

    if (event.key === 'Delete' && selectedTaskId && !isTyping) {
      deleteTask(selectedTaskId);
    }
  }

  function renderCategoryOptions() {
    const select = $('#categoryInput');
    if (!select) return;
    select.innerHTML = categories
      .map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
      .join('');
    select.insertAdjacentHTML('beforeend', '<option value="__custom">+ Custom category</option>');
  }

  function handleAdd(event) {
    event.preventDefault();
    const text = $('#taskInput').value.trim();
    const validation = $('#validationMsg');
    if (!text) {
      validation.textContent = 'Task cannot be empty.';
      validation.classList.add('visible');
      return;
    }

    let category = $('#categoryInput').value;
    if (category === '__custom') {
      category = $('#customCategoryInput').value.trim();
      if (!category) {
        validation.textContent = 'Enter a custom category name.';
        validation.classList.add('visible');
        return;
      }
      categories.push(category);
      renderCategoryOptions();
    }

    const durationValue = $('#durationInput').value;
    const estimatedDuration = durationValue === 'custom'
      ? `${Math.max(5, Number($('#customDurationInput').value) || 15)}m`
      : `${durationValue === '60' ? '1h' : durationValue === '120' ? '2h' : durationValue === '180' ? '3h' : `${durationValue}m`}`;

    validation.classList.remove('visible');
    tasks.unshift({
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now()),
      text,
      completed: false,
      archived: false,
      priority: $('#priorityInput').value,
      category,
      dueDate: $('#dueDateInput').value,
      dueTime: $('#dueTimeInput').value,
      estimatedDuration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: ''
    });

    event.target.reset();
    $('#priorityInput').value = 'medium';
    $('#customCategoryInput').hidden = true;
    save();
    syncTodayActivity();
    render();
    toast('Task Added Successfully');
  }

  function editTask(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    const next = window.prompt('Update task', task.text);
    if (!next || !next.trim()) return;
    task.text = next.trim();
    task.updatedAt = new Date().toISOString();
    save();
    render();
    toast('Task Updated');
  }

  function toggleComplete(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : '';
    task.updatedAt = new Date().toISOString();
    save();
    syncTodayActivity({ showToasts: true });
    render();
    toast(task.completed ? 'Task Completed' : 'Task Updated');
  }

  function deleteTask(id) {
    const index = tasks.findIndex(item => item.id === id);
    if (index === -1) return;
    const [task] = tasks.splice(index, 1);
    deletedTasks.unshift({ ...task, deletedAt: new Date().toISOString() });
    selectedTaskId = null;
    save();
    syncTodayActivity({ showToasts: true });
    render();
    toast('Task Deleted');
  }

  function clearCompleted() {
    const completed = tasks.filter(item => item.completed);
    if (!completed.length) return;
    deletedTasks.unshift(...completed.map(item => ({ ...item, deletedAt: new Date().toISOString() })));
    tasks = tasks.filter(item => !item.completed);
    save();
    syncTodayActivity({ showToasts: true });
    render();
    toast('Completed tasks cleared');
  }

  function archiveCompleted() {
    const completed = tasks.filter(item => item.completed);
    if (!completed.length) return;
    TaskFlowStorage.saveArchivedTasks([...TaskFlowStorage.getArchivedTasks(), ...completed]);
    tasks = tasks.filter(item => !item.completed);
    save();
    syncTodayActivity({ showToasts: true });
    render();
    toast('Completed tasks archived');
  }

  function dateFromKey(key) {
    const [year, month, day] = String(key).split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function previousDateKey(key) {
    const date = dateFromKey(key);
    date.setDate(date.getDate() - 1);
    return TaskFlowStorage.todayKey(date);
  }

  function getProductiveDates(completionHistory) {
    return Object.keys(completionHistory || {})
      .filter(date => completionHistory[date])
      .sort();
  }

  function hasCompletedTaskToday(today = TaskFlowStorage.todayKey()) {
    return tasks.some(task =>
      !task.archived &&
      task.completed &&
      task.completedAt &&
      TaskFlowStorage.todayKey(new Date(task.completedAt)) === today
    );
  }

  function getCurrentStreak(completionHistory) {
    const productiveDates = getProductiveDates(completionHistory);
    if (!productiveDates.length) return 0;

    const activeDays = new Set(productiveDates);
    let cursor = productiveDates[productiveDates.length - 1];
    let current = 0;
    const today = TaskFlowStorage.todayKey();

    if (cursor !== today && cursor !== previousDateKey(today)) {
      return 0;
    }

    while (activeDays.has(cursor)) {
      current += 1;
      cursor = previousDateKey(cursor);
    }

    return current;
  }

  function getLongestStreak(completionHistory) {
    const productiveDates = getProductiveDates(completionHistory);
    if (!productiveDates.length) return 0;

    let longest = 1;
    let run = 1;

    for (let index = 1; index < productiveDates.length; index += 1) {
      const previous = dateFromKey(productiveDates[index - 1]);
      const current = dateFromKey(productiveDates[index]);
      const gap = Math.round((current - previous) / 86400000);

      if (gap === 1) {
        run += 1;
      } else {
        run = 1;
      }

      longest = Math.max(longest, run);
    }

    return longest;
  }

  function syncTodayActivity(options = {}) {
    const { showToasts = false } = options;
    const today = TaskFlowStorage.todayKey();
    const saved = TaskFlowStorage.getStreaks();
    const completionHistory = { ...saved.completionHistory };
    const hadToday = Boolean(completionHistory[today]);
    const wasBest = saved.bestStreak;
    const isProductiveToday = hasCompletedTaskToday(today);

    if (isProductiveToday) {
      completionHistory[today] = true;
    } else {
      delete completionHistory[today];
    }

    const currentStreak = getCurrentStreak(completionHistory);
    const bestStreak = Math.max(wasBest, getLongestStreak(completionHistory), currentStreak);

    TaskFlowStorage.saveStreaks({
      currentStreak,
      bestStreak,
      completionHistory
    });

    if (showToasts && isProductiveToday && !hadToday && streakMilestones.includes(currentStreak)) {
      toast(`🔥 ${currentStreak}-Day Streak Achieved!`);
    }

    if (showToasts && bestStreak > wasBest) {
      toast('🏆 New Best Streak!');
    }
  }

  function getVisibleTasks() {
    const query = ($('#searchInput')?.value || '').trim().toLowerCase();
    let visible = tasks.filter(task => !task.archived);

    if (currentFilter === 'pending') visible = visible.filter(task => !task.completed);
    if (currentFilter === 'completed') visible = visible.filter(task => task.completed);
    if (query) {
      visible = visible.filter(task =>
        task.text.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query)
      );
    }

    return visible.sort((a, b) => {
      if (currentSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (currentSort === 'priority') return priorityRank[b.priority] - priorityRank[a.priority];
      if (currentSort === 'dueDate') return dueValue(a) - dueValue(b);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  function dueValue(task) {
    if (!task.dueDate) return Number.MAX_SAFE_INTEGER;
    return new Date(`${task.dueDate}T${task.dueTime || '23:59'}`).getTime();
  }

  function isOverdue(task) {
    return !task.completed && task.dueDate && dueValue(task) < Date.now();
  }

  function render() {
    renderTasks();
    renderStats();
    renderStreaks();
  }

  function renderTasks() {
    const list = $('#taskList');
    const empty = $('#emptyState');
    if (!list) return;
    const visible = getVisibleTasks();
    list.innerHTML = '';
    empty?.classList.toggle('visible', visible.length === 0);

    visible.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-card ${task.completed ? 'completed' : ''} ${isOverdue(task) ? 'overdue' : ''}`;
      li.draggable = true;
      li.dataset.id = task.id;
      li.tabIndex = 0;
      li.setAttribute('aria-selected', String(selectedTaskId === task.id));
      li.innerHTML = `
        <button class="check-toggle" type="button" aria-label="${task.completed ? 'Mark pending' : 'Mark complete'}">${task.completed ? '✓' : ''}</button>
        <div class="task-content">
          <div class="task-title-row">
            <strong>${escapeHtml(task.text)}</strong>
            <span class="priority-badge ${task.priority}">${priorityLabel[task.priority]}</span>
          </div>
          <div class="task-meta">
            <span>${escapeHtml(task.category)}</span>
            <span>${task.dueDate ? formatDue(task) : 'No due date'}</span>
            ${isOverdue(task) ? '<span class="overdue-text">Overdue</span>' : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="icon-action edit-task" type="button" aria-label="Edit task">✎</button>
          <button class="icon-action delete-task" type="button" aria-label="Delete task">×</button>
        </div>
      `;

      li.addEventListener('click', () => {
        selectedTaskId = task.id;
        renderTasks();
      });
      li.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', task.id));
      li.addEventListener('dragover', event => event.preventDefault());
      li.addEventListener('drop', event => handleDrop(event, task.id));
      li.querySelector('.check-toggle').addEventListener('click', event => {
        event.stopPropagation();
        toggleComplete(task.id);
      });
      li.querySelector('.edit-task').addEventListener('click', event => {
        event.stopPropagation();
        editTask(task.id);
      });
      li.querySelector('.delete-task').addEventListener('click', event => {
        event.stopPropagation();
        deleteTask(task.id);
      });
      list.appendChild(li);
    });
  }

  function handleDrop(event, targetId) {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetId) return;
    const from = tasks.findIndex(item => item.id === draggedId);
    const to = tasks.findIndex(item => item.id === targetId);
    if (from === -1 || to === -1) return;
    const [task] = tasks.splice(from, 1);
    tasks.splice(to, 0, task);
    save();
    renderTasks();
  }

  function formatDue(task) {
    const date = new Date(`${task.dueDate}T${task.dueTime || '00:00'}`);
    const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return task.dueTime ? `${datePart}, ${task.dueTime}` : datePart;
  }

  function renderStats() {
    const total = tasks.length;
    const done = tasks.filter(task => task.completed).length;
    const pending = total - done;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const settings = TaskFlowStorage.getSettings();
    const today = TaskFlowStorage.todayKey();
    const todayDone = tasks.filter(task => task.completedAt?.startsWith(today)).length;

    setText('#plannedToday', total);
    setText('#focusedTime', done);
    setText('#remainingTime', pending);
    setText('#progressPercent', `${pct}%`);
    setText('#productivityLabel', pct >= 80 ? 'Excellent pace' : pct >= 45 ? 'Building momentum' : 'Fresh start');
    setText('#dailyGoalStatus', `${todayDone}/${settings.dailyGoal}`);
    const ring = $('#progressRing');
    if (ring) ring.style.background = `conic-gradient(var(--primary) ${pct * 3.6}deg, var(--ring-track) 0deg)`;

  }

  function renderStreaks() {
    const streaks = TaskFlowStorage.getStreaks();
    const productiveDates = getProductiveDates(streaks.completionHistory);
    const lastActive = productiveDates.length ? productiveDates[productiveDates.length - 1] : '';
    const nextMilestone = streakMilestones.find(milestone => milestone > streaks.currentStreak);

    setText('#currentStreak', streaks.currentStreak);
    setText('#bestStreak', streaks.bestStreak);
    setText('#lastActiveDate', lastActive ? formatDateLabel(lastActive) : 'Never');
    setText(
      '#streakMessage',
      streaks.currentStreak
        ? `Keep the flame alive. ${nextMilestone ? `${nextMilestone - streaks.currentStreak} day(s) to ${nextMilestone}.` : 'Legend status unlocked.'}`
        : 'Complete a task today to start a streak.'
    );
    renderMilestones(streaks.currentStreak);
  }

  function renderMilestones(currentStreak) {
    const row = $('#milestoneRow');
    if (!row) return;
    row.innerHTML = streakMilestones
      .map(milestone => `
        <span class="milestone-pill ${currentStreak >= milestone ? 'achieved' : ''}">
          ${currentStreak >= milestone ? '🏆' : '○'} ${milestone}d
        </span>
      `)
      .join('');
  }

  function formatDateLabel(dateKey) {
    return dateFromKey(dateKey).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function setText(selector, value) {
    const node = $(selector);
    if (node) node.textContent = value;
  }

  document.addEventListener('DOMContentLoaded', init);

  return { toast, render };
})();

window.TaskFlow = TaskFlow;
