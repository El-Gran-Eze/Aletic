/* =========================================================
   ATLETIC — script.js
   Vanilla JS only. No dependencies.
========================================================= */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     PRELOADER
  --------------------------------------------------------- */
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => preloader && preloader.classList.add('is-hidden'), 500);
  });

  /* ---------------------------------------------------------
     THEME TOGGLE (dark default, light optional)
  --------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem ? null : null; // no persistent storage per environment rules
  themeToggle && themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    root.setAttribute('data-theme', isLight ? 'dark' : 'light');
  });

  /* ---------------------------------------------------------
     CUSTOM CURSOR
  --------------------------------------------------------- */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  if (cursorDot && cursorRing && !('ontouchstart' in window)) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    });
    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    document.querySelectorAll('a, button, .gallery__item, input, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-active'));
    });
  }

  /* ---------------------------------------------------------
     SCROLL PROGRESS BAR
  --------------------------------------------------------- */
  const scrollProgress = document.getElementById('scroll-progress');
  const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = pct + '%';
  };

  /* ---------------------------------------------------------
     HEADER SCROLL STATE + ACTIVE LINK
  --------------------------------------------------------- */
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('main section[id], section#inicio');
  const navLinks = document.querySelectorAll('.nav__link');

  const updateHeaderState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  const updateActiveLink = () => {
    let currentId = 'inicio';
    const scrollPos = window.scrollY + 140;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  };

  window.addEventListener('scroll', () => {
    updateScrollProgress();
    updateHeaderState();
    updateActiveLink();
    toggleBackToTop();
  }, { passive: true });

  updateScrollProgress(); updateHeaderState(); updateActiveLink();

  /* ---------------------------------------------------------
     HAMBURGER / MOBILE NAV
  --------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  const closeMobileNav = () => {
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  hamburger && hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNav && mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));

  /* ---------------------------------------------------------
     SMOOTH SCROLL (native scroll-behavior handles it; this
     accounts for the fixed header offset)
  --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerH = document.getElementById('header').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------------------------------------------------------
     BACK TO TOP
  --------------------------------------------------------- */
  const backToTop = document.getElementById('back-to-top');
  function toggleBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  }
  backToTop && backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ---------------------------------------------------------
     SCROLL REVEAL (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), (i % 4) * 90);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------
     ANIMATED COUNTERS
  --------------------------------------------------------- */
  const counters = document.querySelectorAll('.stat__number');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => counterObserver.observe(c));
  }

  /* ---------------------------------------------------------
     RIPPLE EFFECT ON BUTTONS
  --------------------------------------------------------- */
  document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      circle.classList.add('ripple-circle');
      circle.style.width = circle.style.height = size + 'px';
      circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
      circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    });
  });

  /* ---------------------------------------------------------
     HERO PARTICLES (Canvas)
  --------------------------------------------------------- */
  const canvas = document.getElementById('particles');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };

    const colors = ['rgba(229,9,20,', 'rgba(255,215,0,', 'rgba(255,255,255,'];

    const initParticles = () => {
      const count = Math.min(70, Math.floor((w * h) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
      });
      // connecting lines for nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(229,9,20,${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };

    resize(); initParticles(); draw();
    window.addEventListener('resize', () => { resize(); initParticles(); });
  }

  /* ---------------------------------------------------------
     GALLERY LIGHTBOX
  --------------------------------------------------------- */
  const galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentGalleryIndex = 0;

  const openLightbox = (index) => {
    currentGalleryIndex = index;
    const img = galleryItems[index].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { lightbox.hidden = true; }, 350);
  };

  const showGalleryDelta = (delta) => {
    currentGalleryIndex = (currentGalleryIndex + delta + galleryItems.length) % galleryItems.length;
    const img = galleryItems[currentGalleryIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });
  lightboxClose && lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev && lightboxPrev.addEventListener('click', () => showGalleryDelta(-1));
  lightboxNext && lightboxNext.addEventListener('click', () => showGalleryDelta(1));
  lightbox && lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showGalleryDelta(-1);
    if (e.key === 'ArrowRight') showGalleryDelta(1);
  });

  /* ---------------------------------------------------------
     TESTIMONIAL CAROUSEL
  --------------------------------------------------------- */
  const track = document.getElementById('testimonial-track');
  const dotsWrap = document.getElementById('testimonial-dots');
  if (track) {
    const slides = Array.from(track.children);
    let current = 0;
    let autoTimer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
      resetAutoplay();
    }

    function next() { goTo(current + 1); }

    function resetAutoplay() {
      clearInterval(autoTimer);
      if (!prefersReducedMotion) autoTimer = setInterval(next, 5500);
    }
    resetAutoplay();

    // pause on hover
    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.parentElement.addEventListener('mouseleave', resetAutoplay);

    // swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (delta > 50) goTo(current - 1);
      else if (delta < -50) goTo(current + 1);
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     IMC CALCULATOR
  --------------------------------------------------------- */
  const imcForm = document.getElementById('imc-form');
  const imcResult = document.getElementById('imc-result');
  const imcValue = document.getElementById('imc-value');
  const imcStatus = document.getElementById('imc-status');
  const imcDesc = document.getElementById('imc-desc');
  const imcGauge = document.querySelector('.imc__gauge');

  imcForm && imcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const heightCm = parseFloat(document.getElementById('imc-height').value);
    const weightKg = parseFloat(document.getElementById('imc-weight').value);

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      imcResult.hidden = false;
      imcValue.textContent = '—';
      imcStatus.textContent = 'Datos inválidos';
      imcDesc.textContent = 'Por favor ingresá una altura y un peso válidos.';
      return;
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const bmiRounded = Math.round(bmi * 10) / 10;

    let status, desc, angle;
    if (bmi < 18.5) {
      status = 'Bajo peso'; desc = 'Se recomienda aumentar la ingesta calórica y consultar a un nutricionista.';
      angle = 60;
    } else if (bmi < 25) {
      status = 'Peso normal'; desc = '¡Excelente! Mantené tu rutina de entrenamiento y alimentación.';
      angle = 130;
    } else if (bmi < 30) {
      status = 'Sobrepeso'; desc = 'Un plan de entrenamiento funcional y cardio puede ayudarte a mejorar tu composición corporal.';
      angle = 250;
    } else {
      status = 'Obesidad'; desc = 'Te recomendamos combinar entrenamiento personalizado con seguimiento nutricional profesional.';
      angle = 320;
    }

    imcValue.textContent = bmiRounded;
    imcStatus.textContent = status;
    imcDesc.textContent = desc;
    imcResult.hidden = false;
    imcGauge.style.background = `conic-gradient(var(--red) 0deg, var(--gold) ${angle}deg, var(--gray-700) ${angle}deg)`;
  });

  /* ---------------------------------------------------------
     CONTACT FORM VALIDATION
  --------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formError = document.getElementById('form-error');

  const validators = {
    nombre: (v) => v.trim().length >= 2,
    apellido: (v) => v.trim().length >= 2,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    telefono: (v) => /^[\d\s()+.-]{7,20}$/.test(v.trim()),
    mensaje: (v) => v.trim().length >= 10
  };

  const errorMessages = {
    nombre: 'Ingresá tu nombre (mín. 2 caracteres).',
    apellido: 'Ingresá tu apellido (mín. 2 caracteres).',
    email: 'Ingresá un correo electrónico válido.',
    telefono: 'Ingresá un teléfono válido.',
    mensaje: 'Contanos un poco más (mín. 10 caracteres).'
  };

  contactForm && contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    formSuccess.hidden = true;
    formError.hidden = true;

    Object.keys(validators).forEach(name => {
      const field = contactForm.elements[name];
      const errorSpan = contactForm.querySelector(`[data-error-for="cf-${name}"]`);
      if (!field) return;
      const valid = validators[name](field.value);
      field.classList.toggle('is-invalid', !valid);
      if (errorSpan) errorSpan.textContent = valid ? '' : errorMessages[name];
      if (!valid) isValid = false;
    });

    if (isValid) {
      formSuccess.hidden = false;
      contactForm.reset();
      setTimeout(() => { formSuccess.hidden = true; }, 6000);
    } else {
      formError.hidden = false;
      const firstInvalid = contactForm.querySelector('.is-invalid');
      firstInvalid && firstInvalid.focus();
    }
  });

  /* ---------------------------------------------------------
     FOOTER YEAR
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
