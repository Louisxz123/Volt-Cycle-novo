/**
 * VoltCycle — shared/main.js
 * Lógica comum a todas as páginas: tema (light/dark), menu mobile e
 * o menu de usuário logado (avatar no nav, tooltip com o nome, dropdown
 * com "Trocar de conta" e "Sair").
 * Cada página deve incluir este script ANTES do seu próprio JS.
 *
 * login.js e cadastre-se.js chamam window.VoltCycleAuth.setAuth(...)
 * ao autenticar com sucesso; esta lib lê esse estado em toda página
 * que tenha uma navbar (.nav-actions / .mobile-menu).
 */

(function () {
  'use strict';

  var THEME_KEY = 'voltcycle-theme';
  var AUTH_KEY = 'voltcycle-auth';

  /* ---------------- Tema ---------------- */

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
    });
  }

  function initTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
      });
    });
  }

  /* ---------------- Menu mobile ---------------- */

  function initMobileMenu() {
    var hamburger = document.querySelector('.hamburger');
    var menu = document.querySelector('.mobile-menu');
    if (!hamburger || !menu) return;

    hamburger.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileMenu();
      });
    });
  }

  function closeMobileMenu() {
    var hamburger = document.querySelector('.hamburger');
    var menu = document.querySelector('.mobile-menu');
    if (!hamburger || !menu) return;
    menu.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* ---------------- Autenticação (protótipo, sem backend) ---------------- */

  function getAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); }
    catch (e) { return null; }
  }

  function setAuth(data) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  }

  function clearAuth() {
    localStorage.removeItem(AUTH_KEY);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function initialsFor(auth) {
    if (auth.name) {
      var parts = auth.name.trim().split(/\s+/);
      var first = parts[0] ? parts[0][0] : '';
      var last = parts.length > 1 ? parts[parts.length - 1][0] : '';
      return (first + last).toUpperCase();
    }
    if (auth.email) return auth.email.slice(0, 2).toUpperCase();
    return '👤';
  }

  function doLogout(redirectTo) {
    clearAuth();
    window.location.href = redirectTo;
  }

  function buildDesktopUserMenu(auth) {
    var wrap = document.createElement('div');
    wrap.className = 'user-menu';

    var avatar = document.createElement('button');
    avatar.type = 'button';
    avatar.className = 'user-avatar';
    avatar.textContent = initialsFor(auth);
    avatar.setAttribute('aria-haspopup', 'true');
    avatar.setAttribute('aria-expanded', 'false');
    avatar.setAttribute('aria-label', 'Menu da conta de ' + (auth.name || auth.email || 'usuário'));

    var tooltip = document.createElement('div');
    tooltip.className = 'user-tooltip';
    tooltip.textContent = auth.name || auth.email || 'Minha conta';

    var dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML =
      '<div class="user-dropdown-header">' +
        '<strong>' + escapeHtml(auth.name || 'Minha conta') + '</strong>' +
        '<span>' + escapeHtml(auth.email || '') + '</span>' +
      '</div>' +
      '<button type="button" class="switch-account">🔄 Trocar de conta</button>' +
      '<button type="button" class="logout danger">🚪 Sair</button>';

    wrap.appendChild(avatar);
    wrap.appendChild(tooltip);
    wrap.appendChild(dropdown);

    avatar.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.toggle('is-open');
      avatar.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) {
        dropdown.classList.remove('is-open');
        avatar.setAttribute('aria-expanded', 'false');
      }
    });

    dropdown.querySelector('.logout').addEventListener('click', function () {
      doLogout('index.html');
    });
    dropdown.querySelector('.switch-account').addEventListener('click', function () {
      doLogout('login.html');
    });

    return wrap;
  }

  function buildMobileUserBlock(auth) {
    var block = document.createElement('div');
    block.className = 'mobile-user-block';
    block.innerHTML =
      '<div class="mobile-user-id">' +
        '<div class="user-avatar user-avatar-static">' + escapeHtml(initialsFor(auth)) + '</div>' +
        '<div>' +
          '<div class="name">' + escapeHtml(auth.name || 'Minha conta') + '</div>' +
          '<div class="email">' + escapeHtml(auth.email || '') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-user-actions">' +
        '<button type="button" class="btn btn-outline switch-account-mobile">🔄 Trocar de conta</button>' +
        '<button type="button" class="btn btn-outline logout-mobile">🚪 Sair</button>' +
      '</div>';

    block.querySelector('.logout-mobile').addEventListener('click', function () {
      doLogout('index.html');
    });
    block.querySelector('.switch-account-mobile').addEventListener('click', function () {
      doLogout('login.html');
    });

    return block;
  }

  function initAuthUI() {
    var auth = getAuth();
    if (!auth) return;

    var desktopEntry = document.querySelector('.nav-actions a[href="login.html"]');
    if (desktopEntry) {
      desktopEntry.replaceWith(buildDesktopUserMenu(auth));
    }

    var mobileEntry = document.querySelector('.mobile-menu a[href="login.html"]');
    if (mobileEntry) {
      mobileEntry.replaceWith(buildMobileUserBlock(auth));
    }
  }

  // Exposto para login.js / cadastre-se.js gravarem o estado de sessão.
  window.VoltCycleAuth = {
    getAuth: getAuth,
    setAuth: setAuth,
    clearAuth: clearAuth,
  };

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initMobileMenu();
    initAuthUI();
  });
})();