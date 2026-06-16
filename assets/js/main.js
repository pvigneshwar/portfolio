(() => {
  'use strict';
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const compactView = window.matchMedia('(max-width: 930px)');
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const lowMemory = Boolean((navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4));
  const menu = document.getElementById('menu');
  const nav = document.getElementById('nav');
  const header = document.querySelector('.header');
  const progress = document.getElementById('progress');
  const year = document.getElementById('year');
  const boot = document.getElementById('boot');
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const guideLinks = [...document.querySelectorAll('.section-guide a[href^="#"]')];

  const applyPerformanceMode = () => {
    body.classList.toggle('lite-ui', compactView.matches || saveData || lowMemory);
  };
  applyPerformanceMode();
  compactView.addEventListener?.('change', applyPerformanceMode);

  if (year) year.textContent = new Date().getFullYear();

  const finishBoot = () => {
    boot?.classList.add('hide');
    body.classList.add('ready');
    window.setTimeout(() => boot?.remove(), 450);
  };
  let bootSeen = false;
  try { bootSeen = sessionStorage.getItem('vp-boot-seen') === '1'; } catch (_) {}
  if (!boot || reduceMotion || bootSeen || compactView.matches || saveData || lowMemory) {
    finishBoot();
  } else {
    try { sessionStorage.setItem('vp-boot-seen', '1'); } catch (_) {}
    window.setTimeout(finishBoot, 850);
  }

  const closeMenu = () => {
    if (!menu || !nav) return;
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  };

  if (menu && nav) {
    menu.setAttribute('aria-expanded', 'false');
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
  } else {
    revealItems.forEach(item => item.classList.add('show'));
  }

  let scrollFrame = 0;
  const updateScroll = () => {
    scrollFrame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    header?.classList.toggle('scrolled', scrollY > 22);
    let current = sections[0]?.id || 'home';
    for (const section of sections) if (scrollY >= section.offsetTop - 180) current = section.id;
    [...navLinks,...guideLinks].forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
  };
  addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }, {passive:true});
  addEventListener('resize', () => {
    closeMenu();
    updateScroll();
  }, {passive:true});
  updateScroll();

  const frame = document.querySelector('.hero-frame');
  const visual = document.querySelector('.hero-visual');
  if (frame && visual && finePointer && !reduceMotion && !body.classList.contains('lite-ui') && innerWidth > 930) {
    visual.addEventListener('pointermove', event => {
      const rect = visual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      frame.style.transform = `translate3d(${x * 9}px,${y * 7}px,0) rotateX(${-y * 2}deg) rotateY(${x * 2.4}deg)`;
    });
    visual.addEventListener('pointerleave', () => { frame.style.transform = ''; });
  }
})();
