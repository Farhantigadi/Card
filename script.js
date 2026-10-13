/* ==========================================================================
   WEDDING INVITATION MOTION ENGINE
   Mohammed Saman & Huma - 23rd & 25th October 2026
   Dual Theme: Emerald Velvet (Dark - Default) & Rose Light (Editorial Luxury)
   ========================================================================== */

// --- GLOBAL THEME & DOOR HANDLERS (Directly accessible via inline and event listeners) ---
window.openDoors = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const doorStage = document.getElementById('door-stage');
  const mainContent = document.getElementById('main-content');

  if (doorStage && mainContent) {
    doorStage.classList.add('opening');
    mainContent.classList.remove('hidden-initially');

    setTimeout(() => {
      const firstCard = document.querySelector('.header-card');
      if (firstCard) firstCard.classList.add('revealed');
    }, 500);

    setTimeout(() => {
      doorStage.classList.add('opened');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1400);
  }
};

window.toggleTheme = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();

  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', next);

  try {
    localStorage.setItem('wedding_theme', next);
  } catch (err) {
    // Fail silently in private browsing mode
  }

  const meta = document.getElementById('theme-color-meta');
  if (meta) {
    meta.setAttribute('content', next === 'light' ? '#EFE9E1' : '#03140e');
  }

  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
  }

  const label = document.getElementById('theme-label-text');
  if (label) {
    label.textContent = next === 'light' ? 'Emerald Dark' : 'Rose Light';
  }

  if (typeof window.refreshParticles === 'function') {
    window.refreshParticles();
  }
};


// --- PARTICLE CLASSES (Defined before canvas engine usage) ---
class GoldParticle {
  constructor(width, height, init = false) {
    this.reset(width, height, init);
  }

  reset(width, height, init = false) {
    this.x = Math.random() * width;
    this.y = init ? Math.random() * height : height + 10;
    this.size = Math.random() * 2 + 0.8;
    this.speedY = Math.random() * 0.45 + 0.15;
    this.speedX = (Math.random() - 0.5) * 0.25;
    this.opacity = Math.random() * 0.6 + 0.2;
    this.fadeSpeed = Math.random() * 0.006 + 0.003;
    this.fadeDirection = 1;
  }

