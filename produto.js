/**
 * VoltCycle — produto.js
 * Anima cards e linhas da tabela ao entrarem na viewport.
 */
(function () {
  'use strict';

  var targets = document.querySelectorAll('.grid-3 .card, .supplier-row, .tech-panel .card');
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
  }, { threshold: 0.1 });

  targets.forEach(function (el) { observer.observe(el); });
})();