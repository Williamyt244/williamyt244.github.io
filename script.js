import { supabase } from './supabase-config.js';

let todosPortfolios = [];

document.addEventListener('DOMContentLoaded', () => {
  criarParticulas();
  setupNavbar();
  setupMenuMobile();
  setupModal();
  setupFiltros();
  setupScrollTop();
  carregarSite();
  animarAoScroll();
});

async function carregarSite() {
  await Promise.all([
    carregarConfig(),
    carregarPortfolios(),
    carregarServicos(),
    carregarPrecos(),
    carregarContato(),
  ]);
  // Roda POR ÚLTIMO, depois de tudo carregado
  await carregarEstilosCustomizados();
}

async function carregarConfig() {
  try {
    const { data } = await supabase.from('site_config').select('*').eq('id','config').single();
    if (!data) return;

    if (data.logo_icone) {
      setText('logoIcone', data.logo_icone);
      setText('footerIcone', data.logo_icone);
    }
    if (data.cor_primaria || data.cor_secundaria || data.cor_fundo || data.cor_texto) {
      aplicarCores(data);
    }
    if (data.hero_badge) setText('heroBadge', data.hero_badge);
    if (data.hero_titulo) setText('heroTitulo', data.hero_titulo);
    if (data.hero_titulo_destaque) setText('heroTituloDestaque', data.hero_titulo_destaque);
    if (data.hero_subtitulo) setText('heroSubtitulo', data.hero_subtitulo);
    if (data.btn_portfolio) setText('btnVerPortfolio', data.btn_portfolio);
    if (data.btn_solicitar) setText('btnSolicitarArte', data.btn_solicitar);
    if (data.btn_nav) setText('navCtaTexto', data.btn_nav);
    if (data.servicos_tag) setText('servicosTag', data.servicos_tag);
    if (data.servicos_subtitulo) setText('servicosSubtitulo', data.servicos_subtitulo);
    if (data.precos_subtitulo) setText('precosSubtitulo', data.precos_subtitulo);
    if (data.combo_texto) document.getElementById('comboTexto').innerHTML = data.combo_texto;
    if (data.contato_subtitulo) setText('contatoSubtitulo', data.contato_subtitulo);
    if (data.contato_desc) setText('contatoDesc', data.contato_desc);
    if (data.footer_desc) setText('footerDesc', data.footer_desc);
    if (data.footer_copy) setText('footerCopy', data.footer_copy);
    if (data.discord) {
      setText('discordUser', data.discord);
      document.getElementById('btnDiscord').onclick = () =>
        window.open(`https://discord.com/users/${data.discord}`, '_blank');
    }

    await carregarStats();
  } catch(e) { console.error(e); }
}

async function carregarStats() {
  const { data } = await supabase.from('stats').select('*').order('ordem');
  if (!data || !data.length) return;
  const el = document.getElementById('heroStats');
  if (!el) return;
  el.innerHTML = data.map((s, i) => `
    ${i > 0 ? '<div class="stat-divider"></div>' : ''}
    <div class="stat">
      <span class="stat-number">${s.numero}</span>
      <span class="stat-label">${s.label}</span>
    </div>
  `).join('');
}

function aplicarCores(data) {
  const root = document.documentElement;
  if (data.cor_primaria) root.style.setProperty('--primary', data.cor_primaria);
  if (data.cor_secundaria) root.style.setProperty('--secondary', data.cor_secundaria);
  if (data.cor_fundo) root.style.setProperty('--dark', data.cor_fundo);
  if (data.cor_texto) root.style.setProperty('--text', data.cor_texto);
  if (data.cor_primaria && data.cor_secundaria) {
    root.style.setProperty('--gradient',
      `linear-gradient(135deg,${data.cor_primaria},${data.cor_secundaria})`);
  }
}

