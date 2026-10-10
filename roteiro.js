'use strict';
(() => {
  const box = document.querySelector('#roteiro-brutal');
  const toggle = document.querySelector('#roteiro-toggle');
  const panel = document.querySelector('#roteiro-panel');
  const hint = toggle.querySelector('.toggle-hint');
  function setOpen(open) {
    box.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Recolher formulário de roteiro' : 'Abrir formulário de roteiro');
    panel.inert = !open;
    hint.textContent = open ? 'Clique ou toque para recolher' : 'Clique ou toque para escolher seus passeios';
  }
  setOpen(false);
  toggle.addEventListener('click', () => setOpen(!box.classList.contains('is-open')));
  box.addEventListener('keydown', event => {
    if (event.key === 'Escape' && box.classList.contains('is-open')) {
      toggle.focus(); setOpen(false);
    }
  });
})();
