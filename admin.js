import { supabase } from './supabase-config.js';

let portfolios = [];
let servicosLista = [];
let precosLista = [];
let infoItems = [];
let statsLista = [];
let modoEdicao = false;
let idEdicao = null;
let imagemFile = null;
let imagemUrlAtual = '';
let imagemPathAtual = '';

// AUTH
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    inicializarAdmin();
  } else {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
  }
});

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('btnLogin');
  const erro = document.getElementById('erroLogin');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
  erro.classList.remove('show');

  const { error } = await supabase.auth.signInWithPassword({
    email: document.getElementById('loginEmail').value,
    password: document.getElementById('loginSenha').value,
  });

  if (error) {
    erro.textContent = '❌ Email ou senha incorretos!';
    erro.classList.add('show');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
  }
});

document.getElementById('eyeBtn').addEventListener('click', () => {
  const input = document.getElementById('loginSenha');
  input.type = input.type === 'password' ? 'text' : 'password';
  document.querySelector('#eyeBtn i').className =
    input.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

document.getElementById('logoutBtn').addEventListener('click', () => supabase.auth.signOut());

async function inicializarAdmin() {
  setupAbas();
  await Promise.all([
    carregarPortfoliosAdmin(),
    carregarTextosAdmin(),
    carregarServicosAdmin(),
    carregarPrecosAdmin(),
    carregarContatoAdmin(),
    carregarAparenciaAdmin(),
  ]);
  setupPortfolioForm();
  setupSalvarTextos();
  setupServicos();
  setupPrecos();
  setupContato();
  setupAparencia();
}

// ABAS
function setupAbas() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.aba').forEach(a => a.style.display = 'none');
      document.getElementById(`aba-${btn.dataset.aba}`).style.display = 'block';
    });
  });
}

// PORTFÓLIOS
async function carregarPortfoliosAdmin() {
  const { data } = await supabase.from('portfolios').select('*').order('criado_em', { ascending: false });
  portfolios = data || [];
  renderizarPortfoliosAdmin();
}

