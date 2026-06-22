'use strict';

const USERS_KEY = 'taskflow_users';
const SESSION_KEY = 'taskflow_session';
const RESET_KEY = 'taskflow_password_reset';

const auth = {
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (error) {
      console.warn('Could not read registered users:', error);
      return [];
    }
  },

  saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (error) {
      console.warn('Could not read session:', error);
      return null;
    }
  },

  setSession(user, remember) {
    const session = {
      email: user.email,
      name: user.fullName || user.name || 'User',
      isGuest: Boolean(user.isGuest),
      remember: Boolean(remember),
      signedInAt: new Date().toISOString()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'signin.html';
  }
};

window.auth = auth;

function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeAnswer(answer) {
  return answer.trim().toLowerCase();
}

function getValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : '';
}

function setFieldError(id, message) {
  const input = document.getElementById(id);
  const error = document.querySelector(`[data-error-for="${id}"]`);

  if (input) {
    input.closest('.field')?.classList.toggle('is-invalid', Boolean(message));
  }

  if (error) {
    error.textContent = message || '';
  }
}

function clearFieldError(id) {
  setFieldError(id, '');
}

function setSuccessMessage(id, message) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message || '';
  element.classList.toggle('visible', Boolean(message));
}

function setLoading(button, isLoading) {
  if (!button) return;
  button.classList.toggle('is-loading', isLoading);
  button.disabled = isLoading || button.dataset.ready !== 'true';
}

function findUserByEmail(users, email) {
  return users.find(user => String(user.email || '').toLowerCase() === email);
}

function initPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;

      const willShow = input.type === 'password';
      input.type = willShow ? 'text' : 'password';
      button.setAttribute('aria-label', willShow ? 'Hide password' : 'Show password');
    });
  });
}

function initSignIn() {
  const form = document.getElementById('signinForm');
  if (!form) return;

  const emailInput = document.getElementById('signinEmail');
  const passwordInput = document.getElementById('signinPassword');
  const rememberInput = document.getElementById('rememberMe');
  const button = document.getElementById('signinButton');

  function updateButtonState() {
    const ready = emailInput.value.trim() !== '' && passwordInput.value.trim() !== '';
    button.dataset.ready = String(ready);
    button.disabled = !ready;
  }

  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
      clearFieldError(input.id);
      updateButtonState();
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const email = getValue('signinEmail').toLowerCase();
    const password = getValue('signinPassword');
    const users = auth.getUsers();
    let hasError = false;

    if (!email) {
      setFieldError('signinEmail', 'Email is required.');
      hasError = true;
    } else if (!emailIsValid(email)) {
      setFieldError('signinEmail', 'Enter a valid email address.');
      hasError = true;
    }

    if (!password) {
      setFieldError('signinPassword', 'Password is required.');
      hasError = true;
    }

    if (hasError) return;

    const user = users.find(item => String(item.email || '').toLowerCase() === email && item.password === password);
    if (!user) {
      setFieldError('signinPassword', 'Email or password is incorrect.');
      return;
    }

    button.dataset.ready = 'true';
    setLoading(button, true);

    window.setTimeout(() => {
      auth.setSession(user, rememberInput.checked);
      window.location.href = 'index.html';
    }, 700);
  });

  updateButtonState();
}

function initGuestAccess() {
  const guestButton = document.getElementById('guestButton');
  if (!guestButton) return;

  guestButton.addEventListener('click', () => {
    auth.setSession({
      email: 'guest@taskflow.local',
      fullName: 'Guest',
      isGuest: true
    }, false);

    window.location.href = 'index.html';
  });
}

