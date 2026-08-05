
var META_KEY = "com.jonesdnd.ficha/dados";
var params = new URLSearchParams(location.search);
var itemId = params.get("item");
var OBR = null;
var OBRMOD = null;
var obrLigado = false;
var saveTimer = null;

/* ============================= ESTADO ============================= */
var state = {
  step:1,
  classe:null, subclasseNota:"",
  especie:null,
  antecedente:null,
  atributoMetodo:"standard",
  base:{FOR:null,DES:null,CON:null,INT:null,SAB:null,CAR:null},
  bgBonus:{},
  nome:"", nivel:1, xp:0, pvAtual:null, pvMax:null,
  inventario:[], anotacoes:"",
  equipamento:"", nextItemId:1,
  armas:[], nextArmaId:1,
  asiBonus:{},
  asiFeats:{},
  historico:[],
  spellUsed:{},
  pactUsed:0,
  condicoes:[],
  dinheiro:{po:0,pp:0,pc:0},
  deathSuccess:0, deathFail:0,
  checklist:{},
  caBonus:0,
  _ts:0
};

/* ============================= NAV ============================= */
var STEP_NAMES = ["Classe","Espécie","Antecedente","Atributos","Ficha"];
function renderStepNav(){
  const nav = document.getElementById('stepNav');
  nav.innerHTML = STEP_NAMES.map((n,i)=>{
    const s=i+1;
    let cls='step-btn'+(s===state.step?' active':'')+(s<state.step?' done':'');
    return `<button class="${cls}" data-onclick="goStep(${s})">${s}. ${n}</button>`;
  }).join('');
}
function goStep(s){ state.step=s; render(); }

/* ============================= INTEGRAÇÃO COM OWLBEAR ============================= */
function renderObrStatus(){
  const el = document.getElementById('obrStatus');
  if(!el) return;
  if(!itemId){
    el.innerHTML = `⚠️ Esta ficha não está ligada a nenhum token. Pra ela salvar e aparecer pro mestre, selecione seu token no mapa do Owlbear e abra a ficha pelo menu dele (clique direito no token → 🧙 Ficha de Personagem).`;
  } else if(!obrLigado){
    el.innerHTML = `🔄 Conectando ao token...`;
  } else {
    el.innerHTML = `🔗 Ligada ao seu token — salva sozinha, o mestre já vê tudo em tempo real.`;
  }
}
async function carregarDoItem(){
  if(!itemId || !OBR) return;
  try{
    const items = await OBR.scene.items.getItems([itemId]);
    const item = items[0];
    if(item && item.metadata && item.metadata[META_KEY]){
      const saved = item.metadata[META_KEY];
      Object.assign(state, saved);
      if(state.classe && state.especie && state.antecedente) state.step = 5;
    }
    // Só marcar como ligado se a leitura do item tiver sucesso
    obrLigado = true;
    // Se não há metadata no token, tente restaurar backup local automático
    const hasMeta = item && item.metadata && item.metadata[META_KEY];
    if(!hasMeta){
      const backup = loadLocalBackup();
      if(backup){
        Object.assign(state, backup);
        const el = document.getElementById('obrStatus');
        if(el) el.innerHTML = '⚠️ Restaurado backup local — salve agora para gravar no token.';
      }
    }
  }catch(e){
    console.error('Ficha: erro ao carregar dados do item', e);
    obrLigado = false;
  }
  render();
}
function agendarSalvar(){
  if(!itemId || !OBR || !obrLigado) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(salvarNoItem, 600);
}

// Backup local para evitar perda caso o SDK/serviço falhe ou o popover feche.
function _backupKey(){ return META_KEY+':backup:'+(itemId||'unsaved'); }
function saveLocalBackup(){
  try{
    const snapshot = JSON.stringify(state);
    localStorage.setItem(_backupKey(), snapshot);
  }catch(e){ /* nada a fazer */ }
}
function loadLocalBackup(){
  try{
    const raw = localStorage.getItem(_backupKey());
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){ return null; }
}
function clearLocalBackup(){ try{ localStorage.removeItem(_backupKey()); }catch(e){} }
async function salvarNoItem(){
  // se não tem item ligado, guarda só no backup local para não perder.
  if(!itemId || !OBR || !obrLigado){
    saveLocalBackup();
    const el = document.getElementById('obrStatus');
    if(el) el.innerHTML = '⚠️ Ficha não ligada ao token ou SDK indisponível — salvo localmente.';
    return;
  }
  state._ts = Date.now();
  const snapshot = JSON.parse(JSON.stringify(state));
  try{
    await OBR.scene.items.updateItems([itemId], (items)=>{
      for(const it of items) it.metadata[META_KEY] = snapshot;
    });
    // sucesso: remove backup local
    clearLocalBackup();
  }catch(e){
    console.error('Ficha: erro ao salvarNoItem', e);
    // salva backup local para não perder trabalho
    saveLocalBackup();
    const el = document.getElementById('obrStatus');
    if(el) el.innerHTML = '⚠️ Erro ao salvar a ficha — backup salvo localmente.';
    return;
  }
  sincronizarStatusNoToken();
}

/* Calcula quanto de "mana"/recurso mágico resta (soma de todos os espaços de
   magia, ou os espaços de Pacto do Bruxo) — usado só pra desenhar a barra de
   recursos em cima do token, e só aparece se a classe realmente conjura. */
function recursosMagicos(){
  const cl = CLASSES[state.classe];
  if(!cl || !cl.cast) return null;
  const lvl = state.nivel;
  if(cl.cast.tipo==='pact'){
    const p = PACT_SLOTS[lvl];
    if(!p) return null;
    return { atual: Math.max(0, p.n-(state.pactUsed||0)), max: p.n };
  }
  const table = cl.cast.tipo==='full' ? FULL_SLOTS[lvl] : HALF_SLOTS[lvl];
  if(!table) return null;
  let max=0, usados=0;
  table.forEach((t,i)=>{ max += t; usados += Math.min(t, (state.spellUsed[i+1]||0)); });
  if(max<=0) return null;
  return { atual: Math.max(0, max-usados), max };
}

