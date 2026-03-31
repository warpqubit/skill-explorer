const BASE = 'https://api.github.com';
let currentContent = '';

function getHeaders() {
  const token = document.getElementById('tokenInput').value.trim();
  const h = { 'Accept': 'application/vnd.github.v3+json' };
  if (token) h['Authorization'] = `token ${token}`;
  return h;
}

function onTokenChange() {
  const t = document.getElementById('tokenInput').value.trim();
  const dot = document.getElementById('tokenDot');
  const txt = document.getElementById('tokenStatusText');
  if (!t) { dot.className='ts-dot'; txt.textContent='Sin token — modo anónimo (60 req/hora)'; }
  else if (t.startsWith('ghp_')||t.startsWith('github_pat_')) { dot.className='ts-dot ok'; txt.textContent='✓ Token válido — modo autenticado (5.000 req/hora)'; }
  else { dot.className='ts-dot warn'; txt.textContent='⚠ Formato inusual — verificá que sea un PAT de GitHub'; }
}

function showStatus(msg, type='info') {
  const el = document.getElementById('statusBar');
  el.className = 'status-bar ' + type;
  el.innerHTML = msg;
  el.style.display = 'flex';
}

function toggleEndpoints() {
  const list = document.getElementById('epList');
  const icon = document.getElementById('epIcon');
  const open = list.style.display === 'none';
  list.style.display = open ? 'flex' : 'none';
  icon.style.transform = open ? 'rotate(90deg)' : '';
}

function updateRateMonitor(limit, remaining, reset) {
  document.getElementById('rateMonitor').style.display = 'flex';
  document.getElementById('rateLimit').textContent = limit.toLocaleString();
  document.getElementById('rateRemaining').textContent = remaining.toLocaleString();
  document.getElementById('rateReset').textContent = new Date(reset*1000).toLocaleTimeString('es-AR');
  document.getElementById('rateMode').textContent = limit >= 5000 ? '🔑 Autenticado' : '👤 Anónimo';
  const dot = document.getElementById('rateDot');
  dot.className = 'rate-dot' + (remaining < 20 ? ' danger' : remaining < 100 ? ' warn' : '');
}

function updateRateFromHeaders(h) {
  const l=h.get('x-ratelimit-limit'), r=h.get('x-ratelimit-remaining'), s=h.get('x-ratelimit-reset');
  if (l&&r&&s) updateRateMonitor(+l,+r,+s);
}

async function checkRateLimit() {
  try {
    const r = await fetch(`${BASE}/rate_limit`, { headers: getHeaders() });
    const d = await r.json();
    const c = d.resources.core, s = d.resources.search;
    updateRateMonitor(c.limit, c.remaining, c.reset);
    showStatus(`Core: <strong>${c.remaining}/${c.limit}</strong> &nbsp;·&nbsp; Search: <strong>${s.remaining}/${s.limit}</strong> &nbsp;·&nbsp; Reset: ${new Date(c.reset*1000).toLocaleTimeString('es-AR')}`,
      c.remaining > 100 ? 'ok' : c.remaining > 20 ? 'warn' : 'error');
  } catch(e) { showStatus('Error: ' + e.message, 'error'); }
}

function setBtnLoading(id, spinId, textId, loading, label) {
  document.getElementById(id).disabled = loading;
  document.getElementById(spinId).style.display = loading ? 'inline-block' : 'none';
  if (loading) document.getElementById(textId).textContent = label;
}

async function searchRepos() {
  const query = document.getElementById('queryInput').value.trim() || 'claude skills';
  const perPage = document.getElementById('perPage').value;
  const sort = document.getElementById('sortBy').value;
  setBtnLoading('searchBtn','searchSpinner','searchBtnText', true, 'Buscando...');
  showStatus(`<div class="spinner"></div>&nbsp; Buscando repos con "<strong>${query}</strong>"...`, 'info');
  try {
    const url = `${BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&per_page=${perPage}`;
    const r = await fetch(url, { headers: getHeaders() });
    updateRateFromHeaders(r.headers);
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || `HTTP ${r.status}`);
    renderRepos(d.items, d.total_count, query);
    showStatus(`✓ ${d.total_count.toLocaleString()} repositorios encontrados · mostrando ${d.items.length}`, 'ok');
  } catch(e) {
    showStatus('✗ ' + e.message, 'error');
  } finally {
    setBtnLoading('searchBtn','searchSpinner','searchBtnText', false);
    document.getElementById('searchBtnText').textContent = '🔍 Buscar repositorios';
  }
}