  update(width, height) {
    this.y -= this.speedY;
    this.x += this.speedX;

    this.opacity += this.fadeSpeed * this.fadeDirection;
    if (this.opacity >= 0.8) {
      this.fadeDirection = -1;
    } else if (this.opacity <= 0.15) {
      this.fadeDirection = 1;
    }

    if (this.y < -10 || this.x < -10 || this.x > width + 10) {
      this.reset(width, height);
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245, 214, 130, ${this.opacity})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(212, 175, 55, 0.7)';
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class RosePetal {
  constructor(width, height, index = 0, total = 6) {
    this.reset(width, height, true, (index / total) * height);
  }

  reset(width, height, init = false, customY = null) {
    this.x = Math.random() * width;
    this.y = init && customY !== null ? customY : -30;
    this.width = Math.random() * 7 + 10;
    this.height = Math.random() * 5 + 8;
    const fallDurationSeconds = Math.random() * 6 + 14; 
    this.speedY = (height / (fallDurationSeconds * 60)); 
    this.speedX = Math.sin(Math.random() * Math.PI) * 0.35;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.02;
    this.swayAngle = Math.random() * Math.PI * 2;
    this.swaySpeed = Math.random() * 0.02 + 0.015;
    this.opacity = 0.48;
  }

  update(width, height) {
    this.swayAngle += this.swaySpeed;
    this.x += Math.sin(this.swayAngle) * 0.5 + this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotSpeed;

    if (this.y > height + 30 || this.x < -40 || this.x > width + 40) {
      this.reset(width, height);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();

    ctx.moveTo(0, -this.height / 2);
    ctx.quadraticCurveTo(this.width / 2, -this.height / 4, this.width / 3, this.height / 2);
    ctx.quadraticCurveTo(0, this.height * 0.7, -this.width / 3, this.height / 2);
    ctx.quadraticCurveTo(-this.width / 2, -this.height / 4, 0, -this.height / 2);

    ctx.fillStyle = `rgba(185, 128, 138, ${this.opacity})`;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, 0, this.width * 0.25, this.height * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(227, 190, 195, ${this.opacity * 0.6})`;
    ctx.fill();

    ctx.restore();
  }
}


// --- MAIN APPLICATION INIT ---
function initApp() {

  // Sync initial labels and attributes
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const label = document.getElementById('theme-label-text');
  if (label) {
    label.textContent = currentTheme === 'light' ? 'Emerald Dark' : 'Rose Light';
  }
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.setAttribute('aria-pressed', currentTheme === 'light' ? 'true' : 'false');
  }


  // --------------------------------------------------------------------------
  // AMBIENT PARTICLES ENGINE
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('particles-canvas');
  let ctx = null;
  let animId = null;
  let particles = [];
  let width = 0;
  let height = 0;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) cancelAnimationFrame(animId);
    } else {
      if (!prefersReducedMotion && canvas) {
        loopParticles();
      }
    }
  });

  function initCanvasParticles() {
    if (!canvas || prefersReducedMotion) return;
    if (animId) cancelAnimationFrame(animId);

    try {
      ctx = canvas.getContext('2d');
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = [];

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';

      if (isLight) {
        // Maximum 6 slow falling rose petals
        const petalCount = 6;
        for (let i = 0; i < petalCount; i++) {
          particles.push(new RosePetal(width, height, i, petalCount));
        }
      } else {
        // Dark theme: subtle floating gold dust
        const dustCount = Math.min(width > 768 ? 40 : 20, 40);
        for (let i = 0; i < dustCount; i++) {
          particles.push(new GoldParticle(width, height, true));
        }
      }

      loopParticles();
    } catch (err) {
      console.warn('Canvas particle initialization skipped:', err);
    }
  }

  window.refreshParticles = initCanvasParticles;

  function loopParticles() {
    if (!ctx || document.hidden || prefersReducedMotion) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(width, height);
      particles[i].draw(ctx);
    }

    animId = requestAnimationFrame(loopParticles);
  }

  window.addEventListener('resize', () => {
    if (canvas) {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
  });

  initCanvasParticles();


  // --------------------------------------------------------------------------
  // LIVE NIKAH COUNTDOWN TIMER (23 OCTOBER 2026, 20:00:00 IST)
  // --------------------------------------------------------------------------
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');

  const targetDate = new Date('2026-10-23T20:00:00+05:30').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      if (cdDays) cdDays.textContent = '00';
      if (cdHours) cdHours.textContent = '00';
      if (cdMinutes) cdMinutes.textContent = '00';
      if (cdSeconds) cdSeconds.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, '0');
    if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);


  // --------------------------------------------------------------------------
  // SCROLL-TRIGGERED REVEAL OBSERVER
  // --------------------------------------------------------------------------
  const revealItems = document.querySelectorAll('.reveal-item');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('revealed'));
  }
}

// Start application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


// ----------------------------------------------------------------------------
// CALENDAR INTEGRATION (.ICS FILE DOWNLOAD)
// ----------------------------------------------------------------------------
window.addToCalendar = function(eventType) {
  let title = '';
  let location = '';
  let startDate = '';
  let endDate = '';
  let description = '';

  if (eventType === 'nikah') {
    title = 'Nikah Ceremony of Mohammed Saman & Huma';
    location = 'Mezbaan Function Hall, Belagavi, Karnataka';
    startDate = '20261023T143000Z'; // 20:00 IST = 14:30 UTC
    endDate = '20261023T173000Z';   // 23:00 IST = 17:30 UTC
    description = 'You are cordially invited to celebrate the sacred Nikah of Mohammed Saman & Huma.';
  } else if (eventType === 'reception') {
    title = 'Wedding Reception of Mohammed Saman & Huma';
    location = 'A S GADAG FUNCTION HALL, Bailhongal, Karnataka';
    startDate = '20261025T071500Z'; // 12:45 IST = 07:15 UTC
    endDate = '20261025T110000Z';   // 16:30 IST = 11:00 UTC
    description = 'You are cordially invited to celebrate the Walima / Reception of Mohammed Saman & Huma.';
  }

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SamanAndHuma//WeddingInvite//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${eventType}_saman_and_huma.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
