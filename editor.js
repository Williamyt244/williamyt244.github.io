// ==========================================
// EDITOR VISUAL - WilliamDesign
// ==========================================
import { supabase } from './supabase-config.js';

let elementoSelecionadoId = null;
let estilosAtuais = {};
let iframeDoc = null;

const ELEMENTOS_EDITAVEIS = [
  {
    secao: 'Navbar',
    icone: 'fas fa-bars',
    itens: [
      { id: 'navbar', label: 'Barra completa', seletor: '.navbar' },
      { id: 'nav-container', label: 'Container', seletor: '.nav-container' },
      { id: 'nav-logo', label: 'Logo', seletor: '.nav-logo' },
      { id: 'nav-links', label: 'Links container', seletor: '.nav-links' },
      { id: 'nav-link-inicio', label: 'Link Início', seletor: '.nav-links li:nth-child(1) .nav-link' },
      { id: 'nav-link-servicos', label: 'Link Serviços', seletor: '.nav-links li:nth-child(2) .nav-link' },
      { id: 'nav-link-precos', label: 'Link Preços', seletor: '.nav-links li:nth-child(3) .nav-link' },
      { id: 'nav-link-portfolio', label: 'Link Portfólio', seletor: '.nav-links li:nth-child(4) .nav-link' },
      { id: 'nav-link-contato', label: 'Link Contato', seletor: '.nav-links li:nth-child(5) .nav-link' },
      { id: 'nav-cta', label: 'Botão Contratar', seletor: '.nav-cta' },
    ]
  },
  {
    secao: 'Hero - Geral',
    icone: 'fas fa-home',
    itens: [
      { id: 'hero', label: 'Seção Hero', seletor: '.hero' },
      { id: 'hero-content', label: 'Conteúdo Hero', seletor: '.hero-content' },
      { id: 'hero-left', label: 'Lado Esquerdo', seletor: '.hero-left' },
      { id: 'hero-right', label: 'Lado Direito', seletor: '.hero-right' },
    ]
  },
  {
    secao: 'Hero - Textos',
    icone: 'fas fa-font',
    itens: [
      { id: 'hero-badge', label: 'Badge verde', seletor: '.hero-badge' },
      { id: 'badge-dot', label: 'Ponto badge', seletor: '.badge-dot' },
      { id: 'hero-title', label: 'Título completo', seletor: '.hero-title' },
      { id: 'hero-titulo-span', label: 'Título parte 1', seletor: '#heroTitulo' },
      { id: 'hero-destaque-span', label: 'Título colorido', seletor: '#heroTituloDestaque' },
      { id: 'hero-titulo-fim', label: 'Título parte 3', seletor: '#heroTituloFim' },
      { id: 'hero-subtitle', label: 'Subtítulo', seletor: '.hero-subtitle' },
    ]
  },
  {
    secao: 'Hero - Botões',
    icone: 'fas fa-hand-pointer',
    itens: [
      { id: 'hero-buttons', label: 'Container botões', seletor: '.hero-buttons' },
      { id: 'btn-primary', label: 'Botão Ver Portfólio', seletor: '.btn-primary' },
      { id: 'btn-secondary', label: 'Botão Solicitar Arte', seletor: '.btn-secondary' },
    ]
  },
  {
    secao: 'Hero - Stats',
    icone: 'fas fa-chart-bar',
    itens: [
      { id: 'hero-stats', label: 'Container stats', seletor: '.hero-stats' },
      { id: 'stat-1', label: 'Stat 1', seletor: '.hero-stats .stat:nth-child(1)' },
      { id: 'stat-number-1', label: 'Número stat 1', seletor: '.hero-stats .stat:nth-child(1) .stat-number' },
      { id: 'stat-label-1', label: 'Label stat 1', seletor: '.hero-stats .stat:nth-child(1) .stat-label' },
      { id: 'stat-2', label: 'Stat 2', seletor: '.hero-stats .stat:nth-child(3)' },
      { id: 'stat-number-2', label: 'Número stat 2', seletor: '.hero-stats .stat:nth-child(3) .stat-number' },
      { id: 'stat-label-2', label: 'Label stat 2', seletor: '.hero-stats .stat:nth-child(3) .stat-label' },
      { id: 'stat-3', label: 'Stat 3', seletor: '.hero-stats .stat:nth-child(5)' },
      { id: 'stat-number-3', label: 'Número stat 3', seletor: '.hero-stats .stat:nth-child(5) .stat-number' },
      { id: 'stat-label-3', label: 'Label stat 3', seletor: '.hero-stats .stat:nth-child(5) .stat-label' },
    ]
  },
  {
    secao: 'Hero - Visual 3D',
    icone: 'fas fa-cube',
    itens: [
      { id: 'hero-visual-box', label: 'Caixa visual', seletor: '.hero-visual-box' },
      { id: 'cubo-container', label: 'Container cubo', seletor: '.cubo-container' },
      { id: 'cubo', label: 'Cubo 3D', seletor: '.cubo' },
      { id: 'face-frente', label: 'Face frente', seletor: '.face.frente' },
      { id: 'face-traseira', label: 'Face traseira', seletor: '.face.traseira' },
      { id: 'face-esquerda', label: 'Face esquerda', seletor: '.face.esquerda' },
      { id: 'face-direita', label: 'Face direita', seletor: '.face.direita' },
      { id: 'face-topo', label: 'Face topo', seletor: '.face.topo' },
      { id: 'face-base', label: 'Face base', seletor: '.face.base' },
      { id: 'visual-card-1', label: 'Card Logo Profissional', seletor: '.visual-card.vc1' },
      { id: 'visual-card-2', label: 'Card Thumbnail HD', seletor: '.visual-card.vc2' },
      { id: 'visual-card-3', label: 'Card Alta Qualidade', seletor: '.visual-card.vc3' },
    ]
  },
  {
    secao: 'Serviços',
    icone: 'fas fa-concierge-bell',
    itens: [
      { id: 'servicos', label: 'Seção Serviços', seletor: '.servicos' },
      { id: 'servicos-container', label: 'Container', seletor: '.servicos .container' },
      { id: 'servicos-header', label: 'Cabeçalho', seletor: '.servicos .section-header' },
      { id: 'servicos-tag', label: 'Tag', seletor: '.servicos .section-tag' },
      { id: 'servicos-title', label: 'Título', seletor: '.servicos .section-title' },
      { id: 'servicos-subtitle', label: 'Subtítulo', seletor: '.servicos .section-subtitle' },
      { id: 'servicos-grid', label: 'Grid de cards', seletor: '.servicos-grid' },
      { id: 'servico-card-1', label: 'Card serviço 1', seletor: '.servico-card:nth-child(1)' },
      { id: 'servico-card-2', label: 'Card serviço 2', seletor: '.servico-card:nth-child(2)' },
      { id: 'servico-card-3', label: 'Card serviço 3', seletor: '.servico-card:nth-child(3)' },
      { id: 'servico-card-4', label: 'Card serviço 4', seletor: '.servico-card:nth-child(4)' },
    ]
  },
  {
    secao: 'Preços',
    icone: 'fas fa-tags',
    itens: [
      { id: 'precos', label: 'Seção Preços', seletor: '.precos' },
      { id: 'precos-container', label: 'Container', seletor: '.precos .container' },
      { id: 'precos-header', label: 'Cabeçalho', seletor: '.precos .section-header' },
      { id: 'precos-tag', label: 'Tag', seletor: '.precos .section-tag' },
      { id: 'precos-title', label: 'Título', seletor: '.precos .section-title' },
      { id: 'precos-subtitle', label: 'Subtítulo', seletor: '.precos .section-subtitle' },
      { id: 'precos-grid', label: 'Grid de cards', seletor: '.precos-grid' },
      { id: 'preco-card-1', label: 'Card preço 1', seletor: '.preco-card:nth-child(1)' },
      { id: 'preco-card-2', label: 'Card preço 2', seletor: '.preco-card:nth-child(2)' },
      { id: 'preco-card-3', label: 'Card preço 3', seletor: '.preco-card:nth-child(3)' },
      { id: 'preco-card-4', label: 'Card preço 4', seletor: '.preco-card:nth-child(4)' },
      { id: 'preco-card-5', label: 'Card preço 5', seletor: '.preco-card:nth-child(5)' },
      { id: 'combo-aviso', label: 'Aviso combo', seletor: '.combo-aviso' },
    ]
  },
  {
    secao: 'Portfólio',
    icone: 'fas fa-images',
    itens: [
      { id: 'portfolio-section', label: 'Seção Portfólio', seletor: '.portfolio-section' },
      { id: 'portfolio-container', label: 'Container', seletor: '.portfolio-section .container' },
      { id: 'portfolio-header', label: 'Cabeçalho', seletor: '.portfolio-section .section-header' },
      { id: 'portfolio-tag', label: 'Tag', seletor: '.portfolio-section .section-tag' },
      { id: 'portfolio-title', label: 'Título', seletor: '.portfolio-section .section-title' },
      { id: 'filtros', label: 'Filtros', seletor: '.filtros' },
      { id: 'filtro-todos', label: 'Filtro Todos', seletor: '.filtro-btn:nth-child(1)' },
      { id: 'filtro-logos', label: 'Filtro Logos', seletor: '.filtro-btn:nth-child(2)' },
      { id: 'filtro-thumbs', label: 'Filtro Thumbnails', seletor: '.filtro-btn:nth-child(3)' },
      { id: 'filtro-banners', label: 'Filtro Banners', seletor: '.filtro-btn:nth-child(4)' },
      { id: 'portfolio-grid', label: 'Grid', seletor: '.portfolio-grid' },
    ]
  },
  {
    secao: 'Contato',
    icone: 'fas fa-headset',
    itens: [
      { id: 'contato', label: 'Seção Contato', seletor: '.contato' },
      { id: 'contato-container', label: 'Container', seletor: '.contato .container' },
      { id: 'contato-header', label: 'Cabeçalho', seletor: '.contato .section-header' },
      { id: 'contato-tag', label: 'Tag', seletor: '.contato .section-tag' },
      { id: 'contato-title', label: 'Título', seletor: '.contato .section-title' },
      { id: 'contato-subtitle', label: 'Subtítulo', seletor: '.contato .section-subtitle' },
      { id: 'contato-content', label: 'Grid conteúdo', seletor: '.contato-content' },
      { id: 'contato-card', label: 'Card Discord', seletor: '.contato-card' },
      { id: 'discord-icon-box', label: 'Ícone Discord', seletor: '.discord-icon-box' },
      { id: 'discord-user', label: 'Username Discord', seletor: '.discord-user' },
      { id: 'btn-discord', label: 'Botão Discord', seletor: '.btn-discord' },
      { id: 'contato-info', label: 'Cards info', seletor: '.contato-info' },
      { id: 'info-item-1', label: 'Info item 1', seletor: '.info-item:nth-child(1)' },
      { id: 'info-item-2', label: 'Info item 2', seletor: '.info-item:nth-child(2)' },
      { id: 'info-item-3', label: 'Info item 3', seletor: '.info-item:nth-child(3)' },
    ]
  },
  {
    secao: 'Footer',
    icone: 'fas fa-shoe-prints',
    itens: [
      { id: 'footer', label: 'Footer completo', seletor: '.footer' },
      { id: 'footer-content', label: 'Conteúdo', seletor: '.footer-content' },
      { id: 'footer-logo', label: 'Logo', seletor: '.footer-logo' },
      { id: 'footer-desc', label: 'Descrição', seletor: '.footer-desc' },
      { id: 'footer-links', label: 'Links container', seletor: '.footer-links' },
      { id: 'footer-link-1', label: 'Link Início', seletor: '.footer-links a:nth-child(1)' },
      { id: 'footer-link-2', label: 'Link Serviços', seletor: '.footer-links a:nth-child(2)' },
      { id: 'footer-link-3', label: 'Link Portfólio', seletor: '.footer-links a:nth-child(3)' },
      { id: 'footer-link-4', label: 'Link Contato', seletor: '.footer-links a:nth-child(4)' },
      { id: 'footer-copy', label: 'Copyright', seletor: '.footer-copy' },
    ]
  },
  {
    secao: 'Elementos Globais',
    icone: 'fas fa-globe',
    itens: [
      { id: 'body', label: 'Body (fundo)', seletor: 'body' },
      { id: 'particles', label: 'Partículas', seletor: '.particles' },
      { id: 'btn-topo', label: 'Botão Topo', seletor: '.btn-topo' },
      { id: 'modal-overlay', label: 'Modal overlay', seletor: '.modal-overlay' },
      { id: 'modal-content', label: 'Modal conteúdo', seletor: '.modal-content' },
    ]
  },
];

