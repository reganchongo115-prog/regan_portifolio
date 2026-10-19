(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Relógio de Maputo (CAT, UTC+2) ---------- */
  const clock = $("#clock");
  const tickClock = () => {
    clock.textContent = new Intl.DateTimeFormat("pt-PT", {
      hour: "2-digit", minute: "2-digit", timeZone: "Africa/Maputo"
    }).format(new Date());
  };
  tickClock();
  setInterval(tickClock, 15000);

  /* ---------- Cabeçalho e menu ---------- */
  const top = $(".top");
  const nav = $("#nav");
  const menuBtn = $(".menu-btn");
  const onScroll = () => top.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") !== "true";
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("open", open);
  });
  $$(".nav a").forEach((a) => a.addEventListener("click", () => {
    menuBtn.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  }));

  // link ativo conforme a secção visível
  const navLinks = $$(".nav a");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => spy.observe(s));

  /* ---------- Idioma PT / EN ---------- */
  // guarda o texto em português original
  $$("[data-en]").forEach((el) => { el.dataset.pt = el.innerHTML.trim(); });
  $$("[data-ph-pt]").forEach((el) => { el.dataset.phEn = el.dataset.phEn || el.dataset.phPt || ""; });

  const T = {
    pt: {
      sending: "A abrir a sua aplicação de email…",
      sent: "Pronto. Confirme o envio na sua aplicação de email. Se não abriu, escreva para reganchongo115@gmail.com.",
      nameErr: "Escreva o seu nome (pelo menos 2 letras).",
      emailErr: "Indique um email válido.",
      subjErr: "Escolha um assunto.",
      msgErr: "A mensagem precisa de pelo menos 10 caracteres.",
      close: "Fechar", open: "Abrir projeto ↗", menuOpen: "Abrir menu", menuClose: "Fechar menu"
    },
    en: {
      sending: "Opening your email app…",
      sent: "Done. Confirm sending in your email app. If it didn't open, write to reganchongo115@gmail.com.",
      nameErr: "Please enter your name (at least 2 letters).",
      emailErr: "Please enter a valid email.",
      subjErr: "Please choose a subject.",
      msgErr: "The message needs at least 10 characters.",
      close: "Close", open: "Open project ↗", menuOpen: "Open menu", menuClose: "Close menu"
    }
  };

  let lang = localStorage.getItem("lang") || "pt";
  try { localStorage.setItem("lang", lang); } catch (_) {}

  const setLang = (l) => {
    lang = l;
    document.documentElement.lang = l === "pt" ? "pt" : "en";
    $$("[data-en]").forEach((el) => { el.innerHTML = l === "en" ? el.dataset.en : el.dataset.pt; });
    $$("[data-ph-pt]").forEach((el) => { el.placeholder = l === "en" ? el.dataset.phEn : el.dataset.phPt; });
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === l));
    $("#dlg").querySelector(".dlg-close").setAttribute("aria-label", T[l].close);
    $("#dlg-link").textContent = T[l].open;
    menuBtn.setAttribute("aria-label", menuBtn.getAttribute("aria-expanded") === "true" ? T[l].menuClose : T[l].menuOpen);
    clock.nextElementSibling.textContent = l === "en" ? "local time" : "hora local";
    try { localStorage.setItem("lang", l); } catch (_) {}
  };
  $$(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  setLang(lang);

  /* ---------- Habilidades: lista expansível ---------- */
  $$(".skill-row").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".skill");
      const open = !item.classList.contains("open");
      // fecha as outras para manter a lista limpa
      $$(".skill.open").forEach((s) => {
        if (s !== item) { s.classList.remove("open"); s.querySelector(".skill-row").setAttribute("aria-expanded", "false"); }
      });
      item.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open);
    });
  });

  /* ---------- Projetos: pré-visualização e janela ---------- */
  const preview = $(".cursor-preview");
  const previewImg = preview.querySelector("img");
  const dlg = $("#dlg");
  let px = 0, py = 0, cx = 0, cy = 0, raf = null;

  const follow = () => {
    cx += (px - cx) * 0.18;
    cy += (py - cy) * 0.18;
    preview.style.left = `${cx}px`;
    preview.style.top = `${cy}px`;
    raf = (Math.abs(px - cx) + Math.abs(py - cy) > 0.5) ? requestAnimationFrame(follow) : null;
  };

  $$(".project").forEach((btn) => {
    if (finePointer && !reduce) {
      btn.addEventListener("mouseenter", () => {
        previewImg.src = btn.dataset.img;
        preview.classList.add("on");
        if (!raf) raf = requestAnimationFrame(follow);
      });
      btn.addEventListener("mousemove", (e) => { px = e.clientX; py = e.clientY + 40; });
      btn.addEventListener("mouseleave", () => preview.classList.remove("on"));
    }
    btn.addEventListener("click", () => {
      preview.classList.remove("on");
      $("#dlg-img").src = btn.dataset.img;
      $("#dlg-img").alt = `Captura do projeto ${btn.dataset.title}`;
      $("#dlg-title").textContent = btn.dataset.title;
      $("#dlg-desc").textContent = lang === "en" ? btn.dataset.enDesc : btn.dataset.pt;
      $("#dlg-stack").textContent = btn.dataset.stack;
      $("#dlg-link").href = btn.dataset.link;
      dlg.showModal();
    });
  });

  $(".dlg-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  /* ---------- Formulário de contacto ---------- */
  const form = $("#contact-form");
  const status = $("#status");
  const msg = $("#f-msg");
  const count = $("#count");

  msg.addEventListener("input", () => { count.textContent = msg.value.length; });

  const rules = {
    "f-nome": (v) => v.trim().length >= 2 ? "" : T[lang].nameErr,
    "f-email": (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : T[lang].emailErr,
    "f-assunto": (v) => v ? "" : T[lang].subjErr,
    "f-msg": (v) => v.trim().length >= 10 ? "" : T[lang].msgErr
  };

  const check = (id) => {
    const el = $("#" + id);
    const error = rules[id](el.value);
    const field = el.closest(".field");
    field.classList.toggle("invalid", !!error);
    $(`.err[data-for="${id}"]`).textContent = error;
    return !error;
  };

  Object.keys(rules).forEach((id) => {
    $("#" + id).addEventListener("blur", () => check(id));
    $("#" + id).addEventListener("input", () => { if (el_invalid(id)) check(id); });
  });
  const el_invalid = (id) => $("#" + id).closest(".field").classList.contains("invalid");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = Object.keys(rules).map(check).every(Boolean);
    if (!ok) {
      status.className = "status error";
      status.textContent = lang === "en" ? "Please fix the highlighted fields." : "Corrija os campos assinalados.";
      $(".field.invalid input, .field.invalid select, .field.invalid textarea")?.focus();
      return;
    }

    const nome = $("#f-nome").value.trim();
    const email = $("#f-email").value.trim();
    const assunto = $("#f-assunto").value;
    const texto = msg.value.trim();

    const subject = `[Portfólio] ${assunto} — ${nome}`;
    const body = `Nome: ${nome}\nEmail: ${email}\nAssunto: ${assunto}\n\n${texto}`;
    const href = `mailto:reganchongo115@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.className = "status";
    status.textContent = T[lang].sending;
    location.href = href;
    setTimeout(() => { status.textContent = T[lang].sent; }, 600);
    form.reset();
    count.textContent = "0";
    $$(".field").forEach((f) => f.classList.remove("invalid"));
    $$(".err").forEach((er) => { er.textContent = ""; });
  });
})();