/* Manda os dados atuais (PV, CA, Iniciativa, Mana) pro token no mapa, pra
   quem está mestrando ver tudo sem precisar abrir a ficha. */
function sincronizarStatusNoToken(){
  if(!itemId || !obrLigado || !state.classe || state.pvMax==null) return;
  try{
    const final = calcFinal();
    const ca = 10+mod(final.DES)+(Number(state.caBonus)||0);
    const recursos = recursosMagicos();
    sincronizarStatusToken(itemId, {
      pvAtual: state.pvAtual, pvMax: state.pvMax,
      ca, iniciativa: mod(final.DES),
      manaAtual: recursos? recursos.atual : null,
      manaMax: recursos? recursos.max : null
    });
  }catch(e){ /* se a ficha ainda não tiver passo 4 completo, ignora */ }
}
async function ligarOwlbear(){
  try{
    const mod = await import("https://esm.sh/@owlbear-rodeo/sdk@3.1.0");
    OBR = mod.default;
    OBRMOD = mod;
  }catch(e){ render(); return; }
  if(!OBR || !OBR.isAvailable){ render(); return; }
  OBR.onReady(async ()=>{
    await carregarDoItem();
    OBR.scene.items.onChange(async (items)=>{
      if(!itemId) return;
      const it = items.find(i=>i.id===itemId);
      if(it && it.metadata && it.metadata[META_KEY]){
        const incoming = it.metadata[META_KEY];
        if(incoming._ts && incoming._ts > (state._ts||0)){
          state.pvAtual = incoming.pvAtual;
          state.condicoes = incoming.condicoes || state.condicoes;
          state._ts = incoming._ts;
          render();
        }
      }
    });
  });
}