function renderizarPortfoliosAdmin() {
  const grid = document.getElementById('portfolioAdminGrid');
  if (!portfolios.length) {
    grid.innerHTML = `<div class="admin-vazio"><i class="fas fa-images"></i><p>Nenhum trabalho. Clique em "Novo Trabalho"!</p></div>`;
    return;
  }
  grid.innerHTML = portfolios.map(item => `
    <div class="admin-port-item">
      <img src="${item.imagem}" alt="${item.titulo}"
           onerror="this.src='https://via.placeholder.com/300x140/1a1a26/7c3aed?text=Sem+Img'"/>
      <div class="admin-port-info">
        <h4>${item.titulo}</h4>
        <p>${formatCat(item.categoria)} ${item.destaque ? '⭐' : ''}</p>
        <div class="admin-port-actions">
          <button class="btn-edit" onclick="editarPortfolio(${item.id})">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-del" onclick="deletarPortfolio(${item.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function setupPortfolioForm() {
  const form = document.getElementById('formPortfolio');
  const uploadArea = document.getElementById('uploadArea');
  const inputFile = document.getElementById('pImagem');

  document.getElementById('btnNovoPortfolio').addEventListener('click', () => {
    modoEdicao = false; idEdicao = null;
    limparFormPortfolio();
    document.getElementById('formPortTitulo').textContent = '➕ Novo Trabalho';
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
  });

  const fechar = () => { form.style.display = 'none'; limparFormPortfolio(); };
  document.getElementById('fecharFormPort').addEventListener('click', fechar);
  document.getElementById('fecharFormPort2').addEventListener('click', fechar);

  uploadArea.addEventListener('click', () => inputFile.click());
  uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = '#7c3aed'; });
  uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
  uploadArea.addEventListener('drop', e => {
    e.preventDefault(); uploadArea.style.borderColor = '';
    if (e.dataTransfer.files[0]) selecionarImagem(e.dataTransfer.files[0]);
  });
  inputFile.addEventListener('change', () => { if (inputFile.files[0]) selecionarImagem(inputFile.files[0]); });

  document.getElementById('removerImg').addEventListener('click', () => {
    imagemFile = null; imagemUrlAtual = '';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'flex';
    inputFile.value = '';
  });

  document.getElementById('salvarPortfolio').addEventListener('click', salvarPortfolio);
}

function selecionarImagem(file) {
  if (file.size > 5 * 1024 * 1024) { notif('❌ Máximo 5MB!', 'erro'); return; }
  imagemFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('previewImg').src = e.target.result;
    document.getElementById('uploadPreview').style.display = 'block';
    document.getElementById('uploadArea').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function limparFormPortfolio() {
  ['pTitulo','pDescricao'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pCategoria').value = '';
  document.getElementById('pDestaque').checked = false;
  document.getElementById('uploadPreview').style.display = 'none';
  document.getElementById('uploadArea').style.display = 'flex';
  document.getElementById('uploadProgress').style.display = 'none';
  document.getElementById('pImagem').value = '';
  imagemFile = null; imagemUrlAtual = ''; imagemPathAtual = '';
}

async function salvarPortfolio() {
  const titulo = document.getElementById('pTitulo').value.trim();
  const categoria = document.getElementById('pCategoria').value;
  const descricao = document.getElementById('pDescricao').value.trim();
  const destaque = document.getElementById('pDestaque').checked;

  if (!titulo || !categoria || !descricao) { notif('❌ Preencha todos os campos!', 'erro'); return; }
  if (!imagemFile && !imagemUrlAtual) { notif('❌ Selecione uma imagem!', 'erro'); return; }

  const btn = document.getElementById('salvarPortfolio');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

  try {
    let imagemUrl = imagemUrlAtual;
    let imagemPath = imagemPathAtual;

    if (imagemFile) {
      document.getElementById('uploadProgress').style.display = 'flex';
      const ext = imagemFile.name.split('.').pop();
      imagemPath = `${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('portfolios')
        .upload(imagemPath, imagemFile, { upsert: true });

      if (upErr) throw upErr;

      document.getElementById('progressFill').style.width = '100%';
      document.getElementById('progressTxt').textContent = 'Concluído!';

      const { data: urlData } = supabase.storage.from('portfolios').getPublicUrl(imagemPath);
      imagemUrl = urlData.publicUrl;
    }

    const dados = { titulo, categoria, descricao, destaque, imagem: imagemUrl, imagem_path: imagemPath };

    if (modoEdicao && idEdicao) {
      const { error } = await supabase.from('portfolios').update(dados).eq('id', idEdicao);
      if (error) throw error;
      notif('✅ Trabalho atualizado!');
    } else {
      const { error } = await supabase.from('portfolios').insert(dados);
      if (error) throw error;
      notif('✅ Trabalho adicionado!');
    }

    document.getElementById('formPortfolio').style.display = 'none';
    limparFormPortfolio();
    await carregarPortfoliosAdmin();
  } catch(e) {
    console.error(e);
    notif('❌ Erro ao salvar!', 'erro');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Salvar';
    document.getElementById('uploadProgress').style.display = 'none';
  }
}

window.editarPortfolio = function(id) {
  const item = portfolios.find(p => p.id === id);
  if (!item) return;
  modoEdicao = true; idEdicao = id;
  imagemUrlAtual = item.imagem; imagemPathAtual = item.imagem_path || '';

  document.getElementById('pTitulo').value = item.titulo;
  document.getElementById('pCategoria').value = item.categoria;
  document.getElementById('pDescricao').value = item.descricao;
  document.getElementById('pDestaque').checked = item.destaque;
  document.getElementById('formPortTitulo').textContent = '✏️ Editar Trabalho';
  document.getElementById('previewImg').src = item.imagem;
  document.getElementById('uploadPreview').style.display = 'block';
  document.getElementById('uploadArea').style.display = 'none';
  document.getElementById('formPortfolio').style.display = 'block';
  document.getElementById('formPortfolio').scrollIntoView({ behavior: 'smooth' });
};

window.deletarPortfolio = async function(id) {
  const item = portfolios.find(p => p.id === id);
  if (!confirm(`Excluir "${item?.titulo}"?`)) return;
  try {
    if (item?.imagem_path) {
      await supabase.storage.from('portfolios').remove([item.imagem_path]);
    }
    await supabase.from('portfolios').delete().eq('id', id);
    notif('🗑️ Excluído!');
    await carregarPortfoliosAdmin();
  } catch(e) { notif('❌ Erro ao excluir!', 'erro'); }
};