async function searchSkillFiles() {
  const fileQ = document.getElementById('fileQuery').value.trim() || 'SKILL.md';
  setBtnLoading('fileBtn','fileSpinner','fileBtnText', true, 'Buscando archivos...');
  showStatus(`<div class="spinner"></div>&nbsp; Buscando <strong>${fileQ}</strong> en repos públicos...`, 'info');
  try {
    const url = `${BASE}/search/code?q=${encodeURIComponent(fileQ)}+in:path&per_page=30`;
    const r = await fetch(url, { headers: getHeaders() });
    updateRateFromHeaders(r.headers);
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || `HTTP ${r.status}`);
    renderSkillFiles(d.items, d.total_count);
    showStatus(`✓ ${d.total_count.toLocaleString()} archivos encontrados · mostrando ${d.items.length}`, 'ok');
  } catch(e) {
    const extra = (e.message||'').includes('422') ? ' — La búsqueda de código requiere token.' : '';
    showStatus('✗ ' + e.message + extra, 'error');
  } finally {
    setBtnLoading('fileBtn','fileSpinner','fileBtnText', false);
    document.getElementById('fileBtnText').textContent = '📄 Buscar archivos SKILL.md';
  }
}

function renderRepos(repos, total, query) {
  if (!repos.length) { document.getElementById('resultsArea').innerHTML='<div class="empty"><div class="empty-icon">📭</div><h3>Sin resultados</h3></div>'; return; }
  const cards = repos.map(repo => {
    const langs = repo.language ? `<span class="tag p">${repo.language}</span>` : '';
    const topics = (repo.topics||[]).slice(0,3).map(t=>`<span class="tag g">${t}</span>`).join('');
    const archived = repo.archived ? `<span class="tag y">archivado</span>` : '';
    const updated = new Date(repo.updated_at).toLocaleDateString('es-AR',{day:'2-digit',month:'short',year:'numeric'});
    const safeId = repo.full_name.replace('/','_');
    return `<div class="repo-card">
      <div class="repo-name">${repo.name}</div>
      <div class="repo-full">${repo.full_name}</div>
      ${repo.description?`<div class="repo-desc">${repo.description}</div>`:''}
      <div class="repo-stats">
        <span class="stat">⭐ ${repo.stargazers_count.toLocaleString()}</span>
        <span class="stat">🍴 ${repo.forks_count.toLocaleString()}</span>
        <span class="stat">📅 ${updated}</span>
      </div>
      <div class="repo-tags">${langs}${topics}${archived}</div>
      <div class="repo-actions">
        <button class="btn btn-secondary btn-sm" onclick="scanRepo('${repo.full_name}','${safeId}')">🔎 Buscar SKILL.md</button>
        <a href="${repo.html_url}" target="_blank" style="text-decoration:none"><button class="btn btn-secondary btn-sm">↗ Ver repo</button></a>
      </div>
      <div class="scan-area" id="scan-${safeId}"></div>
    </div>`;
  }).join('');
  document.getElementById('resultsArea').innerHTML = `
    <div class="results-header">
      <div class="results-title">Repositorios</div>
      <div class="count-badge">${total.toLocaleString()} resultados · "${query}"</div>
    </div>
    <div class="repo-grid">${cards}</div>`;
}

