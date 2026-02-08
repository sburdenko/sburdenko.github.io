const section = document.querySelector(".h-scroll");
const track = document.querySelector(".h-track");
const grid = document.querySelector(".grid");
const cursor = document.querySelector(".cursor");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const loadPortfolioData = () => {
  const dataEl = document.getElementById("portfolio-data");
  if (!dataEl) return null;
  try {
    return JSON.parse(dataEl.textContent);
  } catch (error) {
    console.error("Invalid portfolio JSON", error);
    return null;
  }
};

const createFigure = (filename, index, loading) => {
  if (!filename) return null;
  const figure = document.createElement("figure");
  figure.className = "work-card";
  const img = document.createElement("img");
  img.src = `images/${filename}`;
  img.alt = `Work ${String(index).padStart(2, "0")}`;
  img.loading = loading;
  figure.appendChild(img);
  return figure;
};

const buildGallery = (data) => {
  if (!track || !grid || !data) return;
  track.innerHTML = "";
  grid.innerHTML = "";

  const horizontal = Array.isArray(data.horizontal) ? data.horizontal : [];
  const vertical = Array.isArray(data.vertical) ? data.vertical : [];
  const rows = Array.isArray(data.rows) ? data.rows : [];

  let index = 1;
  horizontal.forEach((name) => {
    const figure = createFigure(name, index, "eager");
    if (figure) {
      track.appendChild(figure);
      index += 1;
    }
  });

  let pos = 0;
  rows.forEach((cols) => {
    if (pos >= vertical.length) return;
    const count = Math.max(1, Number(cols) || 1);
    const row = document.createElement("div");
    row.className = `grid-row row-${count}`;
    for (let i = 0; i < count && pos < vertical.length; i += 1) {
      const figure = createFigure(vertical[pos], index, "lazy");
      if (figure) {
        row.appendChild(figure);
        index += 1;
      }
      pos += 1;
    }
    grid.appendChild(row);
  });

  while (pos < vertical.length) {
    const remaining = vertical.length - pos;
    const count = remaining >= 3 ? 3 : remaining;
    const row = document.createElement("div");
    row.className = `grid-row row-${count}`;
    for (let i = 0; i < count && pos < vertical.length; i += 1) {
      const figure = createFigure(vertical[pos], index, "lazy");
      if (figure) {
        row.appendChild(figure);
        index += 1;
      }
      pos += 1;
    }
    grid.appendChild(row);
  }
};

const portfolioData = loadPortfolioData();
if (portfolioData) {
  buildGallery(portfolioData);
}

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
