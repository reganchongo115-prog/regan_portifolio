(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lang = () => (document.documentElement.lang === "en" ? "en" : "pt");

  /* ---------- Paletas ---------- */
  const btns = $$(".sw");
  const setPalette = (name) => {
    if (name === "laboratorio") delete document.documentElement.dataset.palette;
    else document.documentElement.dataset.palette = name;
    btns.forEach((b) => b.setAttribute("aria-pressed", b.dataset.pal === name));
    try { localStorage.setItem("palette-regan", name); } catch (_) {}
  };
  btns.forEach((b) => b.addEventListener("click", () => setPalette(b.dataset.pal)));
  let saved = "laboratorio";
  try { saved = localStorage.getItem("palette-regan") || saved; } catch (_) {}
  setPalette(saved);

  /* ---------- Barra de progresso ---------- */
  const bar = $(".progress");
  const updateBar = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", updateBar, { passive: true });
  updateBar();

  /* ---------- Revelação ao fazer scroll ---------- */
  const targets = $$(".sec-head, .statement, .facts, .motto, .skill-list, .project-list, .contact-intro, .form, .service-grid, .comp-grid");
  targets.forEach((el, i) => { el.classList.add("reveal"); el.style.setProperty("--d", `${(i % 3) * 0.12}s`); });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  targets.forEach((el) => io.observe(el));
  if (reduce) targets.forEach((el) => el.classList.add("on"));

  /* ---------- Linha temporal do percurso ---------- */
  const tl = $(".timeline");
  if (tl) {
    if (reduce) tl.classList.add("on");
    else {
      const tlo = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { tl.classList.add("on"); tlo.disconnect(); } });
      }, { threshold: 0.2 });
      tlo.observe(tl);
    }
  }

  /* ---------- Terminal: escreve os comandos quando fica visível ---------- */
  const term = $(".term");
  const lines = $$(".term-body > p", term);
  const typeAll = () => {
    const seq = lines.map((el) => {
      const cmd = el.querySelector(".cmd");
      const full = cmd ? cmd.dataset[lang()] || cmd.textContent : el.dataset[lang()] || el.textContent;
      return { el, target: cmd || el, full, isCmd: !!cmd };
    });
    seq.forEach((s) => { s.target.textContent = ""; });
    let i = 0, c = 0;
    const tick = () => {
      if (i >= seq.length) return;
      const s = seq[i];
      c++;
      s.target.textContent = s.full.slice(0, c);
      if (c >= s.full.length) {
        if (s.isCmd) s.target.classList.remove("cursor-blink");
        i++; c = 0;
        setTimeout(tick, s.isCmd ? 260 : 120);
      } else {
        if (s.isCmd) s.target.classList.add("cursor-blink");
        setTimeout(tick, 28);
      }
    };
    tick();
  };
  if (term) {
    if (reduce) {
      // mostra o texto final sem animação
      lines.forEach((el) => {
        const cmd = el.querySelector(".cmd");
        if (cmd) cmd.textContent = cmd.dataset[lang()] || cmd.textContent;
      });
    } else {
      const tio = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { typeAll(); tio.disconnect(); } });
      }, { threshold: 0.5 });
      tio.observe(term);
    }
  }

  /* ---------- Luz do cursor no herói ---------- */
  if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const hero = $("#inicio");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  }
})();

/* =====================================================
   Camada extra (só com rato e sem "reduzir movimento")
   ===================================================== */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce || !fine) return;

  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  document.documentElement.classList.add("has-cursor");

  /* ---------- Cursor personalizado ---------- */
  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.append(dot, ring);

  let mx = -100, my = -100, rx = -100, ry = -100;
  addEventListener("pointermove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = `${mx}px`; dot.style.top = `${my}px`;
  }, { passive: true });
  const loop = () => {
    rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
    ring.style.left = `${rx}px`; ring.style.top = `${ry}px`;
    requestAnimationFrame(loop);
  };
  loop();

  const hotSel = "a, button, .project, .service, .timeline li, .chip-group li, .skill-row, .sw, .card, .direct a";
  document.addEventListener("pointerover", (e) => {
    if (e.target.closest(hotSel)) { ring.classList.add("hot"); dot.classList.add("hot"); }
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest(hotSel)) { ring.classList.remove("hot"); dot.classList.remove("hot"); }
  });
  document.addEventListener("pointerleave", () => { dot.style.opacity = 0; ring.style.opacity = 0; });
  document.addEventListener("pointerenter", () => { dot.style.opacity = 1; ring.style.opacity = 1; });

  /* ---------- Botões magnéticos ---------- */
  $$(".btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  });

  /* ---------- Retrato com inclinação 3D ---------- */
  const img = document.querySelector(".portrait img");
  if (img) {
    const box = document.querySelector(".portrait");
    box.addEventListener("pointermove", (e) => {
      const r = box.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      img.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) scale(1.02)`;
    });
    box.addEventListener("pointerleave", () => { img.style.transform = ""; });
  }

  /* ---------- Títulos que se decifram ao aparecer ---------- */
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>{}";
  const scramble = (el) => {
    const final = el.textContent;
    let frame = 0;
    const total = 22;
    const step = () => {
      frame++;
      const done = Math.floor((frame / total) * final.length);
      let out = "";
      for (let i = 0; i < final.length; i++) {
        if (final[i] === " " || i < done) out += final[i];
        else out += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (frame < total) requestAnimationFrame(step);
      else el.textContent = final;
    };
    requestAnimationFrame(step);
  };
  const titles = $$(".title");
  const tio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      scramble(e.target);
      tio.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  titles.forEach((t) => tio.observe(t));
})();
