// ==========================================
// PLANILHA.JS - Sistema Excel - WilliamDesign
// ==========================================
import { supabase } from './supabase-config.js';

// ── ESTADO ──────────────────────────────
let planilhas = [];
let planilhaAtual = null;
let linhas = [];
let colunas = [];
let ordemCol = null;
let termoBusca = '';
let colConfigAberta = null;

// ── INIT ─────────────────────────────────
export function inicializarPlanilha() {
  setupNovaPlanilha();
  setupColConfigModal();

  // Aguarda sessão estar pronta antes de carregar
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      carregarPlanilhas();
    } else {
      // Tenta novamente em 1 segundo
      setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session: s } }) => {
          if (s) carregarPlanilhas();
          else notifP('❌ Sessão expirada. Faça login novamente.', 'erro');
        });
      }, 1000);
    }
  });
}

// ==========================================
// CARREGAR LISTA DE PLANILHAS
// ==========================================
async function carregarPlanilhas() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    notifP('❌ Sessão expirada. Faça login novamente.', 'erro');
    return;
  }

  const { data, error } = await supabase
    .from('planilhas')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) {
    console.error('Erro ao carregar planilhas:', error);
    notifP('❌ Erro ao carregar planilhas!', 'erro');
    return;
  }

  planilhas = data || [];
  renderizarListaPlanilhas();
}

