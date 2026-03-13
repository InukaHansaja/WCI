/* ═══════════════════════════════════════════════════════════════
   Wedding Invitation — script.js
   Flow:  Prompt → Envelope opens → Cover card → Main card + RSVP
   ═══════════════════════════════════════════════════════════════ */

/* ── Read guest name from URL ────────────────────────────────────────────────── */
(function () {
  const params = new URLSearchParams(window.location.search);
  const name   = params.get('name');
  const prefix = params.get('prefix');

  if (name) {
    const nameEl   = document.getElementById('guest-name');
    const prefixEl = document.getElementById('guest-prefix');
    if (nameEl)   nameEl.textContent   = name;
    if (prefixEl) prefixEl.textContent = prefix ? prefix : '';
  }
})();

/* ── State ───────────────────────────────────────────────────────────────────── */
let step = 0; // 0=prompt, 1=envelope shown, 2=cover card shown, 3=main card shown

/* ── STEP 1: Click prompt → show envelope ───────────────────────────────────── */
function startEnvelope() {
  if (step !== 0) return;
  step = 1;

  // hide prompt
  const prompt = document.getElementById('click-prompt');
  prompt.classList.add('hidden');

  setTimeout(() => {
    prompt.style.display = 'none';

    // show envelope scene
    const scene = document.getElementById('scene');
    scene.classList.add('visible');
    scene.style.opacity = '0';
    scene.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scene.style.opacity = '1';
      });
    });

    // open flap after short delay
    setTimeout(() => {
      document.getElementById('wax-seal').classList.add('broken');
      setTimeout(() => {
        document.getElementById('env-flap').classList.add('open');
      }, 300);
    }, 800);

  }, 600);
}

/* ── STEP 2: Click cover card → slide it up, fade envelope, show cover detached ─ */
function openCoverCard() {
  if (step !== 1) return;
  step = 2;

  const coverCard = document.getElementById('cover-card');
  const scene     = document.getElementById('scene');

  // slide cover card up out of envelope
  coverCard.classList.add('slide-up');

  setTimeout(() => {
    // fade out envelope
    scene.classList.add('fade-out');

    setTimeout(() => {
      scene.style.display = 'none';

      // move cover card to card-stage
      const cardStage = document.getElementById('card-stage');
      cardStage.classList.add('visible');

      // detach cover card into card-stage (insert before rsvp-panel)
      const rsvpPanel = document.getElementById('rsvp-panel');
      coverCard.classList.remove('slide-up');
      coverCard.classList.add('detached');
      coverCard.style.opacity = '0';
      coverCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      coverCard.style.transform = 'translateY(30px)';
      cardStage.insertBefore(coverCard, rsvpPanel);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          coverCard.style.opacity = '1';
          coverCard.style.transform = 'translateY(0)';
        });
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // confetti burst
      setTimeout(() => launchConfetti(), 500);

    }, 700);
  }, 900);
}

/* ── STEP 3: Click cover card → show main invitation card (skipping Step 2) ─────────── */
function openMainCard() {
  if (step !== 1) return;
  step = 2;

  const coverCard      = document.getElementById('cover-card');
  const scene          = document.getElementById('scene');
  const invitationCard = document.getElementById('invitation-card');
  const rsvpPanel      = document.getElementById('rsvp-panel');

  // fade out envelope and cover card
  scene.classList.add('fade-out');
  
  setTimeout(() => {
    scene.style.display = 'none';
    
    // show card-stage and invitation card
    const cardStage = document.getElementById('card-stage');
    cardStage.classList.add('visible');
    coverCard.style.display = 'none';

    // show main invitation card
    invitationCard.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // show RSVP panel
    setTimeout(() => {
      rsvpPanel.classList.add('show');
      launchConfetti();
    }, 800);

  }, 700);
}

/* ── Attach click handlers ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cover-card').addEventListener('click', () => {
    if (step === 1) openMainCard();
  });
});

/* ── Confetti ───────────────────────────────────────────────────────────────── */
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 120 }, () => ({
    x:    Math.random() * canvas.width,
    y:    Math.random() * canvas.height - canvas.height,
    w:    Math.random() * 10 + 5,
    h:    Math.random() * 5  + 3,
    color: ['#c9aa60','#f5e6c8','#fff','#9b2226','#e8dfc8'][Math.floor(Math.random()*5)],
    speed: Math.random() * 3 + 1,
    angle: Math.random() * Math.PI * 2,
    spin:  (Math.random() - 0.5) * 0.2,
    opacity: 1,
  }));

  let frame = 0;
  const totalFrames = 600; // Total animation frames
  const fadeStartFrame = 300; // Start fading at 4 seconds
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fade out after 4 seconds
    if (frame >= fadeStartFrame) {
      const fadeProgress = (frame - fadeStartFrame) / (totalFrames - fadeStartFrame);
      pieces.forEach(p => {
        p.opacity = Math.max(0, 1 - fadeProgress);
      });
    }
    
    pieces.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.opacity; // Apply fade
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.y     += p.speed;
      p.angle += p.spin;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
    });
    frame++;
    if (frame < totalFrames) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}
