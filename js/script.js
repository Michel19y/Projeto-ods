// ============================================
// AquaVida - script.js
// ============================================

const SUPABASE_URL      = "https://yxfksbosxvqutvydekxd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmtzYm9zeHZxdXR2eWRla3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDY2ODksImV4cCI6MjA5NzgyMjY4OX0.F5K5-ldDiV89pTNyMahyysmZqzfN1AWq9963GZWrS2c";

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== UTILITÁRIOS SUPABASE =====

async function salvarIdeia(payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ideias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Erro ao salvar.");
  }
}

async function carregarIdeias() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ideias?order=criado_em.desc`, {
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  if (!res.ok) throw new Error("Erro ao carregar ideias.");
  return await res.json();
}

// ===== FORMULÁRIO (formulario.html) =====

const formulario = document.getElementById('form-ideia');

if (formulario) {
  function mostrarErro(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function limparErros() {
    ['erro-nome', 'erro-ods', 'erro-descricao', 'erro-geral'].forEach(id => mostrarErro(id, ''));
  }

  formulario.addEventListener('submit', async function (e) {
    e.preventDefault();
    limparErros();

    const nome      = document.getElementById('nome').value.trim();
    const email     = document.getElementById('email').value.trim();
    const ods       = document.getElementById('ods').value;
    const descricao = document.getElementById('descricao').value.trim();
    const impacto   = document.querySelector('input[name="impacto"]:checked');

    let valido = true;
    if (!nome)     { mostrarErro('erro-nome',      'Por favor, insira seu nome.');      valido = false; }
    if (!ods)      { mostrarErro('erro-ods',       'Por favor, selecione um ODS.');     valido = false; }
    if (!descricao){ mostrarErro('erro-descricao', 'Por favor, descreva sua ideia.');   valido = false; }
    if (!impacto)  { mostrarErro('erro-geral',     'Por favor, selecione o nível de impacto.'); valido = false; }
    if (!valido) return;

    const payload = { nome, ods, descricao, impacto: impacto.value };
    if (email) payload.email = email;

    const btnSubmit = formulario.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviando...";

    try {
      await salvarIdeia(payload);

      formulario.reset();
      formulario.style.display = "none";

      const msg = document.getElementById('mensagem-sucesso');
      if (msg) msg.style.display = 'block';

    } catch (err) {
      mostrarErro('erro-geral', "Erro ao cadastrar: " + err.message);
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Cadastrar Ideia';
    }
  });
}

// ===== RESULTADOS (resultados.html) =====

let todasIdeias = null;

function renderizarIdeias(filtroOds = '', filtroImpacto = '') {
  const container = document.getElementById('lista-ideias');
  const semDados  = document.getElementById('sem-dados');
  const contador  = document.getElementById('contador-ideias');

  if (!container || todasIdeias === null) return;

  let ideias = todasIdeias.slice();
  if (filtroOds)     ideias = ideias.filter(i => i.ods === filtroOds);
  if (filtroImpacto) ideias = ideias.filter(i => i.impacto === filtroImpacto);

  if (contador) {
    contador.textContent = `${ideias.length} ideia${ideias.length !== 1 ? 's' : ''} encontrada${ideias.length !== 1 ? 's' : ''}`;
  }

  Array.from(container.children).forEach(child => {
    if (child.id !== 'sem-dados' && child.id !== 'loading-ideias') child.remove();
  });

  if (ideias.length === 0) {
    if (semDados) semDados.style.display = 'block';
    return;
  }

  if (semDados) semDados.style.display = 'none';

  const odsNomes = {
    'ODS 6':  'ODS 6 – Água Limpa',
    'ODS 10': 'ODS 10 – Desigualdades',
    'ODS 12': 'ODS 12 – Consumo Responsável'
  };

  const impactoIcone = {
    'Alto':  '🟢 Alto',
    'Médio': '🟠 Médio',
    'Baixo': '🔵 Baixo'
  };

  const impactoClasse = {
    'Alto':  'impacto-alto',
    'Médio': 'impacto-medio',
    'Baixo': 'impacto-baixo'
  };

  ideias.forEach(ideia => {
    const data = ideia.criado_em
      ? new Date(ideia.criado_em).toLocaleDateString('pt-BR')
      : '';

    const card = document.createElement('article');
    card.className = 'card-ideia';
    card.innerHTML = `
      <div class="ideia-header">
        <span class="ideia-nome">👤 ${escapeHTML(ideia.nome)}</span>
        <span class="ideia-ods">${escapeHTML(odsNomes[ideia.ods] || ideia.ods)}</span>
      </div>
      <p class="ideia-descricao">${escapeHTML(ideia.descricao)}</p>
      <div class="ideia-footer">
        <span class="impacto-badge ${impactoClasse[ideia.impacto] || ''}">
          ${impactoIcone[ideia.impacto] || escapeHTML(ideia.impacto)}
        </span>
        ${data ? `<span>📅 ${data}</span>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

// Inicializar resultados.html
const filtroOdsEl     = document.getElementById('filtro-ods');
const filtroImpactoEl = document.getElementById('filtro-impacto');

if (filtroOdsEl || filtroImpactoEl) {
  const loadingEl = document.getElementById('loading-ideias');
  const semDados  = document.getElementById('sem-dados');

  if (loadingEl) loadingEl.style.display = 'flex';
  if (semDados)  semDados.style.display  = 'none';

  carregarIdeias()
    .then(dados => { todasIdeias = dados; })
    .catch(() => { todasIdeias = []; })
    .finally(() => {
      if (loadingEl) loadingEl.style.display = 'none';
      renderizarIdeias(
        filtroOdsEl ? filtroOdsEl.value : '',
        filtroImpactoEl ? filtroImpactoEl.value : ''
      );
    });

  if (filtroOdsEl) {
    filtroOdsEl.addEventListener('change', () => {
      renderizarIdeias(filtroOdsEl.value || '', filtroImpactoEl ? filtroImpactoEl.value || '' : '');
    });
  }

  if (filtroImpactoEl) {
    filtroImpactoEl.addEventListener('change', () => {
      renderizarIdeias(filtroOdsEl ? filtroOdsEl.value || '' : '', filtroImpactoEl.value || '');
    });
  }
}

// Marcar link ativo no nav
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('nav a');
  links.forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('ativo');
    }
  });
});
