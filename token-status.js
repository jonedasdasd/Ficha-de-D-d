
/* ============================================================================
   STATUS NO TOKEN — HP, Mana/Recursos, CA e Iniciativa desenhados em cima do
   próprio token no mapa (attachedTo), pra quem está mestrando ver tudo sem
   abrir a ficha. Usado por ficha.js, mestre.js e monstro.js.

   Espera encontrar no escopo global: OBR (SDK conectado) e OBRMOD (o módulo
   inteiro do SDK, com buildShape/buildText) — cada tela já guarda os dois ao
   conectar. Se algo der errado (token removido, sem internet, etc.) essas
   funções falham em silêncio e tentam de novo na próxima alteração — nunca
   travam o resto da ficha.
============================================================================ */
var STATUS_KEY = "com.jonesdnd.ficha/statusIds";

function _corPvStatus(razao){
  if(razao<=0) return "#555555";
  if(razao<=0.25) return "#c0392b";
  if(razao<=0.5) return "#c07a1f";
  return "#3a9d4f";
}

async function _construirPilhaStatus(itemId, info, dpi, cx, topoY, largura, alturaBarra){
  const pv = Math.max(0, info.pvAtual||0);
  const pvMax = Math.max(1, info.pvMax||1);
  const razaoPv = Math.max(0, Math.min(1, pv/pvMax));
  const corPv = _corPvStatus(razaoPv);
  const temMana = info.manaMax!=null && info.manaMax>0;
  const textoInfo = `CA ${info.ca!=null?info.ca:'?'} · Inic ${info.iniciativa!=null?fmtMod(info.iniciativa):'?'}`;

  const hpBg = OBRMOD.buildShape().shapeType("RECTANGLE").width(largura).height(alturaBarra)
    .position({x: cx-largura/2, y: topoY})
    .style({fillColor:"#1a1a1a", fillOpacity:0.85, strokeColor:"#000000", strokeOpacity:0.5, strokeWidth:1})
    .attachedTo(itemId).layer("ATTACHMENT").disableHit(true).locked(true).build();
  const hpFill = OBRMOD.buildShape().shapeType("RECTANGLE").width(Math.max(1,largura*razaoPv)).height(alturaBarra)
    .position({x: cx-largura/2, y: topoY})
    .style({fillColor:corPv, fillOpacity:0.95, strokeWidth:0})
    .attachedTo(itemId).layer("ATTACHMENT").disableHit(true).locked(true).build();
  const hpText = OBRMOD.buildText().plainText(`${pv}/${pvMax}`)
    .width(largura).height(alturaBarra+4)
    .position({x: cx-largura/2, y: topoY-2})
    .style({fillColor:"#ffffff", fontSize: Math.max(10,Math.round(dpi*0.15)), textAlign:"CENTER"})
    .attachedTo(itemId).layer("ATTACHMENT").disableHit(true).locked(true).build();
  const infoText = OBRMOD.buildText().plainText(textoInfo)
    .width(largura).height(alturaBarra+4)
    .position({x: cx-largura/2, y: topoY+alturaBarra+3})
    .style({fillColor:"#ffe08a", fontSize: Math.max(9,Math.round(dpi*0.13)), textAlign:"CENTER"})
    .attachedTo(itemId).layer("ATTACHMENT").disableHit(true).locked(true).build();

  const itens = [hpBg, hpFill, hpText, infoText];
  const ids = {hpBg:hpBg.id, hpFill:hpFill.id, hpText:hpText.id, infoText:infoText.id};

  if(temMana){
    const razaoMana = Math.max(0, Math.min(1, (info.manaAtual||0)/info.manaMax));
    const manaBg = OBRMOD.buildShape().shapeType("RECTANGLE").width(largura).height(alturaBarra*0.7)
      .position({x: cx-largura/2, y: topoY+alturaBarra+18})
      .style({fillColor:"#16203a", fillOpacity:0.85, strokeColor:"#000000", strokeOpacity:0.5, strokeWidth:1})
      .attachedTo(itemId).layer("ATTACHMENT").disableHit(true).locked(true).build();
    const manaFill = OBRMOD.buildShape().shapeType("RECTANGLE").width(Math.max(1,largura*razaoMana)).height(alturaBarra*0.7)
      .position({x: cx-largura/2, y: topoY+alturaBarra+18})
      .style({fillColor:"#3a6bc0", fillOpacity:0.95, strokeWidth:0})
      .attachedTo(itemId).layer("ATTACHMENT").disableHit(true).locked(true).build();
    itens.push(manaBg, manaFill);
    ids.manaBg = manaBg.id; ids.manaFill = manaFill.id;
  }

  await OBR.scene.items.addItems(itens);
  await OBR.scene.items.updateItems([itemId], (its)=>{ its[0].metadata[STATUS_KEY] = ids; });
}

