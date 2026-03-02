// ── STATE ─────────────────────────────────────────────────────────────────────
let state = { dark: true, page: 'land', cat: null, sub: null, result: null };

// ── RENDER HELPERS ────────────────────────────────────────────────────────────
function badge(label, g) {
  const c = GRADES[g];
  return `<span class="badge" style="background:${c.bg};color:${c.color}">${label}</span>`;
}

function barRow(n, s, w) {
  const c = GRADES[grade(s)].color;
  return `
    <div class="bar-row">
      <div class="bar-header">
        <span>${n}</span>
        <span style="font-weight:700;color:${c}">${s.toFixed(1)}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${s}%;background:${c}"></div>
      </div>
      <div class="bar-weight">Weight: ${(w * 100).toFixed(0)}%</div>
    </div>`;
}

function svgChart(bd) {
  const W = 340, H = 190, pad = { t: 10, r: 10, b: 38, l: 28 };
  const bw = Math.floor((W - pad.l - pad.r) / bd.length) - 6;
  const barArea = H - pad.t - pad.b;
  let bars = '', xlabels = '', ylines = '';

  [0, 25, 50, 75, 100].forEach(v => {
    const y = H - pad.b - (v / 100) * barArea;
    ylines += `<line x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}" stroke="var(--border2)" stroke-width="1" stroke-dasharray="4,3"/>`;
    ylines += `<text x="${pad.l - 4}" y="${y + 4}" text-anchor="end" font-size="9" fill="var(--muted)">${v}</text>`;
  });

  bd.forEach((f, i) => {
    const x  = pad.l + i * (bw + 6);
    const bh = Math.max(3, (f.s / 100) * barArea);
    const y  = H - pad.b - bh;
    const c  = GRADES[grade(f.s)].color;
    bars    += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${c}" rx="3" opacity="0.9"/>`;
    const lbl = f.n.length > 7 ? f.n.slice(0, 6) + '…' : f.n;
    xlabels += `<text x="${x + bw / 2}" y="${H - 4}" text-anchor="middle" font-size="9" fill="var(--muted)">${lbl}</text>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" class="chart-wrap" style="width:100%;height:auto;display:block">${ylines}${bars}${xlabels}</svg>`;
}

function formField(label, inputHtml, hint) {
  return `
    <div class="field">
      <div class="field-label">${label}</div>
      ${inputHtml}
      ${hint ? `<div class="field-hint">${hint}</div>` : ''}
    </div>`;
}

function basicInput(id, type, value, extra = '') {
  return `<div class="field-input-wrap"><input class="field-input" id="${id}" type="${type}" value="${value}" ${extra}/></div>`;
}

// ── PAGES ─────────────────────────────────────────────────────────────────────

function renderLanding() {
  return `
  <div class="page">
    <div style="margin-bottom:40px">
      <div class="page-eyebrow">Infrastructure Health Platform</div>
      <h1 class="page-title">Infrastructure Health<br>Assessment</h1>
      <p class="page-subtitle">Select an infrastructure category to run a comprehensive health assessment and get actionable maintenance recommendations.</p>
    </div>
    <div class="cat-grid">
      ${CATS.map(cat => `
        <div class="card card-hover cat-card" onclick="selectCat('${cat.id}')">
          <img class="cat-card-img" src="${cat.img}" alt="${cat.title}" loading="lazy" onerror="this.style.display='none'"/>
          <div class="cat-card-fade"></div>
          <div class="cat-card-body">
            <div class="cat-title">${cat.title}</div>
            <div class="cat-desc">${cat.desc}</div>
            <div class="cat-tags">
              ${[...new Set(cat.subs)].map(s => `<span class="tag">${s}</span>`).join('')}
            </div>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

function renderSubcat() {
  const cat = state.cat;
  const subs = [...new Set(cat.subs)];
  return `
  <div class="page">
    <button class="btn-ghost" onclick="goBack('land')" style="margin-bottom:24px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      Back to Categories
    </button>
    <div style="margin-bottom:32px">
      <div class="page-eyebrow">${cat.title}</div>
      <h1 class="page-title" style="font-size:24px">Select Asset Type</h1>
      <p class="page-subtitle" style="font-size:14px">Choose the asset you want to assess for health and remaining useful life.</p>
    </div>
    <div class="sub-grid">
      ${subs.map(s => `
        <div class="card card-hover sub-card" onclick="selectSub('${s}')">
          <img class="sub-card-img" src="${SUB_IMGS[s] || ''}" alt="${s}" loading="lazy" onerror="this.style.display='none'"/>
          <div class="sub-card-overlay"></div>
          <div class="sub-card-body">
            <div class="sub-card-name">${s}</div>
            <div class="sub-card-meta">Design life: <strong>${DEFS[s]?.dl || 30} years</strong></div>
            <div class="sub-card-cta">
              Begin Assessment
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

function renderForm() {
  const sub = state.sub;
  const def = DEFS[sub];
  const img = SUB_IMGS[sub] || '';

  return `
  <div class="page">
    <button class="btn-ghost" onclick="goBack('sub')" style="margin-bottom:20px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      Back
    </button>

    <!-- Hero banner -->
    <div class="form-hero card mb-24" style="margin-bottom:24px">
      <img class="form-hero-img" src="${img}" alt="${sub}" onerror="this.style.display='none'"/>
      <div class="form-hero-overlay"></div>
      <div class="form-hero-body">
        <div class="form-hero-title">${sub}</div>
        <div class="form-hero-sub">Health assessment · Design life: ${def.dl} years</div>
      </div>
    </div>

    <!-- Section 1: Site Information -->
    <div class="form-section mb-16" style="margin-bottom:16px">
      <div class="form-section-header">
        <div class="form-section-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div>
          <div class="form-section-title">Site Information</div>
          <div class="form-section-desc">Location and installation metadata</div>
        </div>
      </div>
      <div class="form-section-body">
        <div class="form-grid-2">
          <div class="field">
            <div class="field-label">Asset Location</div>
            <div class="field-input-wrap">
              <input class="field-input" id="loc" type="text" placeholder="e.g. NH-48, Bengaluru North" value=""/>
            </div>
          </div>
          <div class="field">
            <div class="field-label">Last Inspection Date</div>
            <div class="field-input-wrap">
              <input class="field-input" id="lid" type="date" value="2024-01-15"/>
            </div>
          </div>
          <div class="field">
            <div class="field-label">Installation Year</div>
            <div class="field-input-wrap">
              <input class="field-input" id="iy" type="number" min="1900" max="2025" value="2005" placeholder="e.g. 2005"/>
            </div>
          </div>
          <div class="field">
            <div class="field-label">Design Life (years)</div>
            <div class="field-input-wrap">
              <input class="field-input has-unit" id="dl" type="number" min="1" max="200" value="${def.dl}"/>
              <div class="field-unit">yrs</div>
            </div>
            <div class="field-hint">Default for ${sub}: ${def.dl} years</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Condition Factors -->
    <div class="form-section mb-16" style="margin-bottom:16px">
      <div class="form-section-header">
        <div class="form-section-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
        <div>
          <div class="form-section-title">Condition Factors</div>
          <div class="form-section-desc">Use sliders or type values directly — each factor contributes to the overall health score</div>
        </div>
      </div>
      <div class="form-section-body">
        <div class="form-grid-auto">
          ${def.factors.map(f => `
            <div class="factor-card">
              <div class="factor-header">
                <div class="factor-name">${f.l}</div>
                <div class="factor-unit-badge">${f.u}</div>
              </div>
              <div class="factor-input-row">
                <input class="factor-number" id="f_${f.k}" type="number"
                  min="${f.min}" max="${f.max}" step="${f.step}" value="${f.def}"
                  oninput="syncSlider('${f.k}')"/>
              </div>
              <input class="factor-slider" id="s_${f.k}" type="range"
                min="${f.min}" max="${f.max}" step="${f.step}" value="${f.def}"
                oninput="syncNumber('${f.k}')"/>
              <div class="factor-range-row">
                <span>${f.min}</span>
                <span>${f.max}</span>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Section 3: Formula Reference -->
    <div class="form-section mb-16" style="margin-bottom:24px">
      <div class="form-section-header">
        <div class="form-section-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <div>
          <div class="form-section-title">Scoring Methodology</div>
          <div class="form-section-desc">View the calculation breakdown for each factor</div>
        </div>
        <button class="formula-toggle" id="formula-btn" onclick="toggleFormula()" style="margin-left:auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          Show methodology
        </button>
      </div>
      <div id="formula-box" style="display:none;padding:0 22px 22px">
        <div class="formula-box">${def.formula}</div>
      </div>
    </div>

    <!-- Submit -->
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="calculate()" style="font-size:15px;padding:14px 36px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Calculate Health Score
      </button>
      <span style="font-size:12px;color:var(--muted)">Results include RUL, risk index & recommendations</span>
    </div>
  </div>`;
}

function renderResult() {
  const r   = state.result;
  const h   = r.health;
  const g   = grade(h);
  const cfg = GRADES[g];
  const ri  = Math.round(100 - h);

  return `
  <div class="page">
    <!-- Toolbar -->
    <div class="noprint" style="display:flex;gap:16px;margin-bottom:24px;align-items:center;flex-wrap:wrap">
      <button class="btn-ghost" onclick="goBack('form')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        Edit inputs
      </button>
      <button class="btn-ghost" onclick="goHome()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New assessment
      </button>
      <button class="btn-outline noprint" onclick="window.print()" style="margin-left:auto">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print / Export PDF
      </button>
    </div>

    <!-- Report header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px">
      <div>
        <div class="page-eyebrow">Health Assessment Report</div>
        <h1 class="page-title" style="font-size:24px">${r.sub}</h1>
        ${r.loc ? `<div style="color:var(--muted);font-size:13px;margin-top:4px;display:flex;align-items:center;gap:5px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>${r.loc}</div>` : ''}
        <div style="color:var(--muted);font-size:12px;margin-top:3px">Installed: ${r.iy} · Design Life: ${r.dl} yrs · Inspected: ${r.lid}</div>
      </div>
      <div class="badge" style="background:${cfg.bg};color:${cfg.color};font-size:13px;padding:6px 16px">Risk Index: ${ri} / 100</div>
    </div>

    <!-- KPI row -->
    <div class="kpi-grid" style="margin-bottom:16px">
      <div class="kpi-card" style="border-top:3px solid ${cfg.color}">
        <div class="kpi-val" style="color:${cfg.color}">${h.toFixed(1)}</div>
        <div class="kpi-lbl">Health Score</div>
        <div style="margin-top:10px">${badge(g + ' &nbsp;·&nbsp; ' + cfg.range, g)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-val">${r.rul}</div>
        <div class="kpi-lbl">Years Remaining</div>
        <div class="kpi-sub">Until critical threshold (50)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-val" style="font-size:32px;letter-spacing:-1px">${r.cy}</div>
        <div class="kpi-lbl">Projected Critical Year</div>
        <div class="kpi-sub">${r.conf}</div>
      </div>
      <div class="kpi-card" style="border-top:3px solid ${ri > 60 ? '#ef4444' : ri > 40 ? '#f59e0b' : '#22c55e'}">
        <div class="kpi-val" style="color:${ri > 60 ? '#ef4444' : ri > 40 ? '#f59e0b' : '#22c55e'}">${ri}</div>
        <div class="kpi-lbl">Risk Index</div>
        <div class="kpi-sub">0 = no risk &nbsp;·&nbsp; 100 = critical</div>
      </div>
    </div>

    <!-- Factor breakdown + chart -->
    <div class="result-grid" style="margin-bottom:16px">
      <div class="card">
        <div class="section-title">Factor Breakdown</div>
        ${r.bd.map(f => barRow(f.n, f.s, f.w)).join('')}
      </div>
      <div class="card">
        <div class="section-title">Score Visualization</div>
        ${svgChart(r.bd)}
      </div>
    </div>

    <!-- Threshold violations -->
    ${r.th.length ? `
    <div class="card violation-card" style="margin-bottom:16px">
      <div class="section-title" style="color:#ef4444;display:flex;align-items:center;gap:8px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Threshold Violations
      </div>
      ${r.th.map(t => `<div class="violation-row">${t}</div>`).join('')}
    </div>` : ''}

    <!-- Recommendations -->
    <div class="card" style="margin-bottom:16px">
      <div class="section-title" style="display:flex;align-items:center;gap:8px">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Technical Recommendations
      </div>
      ${r.rec.map((rec, i) => `
        <div style="display:flex;gap:12px;padding:9px 0;${i < r.rec.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}">
          <span style="min-width:22px;height:22px;border-radius:6px;background:var(--accent-glow);color:var(--accent);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${i + 1}</span>
          <span style="font-size:13px;line-height:1.5">${rec}</span>
        </div>`).join('')}
    </div>

    <!-- Factor table -->
    <div class="card">
      <div class="section-title">Factor Score Table</div>
      <div style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>Factor</th>
              <th>Raw Score</th>
              <th>Weight</th>
              <th>Contribution</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${r.bd.map(f => {
              const gg = grade(f.s);
              const gc = GRADES[gg];
              return `
              <tr>
                <td style="font-weight:600">${f.n}</td>
                <td style="font-weight:800;color:${gc.color};font-family:var(--mono)">${f.s.toFixed(1)}</td>
                <td style="color:var(--muted)">${(f.w * 100).toFixed(0)}%</td>
                <td style="font-family:var(--mono)">${(f.s * f.w).toFixed(2)}</td>
                <td>${badge(gg, gg)}</td>
              </tr>`;
            }).join('')}
            <tr style="background:var(--card2)">
              <td colspan="3" style="font-weight:800;font-size:14px">Total Health Score</td>
              <td style="font-weight:800;color:${cfg.color};font-size:17px;font-family:var(--mono)">${h.toFixed(2)}</td>
              <td>${badge(g, g)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function render() {
  const content = document.getElementById('content');
  const homeBtn = document.getElementById('home-btn');
  const bc      = document.getElementById('breadcrumb');

  content.innerHTML = '';

  if (state.page === 'land') {
    content.innerHTML = renderLanding();
    homeBtn.style.display = 'none';
    bc.style.display = 'none';
  } else if (state.page === 'sub') {
    content.innerHTML = renderSubcat();
    homeBtn.style.display = 'flex';
    bc.style.display = 'flex';
    bc.innerHTML = `<a onclick="goHome()">Home</a><span class="bc-sep">›</span><span class="bc-current">${state.cat.title}</span>`;
  } else if (state.page === 'form') {
    content.innerHTML = renderForm();
    homeBtn.style.display = 'flex';
    bc.style.display = 'flex';
    bc.innerHTML = `<a onclick="goHome()">Home</a><span class="bc-sep">›</span><a onclick="goBack('sub')">${state.cat.title}</a><span class="bc-sep">›</span><span class="bc-current">${state.sub}</span>`;
  } else if (state.page === 'res') {
    content.innerHTML = renderResult();
    homeBtn.style.display = 'flex';
    bc.style.display = 'flex';
    bc.innerHTML = `<a onclick="goHome()">Home</a><span class="bc-sep">›</span><a onclick="goBack('sub')">${state.cat.title}</a><span class="bc-sep">›</span><a onclick="goBack('form')">${state.sub}</a><span class="bc-sep">›</span><span class="bc-current">Results</span>`;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  state = { ...state, page: 'land', cat: null, sub: null, result: null };
  render();
}

function goBack(to) {
  if (to === 'land') goHome();
  else { state.page = to; render(); }
}

function selectCat(id) {
  state.cat  = CATS.find(c => c.id === id);
  state.page = 'sub';
  render();
}

function selectSub(sub) {
  state.sub  = sub;
  state.page = 'form';
  render();
}

// ── FORM INTERACTIONS ─────────────────────────────────────────────────────────
function syncSlider(k) {
  const num = document.getElementById('f_' + k);
  const sld = document.getElementById('s_' + k);
  if (num && sld) sld.value = num.value;
}

function syncNumber(k) {
  const num = document.getElementById('f_' + k);
  const sld = document.getElementById('s_' + k);
  if (num && sld) num.value = sld.value;
}

function toggleFormula() {
  const box = document.getElementById('formula-box');
  const btn = document.getElementById('formula-btn');
  const isOpen = box.style.display !== 'none';
  box.style.display = isOpen ? 'none' : 'block';
  btn.classList.toggle('open', !isOpen);
  btn.innerHTML = isOpen
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg> Show methodology`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg> Hide methodology`;
}

function calculate() {
  const def  = DEFS[state.sub];
  const vals = {};

  def.factors.forEach(f => {
    const el = document.getElementById('f_' + f.k);
    vals[f.k] = parseFloat(el ? el.value : f.def) || 0;
  });

  const loc = document.getElementById('loc')?.value || '';
  const iy  = parseInt(document.getElementById('iy')?.value)  || 2005;
  const dl  = parseInt(document.getElementById('dl')?.value)  || def.dl;
  const lid = document.getElementById('lid')?.value || '';

  const r   = def.run(vals);
  const rul = calcRUL(r.health, dl, iy);

  state.result = { sub: state.sub, loc, iy, dl, lid, ...r, ...rul, rec: def.rec(r.health) };
  state.page   = 'res';
  render();
}

// ── THEME ─────────────────────────────────────────────────────────────────────
function toggleTheme() {
  state.dark = !state.dark;
  document.body.classList.toggle('light', !state.dark);
  document.getElementById('theme-icon-moon').style.display = state.dark ? 'block' : 'none';
  document.getElementById('theme-icon-sun').style.display  = state.dark ? 'none'  : 'block';
}

// ── INIT ──────────────────────────────────────────────────────────────────────
render();