function initSignUp() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const fields = [
    'signupName',
    'signupEmail',
    'signupPassword',
    'confirmPassword',
    'securityQuestion',
    'securityAnswer'
  ];
  const button = document.getElementById('signupButton');

  function updateButtonState() {
    const ready = fields.every(id => getValue(id) !== '');
    button.dataset.ready = String(ready);
    button.disabled = !ready;
  }

  fields.forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      clearFieldError(id);
      updateButtonState();
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const fullName = getValue('signupName');
    const email = getValue('signupEmail').toLowerCase();
    const password = getValue('signupPassword');
    const confirmPassword = getValue('confirmPassword');
    const securityQuestion = getValue('securityQuestion');
    const securityAnswer = getValue('securityAnswer');
    const users = auth.getUsers();
    let hasError = false;

    if (!fullName) {
      setFieldError('signupName', 'Full name is required.');
      hasError = true;
    }

    if (!email) {
      setFieldError('signupEmail', 'Email is required.');
      hasError = true;
    } else if (!emailIsValid(email)) {
      setFieldError('signupEmail', 'Enter a valid email address.');
      hasError = true;
    } else if (findUserByEmail(users, email)) {
      setFieldError('signupEmail', 'An account with this email already exists.');
      hasError = true;
    }

    if (!password) {
      setFieldError('signupPassword', 'Password is required.');
      hasError = true;
    } else if (password.length < 8) {
      setFieldError('signupPassword', 'Password must be at least 8 characters.');
      hasError = true;
    }

    if (!confirmPassword) {
      setFieldError('confirmPassword', 'Confirm your password.');
      hasError = true;
    } else if (confirmPassword !== password) {
      setFieldError('confirmPassword', 'Passwords do not match.');
      hasError = true;
    }

    if (!securityQuestion) {
      setFieldError('securityQuestion', 'Choose a security question.');
      hasError = true;
    }

    if (!securityAnswer) {
      setFieldError('securityAnswer', 'Security answer is required.');
      hasError = true;
    }

    if (hasError) return;

    button.dataset.ready = 'true';
    setLoading(button, true);

    window.setTimeout(() => {
      users.push({
        id: Date.now(),
        fullName,
        email,
        password,
        securityQuestion,
        securityAnswer,
        createdAt: new Date().toISOString()
      });

      auth.saveUsers(users);
      window.location.href = 'signin.html';
    }, 700);
  });

  updateButtonState();
}

function initForgotPassword() {
  const form = document.getElementById('forgotPasswordForm');
  if (!form) return;

  const emailInput = document.getElementById('forgotEmail');
  const answerInput = document.getElementById('forgotSecurityAnswer');
  const answerGroup = document.getElementById('securityAnswerGroup');
  const questionCard = document.getElementById('securityQuestionCard');
  const questionText = document.getElementById('displaySecurityQuestion');
  const button = document.getElementById('forgotPasswordButton');
  const buttonText = document.getElementById('forgotButtonText');
  let verifiedUser = null;

  function showQuestion(user) {
    verifiedUser = user;
    questionText.textContent = user.securityQuestion || '';
    questionCard.classList.add('visible');
    answerGroup.hidden = false;
    buttonText.textContent = 'Verify Answer';
    button.dataset.ready = String(answerInput.value.trim() !== '');
    button.disabled = answerInput.value.trim() === '';
    answerInput.focus();
  }

  function resetQuestionStep() {
    verifiedUser = null;
    questionText.textContent = '';
    questionCard.classList.remove('visible');
    answerGroup.hidden = true;
    answerInput.value = '';
    clearFieldError('forgotSecurityAnswer');
    buttonText.textContent = 'Find Account';
  }

  function updateButtonState() {
    const ready = verifiedUser ? answerInput.value.trim() !== '' : emailInput.value.trim() !== '';
    button.dataset.ready = String(ready);
    button.disabled = !ready;
  }

  emailInput.addEventListener('input', () => {
    clearFieldError('forgotEmail');
    resetQuestionStep();
    updateButtonState();
  });

  answerInput.addEventListener('input', () => {
    clearFieldError('forgotSecurityAnswer');
    updateButtonState();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const email = getValue('forgotEmail').toLowerCase();
    const users = auth.getUsers();

    if (!verifiedUser) {
      if (!email) {
        setFieldError('forgotEmail', 'Email is required.');
        return;
      }

      if (!emailIsValid(email)) {
        setFieldError('forgotEmail', 'Enter a valid email address.');
        return;
      }

      const user = findUserByEmail(users, email);
      if (!user) {
        setFieldError('forgotEmail', 'No account exists with this email.');
        return;
      }

      if (!user.securityQuestion || !user.securityAnswer) {
        setFieldError('forgotEmail', 'This account does not have a security question set.');
        return;
      }

      showQuestion(user);
      return;
    }

    const answer = getValue('forgotSecurityAnswer');
    if (!answer) {
      setFieldError('forgotSecurityAnswer', 'Security answer is required.');
      return;
    }

    if (normalizeAnswer(answer) !== normalizeAnswer(verifiedUser.securityAnswer)) {
      setFieldError('forgotSecurityAnswer', 'Security answer does not match.');
      return;
    }

    button.dataset.ready = 'true';
    setLoading(button, true);

    window.setTimeout(() => {
      localStorage.setItem(RESET_KEY, JSON.stringify({
        email: verifiedUser.email,
        verifiedAt: new Date().toISOString()
      }));
      window.location.href = 'reset-password.html';
    }, 500);
  });

  updateButtonState();
}

