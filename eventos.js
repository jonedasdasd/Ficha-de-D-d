
/* Despachante de eventos: le os atributos data-onclick / data-onchange / data-oninput
   (que guardam o mesmo codigo que antes ia dentro de onclick="...") e executa esse
   codigo manualmente. Isso existe porque o Owlbear bloqueia atributos onclick="..."
   direto no HTML por seguranca (CSP), entao a gente intercepta o evento e roda o
   codigo por fora, com o mesmo resultado de antes. */
(function () {
  function rodar(el, attr, event) {
    const codigo = el.getAttribute(attr);
    if (!codigo) return;
    try {
      new Function('event', codigo).call(el, event);
    } catch (err) {
      console.error('Erro ao executar ação (' + attr + '):', codigo, err);
    }
  }

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-onclick]');
    if (el) rodar(el, 'data-onclick', e);
  });

  document.addEventListener('change', function (e) {
    const el = e.target.closest('[data-onchange]');
    if (el) rodar(el, 'data-onchange', e);
  });

  document.addEventListener('input', function (e) {
    const el = e.target.closest('[data-oninput]');
    if (el) rodar(el, 'data-oninput', e);
  });
})();
