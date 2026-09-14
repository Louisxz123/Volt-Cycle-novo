/**
 * VoltCycle — cadastre-se.js
 * Validação de formulário + medidor de força de senha (protótipo, sem backend real).
 */
(function () {
  'use strict';

  var form = document.getElementById('signupForm');
  var name = document.getElementById('name');
  var email = document.getElementById('email');
  var password = document.getElementById('password');
  var confirmPassword = document.getElementById('confirmPassword');
  var strengthFill = document.getElementById('strengthFill');

  document.querySelectorAll('.toggle-visibility').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.dataset.target);
      var isHidden = target.type === 'password';
      target.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? '🙈' : '👁';
    });
  });

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function passwordScore(value) {
    var score = 0;
    if (value.length >= 6) score += 1;
    if (value.length >= 10) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score; // 0..5
  }

  password.addEventListener('input', function () {
    var score = passwordScore(password.value);
    var pct = (score / 5) * 100;
    var color = score <= 1 ? '#ef4444' : score <= 3 ? '#f59e0b' : '#22c55e';
    strengthFill.style.width = pct + '%';
    strengthFill.style.backgroundColor = color;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    toggle('nameField', name.value.trim().length < 3, function (v) { valid = valid && !v; });
    toggle('emailField', !isValidEmail(email.value.trim()), function (v) { valid = valid && !v; });
    toggle('passwordField', password.value.length < 6, function (v) { valid = valid && !v; });
    toggle('confirmField', confirmPassword.value !== password.value || confirmPassword.value === '', function (v) { valid = valid && !v; });

    if (!valid) return;

    sessionStorage.setItem('voltcycle-user-email', email.value.trim());
    sessionStorage.setItem('voltcycle-user-name', name.value.trim());
    if (window.VoltCycleAuth) {
      window.VoltCycleAuth.setAuth({ name: name.value.trim(), email: email.value.trim() });
    }
    window.location.href = 'login-sucesso.html';
  });

  function toggle(fieldId, hasError, cb) {
    var field = document.getElementById(fieldId);
    field.classList.toggle('has-error', hasError);
    cb(hasError);
  }
})();