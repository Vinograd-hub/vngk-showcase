// V.N.G.K — interactions & effects

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---------- Preloader ----------
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    setTimeout(() => preloader.classList.add("is-hidden"), 400);
  });
  setTimeout(() => preloader.classList.add("is-hidden"), 2500);

  // ---------- Nav state on scroll ----------
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Scroll progress ----------
  const progress = document.getElementById("scrollProgress");
  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    progress.style.width = (p * 100).toFixed(2) + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // ---------- Mobile menu ----------
  const burger = document.getElementById("burger");
  const links = document.querySelector(".nav__links");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-label", open ? "Закрыть" : "Меню");
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger.setAttribute("aria-label", "Меню");
    })
  );

  // ---------- Split text reveal ----------
  function splitText(el) {
    const walk = (node) => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (part === "") return;
          if (/^\s+$/.test(part)) {
            node.before(document.createTextNode(part));
            return;
          }
          const word = document.createElement("span");
          word.className = "split-word";
          const inner = document.createElement("span");
          inner.className = "split-word-inner";
          inner.textContent = part;
          word.appendChild(inner);
          node.before(word);
        });
        node.remove();
      } else if (node.nodeType === 1 && node.tagName !== "BR") {
        Array.from(node.childNodes).forEach(walk);
      }
    };
    walk(el);
    el.classList.add("split");
  }

  const splitEls = document.querySelectorAll(".split");
  splitEls.forEach((el) => {
    const words = splitText(el);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
  });

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll(".reveal");
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealIO.observe(el));

  // ---------- Animated counters ----------
  const counters = document.querySelectorAll("[data-count]");
  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => countIO.observe(el));

  // =========================================================
  //  Custom cursor
  // =========================================================
  if (finePointer && !reduceMotion) {
    document.documentElement.classList.add("cursor-none");
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });

    const raf = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(raf);
    };
    raf();

    const hoverables = document.querySelectorAll("a, button, .work__link, .magnetic");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });

    document.querySelectorAll(".work__link").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        ring.classList.remove("is-hover");
        ring.classList.add("is-label");
      });
      el.addEventListener("mouseleave", () => ring.classList.remove("is-label"));
    });
  }

  // =========================================================
  //  Magnetic elements
  // =========================================================
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".btn, .nav__logo, .nav__cta, .footer__logo").forEach((el) => {
      el.classList.add("magnetic");
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0,0)";
      });
    });
  }

  // =========================================================
  //  3D tilt on work cards
  // =========================================================
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".work__media").forEach((card) => {
      const link = card.closest(".work__link");
      link.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -8;
        const ry = (px - 0.5) * 10;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
      });
      link.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // =========================================================
  //  Ambient parallax on mouse
  // =========================================================
  if (finePointer && !reduceMotion) {
    const ambient = document.getElementById("ambient");
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * -30;
      const y = (e.clientY / window.innerHeight - 0.5) * -30;
      ambient.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // =========================================================
  //  Particle field (canvas)
  // =========================================================
  const canvas = document.getElementById("particles");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, particles = [];
    const count = Math.min(90, Math.floor(window.innerWidth / 16));

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class P {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.r = Math.random() * 1.6 + 0.4;
        this.a = Math.random() * 0.5 + 0.15;
      }
      step() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -20 || this.x > w + 20 || this.y < -20 || this.y > h + 20) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 162, 106, ${this.a})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) particles.push(new P());

    const linkDist = 130;
    const drawLinks = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(200, 162, 106, ${(1 - d / linkDist) * 0.12})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => { p.step(); p.draw(); });
      drawLinks();
      requestAnimationFrame(loop);
    };
    loop();
  }
})();