// TEXTOS
async function carregarTextosAdmin() {
  const { data } = await supabase.from('site_config').select('*').eq('id','config').single();
  if (!data) return;
  setValue('tNomeSite', data.nomesite || '');
  setValue('tHeroBadge', data.hero_badge || '');
  setValue('tHeroTitulo', data.hero_titulo || '');
  setValue('tHeroDestaque', data.hero_titulo_destaque || '');
  setValue('tHeroSub', data.hero_subtitulo || '');
  setValue('tBtn1', data.btn_portfolio || '');
  setValue('tBtn2', data.btn_solicitar || '');
  setValue('tBtnNav', data.btn_nav || '');
  setValue('tServTag', data.servicos_tag || '');
  setValue('tServSub', data.servicos_subtitulo || '');
  setValue('tPrecSub', data.precos_subtitulo || '');
  setValue('tCombo', data.combo_texto || '');
  setValue('tContSub', data.contato_subtitulo || '');
  setValue('tContDesc', data.contato_desc || '');
  setValue('tFooterDesc', data.footer_desc || '');
  setValue('tFooterCopy', data.footer_copy || '');

  const { data: stats } = await supabase.from('stats').select('*').order('ordem');
  statsLista = stats || [];
  renderizarStatsEditor();
}

function renderizarStatsEditor() {
  const el = document.getElementById('statsEditor');
  if (!el) return;
  el.innerHTML = statsLista.map((s, i) => `
    <div class="stat-edit-item">
      <div class="field" style="margin:0">
        <input type="text" value="${s.numero}" placeholder="100%"
               oninput="statsLista[${i}].numero=this.value"/>
      </div>
      <div class="field" style="margin:0">
        <input type="text" value="${s.label}" placeholder="Satisfação"
               oninput="statsLista[${i}].label=this.value"/>
      </div>
      <button class="btn-remove-item" onclick="removerStat(${i})">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
}

window.removerStat = function(i) { statsLista.splice(i,1); renderizarStatsEditor(); };

document.getElementById('addStat').addEventListener('click', () => {
  statsLista.push({ numero:'', label:'', ordem: statsLista.length+1 });
  renderizarStatsEditor();
});

function setupSalvarTextos() {
  document.getElementById('salvarTextos').addEventListener('click', async () => {
    const btn = document.getElementById('salvarTextos');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    try {
      await supabase.from('site_config').update({
        nomesite: getValue('tNomeSite'),
        hero_badge: getValue('tHeroBadge'),
        hero_titulo: getValue('tHeroTitulo'),
        hero_titulo_destaque: getValue('tHeroDestaque'),
        hero_subtitulo: getValue('tHeroSub'),
        btn_portfolio: getValue('tBtn1'),
        btn_solicitar: getValue('tBtn2'),
        btn_nav: getValue('tBtnNav'),
        servicos_tag: getValue('tServTag'),
        servicos_subtitulo: getValue('tServSub'),
        precos_subtitulo: getValue('tPrecSub'),
        combo_texto: getValue('tCombo'),
        contato_subtitulo: getValue('tContSub'),
        contato_desc: getValue('tContDesc'),
        footer_desc: getValue('tFooterDesc'),
        footer_copy: getValue('tFooterCopy'),
        atualizado_em: new Date().toISOString(),
      }).eq('id','config');

      await supabase.from('stats').delete().neq('id', 0);
      if (statsLista.length) {
        await supabase.from('stats').insert(
          statsLista.map((s, i) => ({ numero: s.numero, label: s.label, ordem: i+1 }))
        );
      }
      notif('✅ Textos salvos!');
    } catch(e) { notif('❌ Erro!', 'erro'); }
    finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Salvar Textos';
    }
  });
}

// SERVIÇOS
async function carregarServicosAdmin() {
  const { data } = await supabase.from('servicos').select('*').order('ordem');
  servicosLista = data || [];
  renderizarServicosAdmin();
}

function renderizarServicosAdmin() {
  const el = document.getElementById('servicosAdminLista');
  if (!el) return;
  if (!servicosLista.length) {
    el.innerHTML = '<div class="admin-vazio"><i class="fas fa-concierge-bell"></i><p>Nenhum serviço.</p></div>';
    return;
  }
  el.innerHTML = servicosLista.map((s, i) => `
    <div class="servico-edit-item">
      <div class="servico-edit-header">
        <span>${s.titulo || 'Sem título'}</span>
        <button class="btn-remove-item" onclick="removerServico(${i})"><i class="fas fa-trash"></i></button>
      </div>
      <div class="form-grid">
        <div class="field"><label>Título</label>
          <input type="text" value="${s.titulo}" oninput="servicosLista[${i}].titulo=this.value"/></div>
        <div class="field"><label>Ícone (Font Awesome)</label>
          <input type="text" value="${s.icone}" placeholder="fas fa-palette"
                 oninput="servicosLista[${i}].icone=this.value"/></div>
        <div class="field full"><label>Descrição</label>
          <textarea rows="2" oninput="servicosLista[${i}].descricao=this.value">${s.descricao}</textarea></div>
        <div class="field full"><label>Cor (CSS gradient)</label>
          <input type="text" value="${s.cor}" oninput="servicosLista[${i}].cor=this.value"/></div>
        <div class="field">
          <label class="check-label">
            <input type="checkbox" ${s.destaque?'checked':''} onchange="servicosLista[${i}].destaque=this.checked"/>
            <span class="check-box"></span> ⭐ Destaque
          </label>
        </div>
        <div class="field"><label>Badge texto</label>
          <input type="text" value="${s.badge_texto||''}" placeholder="⭐ Mais Popular"
                 oninput="servicosLista[${i}].badge_texto=this.value"/></div>
      </div>
      <div class="servico-edit-tags">
        <label>Tags</label>
        <div class="tags-lista">
          ${(s.tags||[]).map((t,ti)=>`
            <div class="tag-item"><span>${t.texto}</span>
              <button onclick="removerTag(${i},${ti})">×</button></div>`).join('')}
        </div>
        <div class="tag-add-form">
          <input type="text" id="tagInput-${i}" placeholder="Nova tag..."/>
          <button onclick="adicionarTag(${i})">+ Tag</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.removerServico = function(i) {
  if (!confirm('Remover?')) return;
  servicosLista.splice(i,1); renderizarServicosAdmin();
};

window.adicionarTag = function(i) {
  const input = document.getElementById(`tagInput-${i}`);
  const txt = input.value.trim(); if (!txt) return;
  if (!servicosLista[i].tags) servicosLista[i].tags = [];
  servicosLista[i].tags.push({ texto: txt, destaque: false });
  input.value = ''; renderizarServicosAdmin();
};

window.removerTag = function(si, ti) {
  servicosLista[si].tags.splice(ti,1); renderizarServicosAdmin();
};

function setupServicos() {
  document.getElementById('btnNovoServico').addEventListener('click', () => {
    servicosLista.push({ titulo:'Novo Serviço', descricao:'Descrição.', icone:'fas fa-palette',
      cor:'linear-gradient(135deg,#7c3aed,#a855f7)', destaque:false, badge_texto:'', tags:[], ordem:servicosLista.length+1 });
    renderizarServicosAdmin();
    document.getElementById('servicosAdminLista').lastElementChild?.scrollIntoView({behavior:'smooth'});
  });

  document.getElementById('salvarServicos').addEventListener('click', async () => {
    const btn = document.getElementById('salvarServicos');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    try {
      await supabase.from('servicos').delete().neq('id', 0);
      if (servicosLista.length) {
        await supabase.from('servicos').insert(
          servicosLista.map((s,i) => ({
            titulo:s.titulo, descricao:s.descricao, icone:s.icone,
            cor:s.cor, destaque:s.destaque, badge_texto:s.badge_texto||'',
            tags:s.tags||[], ordem:i+1
          }))
        );
      }
      notif('✅ Serviços salvos!');
      await carregarServicosAdmin();
    } catch(e) { notif('❌ Erro!','erro'); }
    finally { btn.disabled=false; btn.innerHTML='<i class="fas fa-save"></i> Salvar Serviços'; }
  });
}

// PREÇOS
async function carregarPrecosAdmin() {
  const { data } = await supabase.from('precos').select('*').order('ordem');
  precosLista = data || [];
  renderizarPrecosAdmin();
}

function renderizarPrecosAdmin() {
  const el = document.getElementById('precosAdminLista');
  if (!el) return;
  if (!precosLista.length) {
    el.innerHTML = '<div class="admin-vazio"><i class="fas fa-tags"></i><p>Nenhum preço.</p></div>';
    return;
  }
  el.innerHTML = precosLista.map((p,i) => `
    <div class="preco-edit-item">
      <div class="field" style="margin:0"><label style="font-size:11px">Emoji</label>
        <input type="text" value="${p.icone}" maxlength="4" style="text-align:center"
               oninput="precosLista[${i}].icone=this.value"/></div>
      <div class="field" style="margin:0"><label style="font-size:11px">Nome</label>
        <input type="text" value="${p.nome}" oninput="precosLista[${i}].nome=this.value"/></div>
      <div class="field" style="margin:0"><label style="font-size:11px">Valor</label>
        <input type="text" value="${p.valor}" oninput="precosLista[${i}].valor=this.value"/></div>
      <div class="field" style="margin:0"><label style="font-size:11px">Obs</label>
        <input type="text" value="${p.obs}" oninput="precosLista[${i}].obs=this.value"/></div>
      <button class="btn-remove-item" onclick="removerPreco(${i})"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
}

window.removerPreco = function(i) {
  if (!confirm('Remover?')) return;
  precosLista.splice(i,1); renderizarPrecosAdmin();
};

function setupPrecos() {
  document.getElementById('btnNovoPreco').addEventListener('click', () => {
    precosLista.push({ icone:'🎨', nome:'Novo', valor:'R$ 0,00', obs:'', ordem:precosLista.length+1 });
    renderizarPrecosAdmin();
  });

  document.getElementById('salvarPrecos').addEventListener('click', async () => {
    const btn = document.getElementById('salvarPrecos');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    try {
      await supabase.from('precos').delete().neq('id', 0);
      if (precosLista.length) {
        await supabase.from('precos').insert(
          precosLista.map((p,i) => ({ icone:p.icone, nome:p.nome, valor:p.valor, obs:p.obs, ordem:i+1 }))
        );
      }
      notif('✅ Preços salvos!');
      await carregarPrecosAdmin();
    } catch(e) { notif('❌ Erro!','erro'); }
    finally { btn.disabled=false; btn.innerHTML='<i class="fas fa-save"></i> Salvar Preços'; }
  });
}

// CONTATO
async function carregarContatoAdmin() {
  const { data: config } = await supabase.from('site_config').select('discord').eq('id','config').single();
  if (config) setValue('cDiscord', config.discord || '');
  const { data } = await supabase.from('contato_info').select('*').order('ordem');
  infoItems = data || [];
  renderizarInfoEditor();
}

function renderizarInfoEditor() {
  const el = document.getElementById('infoItemsEditor');
  if (!el) return;
  el.innerHTML = infoItems.map((item,i) => `
    <div class="info-edit-item">
      <div class="field" style="margin:0"><label style="font-size:11px">Emoji</label>
        <input type="text" value="${item.icone}" maxlength="4" style="text-align:center"
               oninput="infoItems[${i}].icone=this.value"/></div>
      <div class="field" style="margin:0"><label style="font-size:11px">Título</label>
        <input type="text" value="${item.titulo}" oninput="infoItems[${i}].titulo=this.value"/></div>
      <div class="field" style="margin:0"><label style="font-size:11px">Texto</label>
        <input type="text" value="${item.texto}" oninput="infoItems[${i}].texto=this.value"/></div>
      <button class="btn-remove-item" onclick="removerInfoItem(${i})"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
}

window.removerInfoItem = function(i) { infoItems.splice(i,1); renderizarInfoEditor(); };

function setupContato() {
  document.getElementById('addInfoItem').addEventListener('click', () => {
    infoItems.push({ icone:'💡', titulo:'Novo', texto:'Descrição', ordem:infoItems.length+1 });
    renderizarInfoEditor();
  });

  document.getElementById('salvarContato').addEventListener('click', async () => {
    const btn = document.getElementById('salvarContato');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    try {
      await supabase.from('site_config').update({ discord: getValue('cDiscord') }).eq('id','config');
      await supabase.from('contato_info').delete().neq('id', 0);
      if (infoItems.length) {
        await supabase.from('contato_info').insert(
          infoItems.map((item,i) => ({ icone:item.icone, titulo:item.titulo, texto:item.texto, ordem:i+1 }))
        );
      }
      notif('✅ Contato salvo!');
      await carregarContatoAdmin();
    } catch(e) { notif('❌ Erro!','erro'); }
    finally { btn.disabled=false; btn.innerHTML='<i class="fas fa-save"></i> Salvar Contato'; }
  });
}

// APARÊNCIA
async function carregarAparenciaAdmin() {
  const { data } = await supabase.from('site_config').select('*').eq('id','config').single();
  if (!data) return;
  if (data.cor_primaria) { setValue('corPrimariaHex', data.cor_primaria); document.getElementById('corPrimaria').value = data.cor_primaria; }
  if (data.cor_secundaria) { setValue('corSecundariaHex', data.cor_secundaria); document.getElementById('corSecundaria').value = data.cor_secundaria; }
  if (data.cor_fundo) { setValue('corFundoHex', data.cor_fundo); document.getElementById('corFundo').value = data.cor_fundo; }
  if (data.cor_texto) { setValue('corTextoHex', data.cor_texto); document.getElementById('corTexto').value = data.cor_texto; }
  if (data.logo_icone) setValue('logoIcone', data.logo_icone);
  atualizarPreviewCores();
}

['corPrimaria','corSecundaria','corFundo','corTexto'].forEach(id => {
  const picker = document.getElementById(id);
  const hex = document.getElementById(`${id}Hex`);
  if (!picker || !hex) return;
  picker.addEventListener('input', () => { hex.value = picker.value; atualizarPreviewCores(); });
  hex.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) { picker.value = hex.value; atualizarPreviewCores(); }
  });
});

