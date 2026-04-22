(function () {
  'use strict';

  // ─── Background: Neural Blobs + Mouse-reactive Grid ───────────────────────
  function initBgCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, raf;
    const mouse = { x: 0.5, y: 0.5 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const nodes = Array.from({ length: 32 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
    }));

    const blobs = [
      { x: 0.12, y: 0.18, r: 0.45, hue: 25,  sat: 70, sx: 0.0002,   sy: 0.00018 },
      { x: 0.82, y: 0.4,  r: 0.5,  hue: 18,  sat: 75, sx: -0.00022, sy: 0.00015 },
      { x: 0.3,  y: 0.75, r: 0.42, hue: 35,  sat: 65, sx: 0.00018,  sy: -0.0002 },
      { x: 0.7,  y: 0.9,  r: 0.38, hue: 260, sat: 50, sx: -0.00015, sy: -0.00012 },
    ];

    let t = 0;
    function draw() {
      t++;
      ctx.fillStyle = '#0a0706';
      ctx.fillRect(0, 0, w, h);

      blobs.forEach((b, i) => {
        b.x += b.sx; b.y += b.sy;
        if (b.x < -0.2 || b.x > 1.2) b.sx *= -1;
        if (b.y < -0.2 || b.y > 1.2) b.sy *= -1;
        const cx = b.x * w, cy = b.y * h;
        const rad = b.r * Math.min(w, h) * (1 + Math.sin(t * 0.004 + i) * 0.1);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        grad.addColorStop(0, `hsla(${b.hue}, ${b.sat}%, 55%, 0.28)`);
        grad.addColorStop(0.5, `hsla(${b.hue}, ${b.sat}%, 45%, 0.1)`);
        grad.addColorStop(1, 'hsla(0,0%,0%,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      ctx.strokeStyle = 'rgba(220, 180, 130, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 64;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      const mx = mouse.x * w;
      const my = mouse.y * h;

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      });

      ctx.strokeStyle = 'rgba(230, 175, 110, 0.18)';
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = (nodes[i].x - nodes[j].x) * w;
          const dy = (nodes[i].y - nodes[j].y) * h;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 180) {
            ctx.globalAlpha = (1 - d / 180) * 0.55;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x * w, nodes[i].y * h);
            ctx.lineTo(nodes[j].x * w, nodes[j].y * h);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      nodes.forEach(n => {
        const nx = n.x * w, ny = n.y * h;
        const dm = Math.sqrt((nx - mx) ** 2 + (ny - my) ** 2);
        const boost = Math.max(0, 1 - dm / 220);
        ctx.fillStyle = `rgba(245, 210, 150, ${0.5 + boost * 0.5})`;
        ctx.beginPath();
        ctx.arc(nx, ny, 1.6 + boost * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    });
    window.addEventListener('touchmove', function (e) {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX / window.innerWidth;
        mouse.y = e.touches[0].clientY / window.innerHeight;
      }
    }, { passive: true });
  }

  // ─── Hero: Rocket + Money Animation ───────────────────────────────────────
  function initRocketCanvas() {
    const canvas = document.getElementById('rocket-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, raf;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const container = canvas.parentElement;
      w = container.offsetWidth;
      h = container.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      tw: Math.random() * Math.PI * 2,
      sp: 0.02 + Math.random() * 0.04,
    }));

    const bills = Array.from({ length: 18 }, function (_, i) {
      return {
        x: Math.random(),
        y: Math.random() * 1.2 + 0.1,
        z: 0.3 + Math.random() * 0.7,
        rot: Math.random() * Math.PI * 2,
        rotSp: (Math.random() - 0.5) * 0.04,
        sp: 0.0015 + Math.random() * 0.002,
        sway: Math.random() * Math.PI * 2,
        kind: i % 3,
      };
    });

    const smoke = [];
    let t = 0;

    function draw() {
      t++;

      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0a0a14');
      bgGrad.addColorStop(0.6, '#1a0f0a');
      bgGrad.addColorStop(1, '#2a1509');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(w * 0.5, h * 1.1, 0, w * 0.5, h * 1.1, h * 0.9);
      glow.addColorStop(0, 'rgba(245, 180, 80, 0.35)');
      glow.addColorStop(0.5, 'rgba(200, 100, 40, 0.15)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      stars.forEach(function (s) {
        s.tw += s.sp;
        const a = Math.min(1, 0.3 + Math.sin(s.tw) * 0.3 + 0.3);
        ctx.fillStyle = `rgba(245, 220, 180, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const rx = w * 0.5 + Math.sin(t * 0.02) * 4;
      const ry = h * 0.5 + Math.sin(t * 0.03) * 6;
      const rScale = Math.min(w, h) / 400;

      ctx.save();
      ctx.translate(rx, ry);
      ctx.scale(rScale, rScale);

      // Flame
      const flameH = 90 + Math.sin(t * 0.4) * 18 + Math.random() * 10;
      const flameGrad = ctx.createLinearGradient(0, 60, 0, 60 + flameH);
      flameGrad.addColorStop(0, 'rgba(255, 240, 180, 1)');
      flameGrad.addColorStop(0.3, 'rgba(245, 170, 70, 0.95)');
      flameGrad.addColorStop(0.7, 'rgba(200, 80, 40, 0.5)');
      flameGrad.addColorStop(1, 'rgba(100, 30, 10, 0)');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-14, 60);
      ctx.quadraticCurveTo(-22 + Math.random() * 6, 60 + flameH * 0.5, -4, 60 + flameH);
      ctx.quadraticCurveTo(0, 60 + flameH + 6, 4, 60 + flameH);
      ctx.quadraticCurveTo(22 - Math.random() * 6, 60 + flameH * 0.5, 14, 60);
      ctx.closePath();
      ctx.fill();

      const coreGrad = ctx.createLinearGradient(0, 60, 0, 60 + flameH * 0.7);
      coreGrad.addColorStop(0, 'rgba(255, 255, 240, 0.9)');
      coreGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.moveTo(-7, 60);
      ctx.quadraticCurveTo(-10, 60 + flameH * 0.3, -2, 60 + flameH * 0.7);
      ctx.quadraticCurveTo(0, 60 + flameH * 0.75, 2, 60 + flameH * 0.7);
      ctx.quadraticCurveTo(10, 60 + flameH * 0.3, 7, 60);
      ctx.closePath();
      ctx.fill();

      // Body
      const bodyGrad = ctx.createLinearGradient(-20, 0, 20, 0);
      bodyGrad.addColorStop(0, '#e8d4b0');
      bodyGrad.addColorStop(0.5, '#fff4e0');
      bodyGrad.addColorStop(1, '#c8a878');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(-18, -20);
      ctx.lineTo(-18, 50);
      ctx.lineTo(18, 50);
      ctx.lineTo(18, -20);
      ctx.lineTo(18, -30);
      ctx.quadraticCurveTo(0, -68, -18, -30);
      ctx.lineTo(-18, -20);
      ctx.closePath();
      ctx.fill();

      // Nose accent
      ctx.fillStyle = '#d99a56';
      ctx.beginPath();
      ctx.moveTo(-18, -30);
      ctx.quadraticCurveTo(0, -68, 18, -30);
      ctx.lineTo(10, -20);
      ctx.quadraticCurveTo(0, -40, -10, -20);
      ctx.closePath();
      ctx.fill();

      // Porthole
      ctx.fillStyle = '#1a0d08';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b36030';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#f5d296';
      ctx.font = 'bold 14px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);

      // Stripe
      ctx.fillStyle = '#b36030';
      ctx.fillRect(-18, 20, 36, 4);

      // Fins
      ctx.fillStyle = '#b36030';
      ctx.beginPath();
      ctx.moveTo(-18, 35); ctx.lineTo(-32, 55); ctx.lineTo(-18, 55);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(18, 35); ctx.lineTo(32, 55); ctx.lineTo(18, 55);
      ctx.closePath(); ctx.fill();

      // Bottom ring
      ctx.fillStyle = '#8a4a28';
      ctx.fillRect(-14, 50, 28, 10);

      ctx.restore();

      // Smoke particles
      if (t % 2 === 0) {
        smoke.push({
          x: rx + (Math.random() - 0.5) * 12,
          y: ry + 50 * rScale + 90 * rScale,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 1 + Math.random() * 1.5,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          size: 8 + Math.random() * 10,
        });
      }
      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i];
        p.x += p.vx; p.y += p.vy; p.life++;
        if (p.life > p.maxLife) { smoke.splice(i, 1); continue; }
        const lifeRatio = p.life / p.maxLife;
        const a = (1 - lifeRatio) * 0.25;
        ctx.fillStyle = `rgba(180, 140, 100, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + lifeRatio * 2), 0, Math.PI * 2);
        ctx.fill();
      }

      // Money / bills / coins
      bills.forEach(function (b) {
        b.y -= b.sp * b.z;
        b.sway += 0.03;
        b.rot += b.rotSp;
        if (b.y < -0.15) { b.y = 1.15; b.x = Math.random(); }
        const bx = (b.x + Math.sin(b.sway) * 0.02) * w;
        const by = b.y * h;
        const size = 18 * b.z;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(b.rot);
        ctx.globalAlpha = 0.4 + b.z * 0.5;

        if (b.kind === 0) {
          const g = ctx.createLinearGradient(-size * 1.4, 0, size * 1.4, 0);
          g.addColorStop(0, '#2d5a3a'); g.addColorStop(0.5, '#4a8560'); g.addColorStop(1, '#2d5a3a');
          ctx.fillStyle = g;
          ctx.fillRect(-size * 1.4, -size * 0.7, size * 2.8, size * 1.4);
          ctx.strokeStyle = '#7fb090'; ctx.lineWidth = 0.8;
          ctx.strokeRect(-size * 1.4, -size * 0.7, size * 2.8, size * 1.4);
          ctx.fillStyle = '#d4f0c8';
          ctx.font = `bold ${size}px -apple-system, system-ui, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 1);
        } else if (b.kind === 1) {
          const g = ctx.createRadialGradient(-size * 0.3, -size * 0.3, 0, 0, 0, size);
          g.addColorStop(0, '#ffe6a8'); g.addColorStop(0.6, '#e8b866'); g.addColorStop(1, '#a06d2e');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#7a4f1f'; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.fillStyle = '#7a4f1f';
          ctx.font = `bold ${size * 1.1}px -apple-system, system-ui, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 1);
        } else {
          ctx.fillStyle = 'rgba(245, 210, 150, 0.9)';
          ctx.font = `bold ${size * 2}px -apple-system, system-ui, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 1);
        }
        ctx.restore();
      });
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('resize', resize);
  }

  // ─── Smooth nav link scrolling ─────────────────────────────────────────────
  function initNav() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ─── Scroll-triggered fade-in ─────────────────────────────────────────────
  function initFadeIn() {
    const els = document.querySelectorAll('.card, .quote, .final-cta-title, .final-cta-sub');
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      obs.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initBgCanvas();
    initRocketCanvas();
    initNav();
    initFadeIn();
  });
})();
