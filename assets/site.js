/* Danka Study — shared JS: nav toggle + JSON list renderers */
document.addEventListener('DOMContentLoaded', function () {
  var t = document.getElementById('navToggle'), n = document.getElementById('mainNav');
  if (t && n) {
    t.addEventListener('click', function () {
      var open = n.classList.toggle('open');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  if (document.getElementById('latestJobs')) renderLatest();
  if (document.getElementById('jobsList')) renderFull('jobsList', 'data/jobs.json', jobCard, 'भर्ती');
  if (document.getElementById('resultsList')) renderFull('resultsList', 'data/results.json', resultCard, 'रिजल्ट');
  if (document.getElementById('answerKeysList')) renderFull('answerKeysList', 'data/answerkeys.json', answerKeyCard, 'आंसर की');
  if (document.getElementById('cutoffBody')) renderCutoffs();
});

function fetchJSON(path, fallback) {
  return fetch(path).then(function (r) {
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  }).catch(function () { return fallback; });
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function byNewest(a, b) {
  return String(b.date_added || '').localeCompare(String(a.date_added || ''));
}

function emptyState(kind) {
  return '<div class="empty"><strong>अभी कोई ' + esc(kind) + ' सूचीबद्ध नहीं है</strong>' +
    'नई जानकारी मिलते ही यहाँ अपने आप जुड़ जाएगी।<br>तब तक क्विज़ या करेंट अफेयर्स से तैयारी जारी रखें।</div>';
}

function jobCard(j) {
  return '<article class="card">' +
    '<span class="tag">भर्ती</span>' +
    '<h3>' + esc(j.title) + '</h3>' +
    '<div class="meta">' + esc(j.org || '') +
    (j.posts ? ' • पद: ' + esc(j.posts) : '') +
    (j.qualification ? ' • योग्यता: ' + esc(j.qualification) : '') +
    (j.last_date ? ' • अंतिम तिथि: ' + esc(j.last_date) : '') + '</div>' +
    (j.summary ? '<p>' + esc(j.summary) + '</p>' : '') +
    '<div class="actions">' +
    (j.link ? '<a class="btn btn-sm" href="' + esc(j.link) + '" target="_blank" rel="noopener">Official Notification</a>' : '') +
    '</div></article>';
}

function resultCard(r) {
  return '<article class="card">' +
    '<span class="tag">रिजल्ट</span>' +
    '<h3>' + esc(r.title) + '</h3>' +
    '<div class="meta">' + esc(r.org || '') + (r.date ? ' • ' + esc(r.date) : '') + '</div>' +
    (r.summary ? '<p>' + esc(r.summary) + '</p>' : '') +
    '<div class="actions">' +
    (r.link ? '<a class="btn btn-sm" href="' + esc(r.link) + '" target="_blank" rel="noopener">रिजल्ट देखें</a>' : '') +
    '</div></article>';
}

function answerKeyCard(r) {
  return '<article class="card">' +
    '<span class="tag">आंसर की</span>' +
    '<h3>' + esc(r.title) + '</h3>' +
    '<div class="meta">' + esc(r.org || '') + (r.date ? ' • ' + esc(r.date) : '') + '</div>' +
    (r.summary ? '<p>' + esc(r.summary) + '</p>' : '') +
    '<div class="actions">' +
    (r.link ? '<a class="btn btn-sm" href="' + esc(r.link) + '" target="_blank" rel="noopener">आंसर की देखें</a>' : '') +
    '</div></article>';
}

function renderFull(elId, path, cardFn, kind) {
  var el = document.getElementById(elId);
  fetchJSON(path, []).then(function (items) {
    if (!items || !items.length) { el.innerHTML = emptyState(kind); return; }
    items.sort(byNewest);
    el.innerHTML = items.map(cardFn).join('');
  });
}

function renderLatest() {
  var jobsEl = document.getElementById('latestJobs'),
      resEl = document.getElementById('latestResults'),
      akEl = document.getElementById('latestAnswerKeys');
  function latest(el, path, label) {
    fetchJSON(path, []).then(function (items) {
      if (!items || !items.length) { el.innerHTML = '<li>' + esc(label) + ' जल्द जुड़ेंगे।</li>'; return; }
      items.sort(byNewest);
      el.innerHTML = items.slice(0, 5).map(function (it) {
        return '<li><a href="' + esc(path.replace('data/', '').replace('.json', '.html'))
          .replace('answerkeys', 'answer-keys') + '">' + esc(it.title) + '</a>' +
          '<span class="meta">' + esc(it.org || '') +
          (it.last_date ? ' • अंतिम तिथि: ' + esc(it.last_date) : '') +
          (it.date ? ' • ' + esc(it.date) : '') + '</span></li>';
      }).join('');
    });
  }
  if (jobsEl) latest(jobsEl, 'data/jobs.json', 'नई भर्तियाँ');
  if (resEl) latest(resEl, 'data/results.json', 'रिजल्ट');
  if (akEl) latest(akEl, 'data/answerkeys.json', 'आंसर की');
}

function renderCutoffs() {
  var body = document.getElementById('cutoffBody');
  var wrap = document.getElementById('cutoffWrap');
  var empty = document.getElementById('cutoffEmpty');
  fetchJSON('data/cutoffs.json', []).then(function (rows) {
    if (!rows || !rows.length) {
      if (wrap) wrap.style.display = 'none';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';
    body.innerHTML = rows.map(function (r) {
      return '<tr><td>' + esc(r.exam) + '</td><td>' + esc(r.year) + '</td><td>' +
        esc(r.category) + '</td><td><strong>' + esc(r.cutoff) + '</strong></td><td>' +
        esc(r.source || '') + '</td></tr>';
    }).join('');
  });
}
