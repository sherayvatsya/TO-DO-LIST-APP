# Technical Requirements Document

## System Summary

TaskFlow is a static, browser-based productivity application. It uses plain HTML, CSS, and JavaScript with no build step, backend, package manager, or external database. All application state is persisted in browser `localStorage`.

## Technology Stack

- Markup: HTML5
- Styling: CSS3
- Runtime: Vanilla JavaScript
- Persistence: Browser `localStorage`
- Browser APIs: DOM, Web Storage, Crypto UUID, Date, AudioContext, timers
- Assets: Static images and icons in `assets/`

## Runtime Requirements

- Modern desktop or mobile browser.
- JavaScript enabled.
- `localStorage` enabled.
- No server is required for normal usage.
- App can be opened directly from the filesystem.

## File Structure

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

## Application Architecture

### Pages

- `signin.html`: signin and guest entry.
- `signup.html`: local account registration.
- `forgot-password.html`: account lookup and security-question verification.
- `reset-password.html`: password reset after verification.
- `index.html`: main dashboard, task board, metrics, Pomodoro, quotes, and streaks.
- `settings.html`: preferences, security, backup, restore, reset, and trash.
- `profile.html`: user profile surface.
- `analysis.html`: task analytics and weekly/monthly summaries.

### JavaScript Modules

- `js/storage.js`: centralized storage utilities, local user keys, defaults, backup, restore, reset, and streak persistence.
- `js/auth.js`: local authentication, session handling, signup, signin, guest mode, forgot-password, reset-password, route protection, and logout.
- `js/script.js`: dashboard state, task CRUD, filters, sorting, drag ordering, metrics, streak synchronization, and rendering.
- `js/theme.js`: theme application, dark mode, color theme, and high contrast integration.
- `js/settings.js`: settings forms, trash restore/delete, backup, restore, reset, password changes, and security settings.
- `js/pomodoro.js`: timer state, focus/break mode, editable focus duration, persistence, and audio notification.
- `js/analysis.js`: analytics counts and seven-day completion visualization.
- `js/profile.js`, `js/quotes.js`, `js/notifications.js`: page-specific or supporting behaviors.

### CSS Responsibilities

- `css/style.css`: primary design system, layout, dashboard, widgets, forms, responsive breakpoints, dark-mode tokens, and shared components.
- `css/auth.css`: authentication-page-specific styles where used.
- `css/darkmode.css`: reserved for dark-mode-only overrides; current core tokens are in `style.css`.

## Data Model

### User

```json
{
  "id": 1234567890,
  "fullName": "Example User",
  "email": "user@example.com",
  "password": "password-value",
  "securityQuestion": "Question text",
  "securityAnswer": "answer",
  "createdAt": "2026-06-22T00:00:00.000Z"
}
```

Note: This is local demo authentication only. Passwords are not encrypted and must not be treated as production authentication.

### Session

```json
{
  "email": "user@example.com",
  "name": "Example User",
  "isGuest": false,
  "remember": true,
  "signedInAt": "2026-06-22T00:00:00.000Z"
}
```

### Task

```json
{
  "id": "uuid-or-timestamp",
  "text": "Finish assignment",
  "completed": false,
  "archived": false,
  "priority": "medium",
  "category": "Study",
  "dueDate": "2026-06-22",
  "dueTime": "18:00",
  "estimatedDuration": "30m",
  "createdAt": "2026-06-22T00:00:00.000Z",
  "updatedAt": "2026-06-22T00:00:00.000Z",
  "completedAt": ""
}
```

### Settings

```json
{
  "darkMode": false,
  "theme": "purple",
  "highContrast": false,
  "notifications": true,
  "dailyGoal": 5,
  "securityQuestion": "",
  "securityAnswer": ""
}
```

### Streaks

```json
{
  "currentStreak": 0,
  "bestStreak": 0,
  "completionHistory": {
    "2026-06-22": true
  }
}
```

### Pomodoro

```json
{
  "mode": "focus",
  "focusMinutes": 25,
  "remaining": 1500,
  "running": false,
  "updatedAt": 1780000000000
}
```

## Storage Keys

Global keys:

- `taskflow_users`
- `taskflow_session`
- `taskflow_backup`
- `taskflow_settings`
- `taskflow_theme`
- `taskflow_pomodoro`
- `taskflow_focus_history`
- `taskflow_password_reset`

Per-user keys are generated from the signed-in email:

```text
taskflow_<kind>_<email>
```

Examples:

- `taskflow_tasks_user@example.com`
- `taskflow_deleted_tasks_user@example.com`
- `taskflow_archived_tasks_user@example.com`
- `taskflow_categories_user@example.com`
- `taskflow_settings_user@example.com`
- `taskflow_streaks_user@example.com`

## Streak Algorithm Requirements

- Use local date keys in `YYYY-MM-DD` format.
- Mark today productive only when at least one non-archived task has `completed === true` and `completedAt` belongs to today.
- Delete today's completion-history entry when today has no remaining completed tasks.
- Calculate current streak from the latest productive date.
- Treat a streak as active when the latest productive date is today or yesterday.
- Return `0` for current streak when the latest productive date is older than yesterday.
- Calculate best streak from historical productive-date runs and never reduce it below the saved best value.
- Show milestone toast only when a newly productive day reaches 3, 7, 30, or 100 days.
- Show new-best toast when `bestStreak` increases.

## Responsive Requirements

- Desktop layout uses sidebar plus main stage.
- Below large tablet widths, sidebar and content stack vertically.
- Metrics collapse from four-column to two-column to one-column.
- Task composer collapses from multi-column to single-column.
- Toolbar controls and action buttons stretch to full width on mobile.
- Task cards must not overflow horizontally.
- Streak cards and milestone pills must stack cleanly on narrow screens.
- Toasts must fit within the viewport.

## Accessibility Requirements

- Use semantic headings and landmarks where possible.
- Preserve visible focus states for keyboard users.
- Provide aria labels for icon-only controls.
- Use readable color contrast in light and dark modes.
- Keep form validation messages visible and associated with user action.
- Avoid relying only on color to communicate state.

## Error Handling

- Storage reads must catch parse errors and return safe defaults.
- Missing DOM nodes should be handled defensively.
- Invalid forms should show user-facing feedback rather than throwing errors.
- Auth-protected pages should redirect users without sessions to signin.
- Backup restore should no-op safely when no backup exists.

## Performance Requirements

- No build process or dependency loading should be required for core functionality.
- Rendering should be fast for typical personal task volumes.
- Avoid unnecessary network requests.
- Use event listeners only after DOM content is available.
- Keep storage operations small and JSON-serializable.

## Security and Privacy Notes

- All data remains in the user's browser.
- No data is transmitted to a server by the app.
- Local authentication is for demo purposes only.
- Passwords and security answers are stored in `localStorage` and are not secure for production use.
- Users should not store highly sensitive information in tasks.

## Testing Checklist

- Signup, signin, guest access, logout.
- Forgot-password and reset-password flow.
- Task add, edit, complete, uncomplete, delete, restore, clear completed, archive completed.
- Search, filter, and sort.
- Due date and overdue display.
- Streak scenarios from the PRD.
- Milestone and new-best toasts.
- Dark mode, color themes, high contrast.
- Backup, restore, and reset.
- Pomodoro start, pause, reset, edit duration, and refresh persistence.
- Analytics totals and weekly bars.
- Responsive behavior at desktop, tablet, 680px, 430px, and 320px widths.

## Known Limitations

- No production authentication.
- No server persistence or sync between devices.
- No automated test suite.
- No offline service worker.
- No import/export file download flow beyond local backup storage.
