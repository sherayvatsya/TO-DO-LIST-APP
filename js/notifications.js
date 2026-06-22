'use strict';

const TaskFlowNotifications = (() => {
  function show(message, options = {}) {
    const region = document.getElementById(options.regionId || 'toastRegion');
    if (!region) return;

    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    region.appendChild(item);

    window.setTimeout(() => item.classList.add('visible'), 10);
    window.setTimeout(() => {
      item.classList.remove('visible');
      window.setTimeout(() => item.remove(), 220);
    }, options.duration || 2600);
  }

  return { show };
})();

window.TaskFlowNotifications = TaskFlowNotifications;
