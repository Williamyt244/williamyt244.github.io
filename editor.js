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
      { id: 'navbar', label: 'Barra de navegação', seletor: '.navbar' },
      { id: 'nav-logo', label: 'Logo', seletor: '.nav-logo' },
      { id: 'nav-cta', label: 'Botão Contratar', seletor: '.nav-cta' },
    ]
  },
  {
    secao: 'Hero',
    icone: 'fas fa-home',
    itens: [
      { id: 'hero', label: 'Seção Hero', seletor: '.hero' },
      { id: 'hero-badge', label: 'Badge', seletor: '.hero-badge' },
      { id: 'hero-title', label: 'Título', seletor: '.hero-title' },
      { id: 'hero-subtitle', label: 'Subtítulo', seletor: '.hero-subtitle' },
      { id: 'btn-primary', label: 'Botão Primário', seletor: '.btn-primary' },
      { id: 'btn-secondary', label: 'Botão Secundário', seletor: '.btn-secondary' },
      { id: 'hero-stats', label: 'Estatísticas', seletor: '.hero-stats' },
    ]
  },
  {
    secao: 'Serviços',
    icone: 'fas fa-concierge-bell',
    itens: [
      { id: 'servicos', label: 'Seção Serviços', seletor: '.servicos' },
      { id: 'servicos-grid', label: 'Grid de Serviços', seletor: '.servicos-grid' },
      { id: 'section-tag-serv', label: 'Tag', seletor: '.servicos .section-tag' },
      { id: 'section-title-serv', label: 'Título', seletor: '.servicos .section-title' },
    ]
  },
  {
    secao: 'Preços',
    icone: 'fas fa-tags',
    itens: [
      { id: 'precos', label: 'Seção Preços', seletor: '.precos' },
      { id: 'precos-grid', label: 'Grid de Preços', seletor: '.precos-grid' },
      { id: 'combo-aviso', label: 'Aviso Combo', seletor: '.combo-aviso' },
    ]
  },
  {
    secao: 'Portfólio',
    icone: 'fas fa-images',
    itens: [
      { id: 'portfolio-section', label: 'Seção Portfólio', seletor: '.portfolio-section' },
      { id: 'filtros', label: 'Filtros', seletor: '.filtros' },
      { id: 'portfolio-grid', label: 'Grid', seletor: '.portfolio-grid' },
    ]
  },
  {
    secao: 'Contato',
    icone: 'fas fa-headset',
    itens: [
      { id: 'contato', label: 'Seção Contato', seletor: '.contato' },
      { id: 'contato-card', label: 'Card Discord', seletor: '.contato-card' },
      { id: 'contato-info', label: 'Informações', seletor: '.contato-info' },
    ]
  },
  {
    secao: 'Footer',
    icone: 'fas fa-shoe-prints',
    itens: [
      { id: 'footer', label: 'Footer', seletor: '.footer' },
      { id: 'footer-logo', label: 'Logo Footer', seletor: '.footer-logo' },
      { id: 'footer-links', label: 'Links', seletor: '.footer-links' },
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
        paddingTop: parseInt(computed.paddingTop) || 0,
        paddingBottom: parseInt(computed.paddingBottom) || 0,
        paddingLeft: parseInt(computed.paddingLeft) || 0,
        paddingRight: parseInt(computed.paddingRight) || 0,
        backgroundColor: rgbToHex(computed.backgroundColor) || '#0a0a0f',
        borderRadius: parseInt(computed.borderRadius) || 0,
        opacity: Math.round((parseFloat(computed.opacity) || 1) * 100),
        width: parseInt(computed.width) || 0,
        height: parseInt(computed.height) || 0,
      };
    }
  }

  const valores = { ...estiloComputado, ...estiloSalvo };

  setInputVal('propFontSize', valores.fontSize);
  setSelectVal('propFontWeight', String(valores.fontWeight));
  setInputVal('propColorHex', valores.color);
  setColorVal('propColor', valores.color);
  setInputVal('propMarginTop', valores.marginTop);
  setInputVal('propMarginBottom', valores.marginBottom);
  setInputVal('propPaddingTop', valores.paddingTop);
  setInputVal('propPaddingBottom', valores.paddingBottom);
  setInputVal('propPaddingLeft', valores.paddingLeft);
  setInputVal('propPaddingRight', valores.paddingRight);
  setInputVal('propBgColorHex', valores.backgroundColor);
  setColorVal('propBgColor', valores.backgroundColor);
  setInputVal('propBorderRadius', valores.borderRadius);
  setInputVal('propOpacity', valores.opacity);
  setInputVal('propWidth', valores.width);
  setInputVal('propHeight', valores.height);

  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.align === valores.textAlign);
  });
}

// ==========================================
// SETUP PROPRIEDADES
// ==========================================
function setupPropriedades() {
  addPropListener('propFontSize', 'fontSize', 'px');
  addPropListener('propFontWeight', 'fontWeight', '');
  addColorListener('propColor', 'propColorHex', 'color');
  addColorListener('propBgColor', 'propBgColorHex', 'backgroundColor');
  addPropListener('propMarginTop', 'marginTop', 'px');
  addPropListener('propMarginBottom', 'marginBottom', 'px');
  addPropListener('propPaddingTop', 'paddingTop', 'px');
  addPropListener('propPaddingBottom', 'paddingBottom', 'px');
  addPropListener('propPaddingLeft', 'paddingLeft', 'px');
  addPropListener('propPaddingRight', 'paddingRight', 'px');
  addPropListener('propBorderRadius', 'borderRadius', 'px');
  addPropListener('propOpacity', 'opacity', '%');
  addPropListener('propWidth', 'width', 'px');
  addPropListener('propHeight', 'height', 'px');

  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aplicarPropriedade('textAlign', btn.dataset.align, '');
    });
  });

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
               onclick="selecionarPelaArvore('${item.id}','${item.label}','${item.seletor}')">
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
