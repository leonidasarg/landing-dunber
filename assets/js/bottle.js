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

  // Ancho de la botella: escala horizontal respecto del eje x = 60
  var WIDTH = 1.7;
  function sx(d) {
    return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, function (m, x, y) {
      return (60 + (x - 60) * WIDTH).toFixed(1) + ',' + y;
    });
  }

  // Contorno de la botella (viewBox 0 0 120 400), simétrico respecto de x = 60
  var BOTTLE = sx(
    'M50,22 L70,22 C71,24 71,28 69.5,31 C69,45 70,58 72,70 C75,88 89,102 90,130 ' +
    'C91,152 85,176 83,198 C82,214 84,236 89,256 C92,270 92,290 91,320 ' +
    'C90,345 88,360 88,374 C88,386 84,392 77,392 L43,392 ' +
    'C36,392 32,386 32,374 C32,360 30,345 29,320 C28,290 28,270 31,256 ' +
    'C36,236 38,214 37,198 C35,176 29,152 30,130 C31,102 45,88 48,70 ' +
    'C50,58 51,45 50.5,31 C49,28 49,24 50,22 Z');

  // Estrías verticales del vidrio en las dos curvas de la botella
  function flutes() {
    var d = '';
    for (var x = 36; x <= 84; x += 6) {
      d += 'M' + x + ',104 L' + x + ',180 M' + x + ',262 L' + x + ',368 ';
    }
    return sx(d);
  }

  var LEVEL_TOP = 64;      // superficie del líquido con la botella llena (y)
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
      var x = 24 + Math.random() * 72;
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
        '<stop offset="0" stop-color="#1c0402"/><stop offset=".3" stop-color="#4f0d05"/><stop offset=".55" stop-color="#6d170a"/><stop offset=".8" stop-color="#3f0a04"/><stop offset="1" stop-color="#160301"/>' +
      '</linearGradient>' +
      '<linearGradient id="db-glass" x1="0" x2="1" y1="0" y2="0">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".25" stop-color="#fff" stop-opacity=".06"/><stop offset=".75" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/>' +
      '</linearGradient>' +
      '<linearGradient id="db-tint" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d8f0e6" stop-opacity=".35"/><stop offset=".8" stop-color="#9fd4bd" stop-opacity=".3"/><stop offset="1" stop-color="#4fa883" stop-opacity=".85"/></linearGradient>' +
      '<linearGradient id="db-label-shade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".3" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>' +
      // Pasa el logo rojo a blanco conservando su transparencia
      '<filter id="db-white" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>' +
      '<linearGradient id="db-foam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f4d9b8"/><stop offset="1" stop-color="#7a2a14"/></linearGradient>' +
    '</defs>' +
    '<g class="tilt" id="db-tilt">' +
      // Interior de vidrio
      '<path d="' + BOTTLE + '" fill="url(#db-tint)"/>' +
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
      '<rect x="0" y="372" width="120" height="22" fill="#4fa883" fill-opacity=".45" clip-path="url(#db-clip)"/>' +
      '<path d="' + flutes() + '" clip-path="url(#db-clip)" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="' + sx('M36,112 C33,135 34,160 39,184') + '" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="' + sx('M35,264 C33,290 33,320 35,352') + '" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="' + sx('M84,124 C86,145 85,165 81,186') + '" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="' + sx('M55,36 L55,64') + '" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"/>' +
      // Contorno
      '<path d="' + BOTTLE + '" fill="none" stroke="#2f6b55" stroke-opacity=".6" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="' + BOTTLE + '" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<path d="' + BOTTLE + '" fill="none" stroke="#5a0b11" stroke-opacity=".35" stroke-width=".8"/>' +
      // Tapa corona
      '<path d="' + sx('M48,8 L72,8 L74,16 C74,20 72,22 70,22 L50,22 C48,22 46,20 46,16 Z') + '" fill="#e61a27" stroke="#8c0b14" stroke-width="1"/>' +
      '<path d="' + sx('M50,10 L50,20 M54,10 L54,20 M58,10 L58,20 M62,10 L62,20 M66,10 L66,20 M70,10 L70,20') + '" stroke="#fff" stroke-opacity=".28" stroke-width="1"/>' +
      // Texto serigrafiado
      // Etiqueta roja con el logo de Coca-Cola, en la cintura de la botella
      '<g clip-path="url(#db-clip)">' +
        '<rect x="0" y="184" width="120" height="64" fill="#e61a27"/>' +
        '<rect x="0" y="184" width="120" height="64" fill="url(#db-label-shade)"/>' +
        '<rect x="0" y="186" width="120" height="1.2" fill="#fff" fill-opacity=".85"/>' +
        '<rect x="0" y="244.8" width="120" height="1.2" fill="#fff" fill-opacity=".85"/>' +
      '</g>' +
      '<image href="assets/img/marcas/coca-cola.webp" x="25" y="203" width="70" height="25.4" preserveAspectRatio="xMidYMid meet" filter="url(#db-white)"/>' +
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
