
/* ============================================
   CLARINS - ELEGANT WEBSITE ANIMATIONS
============================================ */

(function () {
  "use strict";

  function initializeAnimations() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    /* SCROLL REVEAL */

    const targets = document.querySelectorAll(
      ".intro, .viewer, .feature, .shop, " +
      ".review-card, .reel-card, .page-head"
    );

    targets.forEach(function (element) {
      element.classList.add("reveal");

      if (element.getBoundingClientRect().top <
          window.innerHeight) {
        element.classList.add("visible");
      }
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px 30px 0px"
        }
      );

      targets.forEach(function (element) {
        observer.observe(element);
      });
    } else {
      targets.forEach(function (element) {
        element.classList.add("visible");
      });
    }

    /* SHADE CHANGE ANIMATION */

    document.addEventListener("click", function (event) {
      const dot = event.target.closest(".dot");

      if (!dot) return;

      const viewer = dot.closest(".viewer");

      if (!viewer) return;

      const image = viewer.querySelector(".v-img");

      if (!image) return;

      image.classList.remove("shade-change");
      void image.offsetWidth;
      image.classList.add("shade-change");
    });

    /* ADD TO CART ANIMATION */

    document.addEventListener(
      "clarins:add-to-cart",
      function () {
        const counter = document.querySelector(".cart-count");

        if (!counter) return;

        counter.classList.remove("cart-bounce");
        void counter.offsetWidth;
        counter.classList.add("cart-bounce");
      }
    );

    /* BUTTON CLICK ANIMATION */

    document.addEventListener("click", function (event) {
      const button = event.target.closest(
        ".btn-ink, .add-cart-btn, .hero-add"
      );

      if (!button) return;

      button.classList.remove("button-pop");
      void button.offsetWidth;
      button.classList.add("button-pop");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeAnimations
    );
  } else {
    initializeAnimations();
  }
})();
