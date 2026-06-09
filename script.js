// Interactivity and Effects for "Eu Amo Meu Denguin"

// State management
let loveCount = parseInt(localStorage.getItem('denguin_love_clicks')) || 0;
let soundEnabled = localStorage.getItem('denguin_sound_enabled') !== 'false'; // Default to true
let previousLevel = Math.floor(loveCount / 100) + 1;

// DOM Elements
const heartBtn = document.getElementById('heartBtn');
const heartGlow = document.getElementById('heartGlow');
const loveCounter = document.getElementById('loveCounter');
const loveBar = document.getElementById('loveBar');
const loveStatus = document.getElementById('loveStatus');
const soundToggle = document.getElementById('soundToggle');
const particleCanvas = document.getElementById('particleCanvas');
const ctx = particleCanvas.getContext('2d');
const actionButtons = document.querySelectorAll('.action-btn');
const loveOverlay = document.getElementById('loveOverlay');
const closeOverlayBtn = document.getElementById('closeOverlayBtn');
const overlayBackdrop = document.getElementById('overlayBackdrop');

// Initialize UI States
loveCounter.textContent = loveCount;
updateLoveMeter(false);
updateSoundToggleButton();

// Web Audio API Setup
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Cute Web Audio API Synth Sound Generator
function playChime(type) {
    if (!soundEnabled) return;
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    if (type === 'heart') {
        // Heartbeat click: cute high-speed sweep upward
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
    } 
    else if (type === 'kiss') {
        // Kiss: soft bubble sound + high tone
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(300, now);
        osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(150, now);
        osc2.frequency.exponentialRampToValueAtTime(600, now + 0.1);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.23);
        osc2.stop(now + 0.23);
    } 
    else if (type === 'hug') {
        // Hug: warm, soft dual chord
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(261.63, now); // C4
        osc1.frequency.exponentialRampToValueAtTime(329.63, now + 0.3); // E4
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(392.00, now); // G4
        osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.3); // C5
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.36);
        osc2.stop(now + 0.36);
    } 
    else if (type === 'cafune') {
        // Cafuné: soft arpeggio
        const notes = [349.23, 440.00, 523.25, 659.25]; // F4, A4, C5, E5
        notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.06 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.26);
        });
    }
    else if (type === 'levelup') {
        // Level up: beautiful ascending major 7th arpeggio chime
        const notes = [261.63, 329.63, 392.00, 493.88, 523.25]; // C4, E4, G4, B4, C5
        notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.42);
        });
    }
}

// Particle Engine Configuration
let particles = [];
let bgParticles = [];
const maxBgParticles = 25;

// Resize canvas
function resizeCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Helper to draw a heart shape
function drawHeartShape(c, x, y, size, color, alpha) {
    c.save();
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.beginPath();
    
    // Smooth heart path centered around x, y
    c.translate(x, y);
    c.moveTo(0, -size / 4);
    c.bezierCurveTo(-size / 2, -size * 0.7, -size, -size * 0.3, -size, size / 4);
    c.bezierCurveTo(-size, size * 0.7, -size / 4, size * 0.9, 0, size);
    c.bezierCurveTo(size / 4, size * 0.9, size, size * 0.7, size, size / 4);
    c.bezierCurveTo(size, -size * 0.3, size / 2, -size * 0.7, 0, -size / 4);
    
    c.closePath();
    c.fill();
    c.restore();
}

// Sparkle particle class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 14 + 8;
        this.color = color;
        this.alpha = 1;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.6) * 8 - 2; // Upwards bias
        this.gravity = 0.12;
        this.decay = Math.random() * 0.015 + 0.015;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.05;
    }

    update() {
        this.x += this.speedX;
        this.speedY += this.gravity;
        this.y += this.speedY;
        this.alpha -= this.decay;
        this.rotation += this.rotSpeed;
    }

    draw() {
        drawHeartShape(ctx, this.x, this.y, this.size, this.color, this.alpha);
    }
}

// Background drifting heart class
class BgParticle {
    constructor() {
        this.reset(true);
    }

