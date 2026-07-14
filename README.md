# TaskFlow

TaskFlow is a local-first productivity dashboard built with HTML, CSS, JavaScript, and `localStorage`. It combines task management, dashboard metrics, Pomodoro focus sessions, analytics, dark mode, responsive design, and a professional streak system in a lightweight browser app.

## Features

- Local signup, signin, guest mode, logout, forgot-password, and reset-password flows.
- Task creation with priority, category, due date, due time, and estimated duration.
- Custom categories.
- Task edit, complete, uncomplete, delete, restore, clear completed, and archive completed.
- Search, filtering, and sorting.
- Dashboard metrics with progress ring.
- Daily goal progress.
- Pomodoro timer with editable focus duration.
- Motivation quote widget.
- Productivity analytics with weekly and monthly summaries.
- Professional streak system with current streak, best streak, last active date, milestones, and toast notifications.
- Dark mode, high contrast mode, and color themes.
- Local backup, restore, and reset.
- Responsive layout for desktop, tablet, and mobile.

🌐 Live Demo

🚀 Live Website: https://to-do-list-app-beta-neon.vercel.app/signin.html

## Streak System

TaskFlow tracks productive days using this local data shape:

```json
{
  "currentStreak": 0,
  "bestStreak": 0,
  "completionHistory": {}
}
```

The streak system is designed to avoid overcounting:

- A day counts only when at least one task remains completed.
- Completing multiple tasks on the same day counts once.
- Rechecking a task on the same day does not increase the streak again.
- If all tasks completed today are unchecked, deleted, cleared, or archived, today's activity is removed.
- Missing one or more days resets the current streak when the next productive day occurs.
- Best streak never decreases.
- Milestones are available at 3, 7, 30, and 100 days.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`

No build tools, package installation, backend, or database are required.

## Project Structure

```text
assets/
  icons/
  images/
  logo.png
css/
  style.css
js/
  analysis.js
  auth.js
  notifications.js
  pomodoro.js
  profile.js
  quotes.js
  script.js
  settings.js
  storage.js
  theme.js
analysis.html
forgot-password.html
index.html
profile.html
reset-password.html
settings.html
signin.html
signup.html
LICENSE
PRD.md
README.md
TRD.md
```

## Getting Started

1. Download or clone the project.
2. Open `signin.html` in a modern browser.
3. Create a local account or continue as guest.
4. Use the dashboard from `index.html`.

Because this is a static app, you can also run it with any simple local server if your browser or editor setup prefers that.

Example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/html/signin.html
```

## Main Pages

- `signin.html`: signin and guest access.
- `signup.html`: account creation.
- `forgot-password.html`: security-question verification.
- `reset-password.html`: local password reset.
- `index.html`: main dashboard and task board.
- `settings.html`: preferences, backup, restore, reset, and trash.
- `profile.html`: user profile.
- `analysis.html`: productivity analytics.

## Data Storage

TaskFlow stores data in the browser using `localStorage`.

Stored data includes:

- Users and session.
- Tasks, deleted tasks, and archived tasks.
- Categories.
- Settings and themes.
- Pomodoro timer state.
- Streak history.
- Local backup data.

Data is scoped by user email where applicable. Guest data uses the guest account key.

## Responsive Design

The layout adapts across screen sizes:

- Desktop: sidebar and dashboard content sit side by side.
- Tablet: content stacks into simpler grids.
- Mobile: forms, cards, task actions, metrics, streaks, and toolbars collapse into single-column layouts.

## Documentation

- [PRD.md](PRD.md): Product requirements, goals, user needs, features, and acceptance criteria.
- [TRD.md](TRD.md): Technical requirements, architecture, data models, storage keys, and testing checklist.
- [LICENSE](LICENSE): MIT license.

## Limitations

- Authentication is local-demo authentication only.
- Passwords and security answers are stored in `localStorage`, so this is not production-grade security.
- No backend, cloud sync, real email delivery, or cross-device synchronization.
- Clearing browser storage will remove app data unless a local backup exists.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
