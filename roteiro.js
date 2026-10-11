'use strict';
(() => {
  const box = document.querySelector('#roteiro-brutal');
  const toggle = document.querySelector('#roteiro-toggle');
  const panel = document.querySelector('#roteiro-panel');
  const hint = toggle.querySelector('.toggle-hint');
  
  // Elementos do formulário e resumo
  const form = document.querySelector('#roteiro-form');
  const checkboxes = form.querySelectorAll('.todo-checkbox');
  const countEl = document.querySelector('#route-selection-count');
  const namesEl = document.querySelector('#route-selection-names');

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
      toggle.focus(); 
      setOpen(false);
    }
  });

  // 1. Atualizar resumo em tempo real conforme os passeios são marcados
  function updateSummary() {
    const selected = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    if (selected.length === 0) {
      countEl.textContent = "Escolha os passeios ou peça sugestões";
      namesEl.textContent = "Nossa equipe ajuda você a combinar os destinos e organizar os dias.";
    } else {
      countEl.textContent = `${selected.length} passeio(s) selecionado(s)`;
      namesEl.textContent = selected.join(", ");
    }
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateSummary));

  // 2. Enviar dados formatados para o WhatsApp ao submeter o formulário
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const selectedPasseios = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => `- ${cb.value}`)
      .join('\n');

    const chegada = document.querySelector('#chegada').value;
    const saida = document.querySelector('#saida').value;
    const pessoas = form.querySelector('[name="pessoas"]').value;
    const servico = form.querySelector('[name="servico"]').value;
    const observacoes = form.querySelector('[name="observacoes"]').value;

    // Número de WhatsApp correto com DDI e DDD
    const phoneNumber = "5545999691877"; 

    let mensagem = "Olá! Gostaria de montar meu roteiro em Foz do Iguaçu:\n\n";
    if (selectedPasseios) {
      mensagem += `*Passeios escolhidos:*\n${selectedPasseios}\n\n`;
    }
    if (chegada) mensagem += `*Data de chegada:* ${chegada}\n`;
    if (saida) mensagem += `*Data de saída:* ${saida}\n`;
    if (pessoas) mensagem += `*Quantidade de pessoas:* ${pessoas}\n`;
    mensagem += `*Tipo de serviço:* ${servico}\n`;
    if (observacoes) mensagem += `*Observações:* ${observacoes}\n`;

    const encodedMessage = encodeURIComponent(mensagem);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  });
})();