    reset(initiallyAnywhere = false) {
        this.x = Math.random() * particleCanvas.width;
        this.y = initiallyAnywhere ? Math.random() * particleCanvas.height : particleCanvas.height + 20;
        this.size = Math.random() * 15 + 6;
        this.speedY = -(Math.random() * 0.8 + 0.4);
        this.speedX = (Math.random() - 0.5) * 0.4;
        const redHue = Math.floor(Math.random() * 20) + 340; // 340-360 hue (pinks/reds)
        this.color = `hsl(${redHue}, 100%, 75%)`;
        this.alpha = Math.random() * 0.08 + 0.04;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        // Float upwards, reset if offscreen
        if (this.y < -30 || this.x < -30 || this.x > particleCanvas.width + 30) {
            this.reset(false);
        }
    }

    draw() {
        drawHeartShape(ctx, this.x, this.y, this.size, this.color, this.alpha);
    }
}

// Initialize background drift
for (let i = 0; i < maxBgParticles; i++) {
    bgParticles.push(new BgParticle());
}

// Spawn burst explosion
function spawnBurst(x, y, count = 20) {
    const colors = [
        '#ff1f4b', // primary red
        '#ff758c', // bright rose
        '#ffb3c1', // soft blush
        '#ffd700', // gold sparkle
        '#ff85a2', // neon pink
    ];
    for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, color));
    }
}

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    // Draw background particles
    bgParticles.forEach(bp => {
        bp.update();
        bp.draw();
    });

    // Draw and filter out dead burst particles
    particles = particles.filter(p => {
        p.update();
        p.draw();
        return p.alpha > 0;
    });

    requestAnimationFrame(animate);
}
animate();

// Update Love Meter values, width, and description status
function updateLoveMeter(shouldLevelUpNotify = true) {
    loveCounter.textContent = loveCount;
    localStorage.setItem('denguin_love_clicks', loveCount);

    const levelLimit = 100;
    const progress = loveCount % levelLimit;
    const currentLevel = Math.floor(loveCount / levelLimit) + 1;
    let percentage = (progress / levelLimit) * 100;

    // Show 100% full before resetting when leveling up
    if (progress === 0 && loveCount > 0) {
        percentage = 100;
    }

    loveBar.style.width = `${percentage}%`;

    // Dynamic level labels
    let statusMsg = '';
    if (currentLevel === 1) {
        if (loveCount < 10) statusMsg = "Iniciando o carinho... 🥰";
        else if (loveCount < 30) statusMsg = "Denguin está ficando quentinho! 🔥";
        else if (loveCount < 60) statusMsg = "Amor explodindo! 💥";
        else if (loveCount < 90) statusMsg = "Vocês são o casal mais fofo! 🥺❤️";
        else statusMsg = "Quase lá... Carregando amor infinito! ⚡";
    } else {
        statusMsg = `Amor Infinito Atingido! Nível de Carinho: ${currentLevel} 💖✨`;
    }

    loveStatus.textContent = statusMsg;

    // Glowing border effects on high levels
    if (loveCount > 0) {
        const intensity = Math.min(percentage / 100, 1);
        heartGlow.style.transform = `scale(${1 + intensity * 0.4})`;
        heartGlow.style.opacity = `${0.25 + intensity * 0.4}`;
    }

    // Trigger overlay if level goes up during interaction
    if (shouldLevelUpNotify && currentLevel > previousLevel) {
        triggerLoveOverlay();
    }
    previousLevel = currentLevel;
}

// Show the premium full-screen "Eu amo o Lu" overlay
let showerIntervalId = null;
function triggerLoveOverlay() {
    loveOverlay.classList.remove('hidden');
    loveOverlay.setAttribute('aria-hidden', 'false');
    
    // Play level up chime
    playChime('levelup');

    // Trigger massive particles burst on the screen center
    const screenX = window.innerWidth / 2;
    const screenY = window.innerHeight / 2;
    
    spawnBurst(screenX, screenY, 40);
    setTimeout(() => spawnBurst(screenX - 120, screenY - 60, 25), 200);
    setTimeout(() => spawnBurst(screenX + 120, screenY - 60, 25), 400);
    setTimeout(() => spawnBurst(screenX, screenY + 120, 25), 600);

    // Spawn a continuous shower of hearts and sparkles
    if (showerIntervalId) clearInterval(showerIntervalId);
    showerIntervalId = setInterval(() => {
        if (loveOverlay.classList.contains('hidden')) {
            clearInterval(showerIntervalId);
            return;
        }
        
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 50;

        const emojiEl = document.createElement('div');
        emojiEl.className = 'flying-emoji';
        
        const emojiPool = ['❤️', '💖', '💝', '✨', '🥰', '😘', '🌸', '🌹'];
        emojiEl.textContent = emojiPool[Math.floor(Math.random() * emojiPool.length)];
        
        const targetX = (Math.random() - 0.5) * 250;
        const targetY = -(window.innerHeight + 120);
        const rotation = (Math.random() - 0.5) * 180;

        emojiEl.style.left = `${startX}px`;
        emojiEl.style.top = `${startY}px`;
        emojiEl.style.setProperty('--tx', `${targetX}px`);
        emojiEl.style.setProperty('--ty', `${targetY}px`);
        emojiEl.style.setProperty('--rot', `${rotation}deg`);

        document.body.appendChild(emojiEl);

        emojiEl.addEventListener('animationend', () => {
            emojiEl.remove();
        });
    }, 120);

    // Stop emoji shower automatically after 4 seconds if not closed
    setTimeout(() => {
        if (showerIntervalId) {
            clearInterval(showerIntervalId);
        }
    }, 4000);
}