/* Cria (se ainda não existir) e atualiza a pilha inteira: barra de vida, texto
   de PV, "CA · Iniciativa" e barra de mana (só se info.manaMax vier preenchido). */
async function sincronizarStatusToken(itemId, info){
  if(!itemId || !OBR || !OBRMOD) return;
  // Se o SDK ainda não estiver pronto/registrado, não tente enviar mensagens.
  if(!OBR.isAvailable){
    console.warn('Ficha D&D: SDK não pronto — adiando sincronização do token', itemId);
    return;
  }
  try{
    const dpi = await OBR.scene.grid.getDpi();
    const items = await OBR.scene.items.getItems([itemId]);
    const token = items[0];
    if(!token) return;

    const largura = dpi*0.9;
    const alturaBarra = dpi*0.11;
    const cx = token.position.x;
    const topoY = token.position.y + dpi*0.58;
    const temMana = info.manaMax!=null && info.manaMax>0;

    let ids = (token.metadata && token.metadata[STATUS_KEY]) || null;
    let idsValidos = false;
    if(ids){
      const lista = Object.values(ids).filter(Boolean);
      try{
        const checados = await OBR.scene.items.getItems(lista);
        idsValidos = checados.length === lista.length;
      }catch(e){ idsValidos = false; }
    }

    if(!idsValidos){
      if(ids){ try{ await OBR.scene.items.deleteItems(Object.values(ids).filter(Boolean)); }catch(e){} }
      await _construirPilhaStatus(itemId, info, dpi, cx, topoY, largura, alturaBarra);
      return;
    }

    const pv = Math.max(0, info.pvAtual||0);
    const pvMax = Math.max(1, info.pvMax||1);
    const razaoPv = Math.max(0, Math.min(1, pv/pvMax));
    const corPv = _corPvStatus(razaoPv);
    const textoInfo = `CA ${info.ca!=null?info.ca:'?'} · Inic ${info.iniciativa!=null?fmtMod(info.iniciativa):'?'}`;

    const alvo = [ids.hpFill, ids.hpText, ids.infoText].filter(Boolean);
    if(temMana && ids.manaFill) alvo.push(ids.manaFill);
    if(alvo.length){
      await OBR.scene.items.updateItems(alvo, (its)=>{
        for(const it of its){
          if(it.id===ids.hpFill){ it.width = Math.max(1, largura*razaoPv); it.style.fillColor = corPv; }
          else if(it.id===ids.hpText){ it.text.plainText = `${pv}/${pvMax}`; }
          else if(it.id===ids.infoText){ it.text.plainText = textoInfo; }
          else if(temMana && it.id===ids.manaFill){
            const razaoMana = Math.max(0, Math.min(1, (info.manaAtual||0)/info.manaMax));
            it.width = Math.max(1, largura*razaoMana);
          }
        }
      });
    }

    if(!temMana && (ids.manaBg||ids.manaFill)){
      try{ await OBR.scene.items.deleteItems([ids.manaBg, ids.manaFill].filter(Boolean)); }catch(e){}
      const semMana = Object.assign({}, ids);
      delete semMana.manaBg; delete semMana.manaFill;
      await OBR.scene.items.updateItems([itemId], (its)=>{ its[0].metadata[STATUS_KEY] = semMana; });
    } else if(temMana && !ids.manaFill){
      const razaoMana = Math.max(0, Math.min(1, (info.manaAtual||0)/info.manaMax));
      const manaBg = OBRMOD.buildShape().shapeType("RECTANGLE").width(largura).height(alturaBarra*0.7)
        .position({x: cx-largura/2, y: topoY+alturaBarra+18})
        .style({fillColor:"#16203a", fillOpacity:0.85, strokeColor:"#000000", strokeOpacity:0.5, strokeWidth:1})
        .attachedTo(itemId).layer("ATTACHMENT").disableHit(true).locked(true).build();
      const manaFill = OBRMOD.buildShape().shapeType("RECTANGLE").width(Math.max(1,largura*razaoMana)).height(alturaBarra*0.7)
        .position({x: cx-largura/2, y: topoY+alturaBarra+18})
        .style({fillColor:"#3a6bc0", fillOpacity:0.95, strokeWidth:0})
        .attachedTo(itemId).layer("ATTACHMENT").disableHit(true).locked(true).build();
      await OBR.scene.items.addItems([manaBg, manaFill]);
      const comMana = Object.assign({}, ids, {manaBg:manaBg.id, manaFill:manaFill.id});
      await OBR.scene.items.updateItems([itemId], (its)=>{ its[0].metadata[STATUS_KEY] = comMana; });
    }
  }catch(e){ console.warn("Ficha D&D: não consegui atualizar o status no token agora — tenta de novo na próxima mudança.", e); }
}

