/*
 * Botella de vidrio de Coca-Cola que se vacía a medida que se hace scroll.
 * Módulo autónomo: crea su propio SVG, no depende del resto de la página.
 * Requiere anime.js v4 (global `anime`).
 */
(function () {
  'use strict';
  if (!window.anime) return;

  var animate = anime.animate;
  var createTimeline = anime.createTimeline;
  var stagger = anime.stagger;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Contorno de la botella (viewBox 0 0 120 400), simétrico respecto de x = 60
  var BOTTLE =
    'M52,22 L68,22 C69.5,22 70,26 69,32 C68.5,48 68,56 70,64 C76,84 96,96 96,128 ' +
    'C96,150 91,168 88,192 C86,206 86,216 89,232 C93,252 95,270 95,300 L95,372 ' +
    'C95,386 90,392 82,392 L38,392 C30,392 25,386 25,372 L25,300 C25,270 27,252 31,232 ' +
    'C34,216 34,206 32,192 C29,168 24,150 24,128 C24,96 44,84 50,64 C52,56 51.500,48 51,32 C50,26 50.500,22 52,22 Z';

  var LEVEL_TOP = 46;      // superficie del líquido con la botella llena (y)
  var DRAIN = 360;         // recorrido total del líquido hasta quedar vacía
  var WAVE_PERIOD = 60;

  function wavePath() {
    var d = 'M-' + WAVE_PERIOD * 2 + ',0';
    for (var x = -WAVE_PERIOD * 2; x < 180; x += WAVE_PERIOD) {
      d += ' q' + WAVE_PERIOD / 4 + ',-7 ' + WAVE_PERIOD / 2 + ',0 t' + WAVE_PERIOD / 2 + ',0';
    }
    d += ' L200,420 L-' + WAVE_PERIOD * 2 + ',420 Z';
    return d;
  }

  function crestPath() {
    var d = 'M-' + WAVE_PERIOD * 2 + ',0';
    for (var x = -WAVE_PERIOD * 2; x < 180; x += WAVE_PERIOD) {
      d += ' q' + WAVE_PERIOD / 4 + ',-7 ' + WAVE_PERIOD / 2 + ',0 t' + WAVE_PERIOD / 2 + ',0';
    }
    return d;
  }

  function bubbles(n) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var x = 34 + Math.random() * 52;
      var r = 0.9 + Math.random() * 1.8;
      out += '<circle class="bub" cx="' + x.toFixed(1) + '" cy="' + (330 - Math.random() * 40).toFixed(0) +
        '" r="' + r.toFixed(1) + '" fill="#fff" fill-opacity=".55"/>';
    }
    return out;
  }

  var host = document.createElement('div');
  host.id = 'dunber-bottle';
  host.setAttribute('aria-hidden', 'true');
  host.innerHTML =
    '<svg viewBox="0 0 120 400" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
    '<defs>' +
      '<clipPath id="db-clip"><path d="' + BOTTLE + '"/></clipPath>' +
      '<linearGradient id="db-liquid" x1="0" x2="1" y1="0" y2="0">' +
        '<stop offset="0" stop-color="#1a0402"/><stop offset=".45" stop-color="#3a0d07"/><stop offset=".8" stop-color="#2a0804"/><stop offset="1" stop-color="#120301"/>' +
      '</linearGradient>' +
      '<linearGradient id="db-glass" x1="0" x2="1" y1="0" y2="0">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".25" stop-color="#fff" stop-opacity=".06"/><stop offset=".75" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/>' +
      '</linearGradient>' +
      '<linearGradient id="db-foam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f4d9b8"/><stop offset="1" stop-color="#7a2a14"/></linearGradient>' +
    '</defs>' +
    '<g class="tilt" id="db-tilt">' +
      // Interior de vidrio
      '<path d="' + BOTTLE + '" fill="#bfe0dc" fill-opacity=".3"/>' +
      // Líquido (se vacía bajando el grupo #db-level)
      '<g clip-path="url(#db-clip)">' +
        '<g id="db-level">' +
          '<g id="db-wave"><path d="' + wavePath() + '" fill="url(#db-liquid)"/>' +
            '<path d="' + crestPath() + '" fill="none" stroke="url(#db-foam)" stroke-width="3" stroke-linecap="round" opacity=".9"/>' +
          '</g>' +
          '<g id="db-bubbles">' + bubbles(16) + '</g>' +
        '</g>' +
      '</g>' +
      // Reflejos del vidrio
      '<path d="' + BOTTLE + '" fill="url(#db-glass)"/>' +
      '<path d="M33,130 C31,160 36,190 40,216" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M32,236 C31,262 31,290 31,330" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M88,142 C89,160 87,180 86,196" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2" stroke-linecap="round"/>' +
      // Contorno
      '<path d="' + BOTTLE + '" fill="none" stroke="#2d4a47" stroke-opacity=".55" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="' + BOTTLE + '" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<path d="' + BOTTLE + '" fill="none" stroke="#5a0b11" stroke-opacity=".35" stroke-width=".8"/>' +
      // Tapa corona
      '<path d="M48,8 L72,8 L74,16 C74,20 72,22 70,22 L50,22 C48,22 46,20 46,16 Z" fill="#e61a27" stroke="#8c0b14" stroke-width="1"/>' +
      '<path d="M50,10 L50,20 M54,10 L54,20 M58,10 L58,20 M62,10 L62,20 M66,10 L66,20 M70,10 L70,20" stroke="#fff" stroke-opacity=".28" stroke-width="1"/>' +
      // Texto serigrafiado
      '<text x="60" y="168" text-anchor="middle" font-family="Yellowtail, cursive" font-size="25" fill="#fff" transform="rotate(-8 60 168)">Coca-Cola</text>' +
    '</g>' +
    '</svg>';
  document.body.appendChild(host);

  var level = host.querySelector('#db-level');
  var wave = host.querySelector('#db-wave');
  var tilt = host.querySelector('#db-tilt');
  var bubs = host.querySelectorAll('.bub');

  // Altura de la superficie con la botella llena
  level.setAttribute('transform', 'translate(0 ' + LEVEL_TOP + ')');
  wave.style.transformBox = 'view-box';

  // Línea de tiempo pausada: el scroll la recorre con seek()
  var tl = createTimeline({ autoplay: false, defaults: { ease: 'linear' } });

  // El nivel baja con el scroll. Usamos un objeto proxy para escribir el atributo transform del <g>
  var state = { y: 0 };
  tl.add(state, {
    y: DRAIN,
    duration: 1000,
    onUpdate: function () {
      level.setAttribute('transform', 'translate(0 ' + (LEVEL_TOP + state.y).toFixed(2) + ')');
    }
  }, 0);
  tl.add(tilt, { rotate: [0, -2, -3, -9], duration: 1000, ease: 'inOutSine' }, 0);

  // Entrada de la botella
  if (!reduceMotion) {
    animate(tilt, { translateY: [-30, 0], duration: 1200, ease: 'outElastic(1, .6)', delay: 300 });

    // Ondulación de la superficie
    animate(wave, { translateX: [0, -WAVE_PERIOD], duration: 1800, ease: 'linear', loop: true });

    // Burbujas ascendentes
    animate(bubs, {
      translateY: function () { return [0, -(150 + Math.random() * 220)]; },
      opacity: [{ to: .65, duration: 400 }, { to: 0, duration: 900 }],
      duration: function () { return 2200 + Math.random() * 2800; },
      delay: stagger(220, { from: 'random' }),
      ease: 'inOutSine',
      loop: true
    });
  }

  // Scroll -> progreso (0..1), con suavizado
  var target = 0;
  var current = -1;
  var ticking = false;

  function readScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (!ticking) { ticking = true; requestAnimationFrame(step); }
  }

  function step() {
    if (current < 0) current = target;
    var diff = target - current;
    current = reduceMotion || Math.abs(diff) < 0.0004 ? target : current + diff * 0.14;
    tl.seek(current * tl.duration);
    if (current !== target) requestAnimationFrame(step); else ticking = false;
  }

  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll);
  readScroll();
})();
