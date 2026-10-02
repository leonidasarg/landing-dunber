/* Formulario de contacto: guarda el lead en Supabase y ofrece avisar por WhatsApp */
(function () {
  'use strict';
  var cfg = window.DUNBER_CONFIG || {};
  var form = document.getElementById('lead-form');
  if (!form) return;

  var btn = document.getElementById('submit-btn');
  var btnText = btn.querySelector('.btn-text');
  var status = document.getElementById('form-status');
  var startedAt = Date.now();

  var rules = {
    nombre: function (v) { return v.length >= 2 ? '' : 'Ingresá tu nombre.'; },
    comercio: function (v) { return v.length >= 2 ? '' : 'Ingresá el nombre de tu comercio.'; },
    telefono: function (v) { return v.replace(/\D/g, '').length >= 8 ? '' : 'Ingresá un teléfono válido (con código de área).'; },
    localidad: function (v) { return v ? '' : 'Elegí tu localidad.'; }
  };

  function setError(name, msg) {
    var el = form.elements[name];
    var out = form.querySelector('.err[data-for="' + name + '"]');
    if (out) out.textContent = msg;
    if (el) { el.classList.toggle('invalid', !!msg); el.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
  }

  function validate() {
    var ok = true;
    Object.keys(rules).forEach(function (name) {
      var msg = rules[name](form.elements[name].value.trim());
      setError(name, msg);
      if (msg) ok = false;
    });
    return ok;
  }

  Object.keys(rules).forEach(function (name) {
    form.elements[name].addEventListener('blur', function () { setError(name, rules[name](this.value.trim())); });
  });

  function waLink(data) {
    var lines = [
      '*Nuevo cliente potencial - Web Dunber*',
      'Nombre: ' + data.nombre,
      'Comercio: ' + data.comercio,
      'Teléfono: ' + data.telefono,
      'Localidad: ' + data.localidad
    ];
    if (data.tipo_comercio) lines.push('Tipo: ' + data.tipo_comercio);
    if (data.mensaje) lines.push('Mensaje: ' + data.mensaje);
    return 'https://wa.me/' + (cfg.WHATSAPP_NUMBER || '5493516201626') + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function escapeHtml(s) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return s.replace(/[&<>"']/g, function (c) { return map[c]; });
  }

  function show(kind, html) {
    status.hidden = false;
    status.className = 'form-status ' + kind;
    status.innerHTML = html;
    status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function saveLead(data) {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
      return Promise.reject(new Error('Supabase no está configurado (assets/js/config.js)'));
    }
    return fetch(cfg.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/' + (cfg.SUPABASE_TABLE || 'leads'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + cfg.SUPABASE_ANON_KEY,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error('Supabase ' + res.status + ': ' + t); });
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.hidden = true;

    // Anti-spam: honeypot + tiempo mínimo de llenado
    if (form.elements.empresa_web.value || Date.now() - startedAt < 2500) return;
    if (!validate()) {
      var first = form.querySelector('.invalid');
      if (first) first.focus();
      return;
    }

    var data = {
      nombre: form.elements.nombre.value.trim(),
      comercio: form.elements.comercio.value.trim(),
      telefono: form.elements.telefono.value.trim(),
      localidad: form.elements.localidad.value,
      tipo_comercio: form.elements.tipo_comercio.value || null,
      mensaje: form.elements.mensaje.value.trim() || null,
      origen: 'landing-dunber'
    };

    btn.disabled = true;
    btnText.textContent = 'Enviando...';

    saveLead(data).then(function () {
      form.reset();
      startedAt = Date.now();
      show('ok', '<strong>¡Gracias, ' + escapeHtml(data.nombre) + '!</strong> Recibimos tus datos y te vamos a contactar a la brevedad.' +
        '<br>Si querés una respuesta más rápida, escribinos también por WhatsApp:' +
        '<br><a class="btn" href="' + waLink(data) + '" target="_blank" rel="noopener">Enviar por WhatsApp</a>');
    }).catch(function (err) {
      console.error(err);
      show('fail', 'No pudimos guardar tu consulta en este momento. Podés enviarla igual por WhatsApp:' +
        '<br><a class="btn" href="' + waLink(data) + '" target="_blank" rel="noopener">Enviar por WhatsApp</a>');
    }).then(function () {
      btn.disabled = false;
      btnText.textContent = 'Enviar mis datos';
    });
  });
})();