function initResetPassword() {
  const form = document.getElementById('resetPasswordForm');
  if (!form) return;

  let resetState = null;
  try {
    resetState = JSON.parse(localStorage.getItem(RESET_KEY));
  } catch (error) {
    resetState = null;
  }

  if (!resetState?.email) {
    window.location.href = 'forgot-password.html';
    return;
  }

  const fields = ['resetPassword', 'resetConfirmPassword'];
  const button = document.getElementById('resetPasswordButton');

  function updateButtonState() {
    const ready = fields.every(id => getValue(id) !== '');
    button.dataset.ready = String(ready);
    button.disabled = !ready;
  }

  fields.forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      clearFieldError(id);
      setSuccessMessage('resetSuccess', '');
      updateButtonState();
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const password = getValue('resetPassword');
    const confirmPassword = getValue('resetConfirmPassword');
    const users = auth.getUsers();
    const user = findUserByEmail(users, resetState.email.toLowerCase());
    let hasError = false;

    if (!user) {
      localStorage.removeItem(RESET_KEY);
      window.location.href = 'forgot-password.html';
      return;
    }

    if (!password) {
      setFieldError('resetPassword', 'New password is required.');
      hasError = true;
    } else if (password.length < 8) {
      setFieldError('resetPassword', 'Password must be at least 8 characters.');
      hasError = true;
    }

    if (!confirmPassword) {
      setFieldError('resetConfirmPassword', 'Confirm your new password.');
      hasError = true;
    } else if (confirmPassword !== password) {
      setFieldError('resetConfirmPassword', 'Passwords do not match.');
      hasError = true;
    }

    if (hasError) return;

    button.dataset.ready = 'true';
    setLoading(button, true);

    window.setTimeout(() => {
      user.password = password;
      user.passwordUpdatedAt = new Date().toISOString();
      auth.saveUsers(users);
      localStorage.removeItem(RESET_KEY);
      localStorage.removeItem(SESSION_KEY);
      button.classList.remove('is-loading');
      button.disabled = true;
      setSuccessMessage('resetSuccess', 'Password updated successfully.');

      window.setTimeout(() => {
        window.location.href = 'signin.html';
      }, 1000);
    }, 700);
  });

  updateButtonState();
}

function protectDashboard() {
  if (!document.body.classList.contains('app-body')) return null;

  const session = auth.getSession();
  if (!session) {
    window.location.href = 'signin.html';
    return null;
  }

  const greeting = document.getElementById('userGreeting');
  if (greeting) {
    const displayName = session.name || 'User';
    greeting.textContent = session.isGuest ? 'Guest mode' : `Hi, ${displayName.split(' ')[0]}`;
  }

  return session;
}

function initLogout() {
  const logoutButton = document.getElementById('logoutBtn');
  if (!logoutButton) return;
  logoutButton.addEventListener('click', auth.logout);
}

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initSignIn();
  initSignUp();
  initGuestAccess();
  initForgotPassword();
  initResetPassword();
  protectDashboard();
  initLogout();
});