/* Versão leve: só mexe na barra/texto de vida, sem tocar em CA/Mana. Usada
   pelo painel do mestre pros botões rápidos de +1/-1/+5/-5, pra não precisar
   recalcular a ficha inteira. Se a pilha ainda não existir nesse token (ex:
   personagem cuja ficha nunca foi aberta nessa versão), não faz nada — ela é
   criada na próxima vez que a ficha do jogador salvar sozinha. */
async function atualizarApenasPV(itemId, pvAtual, pvMax){
  if(!itemId || !OBR || !OBRMOD) return;
  if(!OBR.isAvailable){
    console.warn('Ficha D&D: SDK não pronto — adiando atualização de PV', itemId);
    return;
  }
  try{
    const items = await OBR.scene.items.getItems([itemId]);
    const token = items[0];
    const ids = token && token.metadata && token.metadata[STATUS_KEY];
    if(!ids || !ids.hpFill || !ids.hpText) return;
    const dpi = await OBR.scene.grid.getDpi();
    const largura = dpi*0.9;
    const pv = Math.max(0, pvAtual||0);
    const max = Math.max(1, pvMax||1);
    const razao = Math.max(0, Math.min(1, pv/max));
    const cor = _corPvStatus(razao);
    await OBR.scene.items.updateItems([ids.hpFill, ids.hpText], (its)=>{
      for(const it of its){
        if(it.id===ids.hpFill){ it.width = Math.max(1, largura*razao); it.style.fillColor = cor; }
        else if(it.id===ids.hpText){ it.text.plainText = `${pv}/${max}`; }
      }
    });
  }catch(e){ /* token pode ter sido movido/removido nesse meio tempo */ }
}

/* Apaga a pilha de status desse token (usado quando o mestre desvincula uma
   ficha ou remove um monstro). */
async function removerStatusToken(itemId){
  if(!itemId || !OBR || !OBRMOD) return;
  if(!OBR.isAvailable){
    console.warn('Ficha D&D: SDK não pronto — adiando remoção de status para', itemId);
    return;
  }
  try{
    const items = await OBR.scene.items.getItems([itemId]);
    const token = items[0];
    const ids = token && token.metadata && token.metadata[STATUS_KEY];
    if(ids){ await OBR.scene.items.deleteItems(Object.values(ids).filter(Boolean)); }
  }catch(e){}
}