// ==========================================
// INICIALIZAR
// ==========================================
export function inicializarEditor() {
  construirArvore();
  setupIframe();
  setupPropriedades();
  setupBotoesDevice();
  setupBotoesSalvar();
  carregarEstilos();
}

// ==========================================
// CARREGAR ESTILOS
// ==========================================
async function carregarEstilos() {
  const { data } = await supabase
    .from('estilos_elementos')
    .select('propriedades')
    .eq('id', 'estilos')
    .single();
  estilosAtuais = data?.propriedades || {};
  aguardarIframe();
}

// ==========================================
// IFRAME
// ==========================================
function setupIframe() {
  const iframe = document.getElementById('editorIframe');
  iframe.addEventListener('load', () => {
    iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    aplicarEstilosNoIframe();
    setupIframeCliques();
  });
}

function aguardarIframe() {
  const iframe = document.getElementById('editorIframe');
  if (iframe.contentDocument?.readyState === 'complete') {
    iframeDoc = iframe.contentDocument;
    aplicarEstilosNoIframe();
    setupIframeCliques();
  } else {
    iframe.addEventListener('load', () => {
      iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      aplicarEstilosNoIframe();
      setupIframeCliques();
    });
  }
}

function setupIframeCliques() {
  if (!iframeDoc) return;

  ELEMENTOS_EDITAVEIS.forEach(secao => {
    secao.itens.forEach(item => {
      const el = iframeDoc.querySelector(item.seletor);
      if (!el) return;

      el.addEventListener('mouseenter', () => {
        if (elementoSelecionadoId !== item.id) {
          el.classList.add('elemento-hover');
        }
      });

      el.addEventListener('mouseleave', () => {
        el.classList.remove('elemento-hover');
      });

      el.addEventListener('click', e => {
        e.stopPropagation();
        selecionarElemento(item.id, item.label, item.seletor);
      });
    });
  });
}

