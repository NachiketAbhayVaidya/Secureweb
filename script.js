// NAV SCROLL
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// HAMBURGER
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// STARS
const starsContainer = document.getElementById('stars');
for (let i = 0; i < 80; i++) {
  const star = document.createElement('div');
  star.className = 'star';
  const size = Math.random() * 2.5 + 0.5;
  star.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*70}%;width:${size}px;height:${size}px;animation-delay:${Math.random()*4}s;animation-duration:${2+Math.random()*3}s;`;
  starsContainer.appendChild(star);
}

// GUARD JOURNEY
const guard = document.getElementById('guardCharacter');
const speechBubble = document.getElementById('speechBubble');

const checkpointData = [
  { speech: "Namaste! I am Abhedya — Impenetrable.", night: false, showWalkie: false, showTorch: false },
  { speech: "I patrol corporate buildings with discipline.", night: false, showWalkie: true, showTorch: false },
  { speech: "Day shift — access control is my priority.", night: false, showWalkie: true, showTorch: false },
  { speech: "Fire training certified. I never panic.", night: true, showWalkie: false, showTorch: false },
  { speech: "Night watch. Nothing passes without my notice.", night: true, showWalkie: false, showTorch: true },
  { speech: "I protect homes, offices, factories, events.", night: false, showWalkie: true, showTorch: false },
];

let currentCP = -1;
let walkInterval = null;
let speechTimeout = null;

function startWalking() {
  guard.classList.add('walking');
}
function stopWalking() {
  guard.classList.remove('walking');
}
function showSpeech(text) {
  clearTimeout(speechTimeout);
  speechBubble.textContent = text;
  speechBubble.classList.add('visible');
  speechTimeout = setTimeout(() => speechBubble.classList.remove('visible'), 4000);
}

function updateGuardForCP(index) {
  if (index < 0 || index >= checkpointData.length || index === currentCP) return;
  currentCP = index;
  const data = checkpointData[index];
  if (data.night) {
    guard.classList.add('night-mode');
  } else {
    guard.classList.remove('night-mode');
  }
  document.getElementById('torch').style.opacity = data.showTorch ? '1' : '0';
  document.getElementById('torchLight').style.opacity = data.showTorch ? '1' : '0';
  document.getElementById('walkie').style.opacity = data.showWalkie ? '1' : '0';
  showSpeech(data.speech);
  startWalking();
  setTimeout(stopWalking, 1500);
}

// Checkpoint observers
document.querySelectorAll('.checkpoint').forEach((cp, index) => {
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        cp.classList.add('visible');
        updateGuardForCP(index);
      }
    });
  }, { threshold: 0.35 }).observe(cp);
});

// Diff cards
document.querySelectorAll('.diff-card').forEach(card => {
  const delay = parseInt(card.dataset.delay) || 0;
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => card.classList.add('visible'), delay);
      }
    });
  }, { threshold: 0.2 }).observe(card);
});

// Chain steps
const chainContainer = document.querySelector('.chain-container');
if (chainContainer) {
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.chain-step').forEach((step, i) => {
          setTimeout(() => step.classList.add('visible'), i * 150);
        });
      }
    });
  }, { threshold: 0.3 }).observe(chainContainer);
}

// Service cards
document.querySelectorAll('.service-card').forEach((card, i) => {
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) setTimeout(() => card.classList.add('visible'), i * 100);
    });
  }, { threshold: 0.2 }).observe(card);
});

// Team cards
document.querySelectorAll('.team-card').forEach((card, i) => {
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) setTimeout(() => card.classList.add('visible'), i * 150);
    });
  }, { threshold: 0.2 }).observe(card);
});

// Counter animation
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const interval = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(interval); }
    el.textContent = Math.floor(start);
  }, 16);
}
let statsAnimated = false;
const statsSection = document.getElementById('stats');
if (statsSection) {
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        document.querySelectorAll('.stat-num').forEach(el => {
          animateCounter(el, parseInt(el.dataset.target));
        });
      }
    });
  }, { threshold: 0.4 }).observe(statsSection);
}

// Contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = '✓ Request Sent!';
    btn.style.background = '#1a5c3a';
    setTimeout(() => { btn.textContent = original; btn.style.background = ''; contactForm.reset(); }, 3000);
  });
}

// Hero animations on load
document.addEventListener('DOMContentLoaded', () => {
  ['.hero-badge', '.hero-title .line1', '.hero-title .line2', '.hero-title .line3', '.hero-sub', '.hero-btns'].forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.cssText += 'opacity:0;transform:translateY(30px);transition:opacity 0.7s ease,transform 0.7s ease;';
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 200 + i * 120);
  });
});

// Hero parallax
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && scrolled < window.innerHeight) heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' }); }
  });
});