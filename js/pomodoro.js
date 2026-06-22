'use strict';

const TaskFlowPomodoro = (() => {
  const DEFAULT_FOCUS_MINUTES = 25;
  const BREAK = 5 * 60;
  let state = {
    mode: 'focus',
    focusMinutes: DEFAULT_FOCUS_MINUTES,
    remaining: DEFAULT_FOCUS_MINUTES * 60,
    running: false,
    updatedAt: Date.now()
  };
  let intervalId = null;

  function load() {
    state = {
      ...state,
      ...(window.TaskFlowStorage?.read?.('taskflow_pomodoro', null) || {})
    };
    state.focusMinutes = clampMinutes(state.focusMinutes || DEFAULT_FOCUS_MINUTES);
    if (state.running) {
      const elapsed = Math.floor((Date.now() - state.updatedAt) / 1000);
      state.remaining = Math.max(0, state.remaining - elapsed);
    }
  }

  function save() {
    window.TaskFlowStorage?.write?.('taskflow_pomodoro', { ...state, updatedAt: Date.now() });
  }

  function format(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  function focusSeconds() {
    return state.focusMinutes * 60;
  }

  function clampMinutes(value) {
    const minutes = Number(value);
    if (!Number.isFinite(minutes)) return DEFAULT_FOCUS_MINUTES;
    return Math.min(180, Math.max(1, Math.round(minutes)));
  }

  function render() {
    const display = document.getElementById('timerDisplay');
    const mode = document.getElementById('pomodoroMode');
    const focusInput = document.getElementById('focusMinutesInput');
    if (display) display.textContent = format(state.remaining);
    if (mode) mode.textContent = state.mode === 'focus' ? 'Focus' : 'Break';
    if (focusInput) focusInput.value = state.focusMinutes;
    updateControls();
  }

  function updateControls() {
    const editButton = document.getElementById('pomodoroEdit');
    const editForm = document.getElementById('pomodoroEditForm');
    if (editButton) {
      editButton.disabled = state.running;
    }
    if (editForm && state.running) {
      if (!editForm.classList.contains('hidden')) {
        editForm.classList.add('hidden');
        const editBtn = document.getElementById('pomodoroEdit');
        if (editBtn) editBtn.textContent = 'Edit';
      }
    }
  }

  function beep() {
    try {
      const audio = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      oscillator.connect(gain);
      gain.connect(audio.destination);
      gain.gain.setValueAtTime(0.001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.22, audio.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.38);
    } catch (error) {
      console.warn('Audio notification unavailable:', error);
    }
  }

  function completeCycle() {
    beep();
    state.mode = state.mode === 'focus' ? 'break' : 'focus';
    state.remaining = state.mode === 'focus' ? focusSeconds() : BREAK;
    state.running = false;
    save();
    render();
    window.TaskFlow?.toast?.(state.mode === 'break' ? 'Focus session complete' : 'Break complete');
  }

  function tick() {
    state.remaining -= 1;
    if (state.remaining <= 0) {
      pause();
      completeCycle();
      return;
    }
    save();
    render();
  }

  function start() {
    if (state.running) return;
    state.running = true;
    save();
    updateControls();
    intervalId = window.setInterval(tick, 1000);
  }

  function pause() {
    state.running = false;
    window.clearInterval(intervalId);
    intervalId = null;
    save();
    updateControls();
  }

  function reset() {
    pause();
    state.remaining = state.mode === 'focus' ? focusSeconds() : BREAK;
    save();
    render();
  }

  function saveFocusMinutes(event) {
    event.preventDefault();
    const input = document.getElementById('focusMinutesInput');
    const nextMinutes = clampMinutes(input?.value);
    state.focusMinutes = nextMinutes;
    if (state.mode === 'focus') {
      pause();
      state.remaining = focusSeconds();
    }
    save();
    render();
    window.TaskFlow?.toast?.(`Focus timer set to ${nextMinutes} minutes`);
  }

  function init() {
    if (!document.getElementById('timerDisplay')) return;
    load();
    render();
    if (state.running) intervalId = window.setInterval(tick, 1000);
    document.getElementById('pomodoroStart')?.addEventListener('click', start);
    document.getElementById('pomodoroPause')?.addEventListener('click', pause);
    document.getElementById('pomodoroReset')?.addEventListener('click', reset);
    document.getElementById('pomodoroEditForm')?.addEventListener('submit', saveFocusMinutes);
    document.getElementById('pomodoroEdit')?.addEventListener('click', toggleEditForm);
  }

  function toggleEditForm() {
    const form = document.getElementById('pomodoroEditForm');
    const button = document.getElementById('pomodoroEdit');
    const input = document.getElementById('focusMinutesInput');
    if (!form || !button) return;

    const isHidden = form.classList.toggle('hidden');
    button.textContent = isHidden ? 'Edit' : 'Close';
    if (!isHidden) {
      input?.focus();
      input?.select();
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return { start, pause, reset };
})();

window.TaskFlowPomodoro = TaskFlowPomodoro;
