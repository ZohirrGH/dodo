// Pointer effects for the redesign: cursor glow, card spotlight, 3D tilt, button ripples, login parallax.
// Plain DOM code with event delegation, so no component needs to be touched.
export function initGxFx() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const TILT = ".gx-stat-card, .gx-hover-lift, .gx-record-card, .gx-login-card, .gx-tilt";

  let glow = document.querySelector(".gx-cursor-glow");
  if (!glow) {
    glow = document.createElement("div");
    glow.className = "gx-cursor-glow";
    document.body.appendChild(glow);
  }

  let raf = 0, lx = 0, ly = 0, tilted = null;

  const frame = () => {
    raf = 0;
    glow.style.transform = `translate(${lx}px, ${ly}px)`;
    glow.style.opacity = "1";
    root.style.setProperty("--px", ((lx / window.innerWidth) * 2 - 1).toFixed(3));
    root.style.setProperty("--py", ((ly / window.innerHeight) * 2 - 1).toFixed(3));

    const el = document.elementFromPoint(lx, ly);
    const card = el && el.closest(".gx-glass-card");
    if (card) {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${lx - r.left}px`);
      card.style.setProperty("--my", `${ly - r.top}px`);
    }

    const t = !reduce && el ? el.closest(TILT) : null;
    if (tilted && tilted !== t) tilted.style.transform = "";
    if (t) {
      const r = t.getBoundingClientRect();
      const x = (lx - r.left) / r.width - 0.5;
      const y = (ly - r.top) / r.height - 0.5;
      const max = t.classList.contains("gx-login-card") ? 5 : 8;
      t.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) scale(1.02)`;
    }
    tilted = t;
  };

  const onMove = (e) => {
    if (e.pointerType === "touch") return;
    lx = e.clientX; ly = e.clientY;
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const onLeave = () => {
    glow.style.opacity = "0";
    if (tilted) { tilted.style.transform = ""; tilted = null; }
  };

  const onDown = (e) => {
    const btn = e.target.closest && e.target.closest(".gx-btn");
    if (!btn || btn.disabled || reduce) return;
    const r = btn.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 2;
    const s = document.createElement("span");
    s.className = "gx-ripple";
    s.style.width = s.style.height = `${d}px`;
    s.style.left = `${e.clientX - r.left - d / 2}px`;
    s.style.top = `${e.clientY - r.top - d / 2}px`;
    btn.appendChild(s);
    setTimeout(() => s.remove(), 650);
  };

  document.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerdown", onDown, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);

  return () => {
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerdown", onDown);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    if (raf) cancelAnimationFrame(raf);
    glow.remove();
  };
}
