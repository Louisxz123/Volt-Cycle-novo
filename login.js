/**
 * VoltCycle — login.js
 * Validação simples de front-end (protótipo, sem backend real).
 * Ao "logar" com sucesso, navega para login-sucesso.html.
 */
(function () {
  'use strict';

  var form = document.getElementById('loginForm');
  var emailField = document.getElementById('emailField');
  var passwordField = document.getElementById('passwordField');
  var email = document.getElementById('email');
  var password = document.getElementById('password');

  document.querySelectorAll('.toggle-visibility').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.dataset.target);
      var isHidden = target.type === 'password';
      target.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? '🙈' : '👁';
      btn.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
    });
  });

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    if (!isValidEmail(email.value.trim())) {
      emailField.classList.add('has-error');
      valid = false;
    } else {
      emailField.classList.remove('has-error');
    }

    if (password.value.length < 6) {
      passwordField.classList.add('has-error');
      valid = false;
    } else {
      passwordField.classList.remove('has-error');
    }

    if (!valid) return;

    // Protótipo: não há backend, então simulamos sucesso e navegamos.
    sessionStorage.setItem('voltcycle-user-email', email.value.trim());
    if (window.VoltCycleAuth) {
      window.VoltCycleAuth.setAuth({ email: email.value.trim() });
    }
    window.location.href = 'login-sucesso.html';
  });

  document.getElementById('forgotBtn').addEventListener('click', function () {
    alert('Fluxo de recuperação de senha ainda não implementado neste protótipo.');
  });
})();