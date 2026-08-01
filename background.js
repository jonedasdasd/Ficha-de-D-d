
(async () => {
  let OBR;
  try {
    const mod = await import("https://esm.sh/@owlbear-rodeo/sdk@3.1.0");
    OBR = mod.default;
  } catch (e) { return; }
  if (!OBR || !OBR.isAvailable) return;

  const BASE = "https://jonedasdasd.github.io/Ficha-de-D-d/";

  OBR.onReady(() => {
    OBR.contextMenu.create({
      id: "com.jonesdnd.ficha/menu-ficha",
      icons: [
        {
          icon: BASE + "icon.svg",
          label: "🧙 Ficha de Personagem",
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
  });
})();
