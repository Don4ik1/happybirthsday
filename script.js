const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateTitle() {
  const title = document.querySelector('.hero h1');
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  let index = 0;
  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    [...node.textContent].forEach((character) => {
      if (/\s/.test(character)) fragment.append(document.createTextNode(character));
      else {
        const letter = document.createElement('span');
        letter.className = 'title-letter';
        letter.style.setProperty('--letter-index', index++);
        letter.textContent = character;
        fragment.append(letter);
      }
    });
    node.replaceWith(fragment);
  });
}
animateTitle();

const customCursor = document.getElementById('customCursor');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (finePointer && !reduceMotion) {
  window.addEventListener('pointermove', (event) => {
    customCursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
  }, { passive: true });
  document.querySelectorAll('.pill-button, .open-letter').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const box = button.getBoundingClientRect();
      const dx = (event.clientX - box.left - box.width / 2) * .11;
      const dy = (event.clientY - box.top - box.height / 2) * .13;
      button.style.transform = `translate(${dx}px,${dy}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
}

document.querySelectorAll('.balloon').forEach((balloon) => balloon.addEventListener('click', (event) => {
  if (balloon.classList.contains('popped')) return;
  const rect = balloon.getBoundingClientRect();
  balloon.classList.add('popped');
  launchConfetti(24);
  launchFireworksAt(rect.left + rect.width / 2, rect.top + rect.height / 3);
  setTimeout(() => balloon.remove(), 420);
}));

const cakeButton = document.getElementById('cakeButton');
cakeButton.addEventListener('click', () => {
  const blown = cakeButton.classList.toggle('is-blown');
  document.getElementById('cakePrompt').textContent = blown ? 'Желание загадано! С днём рождения!' : 'Задуй свечи и загадай желание';
  if (blown) {
    launchConfetti(110);
    launchFireworks();
  }
});

const confettiCanvas = document.getElementById('confettiLayer');
const confettiContext = confettiCanvas.getContext('2d');
const confettiColors = ['#ad5968', '#d7b16c', '#72816d', '#e8beb9', '#f7e7c5'];
let confettiPieces = [];
let confettiFrame = 0;
let lastConfettiFrame = 0;

function resizeConfetti() {
  const scale = Math.min(window.devicePixelRatio || 1, 1.5);
  confettiCanvas.width = Math.round(innerWidth * scale);
  confettiCanvas.height = Math.round(innerHeight * scale);
  confettiCanvas.style.width = `${innerWidth}px`;
  confettiCanvas.style.height = `${innerHeight}px`;
  confettiContext.setTransform(scale, 0, 0, scale, 0, 0);
  const amount = innerWidth < 600 ? 12 : 28;
  confettiPieces = Array.from({ length: amount }, () => makeConfettiPiece(true));
}

function makeConfettiPiece(spreadAcrossScreen = false) {
  return {
    x: Math.random() * innerWidth,
    y: spreadAcrossScreen ? Math.random() * innerHeight : -12 - Math.random() * 60,
    width: 3 + Math.random() * 5,
    height: 5 + Math.random() * 7,
    speed: 22 + Math.random() * 58,
    sway: 10 + Math.random() * 30,
    phase: Math.random() * Math.PI * 2,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - .5) * 3.8,
    opacity: .42 + Math.random() * .38,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
  };
}

function drawConfetti(timestamp = 0) {
  confettiFrame = 0;
  if (document.hidden || reduceMotion) return;
  if (timestamp - lastConfettiFrame < 30) {
    confettiFrame = requestAnimationFrame(drawConfetti);
    return;
  }
  const elapsed = Math.min((timestamp - lastConfettiFrame) / 1000, .05);
  lastConfettiFrame = timestamp;
  confettiContext.clearRect(0, 0, innerWidth, innerHeight);
  confettiPieces.forEach((piece) => {
    piece.y += piece.speed * elapsed;
    piece.x += Math.sin(timestamp / 1100 + piece.phase) * piece.sway * elapsed;
    piece.rotation += piece.spin * elapsed;
    if (piece.y > innerHeight + 16) Object.assign(piece, makeConfettiPiece());
    confettiContext.save();
    confettiContext.globalAlpha = piece.opacity;
    confettiContext.fillStyle = piece.color;
    confettiContext.translate(piece.x, piece.y);
    confettiContext.rotate(piece.rotation);
    confettiContext.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
    confettiContext.restore();
  });
  confettiFrame = requestAnimationFrame(drawConfetti);
}

function startConfetti() {
  if (!reduceMotion && !document.hidden && !confettiFrame) {
    lastConfettiFrame = performance.now();
    confettiFrame = requestAnimationFrame(drawConfetti);
  }
}
if (!reduceMotion) {
  resizeConfetti();
  startConfetti();
  window.addEventListener('resize', resizeConfetti, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(confettiFrame);
      confettiFrame = 0;
    } else startConfetti();
  });
}

const letter = document.getElementById('letterCard');
const letterContent = document.querySelector('.wish-content');
document.getElementById('openLetter').addEventListener('click', () => {
  letter.setAttribute('aria-hidden', 'false');
  letter.classList.add('visible');
  letterContent.style.opacity = '0';
  letterContent.style.transform = 'scale(.96)';
  setTimeout(() => launchConfetti(), 280);
});
function closeLetter() {
  letter.classList.remove('visible');
  letter.setAttribute('aria-hidden', 'true');
  letterContent.style.opacity = '';
  letterContent.style.transform = '';
}
document.querySelector('.close-letter').addEventListener('click', closeLetter);

const lightbox = document.getElementById('lightbox');
const photoQueue = [...document.querySelectorAll('.gallery-item img')];
let currentPhotoIndex = 0;
function showPhoto(index, animate = true) {
  currentPhotoIndex = (index + photoQueue.length) % photoQueue.length;
  const image = photoQueue[currentPhotoIndex];
  const card = image.closest('.gallery-item');
  const postcard = lightbox.querySelector('.postcard');
  const enlargedImage = lightbox.querySelector('.postcard-image img');
  enlargedImage.src = image.src;
  enlargedImage.alt = image.alt;
  const caption = lightbox.querySelector('.postcard-caption');
  caption.textContent = card.dataset.caption || 'Пусть впереди будет много счастливых дней вместе.';
  caption.hidden = false;
  if (animate) {
    postcard.classList.remove('photo-pop');
    void postcard.offsetWidth;
    postcard.classList.add('photo-pop');
  }
}
document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', (event) => {
    const image = event.target.closest('img') || item.querySelector('img');
    showPhoto(photoQueue.indexOf(image), false);
    lightbox.showModal();
    launchConfetti(28);
  });
  if (finePointer && !reduceMotion) {
    item.addEventListener('pointermove', (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      item.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-3px)`;
    });
    item.addEventListener('pointerleave', () => { item.style.transform = ''; });
  }
});
document.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
document.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(currentPhotoIndex - 1));
document.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(currentPhotoIndex + 1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1);
  if (event.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
});
let swipeStartX = 0;
lightbox.addEventListener('touchstart', (event) => { swipeStartX = event.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', (event) => {
  const delta = event.changedTouches[0].clientX - swipeStartX;
  if (Math.abs(delta) > 55) showPhoto(currentPhotoIndex + (delta < 0 ? 1 : -1));
}, { passive: true });

