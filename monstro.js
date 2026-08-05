
/* Ficha simplificada de Monstro/NPC — aberta pelo Mestre via menu de
   contexto do token (🐲 Tipo: Monstro/NPC). Guarda os dados no MESMO lugar
   que o Painel do Mestre já usa (metadados da cena, com.jonesdnd.ficha/monstros),
   então tudo que é criado aqui aparece e pode ser editado também no painel,
   e vice-versa. */
var MON_KEY = "com.jonesdnd.ficha/monstros";
var params = new URLSearchParams(location.search);
var itemId = params.get("item");
var OBR = null;
var OBRMOD = null;
var monstros = [];
var tokenInfo = null;
var meuMonId = null, meuIdx = null;

function conteudoEl(){ return document.getElementById('content'); }

async function ligarOwlbear(){
  try{
    const mod = await import("https://esm.sh/@owlbear-rodeo/sdk@3.1.0");
    OBR = mod.default;
    OBRMOD = mod;
  }catch(e){ render(); return; }
  if(!OBR || !OBR.isAvailable){ render(); return; }
  OBR.onReady(async ()=>{
    await carregar();
    OBR.scene.onMetadataChange((meta)=>{
      monstros = (meta && meta[MON_KEY]) || [];
      acharMeu();
      render();
    });
  });
}
async function carregar(){
  try{
    const meta = await OBR.scene.getMetadata();
    monstros = (meta && meta[MON_KEY]) || [];
  }catch(e){ monstros = []; }
  try{
    const items = await OBR.scene.items.getItems([itemId]);
    const it = items[0];
    tokenInfo = it ? { nome: it.name, imagem: (it.image && it.image.url) || null } : null;
  }catch(e){ tokenInfo = null; }
  acharMeu();
  render();
}
function acharMeu(){
  meuMonId = null; meuIdx = null;
  for(const m of monstros){
    const idx = (m.membros||[]).findIndex(mb=>mb.tokenId===itemId);
    if(idx>=0){ meuMonId = m.id; meuIdx = idx; break; }
  }
}
async function salvarMonstros(){
  if(!OBR) return;
  try{ await OBR.scene.setMetadata({ [MON_KEY]: monstros }); }catch(e){}
}

function criar(){
  if(!itemId) return;
  const nomeInput = document.getElementById('mNome').value.trim();
  const nome = nomeInput || (tokenInfo && tokenInfo.nome) || 'Monstro';
  const pvMax = Math.max(1, parseInt(document.getElementById('mPv').value)||1);
  const dano = document.getElementById('mDano').value.trim();
  const novo = {
    id: 'm_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
    nome, danoAtaque: dano,
    membros: [{ pvAtual: pvMax, pvMax, tokenId: itemId,
      tokenImage: tokenInfo && tokenInfo.imagem, tokenNome: tokenInfo && tokenInfo.nome }]
  };
  monstros.push(novo);
  salvarMonstros();
  acharMeu();
  render();
  sincronizarStatusToken(itemId, {pvAtual:pvMax, pvMax, ca:null, iniciativa:null, manaMax:null});
}
function ajustarPV(delta){
  const m = monstros.find(x=>x.id===meuMonId); if(!m) return;
  const mb = m.membros[meuIdx]; if(!mb) return;
  mb.pvAtual = Math.max(0, Math.min(mb.pvMax, mb.pvAtual+delta));
  salvarMonstros();
  render();
  atualizarApenasPV(itemId, mb.pvAtual, mb.pvMax);
}
function atualizarCampo(campo, valor){
  const m = monstros.find(x=>x.id===meuMonId); if(!m) return;
  const mb = m.membros[meuIdx];
  if(campo==='nome') m.nome = valor.trim() || m.nome;
  else if(campo==='dano') m.danoAtaque = valor.trim();
  else if(campo==='pvMax' && mb){
    const novo = Math.max(1, parseInt(valor)||1);
    mb.pvMax = novo;
    mb.pvAtual = Math.min(mb.pvAtual, novo);
  }
  salvarMonstros();
  render();
  if(mb) atualizarApenasPV(itemId, mb.pvAtual, mb.pvMax);
}
function removerFichaMonstro(){
  if(!confirm('Remover a ficha de monstro deste token? (o token continua no mapa, só perde a ficha e a barra de vida)')) return;
  const m = monstros.find(x=>x.id===meuMonId);
  if(m){
    m.membros.splice(meuIdx,1);
    if(m.membros.length===0) monstros = monstros.filter(x=>x.id!==meuMonId);
  }
  salvarMonstros();
  removerStatusToken(itemId);
  meuMonId = null; meuIdx = null;
  render();
}

