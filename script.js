'use strict';

/* ============ MENU MOBILE ============ */
const menuToggle = document.getElementById('menuToggle');
const menu = document.getElementById('menu');

menuToggle.addEventListener('click', () => {
  const aberto = menu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', aberto);
  menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});
menu.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  })
);

/* ============ ANO NO RODAPÉ ============ */
document.getElementById('ano').textContent = new Date().getFullYear();

/* ============ LINK ATIVO NO MENU (scroll) ============ */
const secoes = document.querySelectorAll('main section');
const links = document.querySelectorAll('.menu a');
const observerMenu = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
secoes.forEach(s => observerMenu.observe(s));

/* ============ CARROSSEL ============ */
const track = document.getElementById('track');
const cards = Array.from(track.children);
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsBox = document.getElementById('dots');
let indice = 0;

function cardsVisiveis() {
  if (window.innerWidth <= 720) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function criarDots() {
  dotsBox.innerHTML = '';
  cards.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Ir para o projeto ' + (i + 1));
    b.addEventListener('click', () => { indice = i; atualizarCarrossel(); });
    dotsBox.appendChild(b);
  });
}

function atualizarCarrossel() {
  const visiveis = cardsVisiveis();
  const max = cards.length - 1;
  indice = Math.max(0, Math.min(indice, max));

  let inicio = visiveis === 3 ? indice - 1 : indice;
  inicio = Math.max(0, Math.min(inicio, cards.length - visiveis));

  track.style.transform = `translateX(-${inicio * (100 / visiveis)}%)`;

  cards.forEach((c, i) => c.classList.toggle('is-center', i === indice));
  Array.from(dotsBox.children).forEach((d, i) => d.setAttribute('aria-selected', i === indice));
}

prevBtn.addEventListener('click', () => {
  indice = indice <= 0 ? cards.length - 1 : indice - 1;
  atualizarCarrossel();
});
nextBtn.addEventListener('click', () => {
  indice = indice >= cards.length - 1 ? 0 : indice + 1;
  atualizarCarrossel();
});
document.querySelector('.carousel').addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') prevBtn.click();
  if (e.key === 'ArrowRight') nextBtn.click();
});

// suporte a toque (swipe)
let toqueX = null;
track.addEventListener('touchstart', e => { toqueX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  if (toqueX === null) return;
  const dif = e.changedTouches[0].clientX - toqueX;
  if (Math.abs(dif) > 50) (dif < 0 ? nextBtn : prevBtn).click();
  toqueX = null;
});

window.addEventListener('resize', atualizarCarrossel);
criarDots();
atualizarCarrossel();

/* ============ BARRAS DE SKILLS (animação ao aparecer) ============ */
const observerSkills = new IntersectionObserver((entradas, obs) => {
  entradas.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelector('.skill__fill').style.width = e.target.dataset.level + '%';
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.skill').forEach(s => observerSkills.observe(s));

/* ============ VALIDAÇÃO DO FORMULÁRIO ============ */
const form = document.getElementById('contactForm');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoMsg = document.getElementById('mensagem');
const status = document.getElementById('formStatus');

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function mostrarErro(campo, mensagem) {
  document.getElementById('erro-' + campo.id).textContent = mensagem;
  campo.classList.toggle('invalid', Boolean(mensagem));
  campo.classList.toggle('valid', !mensagem);
  campo.setAttribute('aria-invalid', Boolean(mensagem));
  return !mensagem;
}

function validarNome() {
  const v = campoNome.value.trim();
  if (!v) return mostrarErro(campoNome, 'Por favor, informe seu nome.');
  if (v.length < 3) return mostrarErro(campoNome, 'O nome deve ter pelo menos 3 caracteres.');
  return mostrarErro(campoNome, '');
}

function validarEmail() {
  const v = campoEmail.value.trim();
  if (!v) return mostrarErro(campoEmail, 'Por favor, informe seu e-mail.');
  if (!regexEmail.test(v)) return mostrarErro(campoEmail, 'Digite um e-mail válido (ex.: nome@dominio.com).');
  return mostrarErro(campoEmail, '');
}

function validarMensagem() {
  const v = campoMsg.value.trim();
  if (!v) return mostrarErro(campoMsg, 'Por favor, escreva sua mensagem.');
  if (v.length < 10) return mostrarErro(campoMsg, 'A mensagem deve ter pelo menos 10 caracteres.');
  return mostrarErro(campoMsg, '');
}

campoNome.addEventListener('blur', validarNome);
campoEmail.addEventListener('blur', validarEmail);
campoMsg.addEventListener('blur', validarMensagem);
[campoNome, campoEmail, campoMsg].forEach(c =>
  c.addEventListener('input', () => { if (c.classList.contains('invalid')) {
    ({ nome: validarNome, email: validarEmail, mensagem: validarMensagem })[c.id]();
  } })
);

form.addEventListener('submit', e => {
  e.preventDefault();
  status.className = 'form__status';

  // executa todas as validações (sem curto-circuito) para mostrar todos os erros
  const resultados = [validarNome(), validarEmail(), validarMensagem()];
  const tudoOk = resultados.every(Boolean);

  if (!tudoOk) {
    status.textContent = 'Corrija os campos destacados e tente novamente.';
    status.classList.add('fail');
    form.querySelector('.invalid').focus();
    return;
  }

  status.textContent = 'Obrigado, ' + campoNome.value.trim().split(' ')[0] + '! Sua mensagem foi enviada com sucesso.';
  status.classList.add('ok');
  form.reset();
  [campoNome, campoEmail, campoMsg].forEach(c => c.classList.remove('valid', 'invalid'));
});

form.addEventListener('reset', () => {
  status.textContent = '';
  [campoNome, campoEmail, campoMsg].forEach(c => {
    c.classList.remove('valid', 'invalid');
    document.getElementById('erro-' + c.id).textContent = '';
  });
});