if (finePointer && !reduceMotion) {
  let parallaxFrame = 0;
  const movePhotoDepth = () => {
    parallaxFrame = 0;
    document.querySelectorAll('.photo-frame img, .gallery-item.in-view img').forEach((image) => {
      const rect = image.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const shift = Math.max(-7, Math.min(7, (innerHeight / 2 - (rect.top + rect.height / 2)) * .018));
      image.style.translate = `0 ${shift}px`;
    });
  };
  window.addEventListener('scroll', () => {
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(movePhotoDepth);
  }, { passive: true });
}

function launchConfetti(count = 80) {
  if (reduceMotion) return;
  const colors = ['#ad5968', '#d7b16c', '#72816d', '#e8beb9', '#fffaf2'];
  const pieceCount = innerWidth < 600 ? Math.min(count, 48) : count;
  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement('i');
    piece.style.cssText = `position:fixed;z-index:15;left:${Math.random() * 100}vw;top:-12px;width:${5 + Math.random() * 6}px;height:${8 + Math.random() * 8}px;background:${colors[i % colors.length]};pointer-events:none;border-radius:2px;transform:rotate(${Math.random() * 360}deg);`;
    document.body.append(piece);
    const duration = 1700 + Math.random() * 1700;
    const drift = (Math.random() - .5) * 230;
    const animation = piece.animate([
      { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate3d(${drift}px,${innerHeight + 60}px,0) rotate(${540 + Math.random() * 900}deg)`, opacity: 0.1 }
    ], { duration, easing: 'cubic-bezier(.2,.65,.4,1)' });
    animation.onfinish = () => piece.remove();
  }
}

function launchFireworksAt(x, y) {
  const burst = document.createElement('div');
  burst.className = 'firework-burst';
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  const colors = ['#ad5968', '#d7b16c', '#72816d', '#e8beb9', '#fffaf2'];
  for (let i = 0; i < 18; i++) {
    const spark = document.createElement('i');
    const angle = Math.PI * 2 * i / 18;
    const distance = 38 + Math.random() * 62;
    spark.className = 'firework-spark';
    spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    spark.style.setProperty('--spark-color', colors[i % colors.length]);
    burst.append(spark);
  }
  document.body.append(burst);
  setTimeout(() => burst.remove(), 1150);
}

function launchFireworks() {
  launchFireworksAt(innerWidth * .29, innerHeight * .32);
  setTimeout(() => launchFireworksAt(innerWidth * .7, innerHeight * .26), 180);
  setTimeout(() => launchFireworksAt(innerWidth * .5, innerHeight * .38), 360);
}

if (!reduceMotion) setTimeout(() => launchConfetti(110), 850);