function closeLoveOverlay() {
    loveOverlay.classList.add('hidden');
    loveOverlay.setAttribute('aria-hidden', 'true');
    if (showerIntervalId) {
        clearInterval(showerIntervalId);
    }
}

// Overlay close event listeners
closeOverlayBtn.addEventListener('click', closeLoveOverlay);
overlayBackdrop.addEventListener('click', closeLoveOverlay);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLoveOverlay();
    }
});

// Sound Settings Actions
function updateSoundToggleButton() {
    const iconOn = soundToggle.querySelector('.sound-icon-on');
    const iconOff = soundToggle.querySelector('.sound-icon-off');
    
    if (soundEnabled) {
        iconOn.classList.remove('hidden');
        iconOff.classList.add('hidden');
    } else {
        iconOn.classList.add('hidden');
        iconOff.classList.remove('hidden');
    }
}

soundToggle.addEventListener('click', (e) => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('denguin_sound_enabled', soundEnabled);
    updateSoundToggleButton();
    
    // Play a quick test sound if enabled
    if (soundEnabled) {
        initAudio();
        playChime('heart');
    }
    
    // Subtle visual response
    soundToggle.style.transform = 'scale(0.9)';
    setTimeout(() => {
        soundToggle.style.transform = '';
    }, 100);
});

// Main Heart Button Event
heartBtn.addEventListener('click', (e) => {
    loveCount++;
    updateLoveMeter(true);
    playChime('heart');

    // Find center of the heart button to emit particles
    const rect = heartBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    spawnBurst(x, y, 22);

    // Dynamic scale bounce logic
    heartBtn.style.transform = 'scale(0.88)';
    setTimeout(() => {
        heartBtn.style.transform = '';
    }, 80);
});

// Expression buttons (Kiss, Hug, Cafuné)
actionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const type = btn.getAttribute('data-type');
        playChime(type);
        
        // Visual indicator on the button
        btn.style.transform = 'scale(0.92) translateY(-2px)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);

        // Add 5 points to the lovemeter per action expression!
        loveCount += 5;
        updateLoveMeter(true);

        // Calculate click emitter location
        const rect = btn.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top;

        // Custom emoji shower based on action type
        let emojiPool = [];
        if (type === 'kiss') emojiPool = ['😘', '💋', '❤️', '🌹'];
        else if (type === 'hug') emojiPool = ['🤗', '🧸', '💖', '💝'];
        else if (type === 'cafune') emojiPool = ['💆‍♂️', '✨', '🌸', '💫'];

        // Spawn flying DOM emojis
        for (let i = 0; i < 8; i++) {
            const emojiEl = document.createElement('div');
            emojiEl.className = 'flying-emoji';
            emojiEl.textContent = emojiPool[Math.floor(Math.random() * emojiPool.length)];
            
            // Random target paths using CSS variables
            const targetX = (Math.random() - 0.5) * 350;
            const targetY = -(Math.random() * 250 + 150);
            const rotation = (Math.random() - 0.5) * 90;

            emojiEl.style.left = `${startX}px`;
            emojiEl.style.top = `${startY}px`;
            emojiEl.style.setProperty('--tx', `${targetX}px`);
            emojiEl.style.setProperty('--ty', `${targetY}px`);
            emojiEl.style.setProperty('--rot', `${rotation}deg`);

            document.body.appendChild(emojiEl);

            // Clean up DOM after animation
            emojiEl.addEventListener('animationend', () => {
                emojiEl.remove();
            });
        }

        // Also spawn particles at the button location
        spawnBurst(startX, startY, 12);
    });
});
