document.addEventListener('DOMContentLoaded', function () {
  var btn = document.querySelector('.nav-hamburguer');
  var nav = document.querySelector('header nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var aberta = nav.classList.toggle('nav-aberta');
    btn.classList.toggle('nav-aberto', aberta);
    btn.setAttribute('aria-expanded', String(aberta));
    btn.setAttribute('aria-label', aberta ? 'Fechar menu' : 'Abrir menu');
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('header')) {
      nav.classList.remove('nav-aberta');
      btn.classList.remove('nav-aberto');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menu');
    }
  });

  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('nav-aberta');
      btn.classList.remove('nav-aberto');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menu');
    });
  });
});
