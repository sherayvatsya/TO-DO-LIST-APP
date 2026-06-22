'use strict';

function setAnalysisText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function initAnalysis() {
  if (document.body.dataset.page !== 'analysis') return;
  const tasks = TaskFlowStorage.getTasks();
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const monthKey = new Date().toISOString().slice(0, 7);
  const monthTasks = tasks.filter(task => task.createdAt?.slice(0, 7) === monthKey);
  const monthDone = monthTasks.filter(task => task.completed).length;

  setAnalysisText('analysisTotal', total);
  setAnalysisText('analysisPending', pending);
  setAnalysisText('analysisCompleted', completed);
  setAnalysisText('analysisMonthTotal', monthTasks.length);
  setAnalysisText('analysisMonthDone', monthDone);
  setAnalysisText('analysisMonthlyStats', `${monthTasks.length ? Math.round((monthDone / monthTasks.length) * 100) : 0}%`);

  const weekly = document.getElementById('analysisWeeklyStats');
  if (!weekly) return;
  const days = [...Array(7)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = TaskFlowStorage.todayKey(date);
    return {
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
      value: tasks.filter(task => task.completedAt?.startsWith(key)).length
    };
  });
  const max = Math.max(1, ...days.map(day => day.value));
  weekly.innerHTML = days.map(day => `
    <div class="bar-item">
      <span style="height:${Math.max(8, (day.value / max) * 72)}px"></span>
      <small>${day.label}</small>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', initAnalysis);