function atualizarPreviewCores() {
  const p = document.getElementById('corPrimariaHex').value;
  const s = document.getElementById('corSecundariaHex').value;
  const btn = document.getElementById('previewBtn');
  const txt = document.getElementById('previewText');
  if (btn) btn.style.background = `linear-gradient(135deg,${p},${s})`;
  if (txt) { txt.style.background=`linear-gradient(135deg,${p},${s})`;txt.style.webkitBackgroundClip='text';txt.style.webkitTextFillColor='transparent'; }
}

function setupAparencia() {
  document.getElementById('salvarAparencia').addEventListener('click', async () => {
    const btn = document.getElementById('salvarAparencia');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    try {
      await supabase.from('site_config').update({
        cor_primaria: getValue('corPrimariaHex'),
        cor_secundaria: getValue('corSecundariaHex'),
        cor_fundo: getValue('corFundoHex'),
        cor_texto: getValue('corTextoHex'),
        logo_icone: getValue('logoIcone'),
      }).eq('id','config');
      notif('✅ Aparência salva! Recarregue o site.');
    } catch(e) { notif('❌ Erro!','erro'); }
    finally { btn.disabled=false; btn.innerHTML='<i class="fas fa-save"></i> Salvar Aparência'; }
  });
}

// UTILITÁRIOS
function getValue(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function formatCat(cat) {
  return {logo:'Logo',thumbnail:'Thumbnail',banner:'Banner',fotoperfil:'Foto de Perfil',outro:'Outro'}[cat] || cat;
}

function notif(msg, tipo = 'ok') {
  const n = document.createElement('div');
  const cor = tipo==='erro' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)';
  const borda = tipo==='erro' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)';
  n.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:${cor};border:1px solid ${borda};color:#e2e8f0;padding:13px 26px;border-radius:50px;font-size:14px;font-weight:500;z-index:9999;box-shadow:0 8px 28px rgba(0,0,0,0.5);font-family:'Inter',sans-serif;white-space:nowrap`;
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => { n.style.transition='opacity 0.3s'; n.style.opacity='0'; setTimeout(()=>n.remove(),300); }, 3000);
}

window.statsLista = statsLista;
window.servicosLista = servicosLista;
window.precosLista = precosLista;
window.infoItems = infoItems;
