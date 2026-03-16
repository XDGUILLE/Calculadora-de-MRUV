/* ───────────── Helpers seguros ───────────── */

const get = id => parseFloat(document.getElementById(id).value);
const getU = id => parseFloat(document.getElementById(id).value);

function getVal(inputId, unitId) {
    const raw = get(inputId);
    const unit = getU(unitId);

    if (isNaN(raw)) return NaN;

    return raw * unit; // convierte a unidades base (SI)
}

/* ───────────── Mostrar resultado ───────────── */

function mostrarResultado(resultado, unidad){
    const el = document.getElementById("resultado");

    if (isNaN(resultado) || !isFinite(resultado)) {
        el.value = "⚠ Datos inválidos";
        el.className = "error";
        return;
    }

    el.value = resultado.toFixed(4) + " " + unidad;
    el.className = "flash";

    spawnParticles();

    setTimeout(() => {
        el.className = "";
    }, 600);

    // Muestra animacion del carrito si animation.js esta cargado
    if (typeof window.triggerAnimation === "function") {
        window.triggerAnimation({ resultado, unidad});
    }
}

/* ───────────── FUNCIÓN PRINCIPAL (compatible con tu HTML) ───────────── */

function calcular(tipo){

    const Vo = getVal("Vo", "voUnit");
    const Vf = getVal("Vf", "vfUnit");
    const t  = getVal("t",  "tUnit");
    const d  = getVal("d",  "dUnit");
    const a  = getVal("a",  "aUnit");

    let res = NaN;
    let unidad = "";

    switch(tipo){

        case "a":
            if (!isNaN(Vf) && !isNaN(Vo) && !isNaN(t) && t !== 0) {
                res = (Vf - Vo) / t;
                unidad = "m/s²";
            }
        break;

        case "Vf":
            if (!isNaN(Vo) && !isNaN(a) && !isNaN(t)) {
                res = Vo + (a * t);
                unidad = "m/s";
            }
        break;

        case "d_sinA":
            if (!isNaN(Vo) && !isNaN(Vf) && !isNaN(t)) {
                res = ((Vo + Vf) / 2) * t;
                unidad = "m";
            }
        break;

        case "d_sinVf":
            if (!isNaN(Vo) && !isNaN(a) && !isNaN(t)) {
                res = Vo * t + (0.5 * a * t * t);
                unidad = "m";
            }
        break;

        case "Vf2":
            if (!isNaN(Vo) && !isNaN(a) && !isNaN(d)) {
                res = (Vo * Vo) + (2 * a * d);
                unidad = "m²/s²";
            }
        break;
    }

    mostrarResultado(res, unidad);
}

/* ───────────── Limpiar ───────────── */

function limpiar(){
    ["Vo","Vf","t","d","a"].forEach(id => {
        document.getElementById(id).value = "";
    });

    const el = document.getElementById("resultado");
    el.value = "";
    el.className = "";

    // Resetear animacion si animation.js esta cargado
    if (typeof window.resetAnimation === "function") {
        window.resetAnimation();
    }
}

/* ───────────── Sistema de partículas ───────────── */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

function spawnParticles() {
    const el = document.getElementById('resultado');
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3;

        particles.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            size: 2 + Math.random() * 3,
            color: Math.random() > 0.5 ? '#4af0b0' : '#5b8fff'
        });
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(p => p.alpha > 0.02);

    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.alpha *= 0.93;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animateParticles);
}

// Resetear animacion si animation.js esta cargado
if (typeof window.resetAnimation === "function") {
    window.resetAnimation();
}
