/**
 * VoltCycle — referencias.js
 * Mostra um botão "voltar ao topo" após rolar a página.
 */
(function () {
  'use strict';

  var btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    btn.classList.toggle('is-visible', window.scrollY > 480);
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();