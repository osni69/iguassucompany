(() => {
  const fleet = document.querySelector("#frota");

  if (!fleet) return;

  const track = fleet.querySelector(".fleet-track");
  const slides = Array.from(fleet.querySelectorAll(".fleet-photo"));
  const dotsContainer = fleet.querySelector(".fleet-dots");
  const previousButton = fleet.querySelector(".fleet-prev");
  const nextButton = fleet.querySelector(".fleet-next");

  if (!track || slides.length < 2 || !dotsContainer) return;

  let currentIndex = 0;
  let scrollTimer;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  track.setAttribute("tabindex", "0");
  track.setAttribute("aria-label", "Carrossel da frota");

  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");

    dot.className = "fleet-dot";
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Exibir veículo ${index + 1}`);
    dot.addEventListener("click", () => goTo(index));
    dotsContainer.appendChild(dot);

    return dot;
  });

  function updateControls() {
    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
      dot.tabIndex = isActive ? 0 : -1;
    });

    if (previousButton) {
      previousButton.disabled = false;
    }

    if (nextButton) {
      nextButton.disabled = false;
    }
  }

  function getSlidePosition(index) {
    const slide = slides[index];
    return Math.max(0, slide.offsetLeft - track.offsetLeft);
  }

  function goTo(index, smooth = true) {
    currentIndex = (index + slides.length) % slides.length;
    track.scrollTo({
      left: getSlidePosition(currentIndex),
      behavior: smooth && !reducedMotion.matches ? "smooth" : "auto",
    });
    updateControls();
  }

  function updateIndexFromScroll() {
    const scrollLeft = track.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const distance = Math.abs(getSlidePosition(index) - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== currentIndex) {
      currentIndex = closestIndex;
      updateControls();
    }
  }

  previousButton?.addEventListener("click", () => goTo(currentIndex - 1));
  nextButton?.addEventListener("click", () => goTo(currentIndex + 1));

  track.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(updateIndexFromScroll, 80);
    },
    { passive: true },
  );

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(currentIndex + 1);
    }
  });

  window.addEventListener("resize", () => goTo(currentIndex, false));

  updateControls();
  goTo(0, false);
})();
