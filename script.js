/* ==========================================================================
   WEDDING INVITATION MOTION ENGINE
   Mohammed Saman & Huma - 23rd & 25th October 2026
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. PALACE ARCH DOORS OPENING LOGIC
  // --------------------------------------------------------------------------
  const openBtn = document.getElementById('open-invite-btn');
  const doorStage = document.getElementById('door-stage');
  const mainContent = document.getElementById('main-content');
  const doorLeft = document.getElementById('door-left');
  const doorRight = document.getElementById('door-right');

  if (openBtn && doorStage && mainContent) {
    openBtn.addEventListener('click', () => {
      // 1. Play door opening transition
      doorStage.classList.add('opening');

      // 2. Reveal main content smoothly behind doors
      mainContent.classList.remove('hidden-initially');

      // 3. Trigger reveal animation on header card immediately
      setTimeout(() => {
        const firstCard = document.querySelector('.header-card');
        if (firstCard) firstCard.classList.add('revealed');
      }, 500);

      // 4. Fully hide door stage after animation completes
      setTimeout(() => {
        doorStage.classList.add('opened');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500);
    });
  }


  // --------------------------------------------------------------------------
  // 2. AMBIENT GOLD DUST PARTICLES (CANVAS)
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(width > 768 ? 45 : 25, 45);

    class GoldParticle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 2 + 0.8;
        this.speedY = Math.random() * 0.45 + 0.15;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.fadeSpeed = Math.random() * 0.006 + 0.003;
        this.fadeDirection = 1;
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;

        // Twinkle pulse
        this.opacity += this.fadeSpeed * this.fadeDirection;
        if (this.opacity >= 0.8) {
          this.fadeDirection = -1;
        } else if (this.opacity <= 0.15) {
          this.fadeDirection = 1;
        }

        // Loop to bottom if floated off screen
        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 214, 130, ${this.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.7)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new GoldParticle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }


  // --------------------------------------------------------------------------
  // 3. SERENE VOCAL/AMBIENT AUDIO SYNTHESIS & TOGGLE (WEB AUDIO API)
  // --------------------------------------------------------------------------
  // Provides a pure, serene harmonic ambient soundscape with zero network delay,
  // strictly OFF by default, and seamlessly toggled by the user.
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const soundWave = document.getElementById('sound-wave');
  const audioLabel = document.getElementById('audio-label');

  let audioCtx = null;
  let isPlaying = false;
  let synthNodes = [];

  function initAmbientAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Master Gain
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 3);

    // Warm Low-pass Filter for meditative acoustic warmth
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.5, audioCtx.currentTime);

    // Harmonic Chord (D2, A2, D3, F#3 / serene contemplative frequencies)
    const frequencies = [146.83, 220.0, 293.66, 369.99, 440.0];

    const nodes = frequencies.map((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Soft sine waves with subtle warm chorus detune
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.8, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.02 / (index + 1), audioCtx.currentTime);

      // Gentle LFO swell
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.15 + index * 0.05, audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(0.008, audioCtx.currentTime);
      lfo.connect(gain.gain);
      lfo.start();

      osc.connect(gain);
      gain.connect(filter);
      osc.start();

      return { osc, gain, lfo };
    });

    filter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    synthNodes = { nodes, masterGain };
  }

  function stopAmbientAudio() {
    if (synthNodes && synthNodes.masterGain && audioCtx) {
      synthNodes.masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      setTimeout(() => {
        if (synthNodes && synthNodes.nodes) {
          synthNodes.nodes.forEach((n) => {
            try { n.osc.stop(); n.lfo.stop(); } catch(e) {}
          });
        }
        synthNodes = [];
      }, 1250);
    }
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;

      if (isPlaying) {
        initAmbientAudio();
        soundWave.classList.add('playing');
        audioLabel.textContent = 'Music: On';
        audioToggleBtn.classList.add('active');
      } else {
        stopAmbientAudio();
        soundWave.classList.remove('playing');
        audioLabel.textContent = 'Music: Off';
        audioToggleBtn.classList.remove('active');
      }
    });
  }


  // --------------------------------------------------------------------------
  // 4. LIVE NIKAH COUNTDOWN TIMER (23 OCTOBER 2026, 20:00:00 IST)
  // --------------------------------------------------------------------------
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');

  // Nikah Date: 2026-10-23T20:00:00+05:30 (India Standard Time)
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
  // 5. SCROLL-TRIGGERED REVEAL OBSERVER
  // --------------------------------------------------------------------------
  const revealItems = document.querySelectorAll('.reveal-item');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('revealed'));
  }


  // --------------------------------------------------------------------------
  // 6. DUA & WHATSAPP SHARING
  // --------------------------------------------------------------------------
  const guestNameInput = document.getElementById('guest-name-input');
  const guestDuaText = document.getElementById('guest-dua-text');
  const btnWhatsappDua = document.getElementById('btn-send-whatsapp-dua');
  const btnCopyLink = document.getElementById('btn-copy-card-link');
  const copyToast = document.getElementById('copy-toast');

  if (btnWhatsappDua) {
    btnWhatsappDua.addEventListener('click', () => {
      const name = (guestNameInput && guestNameInput.value.trim()) || 'A well-wisher & family';
      const customDua = (guestDuaText && guestDuaText.value.trim()) || 'Baarakallaahu laka wa baaraka \'alayka wa jama\'a baynakumaa fee khayr.';

      const message = `*Assalamu Alaikum!* 💐\n\nHeartiest Mubarak and prayers for *Mohammed Saman & Huma* on their blessed Nikah & Reception!\n\n🤲 *Dua:* "${customDua}"\n\n— With warmest regards, *${name}*`;

      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          showCopyToast();
        });
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showCopyToast();
      }
    });
  }

  function showCopyToast() {
    if (copyToast) {
      copyToast.classList.add('show');
      setTimeout(() => copyToast.classList.remove('show'), 2500);
    }
  }

});


// ----------------------------------------------------------------------------
// 7. CALENDAR INTEGRATION (.ICS FILE DOWNLOAD / GOOGLE CALENDAR)
// ----------------------------------------------------------------------------
function addToCalendar(eventType) {
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

  // Create .ics file content
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
}
