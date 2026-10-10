'use strict';
const storage = {
  get(key, fallback) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} }
};
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu-principal');
function setMenu(open) {
  menu.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}
menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); menuButton.focus(); } });
const theme = document.querySelector('.theme-toggle');
function applyTheme(dark) {
  document.body.classList.toggle('dark-mode', dark);
  theme.setAttribute('aria-pressed', String(dark));
  theme.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
  theme.querySelector('.theme-label').textContent = dark ? 'Modo claro' : 'Modo escuro';
}
applyTheme(storage.get('iguassu-tema', 'claro') === 'escuro');
theme.addEventListener('click', () => {
  const dark = !document.body.classList.contains('dark-mode');
  const commit = () => { applyTheme(dark); storage.set('iguassu-tema', dark ? 'escuro' : 'claro'); };
  // Troca fluida: o navegador faz o cruzamento entre o visual claro e o escuro.
  if (!document.startViewTransition) { commit(); return; }
  const root = document.documentElement;
  root.classList.add('theme-vt');
  const transition = document.startViewTransition(commit);
  transition.finished.finally(() => root.classList.remove('theme-vt'));
});
const grid = document.querySelector('.destinos-grid');
const cards = [...grid.querySelectorAll('.destination-card')];
const names = cards.map(c => c.querySelector('h3').textContent.trim());
let saved = [];
try { const value = JSON.parse(storage.get('iguassu-favoritos','[]')); if (Array.isArray(value)) saved = value; } catch {}
const favorites = new Set(saved.filter(n => names.includes(n)));
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
function filterCards() {
  const query = normalize(document.querySelector('#buscar-passeios').value.trim());
  const onlyFavorites = document.querySelector('#filtro-favoritos').value === 'favoritos';
  cards.forEach((card, i) => {
    const wasHidden = card.hidden;
    card.hidden = !normalize(names[i]).includes(query) || (onlyFavorites && !favorites.has(names[i]));
    if (wasHidden && !card.hidden) revealElement(card);
  });
  document.querySelector('#nenhum-resultado').classList.toggle('visible', cards.every(c => c.hidden));
  document.querySelector('#contador-favoritos').textContent = favorites.size;
}
cards.forEach((card, i) => {
  const title = card.querySelector('h3');
  const row = document.createElement('div'); row.className = 'destination-title-row';
  const button = document.createElement('button'); button.type = 'button'; button.className = 'favorite-button';
  const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  star.setAttribute('viewBox', '0 0 24 24');
  star.setAttribute('aria-hidden', 'true');
  star.setAttribute('focusable', 'false');
  const starPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  starPath.setAttribute('d', 'm12 3 2.78 5.64L21 9.55l-4.5 4.39L17.56 20 12 17.08 6.44 20l1.06-6.06L3 9.55l6.22-.91Z');
  star.append(starPath); button.append(star);
  function update() {
    const active = favorites.has(names[i]);
    button.querySelector('svg').classList.toggle('star-filled', active);
    button.classList.toggle('is-favorite', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', `${active ? 'Remover' : 'Adicionar'} ${names[i]} ${active ? 'dos' : 'aos'} favoritos`);
  }
  button.addEventListener('click', () => { favorites.has(names[i]) ? favorites.delete(names[i]) : favorites.add(names[i]); storage.set('iguassu-favoritos', JSON.stringify([...favorites])); update(); filterCards(); });
  title.replaceWith(row); row.append(title, button); update();
});
document.querySelector('#buscar-passeios').addEventListener('input', filterCards);
document.querySelector('#filtro-favoritos').addEventListener('change', filterCards);
document.querySelector('#ordenar-passeios').addEventListener('change', e => {
  const sorted = [...cards];
  if (e.target.value === 'alfabetica') sorted.sort((a,b) => a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent, 'pt-BR'));
  sorted.forEach(card => grid.append(card));
});
filterCards();
const form = document.querySelector('#roteiro-form');
const arrival = document.querySelector('#chegada');
const departure = document.querySelector('#saida');
function validateDates() {
  departure.min = arrival.value;
  departure.setCustomValidity(arrival.value && departure.value && departure.value < arrival.value ? 'A data de saída deve ser igual ou posterior à chegada.' : '');
}
arrival.addEventListener('input', validateDates); departure.addEventListener('input', validateDates);
const formatDate = value => value ? value.split('-').reverse().join('/') : 'A definir';
form.addEventListener('submit', event => {
  event.preventDefault(); validateDates(); if (!form.reportValidity()) return;
  const data = new FormData(form); const selected = data.getAll('passeios');
  const message = ['Olá, gostaria de fazer meu roteiro com a Iguassu Company!', '', 'Passeios: ' + (selected.length ? selected.join(', ') : 'Quero sugestões da equipe'), 'Chegada: ' + formatDate(data.get('chegada')), 'Saída: ' + formatDate(data.get('saida')), 'Pessoas: ' + (data.get('pessoas') || 'A definir'), 'Serviço: ' + data.get('servico')];
  const notes = data.get('observacoes').trim(); if (notes) message.push('Observações: ' + notes);
  window.open('https://wa.me/554599691877?text=' + encodeURIComponent(message.join('\n')), '_blank', 'noopener,noreferrer');
});

// Entradas suaves na rolagem, sem esconder conteúdo caso o JavaScript falhe.
function revealElement(element, delay = 0) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !element.animate) return;
  element.animate([
    { opacity: 0, translate: '0 22px' },
    { opacity: 1, translate: '0 0' }
  ], { duration: 500, delay, easing: 'ease', fill: 'backwards' });
}
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    let stagger = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealElement(entry.target, Math.min(stagger++ * 65, 260));
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.destination-card, .section-heading, .service-card, .guide-card, #roteiro-form').forEach(el => revealObserver.observe(el));
}
const routeChoices = [...form.querySelectorAll('input[name="passeios"]')];
const routeCount = document.querySelector('#route-selection-count');
const routeNames = document.querySelector('#route-selection-names');
function updateRouteSummary(animate = true) {
  const selected = routeChoices.filter(input => input.checked).map(input => input.value);
  routeCount.textContent = selected.length ? `${selected.length} ${selected.length === 1 ? 'passeio selecionado' : 'passeios selecionados'}` : 'Escolha os passeios ou peça sugestões';
  routeNames.textContent = selected.length ? selected.join(' · ') : 'Nossa equipe ajuda você a combinar os destinos e organizar os dias.';
  if (animate && routeCount.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    routeCount.animate([{opacity:.4,translate:'0 5px'},{opacity:1,translate:'0 0'}],{duration:500,easing:'ease'});
  }
}
routeChoices.forEach(input => input.addEventListener('change', () => updateRouteSummary()));
updateRouteSummary(false);