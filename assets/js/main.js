/* Interacciones generales de la landing: menú, entrada del hero y reveal al scroll */
(function () {
  'use strict';
  var A = window.anime;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Año del footer
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Menú móvil
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Enlaces de WhatsApp con mensaje predefinido
  var num = (window.DUNBER_CONFIG || {}).WHATSAPP_NUMBER || '5493516201626';
  document.querySelectorAll('a[data-wa]').forEach(function (a) {
    a.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(a.getAttribute('data-wa'));
  });

  if (!A || reduce) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }

  // Entrada del hero
  var tl = A.createTimeline({ defaults: { ease: 'outExpo', duration: 900 } });
  tl.add('.eyebrow', { opacity: [0, 1], translateY: [20, 0] }, 0)
    .add('.hero-title .line', { opacity: [0, 1], translateY: [50, 0], delay: A.stagger(130) }, 150)
    .add('.hero-lead', { opacity: [0, 1], translateY: [24, 0] }, 650)
    .add('.hero-cta .btn', { opacity: [0, 1], translateY: [24, 0], delay: A.stagger(100) }, 800)
    .add('.route .dot', { scale: [0, 1], ease: 'outBack', delay: A.stagger(220) }, 950)
    .add('.route .city', { opacity: [0, 1], translateY: [10, 0], delay: A.stagger(220) }, 1050)
    .add('.route-line', { opacity: [0, 1], duration: 1200 }, 1000);

  // Reveal al hacer scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      io.unobserve(el);
      var idx = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      A.animate(el, { opacity: [0, 1], translateY: [26, 0], duration: 800, ease: 'outCubic', delay: Math.min(idx, 6) * 90 });
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
})();
