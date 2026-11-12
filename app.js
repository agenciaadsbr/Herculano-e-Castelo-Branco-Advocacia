(function () {
  'use strict';
  var C = window.LP_CONFIG || {};
  var REST = C.supabaseUrl + '/rest/v1/';
  var B = document.body.dataset;
  var SITE = B.site || C.site;
  var REDIRECT = B.redirect || '/redirect';
  var AREA_KEY = 'hcb_area';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function lget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // ---------- rastreamento (só carrega se o ID estiver configurado) ----------
  if (C.gtmId) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var g = document.createElement('script'); g.async = true;
    g.src = 'https://www.googletagmanager.com/gtm.js?id=' + C.gtmId;
    document.head.appendChild(g);
  }
  if (C.metaPixelId) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', C.metaPixelId);
    window.fbq('track', 'PageView');
  }

  // ---------- origem / UTM ----------
  var params = new URLSearchParams(location.search);
  var utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'].forEach(function (k) {
    if (params.get(k)) utm[k] = params.get(k);
  });
  if (Object.keys(utm).length) sset('hcb_utm', JSON.stringify(utm));
  var stored = {};
  try { stored = JSON.parse(sget('hcb_utm') || '{}'); } catch (e) {}
  function refHost() { try { return document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { return ''; } }
  if (sget('hcb_ref') === null) sset('hcb_ref', refHost());
  function origem() {
    if (stored.utm_source || stored.utm_medium || stored.utm_campaign) {
      return [stored.utm_source, stored.utm_medium, stored.utm_campaign, stored.utm_content].filter(Boolean).join(' / ');
    }
    if (stored.gclid) return 'google / cpc';
    if (stored.fbclid) return 'facebook / social';
    return sget('hcb_ref') || 'direto';
  }

  // ---------- Supabase (REST, só INSERT) ----------
  function insert(table, row) {
    return fetch(REST + table, {
      method: 'POST',
      headers: {
        apikey: C.supabaseAnonKey,
        Authorization: 'Bearer ' + C.supabaseAnonKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(row),
      keepalive: true
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r; });
  }
  insert('lp_visits', { site: SITE, path: location.pathname + location.search, referrer: document.referrer || null }).catch(function () {});

  function track(name, data) {
    data = data || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, data));
    if (typeof window.fbq === 'function') {
      if (name === 'lead_submit') window.fbq('track', 'Lead', data);
      else if (name === 'cta_click') window.fbq('trackCustom', 'CTAClick', data);
    }
    if (typeof window.gtag === 'function') window.gtag('event', name === 'lead_submit' ? 'generate_lead' : name, data);
  }

  // ---------- dados institucionais opcionais ----------
  function fill(sel, val, fmt) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (!val) { el.remove(); return; }
      el.textContent = fmt ? fmt(val) : val;
      el.hidden = false;
    });
  }
  fill('[data-cfg="oabSociedade"]', C.oabSociedade);
  fill('[data-cfg="endereco"]', C.endereco);
  fill('[data-cfg="email"]', C.email);
  fill('[data-cfg="instagram"]', C.instagram, function (v) { return '@' + String(v).replace(/^@/, ''); });
  (C.advogados || []).forEach(function (a, i) {
    var card = document.querySelector('[data-socio="' + i + '"]');
    if (!card) return;
    var oab = card.querySelector('.socio-oab');
    if (a.oab && oab) { oab.textContent = a.oab; oab.hidden = false; } else if (oab) oab.remove();
    if (a.foto) {
      var fig = card.querySelector('.socio-foto');
      fig.innerHTML = '';
      var img = new Image(); img.src = a.foto; img.alt = a.nome + ', sócio da HCB'; img.loading = 'lazy'; img.width = 480; img.height = 600;
      fig.appendChild(img); fig.classList.add('has-photo');
    }
  });

  // ---------- CTAs e área de interesse ----------
  document.addEventListener('click', function (e) {
    var cta = e.target.closest('[data-cta]');
    if (!cta) return;
    var area = cta.getAttribute('data-area');
    if (area) sset(AREA_KEY, area);
    track('cta_click', { local: cta.getAttribute('data-cta'), area: area || '' });
    var href = cta.getAttribute('href') || '';
    if (href.charAt(0) === '#' && href.length > 1) {
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', location.pathname + location.search + href);
      if (target.querySelector('.lead-form')) {
        setTimeout(function () { var n = target.querySelector('input[name="nome"]'); if (n) try { n.focus({ preventScroll: true }); } catch (x) {} }, 650);
      }
    }
  });

  // ---------- FAQ ----------
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    var panel = item.querySelector('.faq-a');
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-q[aria-expanded="true"]').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.closest('.faq-item').querySelector('.faq-a').hidden = true;
      });
      if (!open) { btn.setAttribute('aria-expanded', 'true'); panel.hidden = false; track('faq_open', { pergunta: btn.textContent.trim().slice(0, 60) }); }
    });
  });

  // ---------- header e barra de contato ----------
  var header = document.querySelector('.site-header');
  var bar = document.getElementById('mbar');
  var hero = document.querySelector('.hero');
  var forms = Array.prototype.slice.call(document.querySelectorAll('.lead-form'));
  var pastHero = false, visibleForms = 0;
  function updBar() { if (bar) bar.classList.toggle('on', pastHero && visibleForms === 0); }
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (e) {
      pastHero = !e[0].isIntersecting;
      if (header) header.classList.toggle('solid', window.scrollY > 40);
      updBar();
    }, { threshold: 0.02, rootMargin: '-40% 0px 0px 0px' }).observe(hero);
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target._vis = en.isIntersecting; });
      visibleForms = forms.filter(function (f) { return f._vis; }).length;
      updBar();
    }, { threshold: 0.2 });
    forms.forEach(function (f) { fio.observe(f); });
  }
  window.addEventListener('scroll', function () { if (header) header.classList.toggle('solid', window.scrollY > 40); }, { passive: true });

  // ---------- parallax do fundo da seção de contato ----------
  var pbg = document.querySelector('.final-bg');
  if (pbg && !reduce) {
    var sec = pbg.parentNode, ticking = false;
    var paint = function () {
      ticking = false;
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height); // -0,5 … 0,5
      pbg.style.transform = 'translate3d(0,' + (p * 22).toFixed(2) + '%,0)';
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    window.addEventListener('resize', paint);
    paint();
  }

  // ---------- formulários ----------
  function maskPhone(inp) {
    var d = inp.value.replace(/\D/g, '');
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
    d = d.slice(0, 11);
    var f = d;
    if (d.length > 2) f = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 6) f = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    inp.value = f;
  }

  forms.forEach(function (form) {
    var nome = form.querySelector('input[name="nome"]');
    var wpp = form.querySelector('input[name="whatsapp"]');
    var erro = form.querySelector('.form-erro');
    var btn = form.querySelector('button[type="submit"]');
    var label = btn.querySelector('.btn-label');
    var original = label.textContent;
    var sending = false;

    wpp.addEventListener('input', function () { maskPhone(wpp); wpp.removeAttribute('aria-invalid'); });
    nome.addEventListener('input', function () { nome.removeAttribute('aria-invalid'); });

    function showError(msg, el) {
      erro.textContent = msg;
      erro.hidden = false;
      if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      erro.hidden = true;
      var n = nome.value.replace(/\s+/g, ' ').trim();
      var digits = wpp.value.replace(/\D/g, '');
      if (n.length < 3 || !/[A-Za-zÀ-ÿ]{2}/.test(n)) return showError('Digite seu nome para a equipe saber com quem vai falar.', nome);
      var ddd = +digits.slice(0, 2);
      if (digits.length < 10 || digits.length > 11 || ddd < 11 || ddd > 99 || (digits.length === 11 && digits[2] !== '9') || /^(\d)\1+$/.test(digits)) {
        return showError('Confira seu WhatsApp: DDD + número, como (85) 99999-9999.', wpp);
      }

      sending = true;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      label.textContent = 'Enviando…';

      var area = sget(AREA_KEY) || '';
      var row = { site: SITE, nome: n.slice(0, 120), whatsapp: digits, origem: origem().slice(0, 240) };
      if (area) row.servico = area;

      var done = false;
      function go() {
        if (done) return; done = true;
        var q = new URLSearchParams(location.search);
        q.set('n', n.split(' ')[0]);
        if (area) q.set('a', area);
        location.href = REDIRECT + '?' + q.toString();
      }

      // evita lead duplicado: mesmo número enviado há menos de 30 min só redireciona
      var lastKey = 'hcb_lead_' + digits;
      if (Date.now() - (+lget(lastKey) || 0) < 30 * 60 * 1000) { go(); return; }

      track('lead_submit', { area: area || 'geral', form: form.getAttribute('data-form') || '' });
      insert('lp_leads', row).then(function () { lset(lastKey, String(Date.now())); go(); }).catch(function () {
        insert('lp_leads', row).then(function () { lset(lastKey, String(Date.now())); }).catch(function () {}).then(go);
      });
      setTimeout(go, 5000);
    });

    window.addEventListener('pageshow', function (ev) {
      if (ev.persisted) { sending = false; btn.disabled = false; btn.removeAttribute('aria-busy'); label.textContent = original; }
    });
  });
})();
