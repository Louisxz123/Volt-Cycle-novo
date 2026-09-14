/**
 * VoltCycle — quem-somos.js
 * Reveal animado dos cards de time/missão ao entrarem na tela.
 */
(function () {
  'use strict';

  var targets = document.querySelectorAll('.team-row, .grid-3 .card');
  if (!targets.length || !('IntersectionObserver' in window)) return;

  targets.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = 'opacity .45s ease, transform .45s ease';
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(function (el) { observer.observe(el); });
})();