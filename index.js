document.addEventListener('DOMContentLoaded', () => {
  /* ---------- EFECTOS 3D ---------- */
  const sections = Array.from(document.querySelectorAll('.section'));
  const images = Array.from(document.querySelectorAll('.gallery img'));
  let ticking = false;

  function updateSections() {
    const vh = window.innerHeight;
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const norm = (rect.top + rect.height/2 - vh/2) / (vh/2);
      const maxTranslate = 40;
      const maxRotate = 8;
      const translateZ = Math.max(-maxTranslate, Math.min(maxTranslate, -norm * maxTranslate));
      const rotateX = Math.max(-maxRotate, Math.min(maxRotate, norm * maxRotate));
      section.style.transform = `translateZ(${translateZ}px) rotateX(${rotateX}deg)`;
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateSections);
    }
  }

  images.forEach(img => {
    img.addEventListener('mouseenter', () => {
      img.style.transform = 'translateZ(40px) scale(1.05) rotateY(5deg)';
      img.style.transition = 'transform 300ms ease';
    });
    img.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
  });

  const mediaReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!mediaReduce || !mediaReduce.matches) {
    window.addEventListener('scroll', onScroll, { passive: true });
    updateSections();
  } else {
    sections.forEach(s => s.style.transform = 'none');
  }

  /* ---------- MENÚ HAMBURGUESA + SCROLL SUAVE ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  // Backdrop (si no existe, crear)
  let backdrop = document.querySelector('.mobile-menu-open-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-menu-open-backdrop';
    document.body.appendChild(backdrop);
  }

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('visible');
    document.documentElement.style.overflow = 'hidden';
    const firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('visible');
    document.documentElement.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    if (expanded) closeMenu();
    else openMenu();
  });

  backdrop.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  // cerrar al clicar enlaces del drawer
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // prevenir comportamiento por defecto para hacer scroll controlado
      // (si quieres dejar la navegación por defecto, comentar next line)
      e.preventDefault();
      const href = link.getAttribute('href');
      closeMenu();
      // pequeña espera para que el drawer comience su animación de salida
      setTimeout(() => {
        scrollToHash(href);
      }, 80);
    });
  });

  // cerrar si se hace click en nav principal (útil en móvil)
  document.querySelectorAll('.main-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      // manejo de anclas: prevenir para scroll controlado
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        scrollToHash(href);
        if (mobileMenu.classList.contains('open')) closeMenu();
      } else {
        // enlace externo: dejar comportamiento normal
        if (mobileMenu.classList.contains('open')) closeMenu();
      }
    });
  });

  // Manejar cualquier otro enlace con hash en la página
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    const inNav = link.closest('.main-nav') || link.closest('#mobile-menu');
    if (inNav) return; // ya los manejamos arriba
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#')) {
        e.preventDefault();
        scrollToHash(href);
      } else {
        // si es ruta con hash (ej: page.html#id) y la ruta es igual a location, prevenir y scrollear
        try {
          const url = new URL(href, location.href);
          if (url.pathname === location.pathname && url.hash) {
            e.preventDefault();
            scrollToHash(url.hash);
          }
        } catch (err) {
          // ignore
        }
      }
    });
  });

  // Si la página carga con hash en la URL, hacer scroll correcto al inicio
  if (location.hash) {
    setTimeout(() => scrollToHash(location.hash), 120);
  }

  // Función auxiliar de scroll con compensación por header
  function scrollToHash(hash) {
    if (!hash) return;
    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    const target = document.getElementById(id);
    if (!target) return;
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 0;
    const extra = 12;
    const top = window.scrollY + target.getBoundingClientRect().top - (headerHeight + extra);
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

});
