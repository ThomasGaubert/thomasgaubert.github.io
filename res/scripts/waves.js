const canvas = document.getElementById('wave-canvas');
const ctx = canvas.getContext('2d');

const CHARS = '~≈-—=_.·:;';
let cols, rows, fontSize, charW, charH;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  fontSize = Math.max(14, Math.min(18, window.innerWidth / 80));
  ctx.font = fontSize + 'px monospace';
  charW = ctx.measureText('M').width;
  charH = fontSize * 1.35;
  cols = Math.ceil(window.innerWidth / charW) + 1;
  rows = Math.ceil(window.innerHeight / charH) + 1;
}

const patterns = [
  (c, r, t) =>
    Math.sin(c * 0.06 + t * 0.0004 + r * 0.02) * 0.5 +
    Math.sin(r * 0.04 - t * 0.0003 + c * 0.02) * 0.3 +
    Math.sin(c * 0.03 + t * 0.00025) * 0.2,
  (c, r, t) => {
    const dx = c - cols / 2, dy = r - rows / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.sin(dist * 0.12 - t * 0.0006) * 0.6 +
           Math.sin(dist * 0.06 + t * 0.0003) * 0.4;
  },
  (c, r, t) =>
    Math.sin((c - r) * 0.08 + t * 0.0005) * 0.5 +
    Math.sin((c + r) * 0.05 - t * 0.0004) * 0.3 +
    Math.sin(r * 0.1 + t * 0.0003) * 0.2,
  (c, r, t) =>
    Math.sin(c * 0.09 + t * 0.0004) * Math.sin(r * 0.09 - t * 0.0003) * 0.7 +
    Math.sin((c + r) * 0.06 + t * 0.00025) * 0.3,
  (c, r, t) => {
    const dx = c - cols / 2, dy = r - rows / 2;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.sin(angle * 3 + dist * 0.08 - t * 0.0004) * 0.6 +
           Math.sin(dist * 0.05 + t * 0.0003) * 0.4;
  },
];

const cycleDur = 12000;
const fadeDur = 3000;

function draw(t) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.font = fontSize + 'px monospace';

  const totalCycle = cycleDur * patterns.length;
  const pos = (t % totalCycle) / cycleDur;
  const idx = Math.floor(pos);
  const next = (idx + 1) % patterns.length;
  const blend = pos - idx;

  const fadeStart = 1 - fadeDur / cycleDur;
  const mix = blend < fadeStart ? 0 : (blend - fadeStart) / (1 - fadeStart);
  const smoothMix = mix * mix * (3 - 2 * mix);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = c * charW;
      const py = r * charH;

      const vA = patterns[idx](c, r, t);
      const vB = patterns[next](c, r, t);
      const v = vA * (1 - smoothMix) + vB * smoothMix;

      const n = Math.max(0, Math.min(1, (v + 1) / 2));
      const ci = Math.floor(n * (CHARS.length - 1));
      let red, g, b;
      if (n < 0.5) {
        const t2 = n * 2;
        red = Math.floor(45 + t2 * (91 - 45));
        g = Math.floor(94 + t2 * (154 - 94));
        b = Math.floor(63 + t2 * (107 - 63));
      } else {
        const t2 = (n - 0.5) * 2;
        red = Math.floor(91 + t2 * (168 - 91));
        g = Math.floor(154 + t2 * (197 - 154));
        b = Math.floor(107 + t2 * (160 - 107));
      }
      ctx.fillStyle = `rgba(${red},${g},${b},${0.25 + n * 0.25})`;
      ctx.fillText(CHARS[ci], px, py);
    }
  }
  requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(draw);
