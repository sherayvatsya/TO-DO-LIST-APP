# 🚀 TaskFlow – Local First Productivity Dashboard

TaskFlow is a local-first productivity dashboard built with HTML, CSS, JavaScript, and `localStorage`. It combines task management, dashboard metrics, Pomodoro focus sessions, analytics, dark mode, responsive design, and a professional streak system in a lightweight browser app.

## ✨ Features
TaskFlow offers a complete productivity experience with local authentication (Sign Up, Sign In, Guest Mode, Forgot Password, Reset Password, and Logout), smart task management (Create, Edit, Complete, Uncomplete, Delete, Restore, Archive, and Clear Completed Tasks), custom categories, task priorities, due dates, due times, and estimated durations. It also includes advanced search, filtering, and sorting, a productivity dashboard with progress tracking and daily goals, a customizable Pomodoro focus timer, daily motivational quotes, weekly and monthly productivity analytics, a professional streak system with milestones and toast notifications, dark mode, high-contrast mode, multiple color themes, local backup and restore, data reset, and a fully responsive design optimized for desktop, tablet, and mobile devices.

# 🌐 Live Demo

🚀 Live Website: https://to-do-list-app-beta-neon.vercel.app/signin.html

## 🔥 Professional Streak System

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



## 🛠 Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`

No build tools, package installation, backend, or database are required.

## 📁 Project Structure

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


## 🎨 Customization
🌙 Dark Mode
☀ Light Mode
🎨 Color Themes
♿ High Contrast Mode

## 🚀 Getting Started

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

## 💽 Data Storage

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

## 📱Responsive Design

The layout adapts across screen sizes:

- Desktop: sidebar and dashboard content sit side by side.
- Tablet: content stacks into simpler grids.
- Mobile: forms, cards, task actions, metrics, streaks, and toolbars collapse into single-column layouts.


## 📚 Documentation

- [PRD.md](PRD.md): Product requirements, goals, user needs, features, and acceptance criteria.
- [TRD.md](TRD.md): Technical requirements, architecture, data models, storage keys, and testing checklist.
- [LICENSE](LICENSE): MIT license.

## ⚠ Limitations

- Authentication is local-demo authentication only.
- Passwords and security answers are stored in `localStorage`, so this is not production-grade security.
- No backend, cloud sync, real email delivery, or cross-device synchronization.
- Clearing browser storage will remove app data unless a local backup exists.

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
