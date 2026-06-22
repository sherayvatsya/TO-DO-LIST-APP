# Product Requirements Document

## Product Overview

TaskFlow is a local-first productivity dashboard for people who want a simple, polished way to plan tasks, track progress, protect momentum, and manage focus sessions without needing a backend account system or cloud setup.

The app runs directly in the browser using HTML, CSS, JavaScript, and `localStorage`. It supports personal accounts, guest access, task management, productivity analytics, theme customization, Pomodoro focus sessions, and streak tracking.

## Goals

- Help users capture, prioritize, complete, and review daily tasks.
- Provide a modern dashboard that makes productivity status easy to understand at a glance.
- Encourage consistency through streaks, milestones, and best-streak tracking.
- Keep the product lightweight, private, and install-free by storing data locally.
- Deliver a responsive experience across desktop, tablet, and mobile screens.

## Target Users

- Students managing study plans, assignments, and revision sessions.
- Professionals organizing daily work, priorities, and focused work blocks.
- Personal users tracking routines, errands, habits, and goals.
- Demo or portfolio users evaluating a complete front-end productivity app.

## User Problems

- Users often lose track of task priorities and due dates.
- Basic to-do lists do not show meaningful progress or momentum.
- Many productivity tools require accounts, servers, or complex setup.
- Users want dark mode, customization, and mobile access without extra installation.
- Streak systems often overcount activity when users click checkboxes repeatedly.

## Core Features

### Authentication and User Access

- User signup with full name, email, password, security question, and security answer.
- User signin with email and password.
- Guest mode for quick access without creating an account.
- Forgot-password and reset-password flow using the stored security answer.
- Logout flow and dashboard protection for signed-in or guest sessions.

### Task Management

- Add tasks with title, category, priority, due date, due time, and estimated duration.
- Create custom categories from the task form.
- Mark tasks complete or pending.
- Edit task titles.
- Delete tasks to trash.
- Clear completed tasks.
- Archive completed tasks.
- Restore or permanently delete tasks from settings.
- Search tasks by title, category, or priority.
- Filter tasks by all, pending, or completed.
- Sort tasks by newest, oldest, priority, or due date.
- Highlight overdue pending tasks.

### Productivity Dashboard

- Show total tasks, completed tasks, remaining tasks, and completion percentage.
- Display a visual progress ring.
- Show daily goal progress from settings.
- Provide motivational quotes with refresh support.
- Provide a Pomodoro focus timer with editable focus duration.

### Streak System

The streak system must use the following data shape:

```json
{
  "currentStreak": 0,
  "bestStreak": 0,
  "completionHistory": {}
}
```

Rules:

- A day is productive only when at least one task remains completed for that day.
- Completing multiple tasks on the same day must not increase the streak more than once.
- Rechecking a task on the same day must not increase the streak again.
- If all tasks completed today are unchecked, deleted, cleared, or archived, today's activity must be removed.
- If at least one task remains completed today, today's activity must remain counted.
- Missing one or more days resets the current streak when the next productive day occurs.
- Best streak must never decrease.
- Productive days must be stored in `completionHistory`.
- Milestones must exist for 3, 7, 30, and 100 days.
- Toasts must appear for milestone achievements and new best streaks.

### Analytics

- Show total, pending, and completed task counts.
- Show current-month task totals and completion percentage.
- Show a seven-day completion bar chart based on completed task dates.

### Settings

- Toggle dark mode.
- Toggle high contrast mode.
- Enable or disable notifications preference.
- Change color theme.
- Change password for registered users.
- Update security question and answer.
- Backup local data.
- Restore local backup.
- Reset local profile data.

### Profile

- Display current user profile information.
- Support updating profile information where implemented.

### Responsive Design

- The app must be usable on desktop, tablet, and mobile.
- Navigation, forms, metrics, task cards, toolbars, and streak UI must collapse cleanly on small screens.
- Touch targets should remain comfortable on mobile.
- Content should not horizontally overflow the viewport.

## Non-Goals

- No backend server.
- No real email sending.
- No cloud sync.
- No payment system.
- No production-grade authentication or encryption.
- No browser extension or mobile app packaging.

## UX Requirements

- The interface should feel modern, calm, and productivity-focused.
- Forms should provide clear validation feedback.
- Toasts should confirm important user actions.
- Empty states should guide the user toward the next useful action.
- Dark mode and color themes should preserve readability.
- The app should remain fast and responsive with typical personal task volumes.

## Data Requirements

- All app data must be stored in `localStorage`.
- Data must be separated by user email where applicable.
- Guest data must use the guest account key.
- Storage reads should have safe fallbacks when data is missing or malformed.
- Backup and restore should include tasks, deleted tasks, archived tasks, categories, settings, and streaks.

## Success Metrics

- A user can create an account or enter as guest within one minute.
- A user can add, complete, search, filter, sort, delete, and restore tasks without page reload issues.
- The streak system passes all specified scenarios without overcounting.
- The dashboard remains usable at mobile widths down to 320px.
- Theme, settings, task, streak, and Pomodoro state persist after browser refresh.

## Acceptance Criteria

- Opening `signin.html` allows sign in, signup navigation, and guest access.
- Signed-in users can access `index.html`; signed-out users are redirected to signin.
- Tasks persist after refresh.
- Streak data persists after refresh and uses `currentStreak`, `bestStreak`, and `completionHistory`.
- Dark mode and selected theme persist after refresh.
- Pomodoro timer state persists while running or paused.
- Settings backup and restore operate on local data.
- Mobile layout does not require horizontal scrolling for normal content.
