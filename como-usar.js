/**
 * VoltCycle — como-usar.js
 * Reveal animado dos passos + interação do botão de "play" do vídeo.
 */
(function () {
  'use strict';

  var steps = document.querySelectorAll('.step');
  if (steps.length && 'IntersectionObserver' in window) {
    steps.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-16px)';
      el.style.transition = 'opacity .4s ease, transform .4s ease';
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    steps.forEach(function (el) { observer.observe(el); });
  }

  var playBtn = document.getElementById('videoPlay');
  var caption = document.querySelector('.video-caption');
  if (playBtn) {
    playBtn.addEventListener('click', function () {
      // Protótipo: não há vídeo real hospedado, então apenas simulamos o estado "reproduzindo".
      playBtn.textContent = '⏸';
      if (caption) caption.textContent = 'Reproduzindo… (vídeo de demonstração ainda não hospedado)';
    });
  }
})();