// ==========================================
// SELECIONAR ELEMENTO
// ==========================================
function selecionarElemento(id, label, seletor) {
  if (iframeDoc) {
    iframeDoc.querySelectorAll('.elemento-highlight, .elemento-hover')
      .forEach(el => el.classList.remove('elemento-highlight', 'elemento-hover'));
  }

  elementoSelecionadoId = id;

  if (iframeDoc) {
    const el = iframeDoc.querySelector(seletor);
    if (el) {
      el.classList.add('elemento-highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  document.querySelectorAll('.arvore-item').forEach(item => {
    item.classList.toggle('selecionado', item.dataset.id === id);
  });

  document.getElementById('editorPropriedades').style.display = 'block';
  document.getElementById('editorElementoNome').textContent = label;

  carregarValoresPropriedades(id, seletor);
}

// ==========================================
// CARREGAR VALORES
// ==========================================
function carregarValoresPropriedades(id, seletor) {
  const estiloSalvo = estilosAtuais[id] || {};
  let estiloComputado = {};

  if (iframeDoc) {
    const el = iframeDoc.querySelector(seletor);
    if (el) {
      const computed = iframeDoc.defaultView.getComputedStyle(el);
      estiloComputado = {
        fontSize: parseInt(computed.fontSize) || 16,
        fontWeight: computed.fontWeight || '400',
        color: rgbToHex(computed.color) || '#e2e8f0',
        textAlign: computed.textAlign || 'left',
        marginTop: parseInt(computed.marginTop) || 0,
        marginBottom: parseInt(computed.marginBottom) || 0,
        marginLeft: parseInt(computed.marginLeft) || 0,
        marginRight: parseInt(computed.marginRight) || 0,
        paddingTop: parseInt(computed.paddingTop) || 0,
        paddingBottom: parseInt(computed.paddingBottom) || 0,
        paddingLeft: parseInt(computed.paddingLeft) || 0,
        paddingRight: parseInt(computed.paddingRight) || 0,
        backgroundColor: rgbToHex(computed.backgroundColor) || '#0a0a0f',
        borderRadius: parseInt(computed.borderRadius) || 0,
        opacity: Math.round((parseFloat(computed.opacity) || 1) * 100),
        width: parseInt(computed.width) || 0,
        height: parseInt(computed.height) || 0,
        gap: parseInt(computed.gap) || 0,
        letterSpacing: parseFloat(computed.letterSpacing) || 0,
        lineHeight: parseFloat(computed.lineHeight) || 0,
      };
    }
  }

  const valores = { ...estiloComputado, ...estiloSalvo };

  // Tipografia
  setInputVal('propFontSize', valores.fontSize);
  setSelectVal('propFontWeight', String(valores.fontWeight));
  setInputVal('propColorHex', valores.color);
  setColorVal('propColor', valores.color);
  setInputVal('propLetterSpacing', valores.letterSpacing);
  setInputVal('propLineHeight', valores.lineHeight);

  // Espaçamento
  setInputVal('propMarginTop', valores.marginTop);
  setInputVal('propMarginBottom', valores.marginBottom);
  setInputVal('propMarginLeft', valores.marginLeft);
  setInputVal('propMarginRight', valores.marginRight);
  setInputVal('propPaddingTop', valores.paddingTop);
  setInputVal('propPaddingBottom', valores.paddingBottom);
  setInputVal('propPaddingLeft', valores.paddingLeft);
  setInputVal('propPaddingRight', valores.paddingRight);

  // Aparência
  setInputVal('propBgColorHex', valores.backgroundColor);
  setColorVal('propBgColor', valores.backgroundColor);
  setInputVal('propBorderRadius', valores.borderRadius);
  setInputVal('propOpacity', valores.opacity);
  setInputVal('propGap', valores.gap);

  // Dimensões
  setInputVal('propWidth', valores.width);
  setInputVal('propHeight', valores.height);

  // Alinhamento
  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.align === valores.textAlign);
  });
}

