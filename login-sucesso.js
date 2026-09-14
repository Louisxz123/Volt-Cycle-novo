/**
 * VoltCycle — login-sucesso.js
 * Anima a barra de progresso até 100% e então redireciona para index.html.
 * Se um nome/e-mail foi salvo pelo login/cadastro, personaliza a saudação.
 */
(function () {
  'use strict';

  var name = sessionStorage.getItem('voltcycle-user-name');
  var welcomeMsg = document.getElementById('welcomeMsg');
  if (name && welcomeMsg) {
    welcomeMsg.textContent = 'Bem-vindo, ' + name + '! Redirecionando para o painel...';
  }

  var fill = document.getElementById('progressFill');
  var pct = document.getElementById('progressPct');
  var caption = document.getElementById('progressCaption');

  var steps = [
    { at: 0, text: 'Verificando credenciais...' },
    { at: 35, text: 'Sincronizando módulo VoltCycle...' },
    { at: 70, text: 'Abrindo painel de monitoramento...' },
    { at: 100, text: 'Tudo pronto!' },
  ];

  var progress = 0;
  var interval = setInterval(function () {
    progress = Math.min(100, progress + 4);
    fill.style.width = progress + '%';
    pct.textContent = progress + '%';

    var current = steps.filter(function (s) { return progress >= s.at; }).pop();
    if (current) caption.textContent = current.text;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(function () { window.location.href = 'index.html'; }, 500);
    }
  }, 90);

  document.getElementById('skipBtn').addEventListener('click', function () {
    clearInterval(interval);
  });
})();