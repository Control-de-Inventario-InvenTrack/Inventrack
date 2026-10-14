import {
  authenticateUser,
  ensureAdminUser,
  registerUser,
  resetPassword
} from './auth.js';

const loginForm = document.getElementById('form-login');
const initialization = ensureAdminUser();

function showMessage(element, message, isError = true) {
  element.textContent = message;
  element.hidden = false;
  element.classList.toggle('error-message', isError);
  element.classList.toggle('success-message', !isError);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.hidden = false;
  modal.classList.add('is-open');
  modal.querySelector('input').focus();
}

function closeModal(modal) {
  modal.classList.remove('is-open');
  modal.hidden = true;
}

function showError(element, error) {
  showMessage(element, error instanceof Error ? error.message : 'Ocurrió un error al procesar la solicitud.');
}

document.getElementById('open-register-modal').addEventListener('click', () => openModal('modal-register'));
document.getElementById('open-reset-modal').addEventListener('click', () => openModal('modal-reset'));
document.querySelectorAll('.close-modal').forEach(button => {
  button.addEventListener('click', () => closeModal(button.closest('.modal-overlay')));
});
document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal);
  });
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const errorMessage = document.getElementById('login-error');
  errorMessage.hidden = true;

  try {
    await initialization;
    await authenticateUser(
      document.getElementById('login-user').value,
      document.getElementById('login-pass').value
    );
    window.location.replace('index.html');
  } catch (error) {
    showError(errorMessage, error);
  }
});

document.getElementById('form-register').addEventListener('submit', async event => {
  event.preventDefault();
  const message = document.getElementById('register-msg');
  message.hidden = true;

  const password = document.getElementById('register-pass').value;
  if (password !== document.getElementById('register-confirm-pass').value) {
    showMessage(message, 'Las contraseñas no coinciden.');
    return;
  }

  try {
    await initialization;
    await registerUser({
      username: document.getElementById('register-user').value,
      email: document.getElementById('register-email').value,
      password
    });
    window.location.replace('index.html');
  } catch (error) {
    showError(message, error);
  }
});

document.getElementById('form-reset').addEventListener('submit', async event => {
  event.preventDefault();
  const message = document.getElementById('reset-msg');
  message.hidden = true;

  const password = document.getElementById('reset-new-pass').value;
  if (password !== document.getElementById('reset-confirm-pass').value) {
    showMessage(message, 'Las contraseñas no coinciden.');
    return;
  }

  try {
    await initialization;
    await resetPassword(document.getElementById('reset-user').value, password);
    showMessage(message, 'Contraseña actualizada. Ya puedes iniciar sesión.', false);
    document.getElementById('form-reset').reset();
  } catch (error) {
    showError(message, error);
  }
});

initialization.catch(error => {
  showError(document.getElementById('login-error'), error);
});