async function carregarEstilosCustomizados() {
  try {
    const { data } = await supabase
      .from('estilos_elementos')
      .select('propriedades')
      .eq('id', 'estilos')
      .single();

    if (!data?.propriedades) return;

    const MAPA_SELETORES = {
      'navbar': '.navbar',
      'nav-container': '.nav-container',
      'nav-logo': '.nav-logo',
      'nav-links': '.nav-links',
      'nav-link-inicio': '.nav-links li:nth-child(1) .nav-link',
      'nav-link-servicos': '.nav-links li:nth-child(2) .nav-link',
      'nav-link-precos': '.nav-links li:nth-child(3) .nav-link',
      'nav-link-portfolio': '.nav-links li:nth-child(4) .nav-link',
      'nav-link-contato': '.nav-links li:nth-child(5) .nav-link',
      'nav-cta': '.nav-cta',
      'hero': '.hero',
      'hero-content': '.hero-content',
      'hero-left': '.hero-left',
      'hero-right': '.hero-right',
      'hero-badge': '.hero-badge',
      'badge-dot': '.badge-dot',
      'hero-title': '.hero-title',
      'hero-titulo-span': '#heroTitulo',
      'hero-destaque-span': '#heroTituloDestaque',
      'hero-titulo-fim': '#heroTituloFim',
      'hero-subtitle': '.hero-subtitle',
      'hero-buttons': '.hero-buttons',
      'btn-primary': '.btn-primary',
      'btn-secondary': '.btn-secondary',
      'hero-stats': '.hero-stats',
      'stat-1': '.hero-stats .stat:nth-child(1)',
      'stat-number-1': '.hero-stats .stat:nth-child(1) .stat-number',
      'stat-label-1': '.hero-stats .stat:nth-child(1) .stat-label',
      'stat-2': '.hero-stats .stat:nth-child(3)',
      'stat-number-2': '.hero-stats .stat:nth-child(3) .stat-number',
      'stat-label-2': '.hero-stats .stat:nth-child(3) .stat-label',
      'stat-3': '.hero-stats .stat:nth-child(5)',
      'stat-number-3': '.hero-stats .stat:nth-child(5) .stat-number',
      'stat-label-3': '.hero-stats .stat:nth-child(5) .stat-label',
      'hero-visual-box': '.hero-visual-box',
      'cubo-container': '.cubo-container',
      'cubo': '.cubo',
      'face-frente': '.face.frente',
      'face-traseira': '.face.traseira',
      'face-esquerda': '.face.esquerda',
      'face-direita': '.face.direita',
      'face-topo': '.face.topo',
      'face-base': '.face.base',
      'visual-card-1': '.visual-card.vc1',
      'visual-card-2': '.visual-card.vc2',
      'visual-card-3': '.visual-card.vc3',
      'servicos': '.servicos',
      'servicos-container': '.servicos .container',
      'servicos-header': '.servicos .section-header',
      'servicos-tag': '.servicos .section-tag',
      'servicos-title': '.servicos .section-title',
      'servicos-subtitle': '.servicos .section-subtitle',
      'servicos-grid': '.servicos-grid',
      'servico-card-1': '.servico-card:nth-child(1)',
      'servico-card-2': '.servico-card:nth-child(2)',
      'servico-card-3': '.servico-card:nth-child(3)',
      'servico-card-4': '.servico-card:nth-child(4)',
      'precos': '.precos',
      'precos-container': '.precos .container',
      'precos-header': '.precos .section-header',
      'precos-tag': '.precos .section-tag',
      'precos-title': '.precos .section-title',
      'precos-subtitle': '.precos .section-subtitle',
      'precos-grid': '.precos-grid',
      'preco-card-1': '.preco-card:nth-child(1)',
      'preco-card-2': '.preco-card:nth-child(2)',
      'preco-card-3': '.preco-card:nth-child(3)',
      'preco-card-4': '.preco-card:nth-child(4)',
      'preco-card-5': '.preco-card:nth-child(5)',
      'combo-aviso': '.combo-aviso',
      'portfolio-section': '.portfolio-section',
      'portfolio-container': '.portfolio-section .container',
      'portfolio-header': '.portfolio-section .section-header',
      'portfolio-tag': '.portfolio-section .section-tag',
      'portfolio-title': '.portfolio-section .section-title',
      'filtros': '.filtros',
      'filtro-todos': '.filtro-btn:nth-child(1)',
      'filtro-logos': '.filtro-btn:nth-child(2)',
      'filtro-thumbs': '.filtro-btn:nth-child(3)',
      'filtro-banners': '.filtro-btn:nth-child(4)',
      'portfolio-grid': '.portfolio-grid',
      'contato': '.contato',
      'contato-container': '.contato .container',
      'contato-header': '.contato .section-header',
      'contato-tag': '.contato .section-tag',
      'contato-title': '.contato .section-title',
      'contato-subtitle': '.contato .section-subtitle',
      'contato-content': '.contato-content',
      'contato-card': '.contato-card',
      'discord-icon-box': '.discord-icon-box',
      'discord-user': '.discord-user',
      'btn-discord': '.btn-discord',
      'contato-info': '.contato-info',
      'info-item-1': '.info-item:nth-child(1)',
      'info-item-2': '.info-item:nth-child(2)',
      'info-item-3': '.info-item:nth-child(3)',
      'footer': '.footer',
      'footer-content': '.footer-content',
      'footer-logo': '.footer-logo',
      'footer-desc': '.footer-desc',
      'footer-links': '.footer-links',
      'footer-link-1': '.footer-links a:nth-child(1)',
      'footer-link-2': '.footer-links a:nth-child(2)',
      'footer-link-3': '.footer-links a:nth-child(3)',
      'footer-link-4': '.footer-links a:nth-child(4)',
      'footer-copy': '.footer-copy',
      'body': 'body',
      'particles': '.particles',
      'btn-topo': '.btn-topo',
      'modal-overlay': '.modal-overlay',
      'modal-content': '.modal-content',
    };

    Object.entries(data.propriedades).forEach(([elementoId, props]) => {
      const seletor = MAPA_SELETORES[elementoId];
      if (!seletor) return;
      const el = document.querySelector(seletor);
      if (!el) return;
      Object.entries(props).forEach(([prop, val]) => {
        el.style[prop] = val;
      });
    });

  } catch(e) {
    console.error('Erro ao carregar estilos:', e);
  }
}

