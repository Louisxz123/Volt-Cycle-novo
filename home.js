/**
 * VoltCycle — home.js
 * Pequena animação de entrada nos cards ao rolar a página.
 * Depende apenas do DOM desta página; shared/main.js cuida do tema e do menu.
 */
(function () {
  'use strict';
 
  var targets = document.querySelectorAll('.card, .saiba-mais-card');
  if (!targets.length) return;
 
  targets.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
  });
 
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }
 
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