/* ============================= RENDER ============================= */
function render(){
  renderObrStatus();
  renderStepNav();
  const view = state.step===1?viewClasse(): state.step===2?viewEspecie(): state.step===3?viewAntecedente(): state.step===4?viewAtributos(): viewFicha();
  document.getElementById('content').innerHTML = view;
  agendarSalvar();
}
function exportFicha(){
  const blob = new Blob([JSON.stringify(state)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ficha_'+(state.nome||'personagem').replace(/[^a-zA-Z0-9_\-]/g,'_')+'.json';
  document.body.appendChild(a); a.click(); a.remove();
}

/* ============================= CRIAÇÃO / FICHA (mesma lógica de sempre) ============================= */
function viewClasse(){
  let cards = Object.keys(CLASSES).map(name=>{
    const cl = CLASSES[name];
    const sel = state.classe===name?' selected':'';
    return `<div class="card${sel}" data-onclick="selectClasse('${name}')">
      <b>${name}</b>
      <div class="meta">Dado de Vida: d${cl.hitDie} · Atributo: ${cl.primary}</div>
      <div class="meta">Salvaguardas: ${cl.saves.join(', ')}</div>
    </div>`;
  }).join('');
  let detail = '';
  if(state.classe){
    const cl = CLASSES[state.classe];
    detail = `<h3>${state.classe}</h3>
    <div class="kv"><span>Dado de vida</span><b>d${cl.hitDie} por nível</b></div>
    <div class="kv"><span>Atributo primário</span><b>${cl.primary}</b></div>
    <div class="kv"><span>Salvaguardas</span><b>${cl.saves.join(', ')}</b></div>
    <div class="kv"><span>Treino com armadura</span><b>${cl.armor}</b></div>
    <div class="kv"><span>Proficiência com armas</span><b>${cl.weapons}</b></div>
    ${cl.tool?`<div class="kv"><span>Ferramenta</span><b>${cl.tool}</b></div>`:''}
    <div class="featurebox"><b>Nível 1:</b> ${cl.feature}</div>
    <h3>Escolha ${cl.skillN} perícia(s)</h3>
    <div class="grid" id="skillPick">${cl.skills.map(s=>{
      const list=state.classeSkills||[];
      const checked = list.includes(s)?'checked':'';
      return `<label style="display:flex;align-items:center;background:var(--panel2);padding:6px 10px;border-radius:4px;cursor:pointer;">
        <input type="checkbox" value="${s}" ${checked} data-onchange="toggleClasseSkill(this,'${s}')"> ${s}</label>`;
    }).join('')}</div>`;
  }
  return `<div class="panel"><h2>Passo 1 — Escolha uma classe</h2>
    <p class="small">A classe define o papel do seu personagem em combate e suas principais habilidades.</p>
    <div class="row" style="margin-bottom:14px;align-items:center">
      <label class="ghost" style="cursor:pointer;padding:9px 18px;border-radius:4px;border:1px solid var(--border);font-size:13px">📂 Já tenho uma ficha salva (.json)
        <input type="file" accept=".json" style="display:none" data-onchange="importFichaInput(this.files)"></label>
      <span class="small">Se você já criou seu personagem antes e exportou o arquivo, carregue aqui em vez de começar do zero.</span>
    </div>
    <div class="grid">${cards}</div>
    ${detail}
    <div class="nav"><span></span><button class="action" data-onclick="goStep(2)" ${state.classe?'':'disabled'}>Próximo →</button></div>
  </div>`;
}
function selectClasse(name){ state.classe=name; state.classeSkills=[]; state.equipamento=CLASSES[name].equipmentStart; render(); }
function toggleClasseSkill(el,skill){
  state.classeSkills = state.classeSkills||[];
  const max = CLASSES[state.classe].skillN;
  if(el.checked){
    if(state.classeSkills.length>=max){ el.checked=false; return; }
    state.classeSkills.push(skill);
  } else {
    state.classeSkills = state.classeSkills.filter(s=>s!==skill);
  }
}

/* ============================= STEP 2: ESPÉCIE ============================= */
function viewEspecie(){
  let cards = Object.keys(SPECIES).map(name=>{
    const sp = SPECIES[name];
    const sel = state.especie===name?' selected':'';
    return `<div class="card${sel}" data-onclick="selectEspecie('${name}')">
      <b>${name}</b>
      <div class="meta">Tamanho: ${sp.size} · Deslocamento: ${sp.speed}m</div>
    </div>`;
  }).join('');
  let detail='';
  if(state.especie){
    const sp = SPECIES[state.especie];
    detail = `<h3>Traços de ${state.especie}</h3>
    <div class="kv"><span>Tamanho</span><b>${sp.size}</b></div>
    <div class="kv"><span>Deslocamento</span><b>${sp.speed} metros</b></div>
    ${sp.traits.map(t=>`<div class="featurebox">${t}</div>`).join('')}`;
  }
  return `<div class="panel"><h2>Passo 2 — Escolha uma espécie</h2>
    <p class="small">A espécie define traços especiais, tamanho e deslocamento (não dá mais bônus de atributo nas regras 2024 — isso agora vem do antecedente).</p>
    <div class="grid">${cards}</div>
    ${detail}
    <div class="nav"><button class="ghost" data-onclick="goStep(1)">← Voltar</button><button class="action" data-onclick="goStep(3)" ${state.especie?'':'disabled'}>Próximo →</button></div>
  </div>`;
}
function selectEspecie(name){ state.especie=name; render(); }

/* ============================= STEP 3: ANTECEDENTE ============================= */
function viewAntecedente(){
  let cards = Object.keys(BACKGROUNDS).map(name=>{
    const bg = BACKGROUNDS[name];
    const sel = state.antecedente===name?' selected':'';
    return `<div class="card${sel}" data-onclick="selectAntecedente('${name}')">
      <b>${name}</b>
      <div class="meta">Atributos: ${bg.attrs.join(', ')}</div>
      <div class="meta">Talento: ${bg.talent}</div>
    </div>`;
  }).join('');
  let detail='';
  if(state.antecedente){
    const bg = BACKGROUNDS[state.antecedente];
    detail = `<h3>${state.antecedente}</h3>
    <div class="kv"><span>Atributos favorecidos</span><b>${bg.attrs.join(', ')}</b></div>
    <div class="kv"><span>Talento de origem</span><b>${bg.talent}</b></div>
    <div class="kv"><span>Perícias</span><b>${bg.skills.join(', ')}</b></div>
    <div class="kv"><span>Ferramenta</span><b>${bg.tool}</b></div>
    <p class="small">No passo seguinte, distribua +2/+1 (ou +1/+1/+1) entre esses três atributos.</p>`;
  }
  return `<div class="panel"><h2>Passo 3 — Escolha um antecedente</h2>
    <p class="small">O antecedente reflete a vida do personagem antes da aventura e agora é a fonte dos bônus de atributo.</p>
    <div class="grid">${cards}</div>
    ${detail}
    <div class="nav"><button class="ghost" data-onclick="goStep(2)">← Voltar</button><button class="action" data-onclick="goStep(4)" ${state.antecedente?'':'disabled'}>Próximo →</button></div>
  </div>`;
}
function selectAntecedente(name){ state.antecedente=name; state.bgBonus={}; render(); }

/* ============================= STEP 4: ATRIBUTOS ============================= */
function viewAtributos(){
  const cl = state.classe?CLASSES[state.classe]:null;
  const attrs=["FOR","DES","CON","INT","SAB","CAR"];
  const NAMES={FOR:"Força",DES:"Destreza",CON:"Constituição",INT:"Inteligência",SAB:"Sabedoria",CAR:"Carisma"};

  let methodHtml = `<div class="row">
    <label style="flex:1"><input type="radio" name="method" ${state.atributoMetodo==='standard'?'checked':''} data-onchange="setMethod('standard')"> Conjunto Padrão (15,14,13,12,10,8) — recomendado para iniciantes</label>
  </div>
  <div class="row">
    <label style="flex:1"><input type="radio" name="method" ${state.atributoMetodo==='points'?'checked':''} data-onchange="setMethod('points')"> Custo de Pontos (27 pontos)</label>
  </div>`;

  let assignHtml = '';
  if(state.atributoMetodo==='standard'){
    const suggestion = cl ? cl.array : null;
    assignHtml = `<p class="small">Sugestão automática com base na classe escolhida (${state.classe||'—'}). Você pode trocar os valores entre os atributos se quiser.</p>
    <div class="statgrid">${attrs.map(a=>{
      const v = state.base[a] || (suggestion?suggestion[a]:null);
      return `<div class="statbox"><div class="lbl">${a}</div>
        <select data-onchange="setBase('${a}',this.value)">
          <option value="">-</option>
          ${[15,14,13,12,10,8].map(n=>`<option value="${n}" ${v==n?'selected':''}>${n}</option>`).join('')}
        </select></div>`;
    }).join('')}</div>
    <button class="ghost" data-onclick="applySuggestion()">Usar sugestão da classe automaticamente</button>`;
  } else {
    let spent = attrs.reduce((s,a)=>s+(POINT_COST[state.base[a]||8]||0),0);
    assignHtml = `<p class="small">Pontos gastos: <b>${spent} / 27</b> ${spent>27?'<span class="pool-warning">— excedeu o limite!</span>':''}</p>
    <div class="statgrid">${attrs.map(a=>{
      const v = state.base[a]||8;
      return `<div class="statbox"><div class="lbl">${a}</div>
        <select data-onchange="setBase('${a}',this.value)">
          ${[8,9,10,11,12,13,14,15].map(n=>`<option value="${n}" ${v==n?'selected':''}>${n}</option>`).join('')}
        </select></div>`;
    }).join('')}</div>`;
  }

  let bgHtml='';
  if(state.antecedente){
    const bg = BACKGROUNDS[state.antecedente];
    bgHtml = `<h3>Bônus do antecedente (${state.antecedente})</h3>
    <p class="small">Aumente um atributo dos três em +2 e outro em +1, ou os três em +1. Nenhum pode passar de 20.</p>
    <div class="row">${bg.attrs.map(a=>{
      const abbr=Object.keys(NAMES).find(k=>NAMES[k]===a);
      const cur = state.bgBonus[abbr]||0;
      return `<div class="col"><label>${a}</label>
        <select data-onchange="setBgBonus('${abbr}',this.value)">
          <option value="0" ${cur==0?'selected':''}>+0</option>
          <option value="1" ${cur==1?'selected':''}>+1</option>
          <option value="2" ${cur==2?'selected':''}>+2</option>
        </select></div>`;
    }).join('')}</div>`;
  }

  const totalBonus = Object.values(state.bgBonus).reduce((s,v)=>s+Number(v),0);
  const bonusWarning = totalBonus>3 ? '<p class="pool-warning">Total de bônus não pode passar de +3 (ex.: +2/+1 ou +1/+1/+1).</p>':'';

  let previewHtml = `<h3>Valores finais</h3><div class="statgrid">${attrs.map(a=>{
    const base = state.base[a]||10;
    const bonus = state.bgBonus[a]||0;
    const final = Math.min(20, Number(base)+Number(bonus));
    return `<div class="statbox"><div class="lbl">${a}</div><div class="val">${final}</div><div class="mod">${fmtMod(mod(final))}</div></div>`;
  }).join('')}</div>`;

  return `<div class="panel"><h2>Passo 4 — Determine os valores de atributo</h2>
    ${methodHtml}
    ${assignHtml}
    ${bgHtml}
    ${bonusWarning}
    ${previewHtml}
    <div class="nav"><button class="ghost" data-onclick="goStep(3)">← Voltar</button><button class="action" data-onclick="goStep(5)">Ver ficha →</button></div>
  </div>`;
}
function setMethod(m){ state.atributoMetodo=m; render(); }
function setBase(attr,val){ state.base[attr]=val?Number(val):null; render(); }
function applySuggestion(){
  if(!state.classe) return;
  const arr = CLASSES[state.classe].array;
  state.base = {...arr};
  render();
}
function setBgBonus(attr,val){ state.bgBonus[attr]=Number(val); render(); }

/* ============================= STEP 5: FICHA ============================= */
function calcFinal(){
  const attrs=["FOR","DES","CON","INT","SAB","CAR"];
  let final={};
  attrs.forEach(a=>{ final[a]= Math.min(20,(state.base[a]||10)+(state.bgBonus[a]||0)+(state.asiBonus[a]||0)); });
  return final;
}
function tip(termo, texto){
  return `<span class="tipword" data-onclick="event.stopPropagation();toggleTip(this)">${termo} <span class="tipicon">ⓘ</span><span class="tipbox">${texto}</span></span>`;
}
function toggleTip(el){ el.classList.toggle('open'); }

function rollDado(sides, modificador, resId, label){
  const el = document.getElementById(resId);
  if(!el) return;
  let n = 0;
  el.classList.add('rolling');
  const iv = setInterval(()=>{
    el.textContent = '🎲 ' + (Math.floor(Math.random()*sides)+1);
    n++;
    if(n>=8){
      clearInterval(iv);
      const final = Math.floor(Math.random()*sides)+1;
      const total = final + modificador;
      el.textContent = `🎲 ${final}${modificador?' '+fmtMod(modificador):''} = ${total}`;
      el.classList.remove('rolling');
    }
  }, 55);
}

function viewFicha(){
  if(!state.classe||!state.especie||!state.antecedente){
    return `<div class="panel"><h2>Ficha</h2><p>Complete os passos 1 a 3 antes de gerar a ficha.</p>
    <div class="nav"><button class="ghost" data-onclick="goStep(1)">← Voltar ao início</button></div></div>`;
  }
  const cl = CLASSES[state.classe];
  const sp = SPECIES[state.especie];
  const bg = BACKGROUNDS[state.antecedente];
  const final = calcFinal();
  const lvl = state.nivel;
  const prof = getProf(lvl);
  const conMod = mod(final.CON);

  if(state.pvMax===null){
    state.pvMax = cl.hitDie + conMod;
    state.pvAtual = state.pvMax;
  }
  if(!state.equipamento){ state.equipamento = cl.equipmentStart; }

  const skillsProficient = new Set([...(state.classeSkills||[]), ...bg.skills]);
  const NAMES={FOR:"Força",DES:"Destreza",CON:"Constituição",INT:"Inteligência",SAB:"Sabedoria",CAR:"Carisma"};

  const skillRows = ALL_SKILLS.map(s=>{
    const attr = SKILL_ATTR[s];
    const isProf = skillsProficient.has(s);
    const total = mod(final[attr]) + (isProf?prof:0);
    const id = 'sk_'+s.replace(/[^a-zA-Z]/g,'');
    return `<div class="kv"><span>${isProf?'●':'○'} ${s} <span class="small">(${attr})</span></span>
      <b style="display:flex;align-items:center;gap:6px">${fmtMod(total)}
        <button class="dice-btn" data-onclick="rollDado(20,${total},'${id}')">🎲</button>
        <span class="dice-res" id="${id}"></span>
      </b></div>`;
  }).join('');

  const saveRows = ["FOR","DES","CON","INT","SAB","CAR"].map(a=>{
    const isProf = cl.saves.includes(NAMES[a]);
    const total = mod(final[a]) + (isProf?prof:0);
    const id = 'sv_'+a;
    return `<div class="kv"><span>${isProf?'●':'○'} ${NAMES[a]}</span>
      <b style="display:flex;align-items:center;gap:6px">${fmtMod(total)}
        <button class="dice-btn" data-onclick="rollDado(20,${total},'${id}')">🎲</button>
        <span class="dice-res" id="${id}"></span>
      </b></div>`;
  }).join('');

  const passivePerception = 10 + mod(final.SAB) + (skillsProficient.has('Percepção')?prof:0);

  const nextLevelRow = XP_TABLE.find(r=>r.lvl===lvl+1);
  const curLevelRow = XP_TABLE.find(r=>r.lvl===lvl);
  const xpProgress = nextLevelRow ? Math.min(100, Math.round((state.xp-curLevelRow.xp)/(nextLevelRow.xp-curLevelRow.xp)*100)) : 100;

  const hpRatio = state.pvAtual / state.pvMax;
  const hpClass = hpRatio<=0 ? 'hp-zero' : (hpRatio<=0.5 ? 'hp-low' : '');

  // --- Características por nível (nível 1 + histórico automático de subida) ---
  const featureBoxes = [
    `<div class="featurebox"><b>${state.classe} (Nível 1):</b> ${cl.feature}</div>`,
    ...sp.traits.map(t=>`<div class="featurebox"><b>${state.especie}:</b> ${t}</div>`),
    `<div class="featurebox"><b>Talento (${state.antecedente}):</b> ${bg.talent}</div>`,
    ...state.historico.map(h=>`<div class="featurebox"><b>Nível ${h.lvl}:</b> ${h.texto}</div>`)
  ].join('');

  // --- Equipamento ---
  const equipamentoHtml = `<h3>Equipamento inicial ${tip('(o que é isso?','Sua classe já vem com esses itens de partida. É um texto livre: risque, apague ou reescreva conforme for trocando de equipamento na aventura — não tem sistema automático de troca, é só uma anotação viva.')}</h3>
    <textarea style="min-height:70px" data-oninput="state.equipamento=this.value">${state.equipamento}</textarea>`;

  // --- Inventário com quantidade ---
  const invRows = state.inventario.map(it=>`
    <div class="inv-item"><span>${it.desc}</span>
      <span style="display:flex;align-items:center;gap:6px">
        <button data-onclick="decQty(${it.id})">−</button><b style="min-width:22px;text-align:center;display:inline-block">${it.qty}</b><button data-onclick="incQty(${it.id})">+</button>
        <button data-onclick="removeItem(${it.id})" title="Remover item">✕</button>
      </span></div>`).join('') || '<p class="small">Nenhum item ainda.</p>';

  // --- Armas equipadas com bônus calculado ---
  const armaRows = state.armas.map(a=>{
    const statMod = a.stat==='Nenhum' ? 0 : mod(final[a.stat]);
    const total = statMod + (Number(a.bonusExtra)||0) + prof;
    const id = 'arma_'+a.id;
    const idDano = 'armaDano_'+a.id;
    const danoEsc = (a.dano||'').replace(/'/g,"\\'");
    return `<div class="inv-item"><span>${a.nome} <span class="small">(${a.stat}${a.bonusExtra?', '+fmtMod(Number(a.bonusExtra))+' extra':''}${a.dano?', dano '+a.dano:''})</span></span>
      <span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <b>${fmtMod(total)}</b>
        <button class="dice-btn" data-onclick="rollDado(20,${total},'${id}')" title="Rolar ataque (1d20 + mod + proficiência)">🎲 Atq</button>
        <span class="dice-res" id="${id}"></span>
        ${a.dano? `<button class="dice-btn" data-onclick="rollArmaDano('${danoEsc}',${statMod},'${idDano}')" title="Rolar dano (dado da arma + modificador)">🎲 Dano</button>
        <span class="dice-res" id="${idDano}"></span>` : ''}
        <button data-onclick="removeArma(${a.id})">✕</button>
      </span></div>`;
  }).join('') || '<p class="small">Nenhuma arma equipada ainda.</p>';

  // --- Espaços de magia ---
  let spellHtml = '';
  if(cl.cast){
    if(cl.cast.tipo==='pact'){
      const p = PACT_SLOTS[lvl];
      const boxes = Array.from({length:p.n}).map((_,i)=>{
        const used = i < state.pactUsed;
        return `<span class="slotbox ${used?'used':''}" data-onclick="togglePact(${i})"></span>`;
      }).join('');
      spellHtml = `<h3>Espaços de Magia de Pacto (Bruxo) ${tip('como funciona?','Todos os seus espaços são do mesmo círculo ('+p.c+'º) e voltam em Descanso Curto — clique numa caixinha pra marcar como gasto.')}</h3>
      <div class="row" style="align-items:center;gap:14px"><span>Círculo ${p.c}:</span><div>${boxes}</div>
      <button class="ghost" data-onclick="descansoCurto()">Descanso Curto</button></div>`;
    } else {
      const table = cl.cast.tipo==='full' ? FULL_SLOTS[lvl] : HALF_SLOTS[lvl];
      const rows = table.map((total,i)=>{
        if(total<=0) return '';
        const circulo = i+1;
        const used = state.spellUsed[circulo]||0;
        const boxes = Array.from({length:total}).map((_,j)=>{
          const isUsed = j<used;
          return `<span class="slotbox ${isUsed?'used':''}" data-onclick="toggleSlot(${circulo},${j})"></span>`;
        }).join('');
        return `<div class="kv"><span>Círculo ${circulo}</span><span>${boxes}</span></div>`;
      }).join('');
      spellHtml = `<h3>Espaços de Magia ${tip('gasto de magia','Cada vez que você conjura uma magia usando um espaço, marque uma caixinha. Descanso Longo limpa tudo; Descanso Curto não recupera espaços de magia normais (só os de Bruxo).')}</h3>
      ${rows}
      <div class="row" style="margin-top:6px"><button class="ghost" data-onclick="descansoLongo()">Descanso Longo (recupera tudo)</button></div>`;
    }
  }

  // --- Condições ativas ---
  const condRows = Object.keys(CONDICOES).map(c=>{
    const on = state.condicoes.includes(c);
    return `<label style="display:flex;align-items:center;gap:6px;background:var(--panel2);padding:5px 9px;border-radius:4px;cursor:pointer;font-size:12px;">
      <input type="checkbox" ${on?'checked':''} data-onchange="toggleCondicao('${c}')"> ${tip(c, CONICOES_ESCAPE(c))}</label>`;
  }).join('');

  // --- Testes de morte (só aparece com 0 PV) ---
  const deathHtml = state.pvAtual<=0 ? `<h3 style="color:#d99">Testes de Morte ${tip('o que é isso?', 'Ao chegar a 0 PV você fica Inconsciente e faz um teste de morte no início de cada um dos seus turnos, até estabilizar, ser curado ou morrer.')}</h3>
    <div class="row"><div class="col"><label>Sucessos</label>${[1,2,3].map(i=>`<input type="checkbox" ${state.deathSuccess>=i?'checked':''} data-onchange="setDeathSuccess(${i})">`).join(' ')}</div>
    <div class="col"><label>Falhas</label>${[1,2,3].map(i=>`<input type="checkbox" ${state.deathFail>=i?'checked':''} data-onchange="setDeathFail(${i})">`).join(' ')}</div></div>
    <button class="ghost" data-onclick="rollDado(20,0,'deathroll')">🎲 Rolar teste de morte</button> <span class="dice-res" id="deathroll"></span>
    <p class="small">10 ou mais = sucesso, abaixo de 10 = falha. 3 sucessos estabiliza, 3 falhas e o personagem morre. Um 20 natural recupera 1 PV.</p>` : '';

  // --- Dinheiro ---
  const dinheiroHtml = `<h3>Dinheiro</h3><div class="row">
    <div class="col"><label>Peças de Ouro</label><input type="number" value="${state.dinheiro.po}" data-onchange="state.dinheiro.po=Number(this.value);render()"></div>
    <div class="col"><label>Peças de Prata</label><input type="number" value="${state.dinheiro.pp}" data-onchange="state.dinheiro.pp=Number(this.value);render()"></div>
    <div class="col"><label>Peças de Cobre</label><input type="number" value="${state.dinheiro.pc}" data-onchange="state.dinheiro.pc=Number(this.value);render()"></div>
  </div>`;

  // --- Checklist pré-sessão ---
  const checklistItens = ["Conferi meus Pontos de Vida","Conferi meus espaços de magia / usos por descanso","Conferi meus itens consumíveis (flechas, poções, etc)","Sei o nome e a CA aproximada da minha arma principal"];
  const checklistHtml = `<h3>Checklist antes da sessão</h3>${checklistItens.map((c,i)=>`
    <label style="display:block;font-size:13px;margin:4px 0;cursor:pointer;"><input type="checkbox" ${state.checklist[i]?'checked':''} data-onchange="toggleChecklist(${i})"> ${c}</label>`).join('')}`;

  // --- Frases de interpretação ---
  const frasesHtml = `<details><summary style="cursor:pointer;color:var(--accent2)">💬 Preciso de ideias pra interpretar (clique pra abrir)</summary>
    <div style="margin-top:8px">${FRASES_INTERPRETACAO.map(f=>`<div class="featurebox">${f}</div>`).join('')}</div></details>`;

  // --- Lembrete de turno ---
  const turnoHtml = `<div class="featurebox" style="border-left-color:var(--good)"><b>Lembrete de turno:</b> ${TURNO_LEMBRETE}</div>`;

  return `<div class="sheet ${hpClass}">
    <div class="sheet-header">
      <div>
        <input type="text" placeholder="Nome do personagem" value="${state.nome}" data-oninput="state.nome=this.value"
          style="background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--accent2);font-size:20px;font-family:inherit;padding:2px;">
        <div class="meta">${state.especie} ${state.classe}${state.subclasseNota?' ('+state.subclasseNota+')':''} · Nível ${lvl} · Antecedente: ${state.antecedente}</div>
      </div>
      <div style="text-align:right">
        <div class="small">Bônus de Proficiência</div>
        <div style="font-size:22px;color:var(--accent2)">${fmtMod(prof)}</div>
        <button class="ghost" data-onclick="toggleGlossario()" style="margin-top:6px">📖 Glossário</button>
          <button class="ghost" data-onclick="exportFicha()" style="margin-top:6px">💾 Exportar como backup</button>
          <button class="ghost" data-onclick="salvarNoItem()" style="margin-top:6px">💾 Salvar agora</button>
      </div>
    </div>
    <p class="small" style="margin-top:-6px">Exportar é só um backup local — a ficha já salva e sincroniza sozinha pelo token do Owlbear (veja o aviso no topo da página).</p>


    ${turnoHtml}

    <div class="statgrid">${["FOR","DES","CON","INT","SAB","CAR"].map(a=>{
      const id='at_'+a;
      return `<div class="statbox"><div class="lbl">${a}</div><div class="val">${final[a]}</div><div class="mod">${fmtMod(mod(final[a]))}</div>
      <button class="dice-btn" data-onclick="rollDado(20,${mod(final[a])},'${id}')">🎲</button><div class="dice-res" id="${id}"></div></div>`;
    }).join('')}
    </div>

    <div class="row">
      <div class="col">
        <h3>Combate</h3>
        <div class="kv"><span>Pontos de Vida</span><b>
          <input type="number" value="${state.pvAtual}" style="width:50px" data-onchange="state.pvAtual=Number(this.value);render()"> / ${state.pvMax}
        </b></div>
        <div class="kv"><span>Classe de Armadura (CA) ${tip('Como isso é calculado?','CA = 10 + modificador de Destreza + o bônus da sua armadura/escudo equipados. Ajuste o bônus ao lado quando trocar de armadura — não tem lista automática de armaduras, é só esse número.')}</span>
          <b style="display:flex;align-items:center;gap:6px">${10+mod(final.DES)+(Number(state.caBonus)||0)}
          <input type="number" value="${state.caBonus||0}" title="Bônus de armadura/escudo" style="width:48px" data-onchange="state.caBonus=Number(this.value);render()"></b></div>
        <div class="kv"><span>Deslocamento</span><b>${sp.speed} m</b></div>
        <div class="kv"><span>Iniciativa</span><b style="display:flex;align-items:center;gap:6px">${fmtMod(mod(final.DES))}
          <button class="dice-btn" data-onclick="rollDado(20,${mod(final.DES)},'iniroll')">🎲</button><span class="dice-res" id="iniroll"></span></b></div>
        <div class="kv"><span>Percepção Passiva</span><b>${passivePerception}</b></div>
        <div class="kv"><span>Dado de Vida</span><b>d${cl.hitDie}</b></div>

        <h3>Salvaguardas ${tip('Teste de Resistência','Rolagem de d20 + modificador para resistir a um efeito. Quanto maior o total, mais fácil de resistir.')}</h3>
        ${saveRows}

        ${deathHtml}
      </div>
      <div class="col">
        <h3>Perícias ${tip('Vantagem/Desvantagem','Com Vantagem, role 2d20 e use o maior resultado. Com Desvantagem, role 2d20 e use o menor.')}</h3>
        <div class="skill-list">${skillRows}</div>
      </div>
    </div>

    <h3>Características</h3>
    ${featureBoxes}

    <h3>Proficiências</h3>
    <div class="kv"><span>Armaduras</span><b>${cl.armor}</b></div>
    <div class="kv"><span>Armas</span><b>${cl.weapons}</b></div>
    ${cl.tool?`<div class="kv"><span>Ferramenta (classe)</span><b>${cl.tool}</b></div>`:''}
    <div class="kv"><span>Ferramenta (antecedente)</span><b>${bg.tool}</b></div>

    <h3>Experiência e nível</h3>
    <div class="row">
      <div class="col">
        <label>XP atual</label>
        <input type="number" value="${state.xp}" data-onchange="state.xp=Number(this.value);render()">
        <div class="xpbar" style="margin-top:8px"><div class="xpbar-fill" style="width:${xpProgress}%"></div></div>
        <div class="small">${nextLevelRow? (nextLevelRow.xp-state.xp)+' XP para o nível '+nextLevelRow.lvl : 'Nível máximo'}</div>
      </div>
      <div class="col" style="display:flex;align-items:flex-end">
        <button class="action" data-onclick="levelUp()" ${!nextLevelRow||state.xp<nextLevelRow.xp?'disabled':''}>Subir para o nível ${lvl+1}</button>
      </div>
    </div>
    ${renderAsiPanel(lvl)}
    ${renderSubclassPanel(lvl)}

    ${spellHtml}

    <h3>Armas equipadas</h3>
    ${armaRows}
    <div class="row" style="margin-top:8px;align-items:flex-end">
      <div class="col"><label>Nome</label><input type="text" id="newArmaNome" placeholder="ex: Espada longa"></div>
      <div class="col" style="max-width:110px"><label>Atributo</label>
        <select id="newArmaStat"><option value="FOR">Força</option><option value="DES">Destreza</option><option value="Nenhum">Nenhum</option></select></div>
      <div class="col" style="max-width:90px"><label>Bônus extra</label><input type="number" id="newArmaBonus" value="0"></div>
      <div class="col" style="max-width:110px"><label>Dado de dano</label><input type="text" id="newArmaDano" placeholder="ex: 1d8"></div>
      <button class="ghost" data-onclick="addArma()">+ Adicionar</button>
    </div>

    ${equipamentoHtml}

    <h3>Inventário</h3>
    <div id="invList">${invRows}</div>
    <div class="row" style="margin-top:8px">
      <input type="text" id="newItem" placeholder="Adicionar item (ex: Flecha)" style="flex:1">
      <input type="number" id="newItemQty" placeholder="Qtd" value="1" style="max-width:70px">
      <button class="ghost" data-onclick="addItem()">+ Adicionar</button>
    </div>

    ${dinheiroHtml}

    <h3>Condições ativas ${tip('o que são condições?','Condições descrevem estados especiais (Caído, Envenenado, etc). Marque quando seu personagem estiver sofrendo uma, e desmarque quando passar.')}</h3>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">${condRows}</div>

    ${checklistHtml}

    ${frasesHtml}

    <h3>Anotações</h3>
    <textarea placeholder="Anote decisões, itens usados fora do inventário, XP ganho em sessão, etc." data-oninput="state.anotacoes=this.value">${state.anotacoes}</textarea>
  </div>
  <div class="nav"><button class="ghost" data-onclick="goStep(4)">← Voltar</button><span></span></div>
  ${renderGlossarioModal()}`;
}

function CONICOES_ESCAPE(c){ return CONDICOES[c]; }

function renderSubclassPanel(lvl){
  if(lvl!==SUBCLASS_LEVEL || state.subclasseNota) return '';
  const opcoes = SUBCLASSES[state.classe]||[];
  return `<div class="panel" style="border:1px dashed var(--accent2);margin-top:10px">
    <h3 style="margin-top:0">Escolha de Subclasse — Nível ${lvl}</h3>
    <p class="small">Selecione a subclasse de ${state.classe} que você quer seguir. As características dela vão aparecendo nos níveis certos, e você confere os detalhes no livro.</p>
    <label>Subclasse</label>
    <select id="subclasseSelect">${opcoes.map(o=>`<option value="${o}">${o}</option>`).join('')}</select>
    <button class="action" style="margin-top:10px" data-onclick="confirmSubclass(${lvl})">Confirmar subclasse</button>
  </div>`;
}
function confirmSubclass(lvl){
  const sel = document.getElementById('subclasseSelect');
  const nome = sel ? sel.value : '';
  if(!nome) return;
  state.subclasseNota = nome;
  state.historico.push({lvl, texto:'Escolheu a subclasse: '+nome+'. As características dela vão sendo lembradas aqui a cada nível — confira o livro para os detalhes completos.'});
  render();
}

function renderAsiPanel(lvl){
  if(!ASI_LEVELS.includes(lvl)) return '';
  const already = state.historico.some(h=>h.lvl===lvl && h.asi);
  if(already) return '';
  return `<div class="panel" style="border:1px dashed var(--accent2);margin-top:10px">
    <h3 style="margin-top:0">Melhoria de Habilidade / Talento — Nível ${lvl}</h3>
    <p class="small">Escolha UMA opção: aumente um atributo em +2, OU dois atributos em +1 cada (nenhum pode passar de 20). Se preferir, anote um Talento no lugar.</p>
    <div class="row">
      <div class="col"><label>Atributo 1</label>
        <select id="asiAttr1"><option value="">-</option>${["FOR","DES","CON","INT","SAB","CAR"].map(a=>`<option value="${a}">${a}</option>`).join('')}</select>
      </div>
      <div class="col"><label>+1 ou +2</label>
        <select id="asiVal1"><option value="1">+1</option><option value="2">+2</option></select>
      </div>
      <div class="col"><label>Atributo 2 (se dividiu +1/+1)</label>
        <select id="asiAttr2"><option value="">-</option>${["FOR","DES","CON","INT","SAB","CAR"].map(a=>`<option value="${a}">${a}</option>`).join('')}</select>
      </div>
    </div>
    <label>Ou, em vez disso, anote um Talento escolhido</label>
    <input type="text" id="asiFeatTxt" placeholder="ex: Atento, Duro na Queda...">
    <button class="action" style="margin-top:10px" data-onclick="confirmAsi(${lvl})">Confirmar escolha do nível ${lvl}</button>
  </div>`;
}
function confirmAsi(lvl){
  const a1 = document.getElementById('asiAttr1').value;
  const v1 = Number(document.getElementById('asiVal1').value);
  const a2 = document.getElementById('asiAttr2').value;
  const featTxt = document.getElementById('asiFeatTxt').value.trim();
  let texto = '';
  if(featTxt){
    state.asiFeats[lvl]=featTxt;
    texto = `Talento escolhido: ${featTxt}.`;
  } else if(a1 && !a2){
    state.asiBonus[a1] = Math.min((state.asiBonus[a1]||0) + Math.min(v1,2), 20);
    texto = `+${Math.min(v1,2)} em ${a1}.`;
  } else if(a1 && a2 && a1!==a2){
    state.asiBonus[a1] = (state.asiBonus[a1]||0)+1;
    state.asiBonus[a2] = (state.asiBonus[a2]||0)+1;
    texto = `+1 em ${a1} e +1 em ${a2}.`;
  } else {
    alert('Escolha um atributo (ou dois diferentes), ou escreva um talento.');
    return;
  }
  state.historico.push({lvl, texto:'Melhoria de Habilidade — '+texto, asi:true});
  render();
}

function toggleGlossario(){
  const m = document.getElementById('glossModal');
  if(m) m.classList.toggle('open');
}
function renderGlossarioModal(){
  return `<div class="modal-overlay" id="glossModal" data-onclick="if(event.target===this)toggleGlossario()">
    <div class="modal-box">
      <div class="row" style="justify-content:space-between;align-items:center">
        <h3 style="margin:0">Glossário rápido</h3>
        <button class="ghost" data-onclick="toggleGlossario()">Fechar ✕</button>
      </div>
      ${GLOSSARIO.map(g=>`<div class="featurebox"><b>${g[0]}:</b> ${g[1]}</div>`).join('')}
    </div>
  </div>`;
}

function levelUp(){
  const cl = CLASSES[state.classe];
  const newLvl = state.nivel + 1;
  state.nivel = newLvl;
  const conMod = mod(calcFinal().CON);
  const gain = HD_FIXED[cl.hitDie] + conMod;
  state.pvMax += Math.max(1,gain);
  state.pvAtual += Math.max(1,gain);

  if(SUBCLASS_FEATURE_LEVELS.includes(newLvl) && newLvl!==SUBCLASS_LEVEL && state.subclasseNota){
    state.historico.push({lvl:newLvl, texto:'Subclasse ('+state.subclasseNota+') ganha uma característica nova neste nível — confira no livro.'});
  }
  const featTxt = (LEVEL_FEATURES[state.classe]||{})[newLvl];
  if(featTxt){
    state.historico.push({lvl:newLvl, texto:featTxt});
  }
  render();
}

function addItem(){
  const inp = document.getElementById('newItem');
  const qtyInp = document.getElementById('newItemQty');
  if(inp.value.trim()){
    const qty = Math.max(1, Number(qtyInp.value)||1);
    state.inventario.push({id:state.nextItemId++, desc:inp.value.trim(), qty});
    inp.value=''; qtyInp.value=1; render();
  }
}
function removeItem(id){ state.inventario = state.inventario.filter(it=>it.id!==id); render(); }
function incQty(id){ const it=state.inventario.find(i=>i.id===id); if(it){ it.qty++; render(); } }
function decQty(id){ const it=state.inventario.find(i=>i.id===id); if(it){ it.qty=Math.max(0,it.qty-1); render(); } }

function addArma(){
  const nome = document.getElementById('newArmaNome').value.trim();
  const stat = document.getElementById('newArmaStat').value;
  const bonusExtra = Number(document.getElementById('newArmaBonus').value)||0;
  const dano = document.getElementById('newArmaDano').value.trim();
  if(nome){ state.armas.push({id:state.nextArmaId++, nome, stat, bonusExtra, dano}); render(); }
}
function removeArma(id){ state.armas = state.armas.filter(a=>a.id!==id); render(); }

/* Rola o dado de dano de uma arma (ex: "1d8") somando o modificador de
   atributo usado no ataque + o bônus extra da arma. Usa parseDado/fmtMod,
   que já existem em dados.js. */
function rollArmaDano(diceExpr, statMod, resId){
  const el = document.getElementById(resId);
  if(!el) return;
  const parsed = parseDado(diceExpr);
  if(!parsed){ el.textContent = diceExpr ? 'Dado inválido — use o formato NdM (ex: 1d8)' : 'Sem dado de dano definido pra essa arma'; return; }
  let n=0;
  el.classList.add('rolling');
  const iv = setInterval(()=>{
    el.textContent = '🎲 rolando...';
    n++;
    if(n>=6){
      clearInterval(iv);
      const bonusTotal = parsed.mod + statMod;
      const rolls=[];
      let total = bonusTotal;
      for(let i=0;i<parsed.n;i++){ const r=Math.floor(Math.random()*parsed.sides)+1; rolls.push(r); total+=r; }
      el.textContent = `🎲 [${rolls.join(', ')}]${bonusTotal? ' '+fmtMod(bonusTotal):''} = ${total}`;
      el.classList.remove('rolling');
    }
  }, 70);
}

function toggleSlot(circulo,idx){
  const used = state.spellUsed[circulo]||0;
  state.spellUsed[circulo] = idx<used ? idx : idx+1;
  render();
}
function togglePact(idx){
  state.pactUsed = idx<state.pactUsed ? idx : idx+1;
  render();
}
function descansoCurto(){ state.pactUsed = 0; render(); }
function descansoLongo(){
  state.spellUsed = {}; state.pactUsed = 0;
  state.pvAtual = state.pvMax;
  state.deathSuccess = 0; state.deathFail = 0;
  render();
}

function toggleCondicao(c){
  if(state.condicoes.includes(c)) state.condicoes = state.condicoes.filter(x=>x!==c);
  else state.condicoes.push(c);
  render();
}
function setDeathSuccess(i){ state.deathSuccess = state.deathSuccess===i ? i-1 : i; render(); }
function setDeathFail(i){ state.deathFail = state.deathFail===i ? i-1 : i; render(); }
function toggleChecklist(i){ state.checklist[i] = !state.checklist[i]; render(); }


/* ============================= INÍCIO ============================= */
render();
ligarOwlbear();