function renderSkillFiles(items, total) {
  if (!items.length) { document.getElementById('resultsArea').innerHTML='<div class="empty"><div class="empty-icon">📂</div><h3>Sin archivos</h3></div>'; return; }
  const byRepo = {};
  items.forEach(item => {
    const k = item.repository.full_name;
    if (!byRepo[k]) byRepo[k] = { repo: item.repository, files: [] };
    byRepo[k].files.push(item);
  });
  const cards = Object.values(byRepo).map(({repo, files}) => {
    const rows = files.map(f=>`<div class="skill-file-item" onclick="openSkillFile('${repo.full_name}','${f.path}')">
      <span>📄</span><span class="sfi-path">${f.path}</span></div>`).join('');
    return `<div class="repo-card">
      <div class="repo-name">${repo.name}</div>
      <div class="repo-full">${repo.full_name}</div>
      <div style="margin-bottom:10px">${rows}</div>
      <a href="${repo.html_url}" target="_blank" style="text-decoration:none"><button class="btn btn-secondary btn-sm">↗ Ver repo</button></a>
    </div>`;
  }).join('');
  document.getElementById('resultsArea').innerHTML = `
    <div class="results-header">
      <div class="results-title">Archivos SKILL.md</div>
      <div class="count-badge">${total.toLocaleString()} totales · mostrando ${items.length}</div>
    </div>
    <div class="repo-grid">${cards}</div>`;
}

async function scanRepo(fullName, safeId) {
  const el = document.getElementById('scan-'+safeId);
  el.innerHTML = `<div style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:6px"><div class="spinner"></div> Escaneando árbol del repo...</div>`;
  try {
    const r = await fetch(`${BASE}/repos/${fullName}/git/trees/HEAD?recursive=1`, { headers: getHeaders() });
    updateRateFromHeaders(r.headers);
    const d = await r.json();
    if (!r.ok) throw new Error(d.message);
    const fileQ = (document.getElementById('fileQuery').value.trim() || 'SKILL.md').toLowerCase();
    const found = (d.tree||[]).filter(f => f.path.toLowerCase().includes(fileQ) && f.type==='blob');
    if (!found.length) { el.innerHTML=`<div style="font-size:11px;color:var(--muted)">✗ No se encontró ${fileQ.toUpperCase()} en este repo</div>`; return; }
    const rows = found.map(f=>`<div class="skill-file-item" onclick="openSkillFile('${fullName}','${f.path}')">
      <span>📄</span><span class="sfi-path">${f.path}</span></div>`).join('');
    el.innerHTML = `<div style="font-size:11px;color:var(--accent2);margin-bottom:6px">✓ ${found.length} archivo(s) encontrado(s)</div>${rows}`;
  } catch(e) { el.innerHTML=`<div style="font-size:11px;color:var(--danger)">✗ ${e.message}</div>`; }
}

async function openSkillFile(fullName, path) {
  document.getElementById('modalTitle').textContent = path.split('/').pop();
  document.getElementById('modalSub').textContent = `${fullName} · ${path}`;
  document.getElementById('modalContent').style.display = 'none';
  document.getElementById('modalSpinner').style.display = 'block';
  document.getElementById('modalOverlay').classList.add('open');
  currentContent = '';
  try {
    const r = await fetch(`${BASE}/repos/${fullName}/contents/${encodeURIComponent(path)}`, { headers: getHeaders() });
    updateRateFromHeaders(r.headers);
    const d = await r.json();
    if (!r.ok) throw new Error(d.message);
    currentContent = atob(d.content.replace(/\n/g,''));
    document.getElementById('modalContent').textContent = currentContent;
    document.getElementById('modalContent').style.display = 'block';
    document.getElementById('modalSpinner').style.display = 'none';
  } catch(e) {
    document.getElementById('modalContent').textContent = 'Error: ' + e.message;
    document.getElementById('modalContent').style.display = 'block';
    document.getElementById('modalSpinner').style.display = 'none';
  }
}

function closeModal(e) {
  if (!e || e.target===document.getElementById('modalOverlay'))
    document.getElementById('modalOverlay').classList.remove('open');
}

function copyContent() {
  if (!currentContent) return;
  navigator.clipboard.writeText(currentContent).then(()=>{
    const n = document.getElementById('copyNotice');
    n.classList.add('show');
    setTimeout(()=>n.classList.remove('show'), 2000);
  });
}

function copyEp(el) {
  const path = el.querySelector('.ep-path').textContent;
  navigator.clipboard.writeText(BASE + path).catch(()=>{});
  el.style.borderColor = 'var(--accent2)';
  setTimeout(()=>el.style.borderColor='', 900);
}

checkRateLimit();
