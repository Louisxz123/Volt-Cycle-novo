/**
 * VoltCycle — jogo.js
 * Simulador funcional do painel do módulo VoltCycle.
 * Regras:
 *  - Velocidade é controlada pelos botões Acelerar/Desacelerar (0–45 km/h).
 *  - BPM sobe com a velocidade (+ ruído aleatório). Fora de 50–160 BPM = alerta.
 *  - Bateria cai proporcionalmente à velocidade; acima de 20km/h ela é
 *    parcialmente recarregada pelo dínamo cinético (regra do produto).
 *  - Pontuação cresce mais rápido quanto maior a velocidade sustentada.
 *  - Recorde de pontuação é salvo em localStorage.
 */
(function () {
  'use strict';

  var els = {
    score: document.getElementById('scoreValue'),
    bpm: document.getElementById('bpmValue'),
    battery: document.getElementById('batteryValue'),
    distance: document.getElementById('distanceValue'),
    record: document.getElementById('recordValue'),
    bpmBar: document.getElementById('bpmBar'),
    bpmStatus: document.getElementById('bpmStatus'),
    batteryBar: document.getElementById('batteryBar'),
    batteryStatus: document.getElementById('batteryStatus'),
    speedBar: document.getElementById('speedBar'),
    speedStatus: document.getElementById('speedStatus'),
    toggleBtn: document.getElementById('toggleBtn'),
    btnFaster: document.getElementById('btnFaster'),
    btnSlower: document.getElementById('btnSlower'),
  };

  if (!els.toggleBtn) return; // guard: script incluído em página sem o jogo

  var RECORD_KEY = 'voltcycle-record';
  var MAX_SPEED = 45;
  var TICK_MS = 400;

  var state = {
    running: false,
    speed: 0,
    bpm: 75,
    battery: 100,
    distance: 0,
    score: 0,
    timer: null,
  };

  els.record.textContent = localStorage.getItem(RECORD_KEY) || '0';

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function render() {
    els.score.textContent = Math.floor(state.score);
    els.bpm.textContent = Math.round(state.bpm);
    els.battery.textContent = Math.round(state.battery) + '%';
    els.distance.textContent = state.distance.toFixed(1) + 'km';
    els.speedStatus.textContent = Math.round(state.speed) + ' km/h';
    els.speedBar.style.width = clamp((state.speed / MAX_SPEED) * 100, 0, 100) + '%';
    els.batteryBar.style.width = clamp(state.battery, 0, 100) + '%';

    var bpmPct = clamp(((state.bpm - 40) / (180 - 40)) * 100, 0, 100);
    els.bpmBar.style.width = bpmPct + '%';
    els.bpmBar.classList.remove('warn', 'danger');
    if (state.bpm < 50 || state.bpm > 160) {
      els.bpmBar.classList.add('danger');
      els.bpmStatus.textContent = '⚠️ Fora da faixa segura';
    } else if (state.bpm > 140) {
      els.bpmBar.classList.add('warn');
      els.bpmStatus.textContent = 'Elevada';
    } else {
      els.bpmStatus.textContent = 'Normal';
    }

    if (state.battery < 20) els.batteryStatus.textContent = 'Baixa';
    else if (state.battery < 60) els.batteryStatus.textContent = 'Moderada';
    else els.batteryStatus.textContent = 'Boa';
  }

  function tick() {
    // BPM segue a velocidade com pequena variação aleatória (base 70 + esforço)
    var targetBpm = 70 + state.speed * 1.9;
    state.bpm += (targetBpm - state.bpm) * 0.25 + (Math.random() * 6 - 3);
    state.bpm = clamp(state.bpm, 55, 190);

    // Bateria: consumo proporcional à velocidade, recarga cinética acima de 20km/h
    var drain = state.speed * 0.045;
    var regen = state.speed > 20 ? (state.speed - 20) * 0.015 : 0;
    state.battery = clamp(state.battery - drain + regen, 0, 100);

    // Distância e pontuação
    state.distance += state.speed * (TICK_MS / 3600000);
    state.score += state.speed * 0.6 + (state.speed > 15 ? 2 : 0);

    render();

    if (state.battery <= 0) {
      endRun('Bateria esgotada! ');
    }
  }

  function startRun() {
    state.running = true;
    state.speed = state.speed || 12;
    els.toggleBtn.textContent = '⏸ Pausar Trajeto';
    els.toggleBtn.classList.add('is-running');
    state.timer = setInterval(tick, TICK_MS);
  }

  function pauseRun() {
    state.running = false;
    clearInterval(state.timer);
    els.toggleBtn.textContent = '▶ Continuar Trajeto';
    els.toggleBtn.classList.remove('is-running');
  }

  function endRun(reason) {
    pauseRun();
    var record = parseInt(localStorage.getItem(RECORD_KEY) || '0', 10);
    if (Math.floor(state.score) > record) {
      localStorage.setItem(RECORD_KEY, String(Math.floor(state.score)));
      els.record.textContent = String(Math.floor(state.score));
      alert(reason + 'Novo recorde: ' + Math.floor(state.score) + ' pontos!');
    } else {
      alert(reason + 'Pontuação final: ' + Math.floor(state.score) + ' pontos.');
    }
    els.toggleBtn.textContent = '↻ Reiniciar Trajeto';
    state.speed = 0; state.bpm = 75; state.battery = 100; state.distance = 0; state.score = 0;
    render();
  }

  els.toggleBtn.addEventListener('click', function () {
    if (state.running) { pauseRun(); }
    else { startRun(); }
  });

  els.btnFaster.addEventListener('click', function () {
    state.speed = clamp(state.speed + 5, 0, MAX_SPEED);
    if (!state.running) render();
  });

  els.btnSlower.addEventListener('click', function () {
    state.speed = clamp(state.speed - 5, 0, MAX_SPEED);
    if (!state.running) render();
  });

  render();
})();