// ==========================================
// SETUP PROPRIEDADES
// ==========================================
function setupPropriedades() {
  // Tipografia
  addPropListener('propFontSize', 'fontSize', 'px');
  addPropListener('propFontWeight', 'fontWeight', '');
  addPropListener('propLetterSpacing', 'letterSpacing', 'px');
  addPropListener('propLineHeight', 'lineHeight', 'px');
  addColorListener('propColor', 'propColorHex', 'color');

  // Espaçamento
  addPropListener('propMarginTop', 'marginTop', 'px');
  addPropListener('propMarginBottom', 'marginBottom', 'px');
  addPropListener('propMarginLeft', 'marginLeft', 'px');
  addPropListener('propMarginRight', 'marginRight', 'px');
  addPropListener('propPaddingTop', 'paddingTop', 'px');
  addPropListener('propPaddingBottom', 'paddingBottom', 'px');
  addPropListener('propPaddingLeft', 'paddingLeft', 'px');
  addPropListener('propPaddingRight', 'paddingRight', 'px');

  // Aparência
  addColorListener('propBgColor', 'propBgColorHex', 'backgroundColor');
  addPropListener('propBorderRadius', 'borderRadius', 'px');
  addPropListener('propOpacity', 'opacity', '%');
  addPropListener('propGap', 'gap', 'px');

  // Dimensões
  addPropListener('propWidth', 'width', 'px');
  addPropListener('propHeight', 'height', 'px');

  // Alinhamento
  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aplicarPropriedade('textAlign', btn.dataset.align, '');
    });
  });

  // Resetar elemento
  document.getElementById('btnResetarElemento').addEventListener('click', () => {
    if (!elementoSelecionadoId) return;
    if (!confirm('Resetar estilos deste elemento?')) return;
    delete estilosAtuais[elementoSelecionadoId];

    const item = encontrarItemPorId(elementoSelecionadoId);
    if (item && iframeDoc) {
      const el = iframeDoc.querySelector(item.seletor);
      if (el) el.removeAttribute('style');
    }

    notifEditor('🔄 Elemento resetado!');
    carregarValoresPropriedades(
      elementoSelecionadoId,
      encontrarItemPorId(elementoSelecionadoId)?.seletor
    );
  });
}

