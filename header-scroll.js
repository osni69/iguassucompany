'use strict';
(() => {
  const root = document.documentElement;
  const header = document.querySelector('header');
  const menu = document.querySelector('#menu-principal');
  if (!header) return;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smooth = t => t * t * (3 - 2 * t);
  const isOpen = () => menu && menu.classList.contains('open');

  // Altura do header fechado: o Sobre nós começa por baixo dele, no topo da página.
  function measure() {
    if (isOpen()) return;
    root.style.setProperty('--header-h', header.offsetHeight + 'px');
  }

  // Transição contínua: o fundo (--p) e a cor do texto (--tx) acompanham a rolagem.
  let frame = 0;
  function update() {
    frame = 0;
    const open = isOpen();
    const p = open ? 1 : smooth(clamp(window.scrollY / 150));
    const tx = open ? 1 : smooth(clamp((p - 0.3) / 0.35));
    header.style.setProperty('--p', p.toFixed(3));
    header.style.setProperty('--tx', tx.toFixed(3));
    header.classList.toggle('is-top', p < 0.5);
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

  measure(); update();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  window.addEventListener('scroll', schedule, { passive: true });
  if (menu) new MutationObserver(update).observe(menu, { attributes: true, attributeFilter: ['class'] });

  // "Monte seu roteiro" já abre o formulário ao chegar nele.
  document.querySelectorAll('a[href="#roteiro"]').forEach(link => {
    link.addEventListener('click', () => {
      const toggle = document.querySelector('#roteiro-toggle');
      if (toggle && toggle.getAttribute('aria-expanded') === 'false') toggle.click();
    });
  });
})();