// ==========================================
// WILLIAM ARTS - Script Principal
// ==========================================

let todosPortfolios = [];
let filtroAtual = 'todos';

// ------------------------------------------
// INICIALIZAÇÃO
// ------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  criarParticulas();
  carregarDados();
  setupNavbar();
  setupMenuMobile();
  setupModal();
  setupFiltros();
  setupScrollTop();
  animarAoScroll();
});

// ------------------------------------------
// CARREGAR DADOS DO JSON
// ------------------------------------------
async function carregarDados() {
  try {
    // Adiciona timestamp para evitar cache
    const resp = await fetch(`portfolios.json?v=${Date.now()}`);
    if (!resp.ok) throw new Error('Erro ao carregar dados');
    const dados = await resp.json();

    todosPortfolios = dados.portfolios || [];
    const config = dados.config || {};

    // Preenche discord
    if (config.discord) {
      document.getElementById('discordUsername').textContent = config.discord;
      const btn = document.getElementById('btnDiscord');
      if (btn) {
        btn.onclick = () => {
          alert(`Me chame no Discord: ${config.discord}`);
        };
      }
    }

    // Preenche preços
    preencherPrecos(config.precos);

    // Renderiza portfólios
    renderizarPortfolios(todosPortfolios);

  } catch (err) {
    console.error('Erro:', err);
    document.getElementById('portfolioGrid').innerHTML = `
      <div class="portfolio-vazio">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Erro ao carregar portfólios. Recarregue a página.</p>
      </div>`;
  }
}

// ------------------------------------------
// PREENCHER PREÇOS
// ------------------------------------------
function preencherPrecos(precos) {
  if (!precos) return;
  const grid = document.getElementById('precosGrid');
  if (!grid) return;

  const itens = [
    { icon: '🖼️', nome: 'Foto de Perfil', valor: precos.fotoPerfil, obs: 'PNG com fundo transparente' },
    { icon: '🎬', nome: 'Thumbnail', valor: precos.thumbnail, obs: 'Ideal para YouTube' },
    { icon: '🖌️', nome: 'Banner', valor: precos.banner, obs: 'Para Discord e YouTube' },
    { icon: '👑', nome: 'Logo', valor: precos.logo, obs: 'Identidade visual completa' },
  ];

  grid.innerHTML = itens.map(item => `
    <div class="preco-card">
      <span class="preco-icon">${item.icon}</span>
      <div class="preco-nome">${item.nome}</div>
      <div class="preco-valor">${item.valor}</div>
      <div class="preco-obs">${item.obs}</div>
    </div>
  `).join('');
}