function addPropListener(inputId, cssProp, unidade) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.addEventListener('input', () => {
    aplicarPropriedade(cssProp, el.value, unidade);
  });
}

function addColorListener(pickerId, hexId, cssProp) {
  const picker = document.getElementById(pickerId);
  const hex = document.getElementById(hexId);
  if (!picker || !hex) return;

  picker.addEventListener('input', () => {
    hex.value = picker.value;
    aplicarPropriedade(cssProp, picker.value, '');
  });

  hex.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) {
      picker.value = hex.value;
      aplicarPropriedade(cssProp, hex.value, '');
    }
  });
}

// ==========================================
// APLICAR PROPRIEDADE
// ==========================================
function aplicarPropriedade(cssProp, valor, unidade) {
  if (!elementoSelecionadoId) return;

  const item = encontrarItemPorId(elementoSelecionadoId);
  if (!item || !iframeDoc) return;

  const el = iframeDoc.querySelector(item.seletor);
  if (!el) return;

  let valorCSS = valor;
  if (unidade === 'px' && valor !== '') valorCSS = `${valor}px`;
  if (unidade === '%' && cssProp === 'opacity') valorCSS = String(valor / 100);

  el.style[cssProp] = valorCSS;

  if (!estilosAtuais[elementoSelecionadoId]) {
    estilosAtuais[elementoSelecionadoId] = {};
  }
  estilosAtuais[elementoSelecionadoId][cssProp] = valorCSS;
}

