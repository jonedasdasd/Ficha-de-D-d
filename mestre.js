(function(){

const META_KEY = "com.jonesdnd.ficha/dados";
const MON_KEY = "com.jonesdnd.ficha/monstros";
let OBR = null;
let obrLigado = false;
let mestre = { personagens:{}, monstros:[] };

function renderObrStatus(){
  const el = document.getElementById('obrStatus');
  if(!el) return;
  el.innerHTML = obrLigado
    ? '🔗 Conectado à sala — atualiza sozinho em tempo real.'
    : '🔄 Conectando à sala do Owlbear...';
}

function personagensDeItems(items){
  const out = {};
  for(const it of items){
    if(it && it.metadata && it.metadata[META_KEY]){
      out[it.id] = Object.assign({_itemId:it.id}, it.metadata[META_KEY]);
    }
  }
  return out;
}

async function ligarOwlbear(){
  try{
    const mod = await import("https://esm.sh/@owlbear-rodeo/sdk@3.1.0");
    OBR = mod.default;
  }catch(e){ render(); return; }
  if(!OBR || !OBR.isAvailable){ render(); return; }
  OBR.onReady(async ()=>{
    obrLigado = true;
    try{
      const items = await OBR.scene.items.getItems((it)=> it.metadata && it.metadata[META_KEY]);
      mestre.personagens = personagensDeItems(items);
    }catch(e){}
    try{
      const meta = await OBR.scene.getMetadata();
      mestre.monstros = (meta && meta[MON_KEY]) || [];
    }catch(e){}
    render();
    OBR.scene.items.onChange((items)=>{
      mestre.personagens = personagensDeItems(items);
      render();
    });
    OBR.scene.onMetadataChange((meta)=>{
      mestre.monstros = (meta && meta[MON_KEY]) || [];
      render();
    });
  });
}

async function mestreAjustarPV(itemId, delta){
  if(!OBR) return;
  try{
    await OBR.scene.items.updateItems([itemId], (items)=>{
      const it = items[0];
      if(!it || !it.metadata[META_KEY]) return;
      const d = it.metadata[META_KEY];
      const pvMax = d.pvMax||0;
      d.pvAtual = Math.max(0, Math.min(pvMax, (d.pvAtual||0)+delta));
      d._ts = Date.now();
    });
  }catch(e){ alert('Não consegui atualizar agora — tente de novo em instantes.'); }
}
async function mestreDesvincular(itemId){
  if(!OBR) return;
  if(!confirm('Isso remove a ficha desse token (o jogador pode criar de novo depois). Continuar?')) return;
  try{
    await OBR.scene.items.updateItems([itemId], (items)=>{
      const it = items[0];
      if(it && it.metadata) delete it.metadata[META_KEY];
    });
  }catch(e){}
}
async function salvarMonstros(){
  if(!OBR) return;
  try{ await OBR.scene.setMetadata({ [MON_KEY]: mestre.monstros }); }catch(e){}
}
function addMonstro(){
  const nome = document.getElementById('monNome').value.trim() || 'Monstro';
  const qtd = Math.max(1, parseInt(document.getElementById('monQtd').value)||1);
  const pvMax = Math.max(1, parseInt(document.getElementById('monPv').value)||1);
  const dano = document.getElementById('monDano').value.trim();
  const membros = [];
  for(let i=0;i<qtd;i++) membros.push({pvAtual:pvMax, pvMax});
  mestre.monstros.push({id:'m_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), nome, danoAtaque:dano, membros});
  document.getElementById('monNome').value=''; document.getElementById('monPv').value=''; document.getElementById('monDano').value=''; document.getElementById('monQtd').value='1';
  salvarMonstros();
  render();
}
function removeMonstro(id){ mestre.monstros = mestre.monstros.filter(m=>m.id!==id); salvarMonstros(); render(); }
function monstroAjustarPV(id, idx, delta){
  const m = mestre.monstros.find(m=>m.id===id); if(!m) return;
  const mb = m.membros[idx]; if(!mb) return;
  mb.pvAtual = Math.max(0, Math.min(mb.pvMax, mb.pvAtual+delta));
  salvarMonstros();
  render();
}
function monstroAplicarTodos(id, delta){
  const m = mestre.monstros.find(m=>m.id===id); if(!m) return;
  m.membros.forEach(mb=>{ mb.pvAtual = Math.max(0, Math.min(mb.pvMax, mb.pvAtual+delta)); });
  salvarMonstros();
  render();
}

function render(){
  renderObrStatus();
  document.getElementById('content').innerHTML = viewMestre();
}

function viewMestre(){
  const personagens = Object.values(mestre.personagens);
  const n = personagens.length;
  const nivelMedio = n ? personagens.reduce((s,p)=>s+(Number(p.nivel)||1),0)/n : 1;

  const linhas = personagens.map(p=>{
    const pv = p.pvAtual!=null?p.pvAtual:0, pvMax = p.pvMax||0;
    const razao = pvMax? pv/pvMax : 1;
    const corPv = razao<=0 ? '#666' : razao<=0.25 ? 'var(--danger,#c0392b)' : razao<=0.5 ? '#c07a1f' : 'inherit';
    const condTxt = (p.condicoes&&p.condicoes.length) ? ' · '+p.condicoes.join(', ') : '';
    const idEsc = String(p._itemId).replace(/'/g,"\\'");
    return `<div class="kv" style="flex-wrap:wrap;gap:8px">
      <span>${p.nome||'(sem nome)'} <span class="small">— ${p.especie||'?'} ${p.classe||'?'}${p.subclasseNota?' ('+p.subclasseNota+')':''}${condTxt}</span></span>
      <b style="display:flex;align-items:center;gap:8px">
        <span style="color:${corPv}">PV ${pv}/${pvMax||'?'}</span>
        <button class="ghost" onclick="mestreAjustarPV('${idEsc}', -5)" title="-5">-5</button>
        <button class="ghost" onclick="mestreAjustarPV('${idEsc}', -1)" title="-1">-1</button>
        <button class="ghost" onclick="mestreAjustarPV('${idEsc}', 1)" title="+1">+1</button>
        <button class="ghost" onclick="mestreAjustarPV('${idEsc}', 5)" title="+5">+5</button>
        <button class="ghost" onclick="mestreDesvincular('${idEsc}')" title="Remover a ficha desse token">✕</button>
      </b></div>`;
  }).join('')
    || '<p class="small">Nenhum personagem ainda. Peça pros jogadores selecionarem o token deles no mapa e abrirem "🧙 Ficha de Personagem" no menu do token — assim que criarem, aparece aqui sozinho.</p>';

  const dificuldades = [
    {nome:'Fácil', pv:15, dano:4, ca:12},
    {nome:'Médio', pv:35, dano:7, ca:13},
    {nome:'Chefe / Vilão', pv:70, dano:12.5, ca:15}
  ];
  const gExp = Math.max(0, nivelMedio-1.5);
  const monstroRows = dificuldades.map(d=>{
    const pv = Math.max(1, Math.round(d.pv*Math.pow(1.175, gExp)));
    const dano = Math.max(1, Math.round(d.dano*Math.pow(1.10, gExp)));
    const ca = d.ca + Math.floor(Math.max(0, nivelMedio-1)/2);
    return `<div class="kv"><span>${d.nome}</span><b>PV ~${pv} · Dano ~${dano} · CA ~${ca}</b></div>`;
  }).join('');

  const monRows = (mestre.monstros||[]).map(m=>{
    const vivos = m.membros.filter(mb=>mb.pvAtual>0).length;
    const membrosHtml = m.membros.map((mb,idx)=>{
      const morto = mb.pvAtual<=0;
      return `<div class="kv" style="opacity:${morto?0.5:1}">
        <span>${m.membros.length>1? (m.nome+' #'+(idx+1)) : m.nome}${morto?' 💀':''}</span>
        <b style="display:flex;align-items:center;gap:8px">PV ${mb.pvAtual}/${mb.pvMax}
          <button class="ghost" onclick="monstroAjustarPV('${m.id}',${idx},-5)">-5</button>
          <button class="ghost" onclick="monstroAjustarPV('${m.id}',${idx},-1)">-1</button>
          <button class="ghost" onclick="monstroAjustarPV('${m.id}',${idx},1)">+1</button>
        </b></div>`;
    }).join('');
    return `<div class="panel" style="margin-top:10px">
      <div class="row" style="justify-content:space-between;align-items:center">
        <b>${m.nome} ${m.membros.length>1?`(${vivos}/${m.membros.length} vivos)`:''}</b>
        <button class="ghost" onclick="removeMonstro('${m.id}')">✕ remover</button>
      </div>
      ${m.danoAtaque? `<div class="small row" style="align-items:center;gap:8px">Dano por ataque: ${m.danoAtaque}
        <button class="ghost dice-btn" onclick="rollExpr('${m.danoAtaque.replace(/'/g,"\\'")}','monDano_${m.id}')">🎲 rolar dano</button>
        <span id="monDano_${m.id}" class="dice-res"></span></div>` : ''}
      ${membrosHtml}
      ${m.membros.length>1? `<div class="row" style="margin-top:6px">
        <span class="small" style="align-self:center">Aplicar em todos:</span>
        <button class="ghost" onclick="monstroAplicarTodos('${m.id}',-5)">-5 todos</button>
        <button class="ghost" onclick="monstroAplicarTodos('${m.id}',-1)">-1 todos</button>
      </div>` : ''}
    </div>`;
  }).join('') || '<p class="small">Nenhum monstro criado ainda.</p>';

  return `<div class="panel">
    <h2>Painel do Mestre</h2>
    <p class="small">Assim que um jogador criar a ficha pelo token dele no mapa (clique direito no token → 🧙 Ficha de Personagem), ela aparece aqui sozinha e atualiza em tempo real.</p>

    <h3>Grupo (${n} personagem${n===1?'':'s'})</h3>
    ${linhas}

    <h3 style="margin-top:22px">Monstros / inimigos</h3>
    <p class="small">Crie o monstro com PV e o dano de ataque dele (você já calcula o "acerta ou não" e o bônus de ataque por conta própria — aqui é só pra acompanhar vida e lembrar do dano). Pra um grupo (ex: 4 goblins), coloque a quantidade e cada um ganha sua própria barra de vida.</p>
    <div class="row" style="flex-wrap:wrap;gap:8px">
      <input id="monNome" placeholder="Nome (ex: Goblin)" style="max-width:160px">
      <input id="monQtd" type="number" min="1" value="1" placeholder="Qtd" style="max-width:70px">
      <input id="monPv" type="number" min="1" placeholder="PV de cada" style="max-width:110px">
      <input id="monDano" placeholder="Dano por ataque (ex: 1d6+2)" style="max-width:180px">
      <button class="action" onclick="addMonstro()">+ Adicionar</button>
    </div>
    ${monRows}

    <h3 style="margin-top:22px">🧭 Guia Rápido de Mestre</h3>
    <p class="small">Referências e atalhos pra decidir na hora, sem precisar parar a sessão pra procurar no livro.</p>

    <details>
      <summary><b>Qual atributo/perícia pedir?</b></summary>
      <p class="small">Pense na ação que o jogador quer fazer e veja o atributo mais parecido abaixo. Se a perícia dele se encaixa, ele soma o bônus de proficiência também.</p>
      ${Object.keys(ATRIBUTO_NOMES).map(a=>{
        const pericias = Object.keys(SKILL_ATTR).filter(p=>SKILL_ATTR[p]===a);
        return `<div class="kv" style="align-items:flex-start"><span style="min-width:110px"><b>${ATRIBUTO_NOMES[a]}</b><br><span class="small">${pericias.join(', ')}</span></span>
          <span class="small" style="text-align:right">${ATRIBUTO_EXEMPLOS[a].join(' · ')}</span></div>`;
      }).join('')}
    </details>

    <details style="margin-top:10px">
      <summary><b>Qual CD (dificuldade) usar?</b></summary>
      ${CD_TABELA.map(c=>`<div class="kv"><span>${c.nome} <span class="small">— ${c.exemplo}</span></span><b>CD ${c.cd}</b></div>`).join('')}
    </details>

    <details style="margin-top:10px">
      <summary><b>🎲 Rolador rápido do mestre (d20 + modificador)</b></summary>
      <p class="small">Pra testes ou ataques de NPCs/monstros sem stat block completo — só digitar o modificador que você quer usar.</p>
      <div class="row" style="align-items:center;gap:8px">
        <label style="margin:0">Modificador</label>
        <input id="mestreD20Mod" type="number" value="0" style="max-width:80px">
        <button class="ghost dice-btn" onclick="mestreRolarD20()">🎲 Rolar d20</button>
        <span id="mestreD20Res" class="dice-res"></span>
      </div>
    </details>

    <details style="margin-top:10px">
      <summary><b>Dicas rápidas pra mestre iniciante</b></summary>
      <ul style="margin:8px 0 0 18px;padding:0">${DICAS_MESTRE.map(d=>`<li class="small" style="margin-bottom:6px">${d}</li>`).join('')}</ul>
    </details>

    <details style="margin-top:10px">
      <summary><b>Regras rápidas que sempre esquecemos</b></summary>
      ${REGRAS_RAPIDAS.map(r=>`<div class="kv" style="align-items:flex-start"><span style="min-width:120px"><b>${r[0]}</b></span><span class="small" style="text-align:right">${r[1]}</span></div>`).join('')}
    </details>

    <h3 style="margin-top:22px">Sugestão de dificuldade ${n?`(nível médio do grupo: ${nivelMedio.toFixed(1)})`:''}</h3>
    ${n? monstroRows : '<p class="small">Tenha pelo menos um personagem na lista pra calcular a sugestão.</p>'}
    <p class="small">Cálculo baseado nos seus guias: PV sobe cerca de 15–20% por nível acima da base (grupo nível 1–2), dano cerca de 10% por nível, e CA sobe cerca de 1 ponto a cada 2 níveis. São valores de referência pra você ajustar como preferir — pegue um monstro-base parecido e aplique esses números.</p>
  </div>`;
}


render();
ligarOwlbear();


})();
