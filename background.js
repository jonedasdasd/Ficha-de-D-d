
(async () => {
  const BASE = "https://jonedasdasd.github.io/Ficha-de-D-d/";

  // Tenta importar o SDK do Owlbear varias vezes, caso a rede/conexao
  // ainda nao esteja pronta no momento em que a sala carrega.
  async function carregarOBR(tentativas) {
    for (let i = 0; i < tentativas; i++) {
      try {
        const mod = await import("https://esm.sh/@owlbear-rodeo/sdk@3.1.0");
        if (mod && mod.default) return mod.default;
      } catch (e) {
        console.warn("Ficha D&D: tentativa " + (i + 1) + " de carregar o SDK falhou", e);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    return null;
  }

  const OBR = await carregarOBR(5);
  if (!OBR || !OBR.isAvailable) {
    console.warn("Ficha D&D: nao foi possivel conectar ao Owlbear.");
    return;
  }

  // Jogadores só podem criar/gerenciar Heróis (ficha de personagem comum).
  // O Mestre ganha, além disso, uma opção pra marcar qualquer token como
  // Monstro/NPC, com uma ficha simplificada (só vida e dano de ataque).
  let jaRegistrado = false;
  function registrarMenuHeroi() {
    OBR.contextMenu.create({
      id: "com.jonesdnd.ficha/menu-ficha",
      icons: [
        {
          icon: BASE + "icon.svg",
          label: "🧙 Ficha de Personagem (Herói)",
          filter: { max: 1 }
        }
      ],
      onClick(context, elementId) {
        const id = context.items[0].id;
        OBR.popover.open({
          id: "com.jonesdnd.ficha/popover-ficha",
          url: BASE + "ficha.html?item=" + encodeURIComponent(id),
          width: 520,
          height: 680,
          anchorElementId: elementId
        });
      }
    });
  }
  function registrarMenuMonstro() {
    OBR.contextMenu.create({
      id: "com.jonesdnd.ficha/menu-monstro",
      icons: [
        {
          icon: BASE + "icon.svg",
          label: "🐲 Tipo: Monstro/NPC (Mestre)",
          filter: { max: 1 }
        }
      ],
      onClick(context, elementId) {
        const id = context.items[0].id;
        OBR.popover.open({
          id: "com.jonesdnd.ficha/popover-monstro",
          url: BASE + "monstro.html?item=" + encodeURIComponent(id),
          width: 420,
          height: 480,
          anchorElementId: elementId
        });
      }
    });
  }
  async function registrarMenu() {
    if (jaRegistrado) return;
    jaRegistrado = true;
    registrarMenuHeroi();
    try {
      const papel = await OBR.player.getRole();
      if (papel === "GM") registrarMenuMonstro();
    } catch (e) { /* se nao der pra checar o papel, so o menu de Heroi aparece */ }
  }

  if (OBR.isReady) {
    registrarMenu();
  } else {
    OBR.onReady(registrarMenu);
    // Reforco: caso onReady demore ou nao dispare por algum motivo,
    // tenta registrar de novo depois de 2 segundos.
    setTimeout(() => {
      try { registrarMenu(); } catch (e) {}
    }, 2000);
  }
})();