// ==========================================
// APLICAR ESTILOS NO IFRAME
// ==========================================
function aplicarEstilosNoIframe() {
  if (!iframeDoc) return;

  const styleExistente = iframeDoc.getElementById('editor-styles');
  if (styleExistente) styleExistente.remove();

  const styleTag = iframeDoc.createElement('style');
  styleTag.id = 'editor-styles';
  styleTag.textContent = `
    .elemento-highlight {
      outline: 2px solid #7c3aed !important;
      outline-offset: 2px !important;
      cursor: pointer !important;
    }
    .elemento-hover {
      outline: 1px dashed rgba(124,58,237,0.6) !important;
      outline-offset: 2px !important;
      cursor: pointer !important;
    }
  `;
  iframeDoc.head.appendChild(styleTag);

  Object.entries(estilosAtuais).forEach(([elementoId, estilos]) => {
    const item = encontrarItemPorId(elementoId);
    if (!item) return;
    const el = iframeDoc.querySelector(item.seletor);
    if (!el) return;
    Object.entries(estilos).forEach(([prop, val]) => {
      el.style[prop] = val;
    });
  });
}

// ==========================================
// CONSTRUIR ÁRVORE
// ==========================================
function construirArvore() {
  const arvore = document.getElementById('editorArvore');
  if (!arvore) return;

  arvore.innerHTML = ELEMENTOS_EDITAVEIS.map(secao => `
    <div class="arvore-secao">
      <div class="arvore-secao-titulo" onclick="toggleSecao(this)">
        <i class="${secao.icone}"></i>
        ${secao.secao}
        <i class="fas fa-chevron-right chevron"></i>
      </div>
      <div class="arvore-filhos">
        ${secao.itens.map(item => `
          <div class="arvore-item" data-id="${item.id}"
               onclick="selecionarPelaArvore('${item.id}','${item.label}','${item.seletor.replace(/'/g, "\\'")}')">
            <i class="fas fa-dot-circle"></i>
            ${item.label}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

window.toggleSecao = function(el) {
  el.classList.toggle('aberto');
  el.nextElementSibling.classList.toggle('aberto');
};

window.selecionarPelaArvore = function(id, label, seletor) {
  selecionarElemento(id, label, seletor);
  if (iframeDoc) {
    const el = iframeDoc.querySelector(seletor);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// ==========================================
// BOTÕES DE DEVICE
// ==========================================
function setupBotoesDevice() {
  document.querySelectorAll('.device-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const container = document.getElementById('previewContainer');
      container.className = 'preview-container';
      if (btn.dataset.device !== 'desktop') {
        container.classList.add(btn.dataset.device);
      }
    });
  });

  document.getElementById('btnRefreshPreview').addEventListener('click', () => {
    const iframe = document.getElementById('editorIframe');
    iframe.src = iframe.src;
    notifEditor('🔄 Recarregando preview...');
  });
}