async function carregarPortfolios() {
  const { data } = await supabase
    .from('portfolios')
    .select('*')
    .order('criado_em', { ascending: false });
  todosPortfolios = data || [];
  renderizarPortfolios(todosPortfolios);
}

async function carregarServicos() {
  const { data } = await supabase.from('servicos').select('*').order('ordem');
  const grid = document.getElementById('servicosGrid');
  if (!grid) return;
  if (!data || !data.length) { grid.innerHTML = ''; return; }

  grid.innerHTML = data.map(s => `
    <div class="servico-card ${s.destaque ? 'featured' : ''}">
      ${s.destaque ? `<div class="featured-badge">${s.badge_texto || '⭐ Mais Popular'}</div>` : ''}
      <div class="servico-icon" style="background:${s.cor}">
        <i class="${s.icone}"></i>
      </div>
      <h3>${s.titulo}</h3>
      <p>${s.descricao}</p>
      <div class="servico-tags">
        ${(s.tags || []).map(t =>
          `<span class="tag ${t.destaque ? 'tag-destaque' : ''}">${t.texto}</span>`
        ).join('')}
      </div>
    </div>
  `).join('');
}

async function carregarPrecos() {
  const { data } = await supabase.from('precos').select('*').order('ordem');
  const grid = document.getElementById('precosGrid');
  if (!grid) return;
  if (!data || !data.length) { grid.innerHTML = ''; return; }

  grid.innerHTML = data.map(p => `
    <div class="preco-card">
      <span class="preco-icon">${p.icone}</span>
      <div class="preco-nome">${p.nome}</div>
      <div class="preco-valor">${p.valor}</div>
      <div class="preco-obs">${p.obs}</div>
    </div>
  `).join('');
}

async function carregarContato() {
  const { data } = await supabase.from('contato_info').select('*').order('ordem');
  const el = document.getElementById('contatoInfo');
  if (!el || !data || !data.length) return;

  el.innerHTML = data.map(item => `
    <div class="info-item">
      <div class="info-icon">${item.icone}</div>
      <div>
        <h4>${item.titulo}</h4>
        <p>${item.texto}</p>
      </div>
    </div>
  `).join('');
}

