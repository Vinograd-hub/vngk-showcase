// V.N.G.K — interactions

(function () {
  "use strict";

  // ---------- Preloader ----------
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    setTimeout(() => preloader.classList.add("is-hidden"), 500);
  });
  // Fallback if load already fired
  setTimeout(() => preloader.classList.add("is-hidden"), 2500);

  // ---------- Nav state on scroll ----------
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

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
})();