// ==========================================
// SALVAR NO SUPABASE
// ==========================================
function setupBotoesSalvar() {
  document.getElementById('btnSalvarEditor').addEventListener('click', () => salvarEstilos());

  document.getElementById('btnResetarEstilos').addEventListener('click', async () => {
    if (!confirm('Resetar TODOS os estilos customizados? Isso não pode ser desfeito!')) return;
    estilosAtuais = {};
    await salvarEstilos(true);
    const iframe = document.getElementById('editorIframe');
    iframe.src = iframe.src;
    notifEditor('🔄 Todos os estilos foram resetados!');
  });
}

async function salvarEstilos(silencioso = false) {
  const btn = document.getElementById('btnSalvarEditor');
  if (!silencioso) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
  }

  try {
    const { error } = await supabase
      .from('estilos_elementos')
      .update({
        propriedades: estilosAtuais,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', 'estilos');

    if (error) throw error;
    if (!silencioso) notifEditor('✅ Estilos salvos! Recarregue o site para ver.');
  } catch(e) {
    console.error(e);
    notifEditor('❌ Erro ao salvar!', 'erro');
  } finally {
    if (!silencioso) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
    }
  }
}

// ==========================================
// UTILITÁRIOS
// ==========================================
function encontrarItemPorId(id) {
  for (const secao of ELEMENTOS_EDITAVEIS) {
    const item = secao.itens.find(i => i.id === id);
    if (item) return item;
  }
  return null;
}

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#000000';
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#000000';
  return '#' + [match[1], match[2], match[3]]
    .map(x => parseInt(x).toString(16).padStart(2, '0'))
    .join('');
}

function setInputVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val ?? '';
}

function setSelectVal(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  const opt = [...el.options].find(o => o.value === String(val));
  if (opt) el.value = opt.value;
}

function setColorVal(id, hex) {
  const el = document.getElementById(id);
  if (el && /^#[0-9a-fA-F]{6}$/.test(hex)) el.value = hex;
}

function notifEditor(msg, tipo = 'ok') {
  const n = document.createElement('div');
  const cor = tipo === 'erro' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)';
  const borda = tipo === 'erro' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)';
  n.style.cssText = `
    position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
    background:${cor};border:1px solid ${borda};color:#e2e8f0;
    padding:13px 26px;border-radius:50px;font-size:14px;font-weight:500;
    z-index:9999;box-shadow:0 8px 28px rgba(0,0,0,0.5);
    font-family:'Inter',sans-serif;white-space:nowrap;
  `;
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => {
    n.style.transition = 'opacity 0.3s';
    n.style.opacity = '0';
    setTimeout(() => n.remove(), 300);
  }, 3000);
}
