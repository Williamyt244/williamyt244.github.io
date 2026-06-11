// ==========================================
// ADMIN PANEL - WilliamArts
// ==========================================

// ⚠️ MUDE ESTA SENHA PARA A SUA SENHA PESSOAL!
const SENHA_ADMIN = 'minecraft2024@william';

// ------------------------------------------
// ESTADO DO APP
// ------------------------------------------
let dadosAtuais = {
  portfolios: [],
  config: {
    nomeArtista: 'William',
    discord: '',
    descricaoHero: 'Artes profissionais para servidores e canais de Minecraft',
    precos: {
      fotoPerfil: 'R$ 5,50',
      thumbnail: 'R$ 4,00',
      banner: 'R$ 5,65',
      logo: 'R$ 6,00'
    }
  }
};

let modoEdicao = false;
let idEdicao = null;

// ------------------------------------------
// LOGIN
// ------------------------------------------
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const senha = document.getElementById('senhaInput').value;
  const erro = document.getElementById('erroLogin');

  if (senha === SENHA_ADMIN) {
    sessionStorage.setItem('admin_auth', 'true');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    inicializarAdmin();
  } else {
    erro.classList.add('show');
    document.getElementById('senhaInput').value = '';
    setTimeout(() => erro.classList.remove('show'), 3000);
  }
});

// Eye button - mostrar/ocultar senha
document.getElementById('eyeBtn').addEventListener('click', () => {
  const input = document.getElementById('senhaInput');
  const icon = document.querySelector('#eyeBtn i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
});

// Verificar se já está logado
if (sessionStorage.getItem('admin_auth') === 'true') {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'flex';
  inicializarAdmin();
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('admin_auth');
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('senhaInput').value = '';
});

// ------------------------------------------
// INICIALIZAR ADMIN
// ------------------------------------------
async function inicializarAdmin() {
  await carregarDadosAdmin();
  renderizarLista();
  preencherConfigForm();
  setupAbas();
  setupFormPortfolio();
  setupConfig();
}

// ------------------------------------------
// CARREGAR DADOS
// ------------------------------------------
async function carregarDadosAdmin() {
  try {
    const resp = await fetch(`portfolios.json?v=${Date.now()}`);
    if (resp.ok) {
      dadosAtuais = await resp.json();
      if (!dadosAtuais.portfolios) dadosAtuais.portfolios = [];
      if (!dadosAtuais.config) dadosAtuais.config = {};
      if (!dadosAtuais.config.precos) dadosAtuais.config.precos = {};
    }
  } catch (e) {
    console.log('Usando dados padrão');
  }
}

// ------------------------------------------
// ABAS
// ------------------------------------------
function setupAbas() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const aba = btn.dataset.aba;

      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.aba').forEach(a => a.style.display = 'none');
      document.getElementById(`aba-${aba}`).style.display = 'block';
    });
  });
}

// ------------------------------------------
// FORMULÁRIO DE PORTFÓLIO
// ------------------------------------------
function setupFormPortfolio() {
  const btnAdd = document.getElementById('btnAddPortfolio');
  const formSection = document.getElementById('formSection');
  const btnFechar = document.getElementById('fecharForm');
  const btnFechar2 = document.getElementById('fecharForm2');
  const form = document.getElementById('portfolioForm');
  const inputImagem = document.getElementById('fImagem');

  btnAdd.addEventListener('click', () => {
    modoEdicao = false;
    idEdicao = null;
    form.reset();
    document.getElementById('formTitulo').textContent = '➕ Novo Portfólio';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('jsonResult').style.display = 'none';
    formSection.style.display = 'block';
    formSection.scrollIntoView({ behavior: 'smooth' });
  });

  const fechar = () => {
    formSection.style.display = 'none';
    form.reset();
    document.getElementById('previewContainer').style.display = 'none';
  };

  btnFechar.addEventListener('click', fechar);
  btnFechar2.addEventListener('click', fechar);

  // Preview de imagem
  inputImagem.addEventListener('input', debounce(() => {
    const url = inputImagem.value.trim();
    if (url) {
      const preview = document.getElementById('imgPreview');
      preview.src = url;
      preview.onload = () => {
        document.getElementById('previewContainer').style.display = 'block';
      };
      preview.onerror = () => {
        document.getElementById('previewContainer').style.display = 'none';
      };
    } else {
      document.getElementById('previewContainer').style.display = 'none';
    }
  }, 600));

  // Submit do form
  form.addEventListener('submit', e => {
    e.preventDefault();
    salvarPortfolio();
  });
}

