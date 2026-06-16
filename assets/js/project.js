(() => {
  'use strict';
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const compactView = window.matchMedia('(max-width: 930px)');
  const menu = document.getElementById('menu');
  const nav = document.getElementById('nav');
  const header = document.querySelector('.header');
  const progress = document.getElementById('progress');
  const year = document.getElementById('year');
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  body.classList.add('ready');
  if (year) year.textContent = new Date().getFullYear();

  const closeMenu = () => {
    if (!menu || !nav) return;
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
    body.classList.remove('menu-open');
  };
  if (menu && nav) {
    menu.setAttribute('aria-expanded','false');
    menu.addEventListener('click', event => {
      event.stopPropagation();
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      body.classList.toggle('menu-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', event => {
      if (nav.classList.contains('open') && !header?.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    compactView.addEventListener?.('change', closeMenu);
  }

  const revealItems = document.querySelectorAll('.reveal,.stagger');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      });
    }, {threshold:.06, rootMargin:'0px 0px 80px'});
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('show'));

  let scrollFrame = 0;
  const updateScroll = () => {
    scrollFrame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    header?.classList.toggle('scrolled', scrollY > 22);
    let current = sections[0]?.id || '';
    for (const section of sections) if (scrollY >= section.offsetTop - 180) current = section.id;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
  };
  addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }, {passive:true});
  addEventListener('resize', () => { closeMenu(); updateScroll(); }, {passive:true});
  updateScroll();

  const logo = document.querySelector('.project-logo-hero');
  if (logo && finePointer && !reduceMotion && innerWidth > 930) {
    logo.addEventListener('pointermove', event => {
      const rect = logo.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      logo.style.transform = `perspective(900px) rotateX(${-y * 2.5}deg) rotateY(${x * 3}deg)`;
    });
    logo.addEventListener('pointerleave', () => { logo.style.transform = ''; });
  }
})();
