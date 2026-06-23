// ============================================
// AquaVida - script.js
// ============================================

// ===== UTILITÁRIOS =====

function salvarIdeia(ideia) {
  const ideias = carregarIdeias();
  ideias.unshift(ideia); // mais recente primeiro
  localStorage.setItem('aquavida_ideias', JSON.stringify(ideias));
}

function carregarIdeias() {
  const dados = localStorage.getItem('aquavida_ideias');
  return dados ? JSON.parse(dados) : [];
}

// ===== FORMULÁRIO (formulario.html) =====

const formulario = document.getElementById('form-ideia');

if (formulario) {
  formulario.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome      = document.getElementById('nome').value.trim();
    const email     = document.getElementById('email').value.trim();
    const ods       = document.getElementById('ods').value;
    const descricao = document.getElementById('descricao').value.trim();
    const impacto   = document.querySelector('input[name="impacto"]:checked');

    if (!nome || !email || !ods || !descricao || !impacto) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const ideia = {
      id:       Date.now(),
      nome,
      email,
      ods,
      descricao,
      impacto:  impacto.value, // "Alto", "Médio" ou "Baixo"
      data:     new Date().toLocaleDateString('pt-BR')
    };

    salvarIdeia(ideia);

    formulario.reset();

    const msg = document.getElementById('mensagem-sucesso');
    if (msg) {
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 4000);
    }
  });
}

// ===== RESULTADOS (resultados.html) =====

function renderizarIdeias(filtroOds = 'todos', filtroImpacto = 'todos') {
  const container = document.getElementById('lista-ideias');
  const semDados  = document.getElementById('sem-dados');
  const contador  = document.getElementById('contador-ideias');

  if (!container) return;

  let ideias = carregarIdeias();

  if (filtroOds !== 'todos') {
    ideias = ideias.filter(i => i.ods === filtroOds);
  }
  if (filtroImpacto !== 'todos') {
    ideias = ideias.filter(i => i.impacto === filtroImpacto);
  }

  if (contador) {
    contador.textContent = `${ideias.length} ideia${ideias.length !== 1 ? 's' : ''} encontrada${ideias.length !== 1 ? 's' : ''}`;
  }

  // Limpar cards anteriores (mantém o #sem-dados)
  Array.from(container.children).forEach(child => {
    if (child.id !== 'sem-dados') child.remove();
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
    const card = document.createElement('article');
    card.className = 'card-ideia';
    card.innerHTML = `
      <div class="ideia-header">
        <span class="ideia-nome">👤 ${ideia.nome}</span>
        <span class="ideia-ods">${odsNomes[ideia.ods] || ideia.ods}</span>
      </div>
      <p class="ideia-descricao">${ideia.descricao}</p>
      <div class="ideia-footer">
        <span class="impacto-badge ${impactoClasse[ideia.impacto] || ''}">
          ${impactoIcone[ideia.impacto] || ideia.impacto}
        </span>
        <span>📅 ${ideia.data}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Inicializar filtros em resultados.html
const filtroOdsEl     = document.getElementById('filtro-ods');
const filtroImpactoEl = document.getElementById('filtro-impacto');

if (filtroOdsEl || filtroImpactoEl) {
  renderizarIdeias();

  if (filtroOdsEl) {
    filtroOdsEl.addEventListener('change', () => {
      renderizarIdeias(
        filtroOdsEl.value || 'todos',
        filtroImpactoEl ? filtroImpactoEl.value || 'todos' : 'todos'
      );
    });
  }

  if (filtroImpactoEl) {
    filtroImpactoEl.addEventListener('change', () => {
      renderizarIdeias(
        filtroOdsEl ? filtroOdsEl.value || 'todos' : 'todos',
        filtroImpactoEl.value || 'todos'
      );
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