function salvarPortfolio() {
  const titulo = document.getElementById('fTitulo').value.trim();
  const categoria = document.getElementById('fCategoria').value;
  const descricao = document.getElementById('fDescricao').value.trim();
  const imagem = document.getElementById('fImagem').value.trim();
  const destaque = document.getElementById('fDestaque').checked;

  if (!titulo || !categoria || !descricao || !imagem) {
    alert('Por favor, preencha todos os campos!');
    return;
  }

  if (modoEdicao && idEdicao !== null) {
    // Editar existente
    const idx = dadosAtuais.portfolios.findIndex(p => p.id === idEdicao);
    if (idx !== -1) {
      dadosAtuais.portfolios[idx] = {
        ...dadosAtuais.portfolios[idx],
        titulo, categoria, descricao, imagem, destaque
      };
    }
  } else {
    // Novo
    const novoId = dadosAtuais.portfolios.length > 0
      ? Math.max(...dadosAtuais.portfolios.map(p => p.id)) + 1
      : 1;

    dadosAtuais.portfolios.push({
      id: novoId,
      titulo,
      categoria,
      descricao,
      imagem,
      destaque
    });
  }

  // Esconder form
  document.getElementById('formSection').style.display = 'none';
  document.getElementById('portfolioForm').reset();

  // Mostrar JSON
  exibirJsonResultado();

  // Atualizar lista
  renderizarLista();

  const acao = modoEdicao ? 'editado' : 'adicionado';
  mostrarNotificacao(`✅ Portfólio ${acao} com sucesso!`);
  modoEdicao = false;
  idEdicao = null;
}

