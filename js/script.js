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
   const modais = {
      ods6: {
        cor: '#0277bd',
        icone: 'fa-faucet-drip',
        titulo: 'ODS 6 — Água Limpa e Saneamento',
        conteudo: `
          <p>O <strong>ODS 6</strong> foi adotado pela ONU em 2015 como parte da Agenda 2030. Seu objetivo central é garantir a disponibilidade e gestão sustentável da água e do saneamento para todos até 2030.</p>
          <h4>Por que é urgente?</h4>
          <ul>
            <li>Segundo a OMS e UNICEF (2023), <strong>2,2 bilhões de pessoas</strong> ainda não têm acesso a água potável gerida de forma segura.</li>
            <li><strong>3,5 bilhões</strong> carecem de saneamento básico adequado.</li>
            <li>Doenças de veiculação hídrica — como cólera e diarreia — matam cerca de <strong>800 mil crianças menores de 5 anos por ano</strong> no mundo (OMS, 2019).</li>
            <li>No Brasil, segundo o SNIS 2022, apenas <strong>56% da população</strong> tem acesso a coleta de esgoto.</li>
        </ul>
          <h4>Metas principais</h4>
          <ul>
            <li>Acesso universal e equitativo à água potável segura e acessível até 2030.</li>
            <li>Saneamento e higiene adequados para todos, encerrando a defecação a céu aberto.</li>
            <li>Melhoria da qualidade da água, reduzindo poluição e aumentando a reciclagem hídrica.</li>
            <li>Proteção dos ecossistemas aquáticos — rios, lagos, aquíferos e zonas úmidas.</li>
          </ul>
          <h4>Ações práticas</h4>
          <ul>
            <li>Instalar redutores de vazão em torneiras e chuveiros.</li>
            <li>Captar água da chuva para uso não potável (jardim, limpeza).</li>
            <li>Reportar vazamentos na rede pública ao município.</li>
            <li>Apoiar organizações que levam água potável a comunidades rurais.</li>
          </ul>
        `
      },
      ods10: {
        cor: '#c62828',
        icone: 'fa-scale-balanced',
        titulo: 'ODS 10 — Redução das Desigualdades',
        conteudo: `
          <p>O <strong>ODS 10</strong> busca reduzir as desigualdades dentro e entre os países. No contexto hídrico, ele reconhece que o acesso à água potável e ao saneamento não é distribuído de forma igualitária — e que essa desigualdade perpetua a pobreza e a exclusão social.</p>
          <h4>Desigualdade hídrica no mundo</h4>
          <ul>
            <li>Nas áreas rurais da África Subsaariana, mulheres e crianças percorrem <strong>até 6 km por viagem</strong> para buscar água (ONU-Água, 2023).</li>
            <li>Famílias pobres em países em desenvolvimento pagam até <strong>10 vezes mais</strong> por litro de água do que famílias ricas com rede encanada.</li>
            <li>No Brasil, comunidades quilombolas e indígenas têm acesso à água tratada muito inferior à média nacional.</li>
            <li>A falta de banheiros nas escolas é uma das principais causas de evasão escolar entre meninas adolescentes.</li>
          </ul>
          <h4>Metas principais</h4>
          <ul>
            <li>Garantir que políticas sociais priorizem as populações mais vulneráveis.</li>
            <li>Promover inclusão social, econômica e política de todos, independente de origem, gênero ou local de moradia.</li>
            <li>Regular mercados e instituições para reduzir a desigualdade de resultados.</li>
          </ul>
          <h4>Ações práticas</h4>
          <ul>
            <li>Apoiar políticas de tarifas sociais de água para famílias de baixa renda.</li>
            <li>Pressionar governos municipais por investimento em saneamento em bairros periféricos.</li>
            <li>Valorizar e apoiar organizações que atuam em comunidades rurais e tradicionais.</li>
          </ul>
        `
      },
      ods12: {
        cor: '#e65100',
        icone: 'fa-recycle',
        titulo: 'ODS 12 — Consumo e Produção Responsáveis',
        conteudo: `
          <p>O <strong>ODS 12</strong> propõe uma transformação nos padrões globais de consumo e produção, com foco na eficiência no uso de recursos naturais — especialmente a água.</p>
          <h4>A pegada hídrica do consumo</h4>
          <ul>
            <li>Produzir <strong>1 kg de carne bovina</strong> consome em média 15.400 litros de água (Water Footprint Network).</li>
            <li>Uma única calça jeans requer cerca de <strong>7.500 litros</strong> para ser produzida.</li>
            <li>A indústria têxtil é responsável por <strong>20% da poluição hídrica industrial</strong> global (PNUMA).</li>
            <li>O desperdício alimentar global equivale a desperdiçar <strong>250 km³ de água por ano</strong> — mais que o volume anual do Rio Nilo (FAO, 2013).</li>
            <li>A agropecuária consome cerca de <strong>70% de toda a água doce</strong> utilizada no planeta (FAO).</li>
          </ul>
          <h4>Metas principais</h4>
          <ul>
            <li>Alcançar gestão sustentável e uso eficiente dos recursos naturais até 2030.</li>
            <li>Reduzir pela metade o desperdício de alimentos per capita até 2030.</li>
            <li>Gestão ambientalmente responsável de produtos químicos e resíduos.</li>
            <li>Garantir que as empresas adotem e divulguem práticas de sustentabilidade.</li>
          </ul>
          <h4>Ações práticas</h4>
          <ul>
            <li>Reduzir o consumo de carne, especialmente bovina.</li>
            <li>Evitar desperdício de alimentos — planejar compras e armazenar corretamente.</li>
            <li>Preferir marcas com certificação de gestão hídrica responsável.</li>
            <li>Reutilizar água de cozimento de legumes para regar plantas.</li>
          </ul>
        `
      }
    };

    function abrirModal(id) {
      const dados = modais[id];
      const conteudo = document.getElementById('modal-conteudo');
      conteudo.innerHTML = `
        <div class="modal-header" style="border-color: ${dados.cor}">
          <i class="fa-solid ${dados.icone}" style="color: ${dados.cor}; font-size: 2rem;"></i>
          <h2 id="modal-titulo" style="color: ${dados.cor}">${dados.titulo}</h2>
        </div>
        <div class="modal-body">${dados.conteudo}</div>
        <div class="modal-footer">
          <a href="ods.html#${id}" class="btn btn-modal" style="background: ${dados.cor}">
            Ver página completa <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      `;
      document.getElementById('modal-overlay').classList.add('ativo');
      document.body.style.overflow = 'hidden';
    }

    function fecharModal() {
      document.getElementById('modal-overlay').classList.remove('ativo');
      document.body.style.overflow = '';
    }

    function fecharModalOverlay(e) {
      if (e.target === document.getElementById('modal-overlay')) fecharModal();
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') fecharModal();
    });
  

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