function renderizarListaPlanilhas() {
  const el = document.getElementById('planilhasLista');
  if (!el) return;

  if (!planilhas.length) {
    el.innerHTML = `
      <div class="admin-vazio" style="grid-column:1/-1">
        <i class="fas fa-table"></i>
        <p>Nenhuma planilha. Crie uma acima!</p>
      </div>`;
    return;
  }

  el.innerHTML = planilhas.map(p => `
    <div class="planilha-card">
      <div class="planilha-card-icon">📊</div>
      <div class="planilha-card-nome">${p.nome}</div>
      <div class="planilha-card-info">
        ${(p.colunas || []).length} coluna(s) •
        Criada em ${formatarData(p.criado_em)}
      </div>
      <div class="planilha-card-acoes">
        <button class="btn-abrir-planilha" onclick="abrirPlanilha('${p.id}')">
          <i class="fas fa-table"></i> Abrir
        </button>
        <button class="btn-del-planilha" onclick="deletarPlanilha('${p.id}')" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// CRIAR NOVA PLANILHA
// ==========================================
function setupNovaPlanilha() {
  const btn = document.getElementById('btnCriarPlanilha');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const nome = document.getElementById('novaPlanilhaNome').value.trim();
    if (!nome) { notifP('❌ Digite um nome!', 'erro'); return; }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { notifP('❌ Sessão expirada!', 'erro'); return; }

    const { data, error } = await supabase
      .from('planilhas')
      .insert({ nome, colunas: [] })
      .select()
      .single();

    if (error) {
      console.error(error);
      notifP('❌ Erro ao criar!', 'erro');
      return;
    }

    document.getElementById('novaPlanilhaNome').value = '';
    notifP('✅ Planilha criada!');
    await carregarPlanilhas();
    abrirPlanilha(data.id);
  });
}

// ==========================================
// ABRIR PLANILHA
// ==========================================
window.abrirPlanilha = async function(id) {
  const p = planilhas.find(x => x.id === id);
  if (!p) return;

  planilhaAtual = p;
  colunas = p.colunas || [];

  const { data, error } = await supabase
    .from('planilha_linhas')
    .select('*')
    .eq('planilha_id', id)
    .order('ordem');

  if (error) {
    console.error(error);
    notifP('❌ Erro ao abrir planilha!', 'erro');
    return;
  }

  linhas = data || [];

  document.getElementById('planilhasHome').style.display = 'none';
  const tela = document.getElementById('planilhaTela');
  tela.classList.add('aberta');

  document.getElementById('planilhaNomeEdit').value = p.nome;

  ordemCol = null;
  termoBusca = '';
  document.getElementById('planilhaBusca').value = '';

  renderizarTabela();
};

// ==========================================
// FECHAR PLANILHA
// ==========================================
window.fecharPlanilha = function() {
  document.getElementById('planilhaTela').classList.remove('aberta');
  document.getElementById('planilhasHome').style.display = 'block';
  planilhaAtual = null;
  linhas = [];
  colunas = [];
};

// ==========================================
// RENDERIZAR TABELA
// ==========================================
function renderizarTabela() {
  const wrap = document.getElementById('planilhaTableWrap');
  if (!wrap) return;

  let linhasFiltradas = [...linhas];
  if (termoBusca) {
    linhasFiltradas = linhasFiltradas.filter(l =>
      Object.values(l.dados || {}).some(v =>
        String(v).toLowerCase().includes(termoBusca.toLowerCase())
      )
    );
  }

  if (ordemCol) {
    linhasFiltradas.sort((a, b) => {
      const va = a.dados?.[ordemCol.colId] ?? '';
      const vb = b.dados?.[ordemCol.colId] ?? '';
      const na = parseFloat(va), nb = parseFloat(vb);
      const numerico = !isNaN(na) && !isNaN(nb);
      const cmp = numerico ? na - nb : String(va).localeCompare(String(vb));
      return ordemCol.direcao === 'asc' ? cmp : -cmp;
    });
  }

  if (!colunas.length) {
    wrap.innerHTML = `
      <div class="linha-vazia-msg">
        <i class="fas fa-columns" style="font-size:32px;margin-bottom:12px;display:block;opacity:0.3"></i>
        Nenhuma coluna. Clique em <strong>+ Coluna</strong> para começar.
      </div>`;
    atualizarStatusBar(linhasFiltradas);
    return;
  }

  const temTotal = colunas.some(c =>
    (c.tipo === 'formula' && c.formula?.totalizar) ||
    (c.tipo === 'numero' && c.somarTotal)
  );

  let html = `<table class="planilha-table" id="planilhaTable">
    <thead>
      <tr>
        <th class="th-num">#</th>
        ${colunas.map((col, ci) => {
          const icone = iconeTipo(col.tipo);
          const sortAtivo = ordemCol?.colId === col.id;
          const sortDir = sortAtivo ? ordemCol.direcao : '';
          return `
            <th style="min-width:${col.largura || 140}px">
              <div class="th-inner">
                <div class="th-label ${sortAtivo ? 'ordenado-' + sortDir : ''}"
                     onclick="ordenarPor('${col.id}')">
                  <i class="${icone}" style="font-size:10px;opacity:0.6"></i>
                  ${escaparHTML(col.nome)}
                  <i class="fas fa-sort th-sort-icon ${sortAtivo ? 'ativo' : ''}"></i>
                </div>
                <button class="th-config-btn" onclick="abrirColConfig(${ci})" title="Configurar coluna">
                  <i class="fas fa-cog"></i>
                </button>
              </div>
            </th>`;
        }).join('')}
        <th style="min-width:44px;width:44px;background:var(--dark-3);border:1px solid var(--border)">
          <button class="tb-btn primary" onclick="adicionarColuna()"
                  style="width:100%;justify-content:center;padding:6px;font-size:11px"
                  title="Nova coluna">
            <i class="fas fa-plus"></i>
          </button>
        </th>
      </tr>
    </thead>
    <tbody>`;

  if (!linhasFiltradas.length) {
    html += `<tr>
      <td class="td-num">—</td>
      <td colspan="${colunas.length + 1}">
        <div class="linha-vazia-msg">
          ${termoBusca
            ? `Nenhum resultado para "<strong>${escaparHTML(termoBusca)}</strong>"`
            : 'Nenhuma linha. Clique em <strong>+ Linha</strong> para adicionar.'}
        </div>
      </td>
    </tr>`;
  } else {
    linhasFiltradas.forEach((linha, li) => {
      html += `<tr data-id="${linha.id}" onclick="selecionarLinha(this)">
        <td class="td-num">${li + 1}</td>
        ${colunas.map(col => {
          if (col.tipo === 'formula') {
            const resultado = calcularFormulaCelula(col, linha, li, linhasFiltradas);
            const negativo = parseFloat(resultado) < 0;
            return `<td>
              <input class="cell-input ${negativo ? 'negativo' : ''}"
                     data-tipo="formula"
                     value="${escaparHTML(String(formatarValor(resultado, col)))}"
                     readonly tabindex="-1"/>
            </td>`;
          }
          const val = linha.dados?.[col.id] ?? '';
          return `<td>
            <input class="cell-input"
                   data-tipo="${col.tipo}"
                   data-linha="${linha.id}"
                   data-col="${col.id}"
                   value="${escaparHTML(String(val))}"
                   ${col.tipo === 'data' ? 'type="date"' : ''}
                   onchange="alterarCelula('${linha.id}','${col.id}',this.value)"
                   onfocus="this.select()"/>
          </td>`;
        }).join('')}
        <td style="border:1px solid var(--border)">
          <button class="tb-btn danger"
                  onclick="deletarLinha('${linha.id}')"
                  style="width:100%;justify-content:center;padding:6px;font-size:11px"
                  title="Excluir linha">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`;
    });
  }

  // Linha de totais
  if (temTotal && linhasFiltradas.length) {
    html += `<tr class="linha-formula-total">
      <td class="td-num">
        <span style="padding:0 10px;display:flex;align-items:center;justify-content:center;height:36px;font-size:10px">Σ</span>
      </td>
      ${colunas.map(col => {
        if (col.tipo === 'formula' && col.formula?.totalizar) {
          const total = linhasFiltradas.reduce((acc, l, li) => {
            const v = parseFloat(calcularFormulaCelula(col, l, li, linhasFiltradas));
            return acc + (isNaN(v) ? 0 : v);
          }, 0);
          return `<td>
            <div class="total-cell ${total < 0 ? 'negativo' : ''}">
              ${formatarMoeda(total)}
            </div>
          </td>`;
        }
        if (col.tipo === 'numero' && col.somarTotal) {
          const total = linhasFiltradas.reduce((acc, l) => {
            const v = parseFloat(l.dados?.[col.id] || 0);
            return acc + (isNaN(v) ? 0 : v);
          }, 0);
          return `<td>
            <div class="total-cell">
              ${formatarMoeda(total)}
            </div>
          </td>`;
        }
        return `<td><div class="total-label">—</div></td>`;
      }).join('')}
      <td style="border:1px solid var(--border)"></td>
    </tr>`;
  }

  html += `</tbody></table>`;
  wrap.innerHTML = html;
  atualizarStatusBar(linhasFiltradas);
}

// ==========================================
// CÁLCULO DE FÓRMULAS
// ==========================================
function calcularFormulaCelula(col, linha, li, todasLinhas) {
  const f = col.formula;
  if (!f || !f.operacao) return '';

  function getVal(colId, constante) {
    if (colId) {
      const v = parseFloat(linha.dados?.[colId] ?? 0);
      return isNaN(v) ? 0 : v;
    }
    const v = parseFloat(constante ?? 0);
    return isNaN(v) ? 0 : v;
  }

  const a = getVal(f.colA, f.constA);
  const b = getVal(f.colB, f.constB);

  switch (f.operacao) {
    case 'soma':          return (a + b).toFixed(2);
    case 'subtracao':     return (a - b).toFixed(2);
    case 'multiplicacao': return (a * b).toFixed(2);
    case 'divisao':       return b !== 0 ? (a / b).toFixed(2) : 'Erro';
    case 'percentual':    return b !== 0 ? ((a / b) * 100).toFixed(2) + '%' : 'Erro';
    case 'acumulado': {
      const total = todasLinhas.slice(0, li + 1).reduce((acc, l) => {
        const v = parseFloat(l.dados?.[f.colA] ?? 0);
        return acc + (isNaN(v) ? 0 : v);
      }, 0);
      return total.toFixed(2);
    }
    default: return '';
  }
}

// ==========================================
// ADICIONAR COLUNA
// ==========================================
window.adicionarColuna = function() {
  const novaCol = {
    id: 'col_' + Date.now(),
    nome: `Coluna ${colunas.length + 1}`,
    tipo: 'texto',
    somarTotal: false,
    formula: null,
    largura: 140
  };
  colunas.push(novaCol);
  salvarColunas();
  renderizarTabela();
  abrirColConfig(colunas.length - 1);
};

// ==========================================
// CONFIGURAR COLUNA
// ==========================================
window.abrirColConfig = function(ci) {
  colConfigAberta = ci;
  const col = colunas[ci];
  if (!col) return;

  document.getElementById('colConfigNome').value = col.nome;
  document.getElementById('colConfigLargura').value = col.largura || 140;
  document.getElementById('colConfigSomarTotal').checked = col.somarTotal || false;

  document.querySelectorAll('.col-tipo-btn').forEach(btn => {
    btn.classList.toggle('selecionado', btn.dataset.tipo === col.tipo);
  });

  const formulaDiv = document.getElementById('formulaConfig');
  if (col.tipo === 'formula') {
    formulaDiv.classList.add('visivel');
    popularSelectsColunas(ci);
    const f = col.formula || {};
    document.getElementById('fOperacao').value = f.operacao || 'soma';

    const useColA = !!f.colA;
    const useColB = !!f.colB;
    document.getElementById('fUseColA').checked = useColA;
    document.getElementById('fUseColB').checked = useColB;
    document.getElementById('fColA').value = f.colA || '';
    document.getElementById('fConstA').value = f.constA || '';
    document.getElementById('fColB').value = f.colB || '';
    document.getElementById('fConstB').value = f.constB || '';
    document.getElementById('fTotalizar').checked = f.totalizar || false;
    toggleColunaOuConstante('A');
    toggleColunaOuConstante('B');
  } else {
    formulaDiv.classList.remove('visivel');
  }

  document.getElementById('colConfigModal').classList.add('aberto');
};

function popularSelectsColunas(ciAtual) {
  const colsNumericas = colunas.filter((c, i) =>
    i !== ciAtual && c.tipo === 'numero'
  );
  ['fColA', 'fColB'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = `<option value="">— Selecione a coluna —</option>` +
      colsNumericas.map(c =>
        `<option value="${c.id}">${escaparHTML(c.nome)}</option>`
      ).join('');
  });
}

window.toggleColunaOuConstante = function(letra) {
  const useCol = document.getElementById(`fUseCol${letra}`)?.checked;
  const colWrap = document.getElementById(`fColWrap${letra}`);
  const constWrap = document.getElementById(`fConstWrap${letra}`);
  if (colWrap) colWrap.style.display = useCol ? 'block' : 'none';
  if (constWrap) constWrap.style.display = useCol ? 'none' : 'block';
};

function setupColConfigModal() {
  // Tipos de coluna
  document.querySelectorAll('.col-tipo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.col-tipo-btn').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      const formulaDiv = document.getElementById('formulaConfig');
      if (btn.dataset.tipo === 'formula') {
        formulaDiv.classList.add('visivel');
        popularSelectsColunas(colConfigAberta);
      } else {
        formulaDiv.classList.remove('visivel');
      }
    });
  });

  // Fechar modal
  const btnFechar = document.getElementById('btnFecharColConfig');
  if (btnFechar) btnFechar.addEventListener('click', fecharColConfig);

  const modal = document.getElementById('colConfigModal');
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) fecharColConfig();
    });
  }

  // Salvar
  const btnSalvar = document.getElementById('btnSalvarColConfig');
  if (btnSalvar) btnSalvar.addEventListener('click', salvarColConfig);

  // Deletar coluna
  const btnDel = document.getElementById('btnDeletarColuna');
  if (btnDel) {
    btnDel.addEventListener('click', () => {
      if (!confirm('Excluir esta coluna? Os dados dela serão perdidos.')) return;
      colunas.splice(colConfigAberta, 1);
      salvarColunas();
      fecharColConfig();
      renderizarTabela();
      notifP('🗑️ Coluna removida!');
    });
  }

  // Busca
  const busca = document.getElementById('planilhaBusca');
  if (busca) {
    busca.addEventListener('input', e => {
      termoBusca = e.target.value;
      renderizarTabela();
    });
  }

  // Renomear planilha
  const nomeEdit = document.getElementById('planilhaNomeEdit');
  if (nomeEdit) {
    nomeEdit.addEventListener('change', async e => {
      const novoNome = e.target.value.trim();
      if (!novoNome || !planilhaAtual) return;
      await supabase.from('planilhas')
        .update({ nome: novoNome })
        .eq('id', planilhaAtual.id);
      planilhaAtual.nome = novoNome;
      const card = planilhas.find(p => p.id === planilhaAtual.id);
      if (card) card.nome = novoNome;
      notifP('✅ Planilha renomeada!');
    });
  }
}

function salvarColConfig() {
  if (colConfigAberta === null) return;
  const col = colunas[colConfigAberta];
  if (!col) return;

  const tipoSel = document.querySelector('.col-tipo-btn.selecionado');
  col.nome = document.getElementById('colConfigNome').value.trim() || col.nome;
  col.tipo = tipoSel ? tipoSel.dataset.tipo : col.tipo;
  col.largura = parseInt(document.getElementById('colConfigLargura').value) || 140;
  col.somarTotal = document.getElementById('colConfigSomarTotal').checked;

  if (col.tipo === 'formula') {
    const useColA = document.getElementById('fUseColA').checked;
    const useColB = document.getElementById('fUseColB').checked;
    col.formula = {
      operacao: document.getElementById('fOperacao').value,
      colA: useColA ? document.getElementById('fColA').value : '',
      constA: useColA ? '' : document.getElementById('fConstA').value,
      colB: useColB ? document.getElementById('fColB').value : '',
      constB: useColB ? '' : document.getElementById('fConstB').value,
      totalizar: document.getElementById('fTotalizar').checked,
    };
  } else {
    col.formula = null;
  }

  salvarColunas();
  fecharColConfig();
  renderizarTabela();
  notifP('✅ Coluna salva!');
}

function fecharColConfig() {
  const modal = document.getElementById('colConfigModal');
  if (modal) modal.classList.remove('aberto');
  colConfigAberta = null;
}

// ==========================================
// ORDENAR
// ==========================================
window.ordenarPor = function(colId) {
  if (ordemCol?.colId === colId) {
    ordemCol.direcao = ordemCol.direcao === 'asc' ? 'desc' : 'asc';
  } else {
    ordemCol = { colId, direcao: 'asc' };
  }
  renderizarTabela();
};

// ==========================================
// ADICIONAR LINHA
// ==========================================
window.adicionarLinha = async function() {
  if (!planilhaAtual) return;

  const { data, error } = await supabase
    .from('planilha_linhas')
    .insert({
      planilha_id: planilhaAtual.id,
      dados: {},
      ordem: linhas.length + 1
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    notifP('❌ Erro ao adicionar linha!', 'erro');
    return;
  }

  linhas.push(data);
  renderizarTabela();

  setTimeout(() => {
    const inputs = document.querySelectorAll(`[data-linha="${data.id}"]`);
    if (inputs[0]) inputs[0].focus();
  }, 50);
};

// ==========================================
// ALTERAR CÉLULA
// ==========================================
window.alterarCelula = async function(linhaId, colId, valor) {
  const linha = linhas.find(l => l.id === linhaId);
  if (!linha) return;

  if (!linha.dados) linha.dados = {};
  linha.dados[colId] = valor;

  await supabase
    .from('planilha_linhas')
    .update({ dados: linha.dados })
    .eq('id', linhaId);

  // Atualizar só as células de fórmula sem re-renderizar tudo
  const colsFormula = colunas.filter(c => c.tipo === 'formula');
  if (!colsFormula.length) return;

  let linhasFiltradas = [...linhas];
  if (termoBusca) {
    linhasFiltradas = linhasFiltradas.filter(l =>
      Object.values(l.dados || {}).some(v =>
        String(v).toLowerCase().includes(termoBusca.toLowerCase())
      )
    );
  }
  if (ordemCol) {
    linhasFiltradas.sort((a, b) => {
      const va = a.dados?.[ordemCol.colId] ?? '';
      const vb = b.dados?.[ordemCol.colId] ?? '';
      const na = parseFloat(va), nb = parseFloat(vb);
      const cmp = !isNaN(na) && !isNaN(nb) ? na - nb : String(va).localeCompare(String(vb));
      return ordemCol.direcao === 'asc' ? cmp : -cmp;
    });
  }

  linhasFiltradas.forEach((l, li) => {
    const tr = document.querySelector(`tr[data-id="${l.id}"]`);
    if (!tr) return;
    const formulaInputs = [...tr.querySelectorAll('input[data-tipo="formula"]')];
    const formulaCols = colunas
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.tipo === 'formula');

    formulaCols.forEach(({ c }, fIdx) => {
      const resultado = calcularFormulaCelula(c, l, li, linhasFiltradas);
      if (formulaInputs[fIdx]) {
        formulaInputs[fIdx].value = formatarValor(resultado, c);
        formulaInputs[fIdx].className = `cell-input ${parseFloat(resultado) < 0 ? 'negativo' : ''}`;
      }
    });
  });

  atualizarStatusBar(linhasFiltradas);
};

// ==========================================
// DELETAR LINHA
// ==========================================
window.deletarLinha = async function(linhaId) {
  if (!confirm('Excluir esta linha?')) return;
  const { error } = await supabase
    .from('planilha_linhas')
    .delete()
    .eq('id', linhaId);

  if (error) { notifP('❌ Erro ao deletar!', 'erro'); return; }

  linhas = linhas.filter(l => l.id !== linhaId);
  renderizarTabela();
  notifP('🗑️ Linha removida!');
};

// ==========================================
// SELECIONAR LINHA
// ==========================================
window.selecionarLinha = function(tr) {
  document.querySelectorAll('.planilha-table tr').forEach(r =>
    r.classList.remove('linha-selecionada')
  );
  tr.classList.add('linha-selecionada');
};

// ==========================================
// DELETAR PLANILHA
// ==========================================
window.deletarPlanilha = async function(id) {
  const p = planilhas.find(x => x.id === id);
  if (!confirm(`Excluir "${p?.nome}"? Todos os dados serão perdidos!`)) return;

  await supabase.from('planilha_linhas').delete().eq('planilha_id', id);
  await supabase.from('planilhas').delete().eq('id', id);

  planilhas = planilhas.filter(x => x.id !== id);
  renderizarListaPlanilhas();
  notifP('🗑️ Planilha excluída!');
};

// ==========================================
// SALVAR COLUNAS
// ==========================================
async function salvarColunas() {
  if (!planilhaAtual) return;
  const { error } = await supabase
    .from('planilhas')
    .update({ colunas, atualizado_em: new Date().toISOString() })
    .eq('id', planilhaAtual.id);

  if (error) console.error('Erro ao salvar colunas:', error);
  else planilhaAtual.colunas = colunas;
}

// ==========================================
// STATUS BAR
// ==========================================
function atualizarStatusBar(linhasFiltradas) {
  const el = document.getElementById('planilhaStatusBar');
  if (!el) return;

  const somas = colunas
    .filter(c => c.tipo === 'numero' && c.somarTotal)
    .map(c => {
      const total = linhasFiltradas.reduce((acc, l) => {
        const v = parseFloat(l.dados?.[c.id] || 0);
        return acc + (isNaN(v) ? 0 : v);
      }, 0);
      return `<span class="statusbar-item">
        Σ ${escaparHTML(c.nome)}: <strong>${formatarMoeda(total)}</strong>
      </span>`;
    }).join('');

  el.innerHTML = `
    <span class="statusbar-item">
      <i class="fas fa-table"></i>
      Linhas: <strong>${linhas.length}</strong>
      ${termoBusca ? `(mostrando <strong>${linhasFiltradas.length}</strong>)` : ''}
    </span>
    <span class="statusbar-item">
      <i class="fas fa-columns"></i>
      Colunas: <strong>${colunas.length}</strong>
    </span>
    ${somas}
  `;
}

// ==========================================
// EXPORTAR CSV
// ==========================================
window.exportarCSV = function() {
  if (!planilhaAtual || !colunas.length) {
    notifP('❌ Nenhuma coluna para exportar!', 'erro');
    return;
  }

  const header = colunas.map(c => `"${c.nome}"`).join(',');
  const rows = linhas.map((l, li) =>
    colunas.map(col => {
      if (col.tipo === 'formula') {
        return `"${calcularFormulaCelula(col, l, li, linhas)}"`;
      }
      return `"${String(l.dados?.[col.id] ?? '').replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${planilhaAtual.nome}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  notifP('📥 CSV exportado!');
};

// ==========================================
// UTILITÁRIOS
// ==========================================
function iconeTipo(tipo) {
  return {
    texto: 'fas fa-font',
    numero: 'fas fa-hashtag',
    data: 'fas fa-calendar',
    formula: 'fas fa-calculator',
  }[tipo] || 'fas fa-font';
}

function formatarValor(val, col) {
  if (val === '' || val === undefined || val === null) return '';
  if (String(val).endsWith('%')) return val;
  if (val === 'Erro') return 'Erro';
  const num = parseFloat(val);
  if (!isNaN(num)) return num.toFixed(2);
  return val;
}

function formatarMoeda(val) {
  if (isNaN(val)) return '0,00';
  return val.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function escaparHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function notifP(msg, tipo = 'ok') {
  const n = document.createElement('div');
  const cor = tipo === 'erro' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)';
  const borda = tipo === 'erro' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)';
  n.style.cssText = `
    position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
    background:${cor};border:1px solid ${borda};color:#e2e8f0;
    padding:13px 26px;border-radius:50px;font-size:14px;font-weight:500;
    z-index:99999;box-shadow:0 8px 28px rgba(0,0,0,0.5);
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
