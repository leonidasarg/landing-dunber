/* Formulario de contacto: guarda el lead en Supabase */
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
      show('ok', '<strong>¡Gracias por contactarnos!</strong> En breve un representante de la empresa se pondrá en contacto con vos.');
    }).catch(function (err) {
      console.error(err);
      show('fail', 'No pudimos enviar tu consulta en este momento. Por favor, intentá de nuevo en unos minutos.');
    }).then(function () {
      btn.disabled = false;
      btnText.textContent = 'Enviar mis datos';
    });
  });
})();