function renderizarPortfolios(lista) {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;
  if (!lista.length) {
    grid.innerHTML = `
      <div class="portfolio-vazio">
        <i class="fas fa-images"></i>
        <p>Nenhum trabalho encontrado.</p>
      </div>`;
    return;
  }
  grid.innerHTML = lista.map((item, idx) => {
    const cor = getCatColor(item.categoria);
    return `
      <div class="portfolio-item" style="animation-delay:${idx * 0.07}s"
           onclick="abrirModal(${item.id})">
        ${item.destaque ? '<div class="p-destaque-badge">⭐ Destaque</div>' : ''}
        <div class="portfolio-img-wrap">
          <img src="${item.imagem}" alt="${item.titulo}" class="portfolio-img" loading="lazy"
               onerror="this.src='https://via.placeholder.com/600x400/1a1a26/7c3aed?text=WilliamDesign'"/>
          <div class="portfolio-overlay">
            <div class="overlay-icon"><i class="fas fa-expand"></i></div>
          </div>
        </div>
        <div class="portfolio-info">
          <h3>${item.titulo}</h3>
          <p>${item.descricao}</p>
          <span class="p-cat-badge"
                style="background:${cor.bg};color:${cor.text};border:1px solid ${cor.border}">
            ${formatCat(item.categoria)}
          </span>
        </div>
      </div>`;
  }).join('');
}

function setupFiltros() {
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filtro;
      renderizarPortfolios(
        f === 'todos'
          ? todosPortfolios
          : todosPortfolios.filter(p => p.categoria === f)
      );
    });
  });
}

function setupModal() {
  document.getElementById('modalClose').addEventListener('click', fecharModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) fecharModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharModal();
  });
}

window.abrirModal = function(id) {
  const item = todosPortfolios.find(p => p.id === id);
  if (!item) return;
  document.getElementById('modalImg').src = item.imagem;
  document.getElementById('modalTitulo').textContent = item.titulo;
  document.getElementById('modalDesc').textContent = item.descricao;
  document.getElementById('modalCat').textContent = formatCat(item.categoria);
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function setupNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    const sections = document.querySelectorAll('section[id]');
    let atual = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) atual = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${atual}`);
    });
  });
}

function setupMenuMobile() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    toggle.querySelector('i').className =
      menu.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
  });
  document.querySelectorAll('.mobile-link').forEach(l => {
    l.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.querySelector('i').className = 'fas fa-bars';
    });
  });
}

window.scrollToSection = function(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

function setupScrollTop() {
  const btn = document.getElementById('btnTopo');
  window.addEventListener('scroll', () =>
    btn.classList.toggle('visible', window.scrollY > 400)
  );
}

function animarAoScroll() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.servico-card,.preco-card,.info-item,.contato-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    obs.observe(el);
  });
}

function criarParticulas() {
  const container = document.getElementById('particles');
  if (!container) return;
  const cores = ['#7c3aed', '#06b6d4', '#f97316', '#10b981', '#a855f7'];
  const qtd = window.innerWidth > 768 ? 22 : 10;
  for (let i = 0; i < qtd; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 4 + 2;
    const cor = cores[Math.floor(Math.random() * cores.length)];
    p.style.cssText = `
      width:${size}px;height:${size}px;left:${Math.random() * 100}%;
      background:${cor};animation-duration:${Math.random() * 15 + 10}s;
      animation-delay:${Math.random() * 10}s;
      box-shadow:0 0 ${size * 3}px ${cor}
    `;
    container.appendChild(p);
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function getCatColor(cat) {
  const c = {
    logo: { bg: 'rgba(16,185,129,0.15)', text: '#10b981', border: 'rgba(16,185,129,0.3)' },
    thumbnail: { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: 'rgba(249,115,22,0.3)' },
    banner: { bg: 'rgba(6,182,212,0.15)', text: '#06b6d4', border: 'rgba(6,182,212,0.3)' },
    fotoperfil: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', border: 'rgba(168,85,247,0.3)' },
    outro: { bg: 'rgba(248,113,113,0.15)', text: '#f87171', border: 'rgba(248,113,113,0.3)' },
  };
  return c[cat] || c.outro;
}

function formatCat(cat) {
  const n = {
    logo: 'Logo',
    thumbnail: 'Thumbnail',
    banner: 'Banner',
    fotoperfil: 'Foto de Perfil',
    outro: 'Outro'
  };
  return n[cat] || cat;
}
