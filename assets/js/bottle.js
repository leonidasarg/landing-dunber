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
  var WIDTH = 2;
  function sx(d) {
    return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, function (m, x, y) {
      return (60 + (x - 60) * WIDTH).toFixed(1) + ',' + y;
    });
  }

  // Contorno de la botella (viewBox 0 0 120 400), simétrico respecto de x = 60.
  // Cuello, hombros, cuerpo recto (donde va la etiqueta), cintura, curva inferior y base.
  var BOTTLE = sx(
    'M50,22 L70,22 C71,24 71,28 69.5,31 C69,50 70,68 71.5,82 C73,100 85,112 85.5,138 ' +
    'C86,165 86,205 85,232 C84.5,248 83,256 83.2,266 C83.5,285 87.5,300 87.5,322 ' +
    'C87.5,345 86,362 86,376 C86,387 82,392 76,392 L44,392 ' +
    'C38,392 34,387 34,376 C34,362 32.5,345 32.5,322 C32.5,300 36.5,285 36.8,266 ' +
    'C37,256 35.5,248 35,232 C34,205 34,165 34.5,138 C35,112 47,100 48.5,82 ' +
    'C50,68 51,50 50.5,31 C49,28 49,24 50,22 Z');

  var LABEL_TOP = 150;     // etiqueta sobre el tramo recto del cuerpo
  var LABEL_H = 62;
  var LEVEL_TOP = 64;      // superficie del líquido con la botella llena (y)
  var DRAIN = 340;         // recorrido total del líquido hasta quedar vacía
  var WAVE_PERIOD = 60;
  var LIQUID = '#170403';  // negro rojizo

  // Estrías verticales del vidrio en los hombros y en la curva inferior
  function flutes() {
    var d = '';
    for (var x = 37; x <= 83; x += 5.75) {
      d += 'M' + x + ',100 L' + x + ',' + (LABEL_TOP - 4) + ' M' + x + ',272 L' + x + ',370 ';
    }
    return sx(d);
  }

  function crestPath() {
    var d = 'M-' + WAVE_PERIOD * 2 + ',0';
    for (var x = -WAVE_PERIOD * 2; x < 180; x += WAVE_PERIOD) {
      d += ' q' + WAVE_PERIOD / 4 + ',-6 ' + WAVE_PERIOD / 2 + ',0 t' + WAVE_PERIOD / 2 + ',0';
    }
    return d;
  }

  function bubbles(n) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var x = 18 + Math.random() * 84;
      var r = 0.9 + Math.random() * 1.8;
      out += '<circle class="bub" cx="' + x.toFixed(1) + '" cy="' + (388 - Math.random() * 30).toFixed(0) +
        '" r="' + r.toFixed(1) + '" fill="#fff" fill-opacity=".6"/>';
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
      // Zona ocupada por el líquido: se achica a medida que baja el nivel
      '<clipPath id="db-liq-clip"><rect id="db-liq-rect" x="0" y="' + LEVEL_TOP + '" width="120" height="400"/></clipPath>' +
      // Sombreado fijo del líquido (no se mueve con la ola, así no parpadea)
      '<linearGradient id="db-liq-shade" gradientUnits="userSpaceOnUse" x1="0" x2="120" y1="0" y2="0">' +
        '<stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset=".28" stop-color="#5c1208" stop-opacity=".55"/>' +
        '<stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity=".35"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".75"/>' +
      '</linearGradient>' +
      '<linearGradient id="db-glass" gradientUnits="userSpaceOnUse" x1="0" x2="120" y1="0" y2="0">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".22" stop-color="#fff" stop-opacity=".05"/>' +
        '<stop offset=".78" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity=".28"/>' +
      '</linearGradient>' +
      '<linearGradient id="db-tint" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="20" y2="392">' +
        '<stop offset="0" stop-color="#d8f0e6" stop-opacity=".35"/><stop offset=".85" stop-color="#9fd4bd" stop-opacity=".3"/>' +
        '<stop offset="1" stop-color="#4fa883" stop-opacity=".85"/>' +
      '</linearGradient>' +
      '<linearGradient id="db-label-shade" gradientUnits="userSpaceOnUse" x1="0" x2="120" y1="0" y2="0">' +
        '<stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".28" stop-color="#fff" stop-opacity=".2"/>' +
        '<stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/>' +
      '</linearGradient>' +
      // Pasa el logo rojo a blanco conservando su transparencia
      '<filter id="db-white" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>' +
    '</defs>' +
    '<g class="tilt" id="db-tilt">' +
      // Interior de vidrio
      '<path d="' + BOTTLE + '" fill="url(#db-tint)"/>' +
      '<g clip-path="url(#db-clip)">' +
        // Superficie con ola: color plano para que no cambie al moverse
        '<g id="db-level"><g id="db-wave">' +
          '<path d="' + crestPath() + ' L200,420 L-' + WAVE_PERIOD * 2 + ',420 Z" fill="' + LIQUID + '"/>' +
          '<path d="' + crestPath() + '" fill="none" stroke="#b9774c" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/>' +
        '</g></g>' +
        '<g clip-path="url(#db-liq-clip)">' +
          '<rect x="0" y="0" width="120" height="400" fill="url(#db-liq-shade)"/>' +
          // Burbujas: suben dentro del líquido mientras quede líquido
          '<g id="db-bubbles">' + bubbles(18) + '</g>' +
        '</g>' +
      '</g>' +
      // Reflejos del vidrio
      '<path d="' + BOTTLE + '" fill="url(#db-glass)"/>' +
      '<rect x="0" y="374" width="120" height="20" fill="#4fa883" fill-opacity=".45" clip-path="url(#db-clip)"/>' +
      '<path d="' + flutes() + '" clip-path="url(#db-clip)" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="' + sx('M37,108 C36,120 35.5,132 36,144') + '" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="' + sx('M37.5,222 C37.5,236 38.5,250 39,262') + '" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="' + sx('M36,284 C35,305 35,330 36.5,356') + '" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="' + sx('M83,286 C84,305 84,330 83,352') + '" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="' + sx('M55,36 L55.5,76') + '" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.8" stroke-linecap="round"/>' +
      // Etiqueta roja con el logo de Coca-Cola, sobre el tramo recto del cuerpo
      '<g clip-path="url(#db-clip)">' +
        '<rect x="0" y="' + LABEL_TOP + '" width="120" height="' + LABEL_H + '" fill="#e61a27"/>' +
        '<rect x="0" y="' + LABEL_TOP + '" width="120" height="' + LABEL_H + '" fill="url(#db-label-shade)"/>' +
        '<rect x="0" y="' + (LABEL_TOP + 3) + '" width="120" height="1.2" fill="#fff" fill-opacity=".85"/>' +
        '<rect x="0" y="' + (LABEL_TOP + LABEL_H - 4.2) + '" width="120" height="1.2" fill="#fff" fill-opacity=".85"/>' +
      '</g>' +
      '<image href="assets/img/marcas/coca-cola.webp" x="18" y="' + (LABEL_TOP + LABEL_H / 2 - 15) + '" width="84" height="30" preserveAspectRatio="xMidYMid meet" filter="url(#db-white)"/>' +
      // Contorno
      '<path d="' + BOTTLE + '" fill="none" stroke="#2f6b55" stroke-opacity=".6" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="' + BOTTLE + '" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1.3" stroke-linejoin="round"/>' +
      // Tapa corona
      '<path d="M39,8 L81,8 L83,15 C83,20 81,22 79,22 L41,22 C39,22 37,20 37,15 Z" fill="#e61a27" stroke="#8c0b14" stroke-width="1"/>' +
      '<path d="M42,10 L42,20 M48,10 L48,20 M54,10 L54,20 M60,10 L60,20 M66,10 L66,20 M72,10 L72,20 M78,10 L78,20" stroke="#fff" stroke-opacity=".28" stroke-width="1"/>' +
    '</g>' +
    '</svg>';
  document.body.appendChild(host);

  var level = host.querySelector('#db-level');
  var liqRect = host.querySelector('#db-liq-rect');
  var wave = host.querySelector('#db-wave');
  var tilt = host.querySelector('#db-tilt');
  var bubs = host.querySelectorAll('.bub');

  function setLevel(y) {
    level.setAttribute('transform', 'translate(0 ' + y.toFixed(2) + ')');
    liqRect.setAttribute('y', (y + 1).toFixed(2));
  }
  setLevel(LEVEL_TOP);
  wave.style.transformBox = 'view-box';

  // Línea de tiempo pausada: el scroll la recorre con seek()
  var tl = createTimeline({ autoplay: false, defaults: { ease: 'linear' } });

  // El nivel baja con el scroll. Usamos un objeto proxy para escribir los atributos del SVG
  var state = { y: 0 };
  tl.add(state, {
    y: DRAIN,
    duration: 1000,
    onUpdate: function () { setLevel(LEVEL_TOP + state.y); }
  }, 0);
  tl.add(tilt, { rotate: [0, -2, -3, -9], duration: 1000, ease: 'inOutSine' }, 0);

  // Burbujas ascendentes: siempre activas
  animate(bubs, {
    translateY: function () { return [0, -(60 + Math.random() * 280)]; },
    opacity: [{ to: .7, duration: 400 }, { to: 0, duration: 900 }],
    duration: function () { return 2200 + Math.random() * 2800; },
    delay: stagger(200, { from: 'random' }),
    ease: 'inOutSine',
    loop: true
  });

  if (!reduceMotion) {
    // Entrada de la botella
    animate(tilt, { translateY: [-30, 0], duration: 1200, ease: 'outElastic(1, .6)', delay: 300 });
    // Ondulación de la superficie
    animate(wave, { translateX: [0, -WAVE_PERIOD], duration: 1800, ease: 'linear', loop: true });
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