function render(){
  const el = conteudoEl();
  if(!itemId){
    el.innerHTML = `<div class="panel"><p class="small">Abra isso pelo menu de contexto de um token no mapa (botão direito → 🐲 Tipo: Monstro/NPC).</p></div>`;
    return;
  }
  if(meuMonId==null){
    el.innerHTML = `<div class="panel">
      <h2>🐲 Ficha de Monstro/NPC</h2>
      <p class="small">Cria um stat block simplificado pra este token${tokenInfo && tokenInfo.nome ? ' ("'+tokenInfo.nome+'")' : ''} — só vida e dano de ataque, sem bônus de ataque (você mesmo calcula isso na hora). Depois de criado, ele também aparece no Painel do Mestre.</p>
      <label>Nome</label>
      <input type="text" id="mNome" placeholder="${(tokenInfo && tokenInfo.nome) || 'ex: Goblin'}">
      <label>PV máximo</label>
      <input type="number" id="mPv" min="1" placeholder="ex: 7">
      <label>Dano por ataque</label>
      <input type="text" id="mDano" placeholder="ex: 1d6+2">
      <div style="margin-top:14px"><button class="action" data-onclick="criar()">Criar e vincular a este token</button></div>
    </div>`;
  } else {
    const m = monstros.find(x=>x.id===meuMonId);
    const mb = m.membros[meuIdx];
    const danoEsc = (m.danoAtaque||'').replace(/'/g,"\\'");
    el.innerHTML = `<div class="panel">
      <h2>🐲 ${m.nome}</h2>
      <div class="kv"><span>Pontos de Vida</span><b>${mb.pvAtual} / ${mb.pvMax}</b></div>
      <div class="row" style="margin:10px 0">
        <button class="ghost" data-onclick="ajustarPV(-5)">-5</button>
        <button class="ghost" data-onclick="ajustarPV(-1)">-1</button>
        <button class="ghost" data-onclick="ajustarPV(1)">+1</button>
        <button class="ghost" data-onclick="ajustarPV(5)">+5</button>
      </div>
      ${m.danoAtaque? `<div class="row small" style="align-items:center;gap:8px;margin-bottom:8px">Dano por ataque: ${m.danoAtaque}
        <button class="ghost dice-btn" data-onclick="rollExpr('${danoEsc}','monstroDanoRes')">🎲 rolar</button>
        <span id="monstroDanoRes"></span></div>` : ''}
      <label>Nome</label>
      <input type="text" value="${m.nome}" data-onchange="atualizarCampo('nome',this.value)">
      <label>PV máximo</label>
      <input type="number" value="${mb.pvMax}" data-onchange="atualizarCampo('pvMax',this.value)">
      <label>Dano por ataque</label>
      <input type="text" value="${m.danoAtaque||''}" placeholder="ex: 1d6+2" data-onchange="atualizarCampo('dano',this.value)">
      <div style="margin-top:14px"><button class="ghost" data-onclick="removerFichaMonstro()">✕ Remover ficha deste token</button></div>
      <p class="small" style="margin-top:10px">Isso também aparece e pode ser ajustado no Painel do Mestre (inclusive se este monstro fizer parte de um grupo).</p>
    </div>`;
  }
}

render();
ligarOwlbear();