// ------------------------------------------
// RENDERIZAR LISTA ADMIN
// ------------------------------------------
function renderizarLista() {
  const lista = document.getElementById('adminLista');
  const portfolios = dadosAtuais.portfolios;

  if (portfolios.length === 0) {
    lista.innerHTML = `
      <div class="admin-vazio">
        <i class="fas fa-images"></i>
        <p>Nenhum portfólio cadastrado ainda.</p>
        <p>Clique em "Novo Portfólio" para começar!</p>
      </div>`;
    return;
  }

  lista.innerHTML = portfolios.map(item => `
    <div class="admin-item">
      <img 
        src="${item.imagem}" 
        alt="${item.titulo}"
        class="admin-item-img"
        onerror="this.src='https://via.placeholder.com/300x160/1a1a26/7c3aed?text=Sem+Imagem'"
      />
      <div class="admin-item-info">
        <div class="admin-item-title">${item.titulo}</div>
        <div class="admin-item-cat">
          ${formatarCat(item.categoria)} 
          ${item.destaque ? '⭐ Destaque' : ''}
        </div>
        <div class="admin-item-actions">
          <button class="btn-edit" onclick="editarPortfolio(${item.id})">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-del" onclick="deletarPortfolio(${item.id})">
            <i class="fas fa-trash"></i> Excluir
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ------------------------------------------
// EDITAR
// ------------------------------------------
function editarPortfolio(id) {
  const item = dadosAtuais.portfolios.find(p => p.id === id);
  if (!item) return;

  modoEdicao = true;
  idEdicao = id;

  document.getElementById('fTitulo').value = item.titulo;
  document.getElementById('fCategoria').value = item.categoria;
  document.getElementById('fDescricao').value = item.descricao;
  document.getElementById('fImagem').value = item.imagem;
  document.getElementById('fDestaque').checked = item.destaque;
  document.getElementById('formTitulo').textContent = '✏️ Editar Portfólio';

  // Preview
  const preview = document.getElementById('imgPreview');
  preview.src = item.imagem;
  document.getElementById('previewContainer').style.display = 'block';

  document.getElementById('jsonResult').style.display = 'none';
  document.getElementById('formSection').style.display = 'block';
  document.getElementById('formSection').scrollIntoView({ behavior: 'smooth' });
}

// ------------------------------------------
// DELETAR
// ------------------------------------------
function deletarPortfolio(id) {
  const item = dadosAtuais.portfolios.find(p => p.id === id);
  if (!item) return;

  if (!confirm(`Tem certeza que quer excluir "${item.titulo}"?`)) return;

  dadosAtuais.portfolios = dadosAtuais.portfolios.filter(p => p.id !== id);
  renderizarLista();
  exibirJsonResultado();
  mostrarNotificacao('🗑️ Portfólio excluído!');
}

// ------------------------------------------
// EXIBIR JSON RESULTADO
// ------------------------------------------
function exibirJsonResultado() {
  const jsonStr = JSON.stringify(dadosAtuais, null, 2);
  document.getElementById('jsonOutput').value = jsonStr;
  document.getElementById('jsonResult').style.display = 'block';
  document.getElementById('jsonResult').scrollIntoView({ behavior: 'smooth' });

  document.getElementById('btnCopiarJson').onclick = () => {
    copiarTexto(jsonStr);
    mostrarNotificacao('📋 JSON copiado! Cole no GitHub.');
  };
}

// ------------------------------------------
// CONFIGURAÇÕES
// ------------------------------------------
function preencherConfigForm() {
  const config = dadosAtuais.config;
  if (!config) return;

  if (config.discord) document.getElementById('cDiscord').value = config.discord;
  if (config.precos) {
    if (config.precos.fotoPerfil) document.getElementById('cFotoPerfil').value = config.precos.fotoPerfil;
    if (config.precos.thumbnail) document.getElementById('cThumbnail').value = config.precos.thumbnail;
    if (config.precos.banner) document.getElementById('cBanner').value = config.precos.banner;
    if (config.precos.logo) document.getElementById('cLogo').value = config.precos.logo;
  }
}

function setupConfig() {
  document.getElementById('btnSalvarConfig').addEventListener('click', () => {
    dadosAtuais.config.discord = document.getElementById('cDiscord').value.trim();
    dadosAtuais.config.precos = {
      fotoPerfil: document.getElementById('cFotoPerfil').value.trim() || 'R$ 5,50',
      thumbnail: document.getElementById('cThumbnail').value.trim() || 'R$ 4,00',
      banner: document.getElementById('cBanner').value.trim() || 'R$ 5,65',
      logo: document.getElementById('cLogo').value.trim() || 'R$ 6,00',
    };

    const jsonStr = JSON.stringify(dadosAtuais, null, 2);
    document.getElementById('jsonOutputConfig').value = jsonStr;
    document.getElementById('jsonResultConfig').style.display = 'block';
    document.getElementById('jsonResultConfig').scrollIntoView({ behavior: 'smooth' });
    mostrarNotificacao('✅ Configurações salvas no JSON!');

    document.getElementById('btnCopiarConfig').onclick = () => {
      copiarTexto(jsonStr);
      mostrarNotificacao('📋 JSON copiado!');
    };
  });
}

// ------------------------------------------
// UTILITÁRIOS
// ------------------------------------------
function formatarCat(cat) {
  const n = { logo: 'Logo', thumbnail: 'Thumbnail', banner: 'Banner', fotoperfil: 'Foto de Perfil', outro: 'Outro' };
  return n[cat] || cat;
}

function copiarTexto(texto) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(texto);
  } else {
    const ta = document.createElement('textarea');
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

function mostrarNotificacao(msg) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: #1a1a26; border: 1px solid rgba(124,58,237,0.4);
    color: #e2e8f0; padding: 14px 28px; border-radius: 50px;
    font-size: 15px; font-weight: 500; z-index: 9999;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    animation: notif-in 0.3s ease; font-family: 'Inter', sans-serif;
  `;
  notif.textContent = msg;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes notif-in { from { opacity:0; transform: translate(-50%, 20px); } to { opacity:1; transform: translate(-50%, 0); } }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transition = 'opacity 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