// ------------------------------------------
// RENDERIZAR PORTFÓLIOS
// ------------------------------------------
function renderizarPortfolios(lista) {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="portfolio-vazio">
        <i class="fas fa-images"></i>
        <p>Nenhum trabalho encontrado nessa categoria.</p>
      </div>`;
    return;
  }

  grid.innerHTML = lista.map((item, idx) => {
    const cor = getCategoriaColor(item.categoria);
    return `
      <div class="portfolio-item"
           style="animation-delay: ${idx * 0.08}s"
           onclick="abrirModal(${item.id})">
        ${item.destaque ? '<div class="portfolio-destaque-badge">⭐ Destaque</div>' : ''}
        <div class="portfolio-img-container">
          <img 
            src="${item.imagem}" 
            alt="${item.titulo}"
            class="portfolio-img"
            loading="lazy"
            onerror="this.src='https://via.placeholder.com/600x400/1a1a26/7c3aed?text=Arte+Minecraft'"
          />
          <div class="portfolio-overlay">
            <div class="overlay-icon">
              <i class="fas fa-expand"></i>
            </div>
          </div>
        </div>
        <div class="portfolio-info">
          <h3>${item.titulo}</h3>
          <p>${item.descricao}</p>
          <span class="portfolio-cat-badge" style="background: ${cor.bg}; color: ${cor.text}; border: 1px solid ${cor.border}">
            ${formatarCategoria(item.categoria)}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// ------------------------------------------
// CORES POR CATEGORIA
// ------------------------------------------
function getCategoriaColor(cat) {
  const cores = {
    logo: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', border: 'rgba(16,185,129,0.3)' },
    thumbnail: { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: 'rgba(249,115,22,0.3)' },
    banner: { bg: 'rgba(6,182,212,0.15)', text: '#06b6d4', border: 'rgba(6,182,212,0.3)' },
    fotoperfil: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', border: 'rgba(168,85,247,0.3)' },
    outro: { bg: 'rgba(248,113,113,0.15)', text: '#f87171', border: 'rgba(248,113,113,0.3)' },
  };
  return cores[cat] || cores.outro;
}

function formatarCategoria(cat) {
  const nomes = {
    logo: 'Logo',
    thumbnail: 'Thumbnail',
    banner: 'Banner',
    fotoperfil: 'Foto de Perfil',
    outro: 'Outro',
  };
  return nomes[cat] || cat;
}

// ------------------------------------------
// FILTROS
// ------------------------------------------
function setupFiltros() {
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtroAtual = btn.dataset.filtro;

      const filtrado = filtroAtual === 'todos'
        ? todosPortfolios
        : todosPortfolios.filter(p => p.categoria === filtroAtual);

      renderizarPortfolios(filtrado);
    });
  });
}

// ------------------------------------------
// MODAL
// ------------------------------------------
function setupModal() {
  const overlay = document.getElementById('modalOverlay');
  const btnClose = document.getElementById('modalClose');

  btnClose.addEventListener('click', fecharModal);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) fecharModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharModal();
  });
}

function abrirModal(id) {
  const item = todosPortfolios.find(p => p.id === id);
  if (!item) return;

  document.getElementById('modalImg').src = item.imagem;
  document.getElementById('modalImg').alt = item.titulo;
  document.getElementById('modalTitulo').textContent = item.titulo;
  document.getElementById('modalDesc').textContent = item.descricao;
  document.getElementById('modalCat').textContent = formatarCategoria(item.categoria);

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ------------------------------------------
// NAVBAR COM SCROLL
// ------------------------------------------
function setupNavbar() {
  const navbar = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Link ativo conforme scroll
    const sections = document.querySelectorAll('section[id]');
    let atual = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        atual = sec.getAttribute('id');
      }
    });

    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${atual}`);
    });
  });
}

// ------------------------------------------
// MENU MOBILE
// ------------------------------------------
function setupMenuMobile() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');

  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    const icon = toggle.querySelector('i');
    icon.className = menu.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.querySelector('i').className = 'fas fa-bars';
    });
  });
}

// ------------------------------------------
// SCROLL SUAVE
// ------------------------------------------
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ------------------------------------------
// BOTÃO TOPO
// ------------------------------------------
function setupScrollTop() {
  const btn = document.getElementById('btnTopo');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
}

// ------------------------------------------
// ANIMAÇÃO AO SCROLL (Intersection Observer)
// ------------------------------------------
function animarAoScroll() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const animaveis = document.querySelectorAll(
    '.servico-card, .preco-card, .info-item, .contato-card'
  );

  animaveis.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ------------------------------------------
// PARTÍCULAS DE FUNDO
// ------------------------------------------
function criarParticulas() {
  const container = document.getElementById('particles');
  if (!container) return;

  const cores = ['#7c3aed', '#06b6d4', '#f97316', '#10b981', '#a855f7'];
  const qtd = window.innerWidth > 768 ? 25 : 12;

  for (let i = 0; i < qtd; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');

    const size = Math.random() * 4 + 2;
    const cor = cores[Math.floor(Math.random() * cores.length)];
    const left = Math.random() * 100;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 10;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      background: ${cor};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 3}px ${cor};
    `;

    container.appendChild(p);
  }
}
