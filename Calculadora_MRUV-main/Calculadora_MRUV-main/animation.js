/* ============================================================
   animation.js  –  Animación MRUV
   Carrito sobre plano con movimiento físicamente correcto.
   Se comunica con app.js mediante window.triggerAnimation()
   y window.resetAnimation().
   ============================================================ */

(function () {

  /* ── Constantes visuales ──────────────────────────────────── */
  const COLORS = {
    track:       '#1e2235',
    trackLine:   '#252a3a',
    trackAccent: '#4af0b0',
    cart:        '#1a2540',
    cartBorder:  '#5b8fff',
    cartTop:     '#4af0b0',
    wheel:       '#0a0c12',
    wheelRim:    '#4af0b0',
    axle:        '#252a3a',
    smoke:       'rgba(91,143,255,',
    label:       '#e8eaf0',
    labelMuted:  '#6b7290',
    accelArrow:  '#ff5f87',
    veloArrow:   '#4af0b0',
    grid:        'rgba(74,240,176,0.06)',
  };

  const CART_W  = 72;   // ancho del carrito px
  const CART_H  = 34;   // alto del carrito px
  const WHEEL_R = 10;   // radio rueda px
  const TRACK_Y_RATIO = 0.62; // posición vertical del plano (% canvas height)

  /* ── Estado de la animación ───────────────────────────────── */
  let state = {
    running:   false,
    vo:        0,      // m/s  (velocidad inicial normalizada a la animación)
    a:         0,      // m/s² (aceleración normalizada)
    t:         0,      // tiempo transcurrido (s, interno)
    duration:  4,      // duración total de la animación (s)
    x:         0,      // posición actual del carrito (px en canvas)
    xStart:    0,      // posición inicial
    xEnd:      0,      // posición final estimada
    raf:       null,
    lastTs:    null,
    wheelAngle:0,
    particles: [],
    formula:   null,   // última fórmula usada
    resultLabel: '',
  };

  /* ── Canvas setup ─────────────────────────────────────────── */
  let canvas, ctx, W, H, trackY;

  function initCanvas() {
    // Buscamos el canvas de animación (id="animCanvas")
    canvas = document.getElementById('animCanvas');
    if (!canvas) return false;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    return true;
  }

  function resize() {
    if (!canvas) return;
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    trackY = H * TRACK_Y_RATIO;
    if (!state.running) drawIdle();
  }

  /* ── API pública (llamada desde app.js) ───────────────────── */

  /**
   * triggerAnimation({ vo, vf, a, t, d, tipo, valor, unidad })
   * Recibe los valores en SI directamente desde app.js
   */
  window.triggerAnimation = function (params) {
    if (!canvas) return;

    cancelAnimationFrame(state.raf);

    // Extraemos lo que necesitamos para la cinemática
    // app.js llama esto con { valor, unidad } + los campos del DOM
    const voRaw = parseFloat(document.getElementById('Vo')?.value) || 0;
    const vfRaw = parseFloat(document.getElementById('Vf')?.value) || 0;
    const aRaw  = parseFloat(document.getElementById('a')?.value)  || 0;
    const tRaw  = parseFloat(document.getElementById('t')?.value)  || 4;

    // Normalizamos velocidades y aceleración a escala visual
    // (no importan las unidades reales, solo la proporción)
    const SCALE = 40;  // px por unidad de velocidad en la animación
    const vo_vis = voRaw * SCALE;
    const a_vis  = aRaw  * SCALE;
    const dur    = Math.min(Math.max(Math.abs(tRaw), 1), 8); // clamp 1-8s

    state.running    = true;
    state.vo         = vo_vis;
    state.a          = a_vis;
    state.t          = 0;
    state.duration   = dur;
    state.lastTs     = null;
    state.wheelAngle = 0;
    state.particles  = [];
    state.resultLabel = `${params.valor !== undefined ? (Math.round(params.valor * 100) / 100) : ''} ${params.unidad || ''}`;

    // Posición inicial: si hay aceleración negativa empezamos más a la derecha
    state.xStart = a_vis < 0 ? W * 0.65 : W * 0.12;
    state.x      = state.xStart;

    // Estimamos xEnd para saber el rango visual
    const xFinal = state.xStart + vo_vis * dur + 0.5 * a_vis * dur * dur;
    state.xEnd = xFinal;

    state.raf = requestAnimationFrame(animLoop);
  };

  window.resetAnimation = function () {
    if (!canvas) return;
    cancelAnimationFrame(state.raf);
    state.running    = false;
    state.particles  = [];
    state.a          = 0;
    state.vo         = 0;
    state.resultLabel = '';
    drawIdle();
  };

  /* ── Loop principal ───────────────────────────────────────── */

  function animLoop(ts) {
    if (!state.lastTs) state.lastTs = ts;
    const dt = Math.min((ts - state.lastTs) / 1000, 0.05); // delta en segundos
    state.lastTs = ts;

    state.t += dt;

    // Cinemática real: x = xStart + vo*t + 0.5*a*t²
    const tClamped = Math.min(state.t, state.duration);
    state.x = state.xStart + state.vo * tClamped + 0.5 * state.a * tClamped * tClamped;

    // Velocidad instantánea: v = vo + a*t
    const vInst = state.vo + state.a * tClamped;

    // Girar ruedas proporcional a la velocidad
    state.wheelAngle += vInst * dt * 0.08;

    // Partículas de humo/rastro
    if (Math.abs(vInst) > 2 && Math.random() < 0.4) {
      spawnTrailParticle(state.x, vInst);
    }

    draw(vInst);
    updateTrailParticles();

    if (state.t < state.duration + 0.5) {
      state.raf = requestAnimationFrame(animLoop);
    } else {
      state.running = false;
      // Idle con el carrito en su posición final
      drawIdle(state.x);
    }
  }

  /* ── Render principal ─────────────────────────────────────── */

  function draw(vInst) {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawTrack();
    drawTrailParticles();
    drawDistanceLine();
    drawCart(state.x, vInst);
    drawLabels(vInst);
  }

  function drawIdle(xPos) {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawTrack();
    const x = xPos !== undefined ? xPos : W * 0.12;
    drawCart(x, 0);
    drawIdleLabel();
  }

  /* ── Componentes visuales ─────────────────────────────────── */

  function drawBackground() {
    // Fondo sólido oscuro
    ctx.fillStyle = '#0d1018';
    ctx.fillRect(0, 0, W, H);

    // Líneas de cuadrícula verticales tenues
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  function drawTrack() {
    const y = trackY;
    const pad = 10;

    // Sombra del plano
    ctx.shadowColor = 'rgba(74,240,176,0.15)';
    ctx.shadowBlur  = 12;

    // Plano principal
    ctx.fillStyle = COLORS.track;
    ctx.beginPath();
    ctx.roundRect(pad, y, W - pad * 2, 18, 4);
    ctx.fill();

    // Línea superior del plano (acento verde)
    ctx.strokeStyle = COLORS.trackAccent;
    ctx.lineWidth   = 2;
    ctx.shadowColor = 'rgba(74,240,176,0.5)';
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(W - pad, y);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Marcas de distancia en el plano (cada ~60px)
    ctx.strokeStyle = COLORS.trackLine;
    ctx.lineWidth   = 1;
    for (let mx = pad + 30; mx < W - pad; mx += 60) {
      ctx.beginPath();
      ctx.moveTo(mx, y);
      ctx.lineTo(mx, y + 10);
      ctx.stroke();
    }

    // Etiqueta de plano
    ctx.fillStyle   = COLORS.labelMuted;
    ctx.font        = '10px Space Mono, monospace';
    ctx.textAlign   = 'right';
    ctx.fillText('plano de referencia', W - pad - 4, y + 14);
  }

  function drawCart(cx, vInst) {
    const y   = trackY;
    const x   = cx;
    const cw  = CART_W;
    const ch  = CART_H;
    const top = y - ch - WHEEL_R * 0.6;

    // Inclinación leve según aceleración
    const tilt = Math.max(-0.08, Math.min(0.08, state.a * 0.001));

    ctx.save();
    ctx.translate(x + cw / 2, top + ch / 2);
    ctx.rotate(tilt);
    ctx.translate(-(x + cw / 2), -(top + ch / 2));

    // Sombra del carrito
    ctx.shadowColor = 'rgba(91,143,255,0.3)';
    ctx.shadowBlur  = 14;

    // Cuerpo del carrito
    ctx.fillStyle = COLORS.cart;
    ctx.strokeStyle = COLORS.cartBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, top, cw, ch, 6);
    ctx.fill();
    ctx.stroke();

    // Franja superior de color
    ctx.fillStyle = COLORS.cartTop;
    ctx.beginPath();
    ctx.roundRect(x + 2, top + 2, cw - 4, 5, [4, 4, 0, 0]);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Ventanita
    ctx.fillStyle   = 'rgba(91,143,255,0.15)';
    ctx.strokeStyle = 'rgba(91,143,255,0.4)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.roundRect(x + cw * 0.55, top + 8, cw * 0.3, ch * 0.45, 3);
    ctx.fill();
    ctx.stroke();

    // Ruedas
    drawWheel(x + 14,      y - 2);
    drawWheel(x + cw - 14, y - 2);

    // Flecha de velocidad
    if (Math.abs(vInst) > 1) {
      drawArrow(
        x + cw / 2, top - 12,
        x + cw / 2 + Math.sign(vInst) * Math.min(Math.abs(vInst) * 0.4, 50), top - 12,
        COLORS.veloArrow, 'v'
      );
    }

    // Flecha de aceleración (si hay)
    if (Math.abs(state.a) > 0.5) {
      drawArrow(
        x + cw / 2, top - 26,
        x + cw / 2 + Math.sign(state.a) * Math.min(Math.abs(state.a) * 0.8, 40), top - 26,
        COLORS.accelArrow, 'a'
      );
    }

    ctx.restore();
  }

  function drawWheel(cx, cy) {
    const r = WHEEL_R;

    // Neumático
    ctx.fillStyle   = COLORS.wheel;
    ctx.strokeStyle = COLORS.wheelRim;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rayos (rotan con state.wheelAngle)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.wheelAngle);
    ctx.strokeStyle = COLORS.wheelRim;
    ctx.lineWidth   = 1.5;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * (r - 2), Math.sin(angle) * (r - 2));
      ctx.stroke();
    }
    // Centro
    ctx.fillStyle = COLORS.wheelRim;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawArrow(x1, y1, x2, y2, color, labelText) {
    if (Math.abs(x2 - x1) < 4) return;
    const headLen = 7;
    const angle   = Math.atan2(y2 - y1, x2 - x1);

    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 6;

    // Línea
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Punta
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Etiqueta
    ctx.fillStyle = color;
    ctx.font      = 'bold 10px Space Mono, monospace';
    ctx.textAlign = x2 > x1 ? 'left' : 'right';
    ctx.fillText(labelText, x2 + (x2 > x1 ? 4 : -4), y2 + 4);
  }

  function drawDistanceLine() {
    if (!state.running || state.t < 0.1) return;
    const y    = trackY - CART_H - WHEEL_R * 0.6 - 32;
    const xNow = state.x + CART_W / 2;
    const xSt  = state.xStart + CART_W / 2;

    ctx.strokeStyle = 'rgba(74,240,176,0.35)';
    ctx.lineWidth   = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(xSt,  y);
    ctx.lineTo(xNow, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Corchetes
    [[xSt, '|'], [xNow, '|']].forEach(([x]) => {
      ctx.strokeStyle = 'rgba(74,240,176,0.5)';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y - 4);
      ctx.lineTo(x, y + 4);
      ctx.stroke();
    });

    // Texto distancia
    const dist = Math.abs(state.x - state.xStart).toFixed(0);
    ctx.fillStyle = 'rgba(74,240,176,0.7)';
    ctx.font      = '10px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Δx ≈ ${dist}px`, (xSt + xNow) / 2, y - 8);
  }

  function drawLabels(vInst) {
    const pad = 14;

    // Tiempo transcurrido
    ctx.fillStyle = COLORS.labelMuted;
    ctx.font      = '11px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`t = ${state.t.toFixed(2)} s`, pad, 20);

    // Velocidad instantánea
    ctx.fillStyle = COLORS.veloArrow;
    ctx.fillText(`v = ${(vInst / 40).toFixed(2)}`, pad, 36);

    // Resultado calculado
    if (state.resultLabel) {
      ctx.fillStyle = '#e8eaf0';
      ctx.font      = 'bold 11px Space Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(state.resultLabel, W - pad, 20);
    }

    // Leyenda flechas
    ctx.font      = '9px Space Mono, monospace';
    ctx.textAlign = 'left';

    ctx.fillStyle = COLORS.veloArrow;
    ctx.fillText('▶ velocidad', pad, H - 14);

    ctx.fillStyle = COLORS.accelArrow;
    ctx.fillText('▶ aceleración', pad + 80, H - 14);
  }

  function drawIdleLabel() {
    ctx.fillStyle = COLORS.labelMuted;
    ctx.font      = '11px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Calculá un valor para ver la animación', W / 2, H - 14);
  }

  /* ── Partículas de rastro ─────────────────────────────────── */

  function spawnTrailParticle(cartX, vInst) {
    const side  = vInst > 0 ? cartX : cartX + CART_W;
    const baseY = trackY - WHEEL_R;
    state.particles.push({
      x: side,
      y: baseY - 4 + Math.random() * 8,
      vx: -Math.sign(vInst) * (0.3 + Math.random() * 0.8),
      vy: -(0.2 + Math.random() * 0.5),
      alpha: 0.6 + Math.random() * 0.3,
      r: 2 + Math.random() * 3,
    });
  }

  function updateTrailParticles() {
    state.particles = state.particles.filter(p => p.alpha > 0.02);
    for (const p of state.particles) {
      p.x     += p.vx;
      p.y     += p.vy;
      p.vy    += 0.02;
      p.alpha *= 0.88;
      p.r     *= 0.97;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = COLORS.smoke + p.alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawTrailParticles() {
    // Se llama antes del carrito para que quede detrás
    // (updateTrailParticles dibuja y actualiza en el mismo paso)
  }

  /* ── Init ─────────────────────────────────────────────────── */

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (initCanvas()) drawIdle();
    });
  } else {
    if (initCanvas()) drawIdle();
  }

})();