const section = document.querySelector(".h-scroll");
const track = document.querySelector(".h-track");
const cursor = document.querySelector(".cursor");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateCursorColor = () => {
  if (!cursor) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;
  const t = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
  const value = Math.round(255 * (0.5 - 0.5 * Math.cos(Math.PI * 2 * t)));
  cursor.style.backgroundColor = `rgb(${value}, ${value}, ${value})`;
};

if (cursor) {
  window.addEventListener("mousemove", (event) => {
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
  });
}

updateCursorColor();
window.addEventListener("scroll", updateCursorColor, { passive: true });
window.addEventListener("resize", updateCursorColor);

if (!section || !track || prefersReduced) {
  document.documentElement.classList.add("reduce-motion");
} else {
  const setHeight = () => {
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollLength = Math.max(0, trackWidth - viewportWidth);
    section.style.height = `${scrollLength + viewportHeight}px`;
  };

  const update = () => {
    const scrollDistance = section.offsetHeight - window.innerHeight;
    if (scrollDistance <= 0) return;

    const rect = section.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
    const maxTranslate = track.scrollWidth - window.innerWidth;
    track.style.transform = `translateX(${-maxTranslate * progress}px)`;
  };

  setHeight();
  update();

  window.addEventListener("resize", () => {
    setHeight();
    update();
  });
  window.addEventListener("scroll", update, { passive: true });
}
