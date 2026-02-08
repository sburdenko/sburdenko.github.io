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

const buildGallery = (series) => {
  if (!track || !grid || !series) return;
  track.innerHTML = "";
  grid.innerHTML = "";

  const horizontal = Array.isArray(series.horizontal) ? series.horizontal : [];
  const vertical = Array.isArray(series.vertical) ? series.vertical : [];
  const rows = Array.isArray(series.rows) ? series.rows : [];

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

let recalcHorizontal = () => {};

const applyLoadingStrategy = (preloadCount = 12) => {
  const images = Array.from(document.querySelectorAll(".work-card img"));
  images.forEach((img, index) => {
    img.decoding = "async";
    img.loading = index < preloadCount ? "eager" : "lazy";
    if (index < 4) {
      img.fetchPriority = "high";
    }
  });
  return images;
};

const waitForImages = (images) =>
  Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      if (img.decode) {
        return img.decode().catch(() => undefined);
      }
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    })
  );

const portfolioData = loadPortfolioData();
const seriesButtons = Array.from(document.querySelectorAll("[data-series]"));

const setActiveSeries = (name) => {
  if (!portfolioData || !portfolioData.series) return;
  const series = portfolioData.series[name];
  if (!series) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  buildGallery(series);
  applyLoadingStrategy(12);
  const trackImages = track ? Array.from(track.querySelectorAll("img")) : [];
  waitForImages(trackImages).then(() => recalcHorizontal());
  recalcHorizontal();

  seriesButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.series === name);
  });
};

if (portfolioData) {
  const initial = portfolioData.active || (portfolioData.series ? Object.keys(portfolioData.series)[0] : null);
  if (initial) {
    setActiveSeries(initial);
  }
}

seriesButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveSeries(button.dataset.series);
  });
});

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
    const stickyHeight = section.querySelector(".h-sticky")?.offsetHeight || window.innerHeight;
    const scrollLength = Math.max(0, trackWidth - viewportWidth);
    section.style.height = `${scrollLength + stickyHeight}px`;
  };

  const update = () => {
    const stickyHeight = section.querySelector(".h-sticky")?.offsetHeight || window.innerHeight;
    const scrollDistance = Math.max(0, section.offsetHeight - stickyHeight);
    if (scrollDistance <= 0) return;

    const rect = section.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
    const maxTranslate = track.scrollWidth - window.innerWidth;
    track.style.transform = `translateX(${-maxTranslate * progress}px)`;
  };

  recalcHorizontal = () => {
    setHeight();
    update();
    if (window.scrollY === 0) {
      track.style.transform = "translateX(0px)";
    }
  };

  recalcHorizontal();

  window.addEventListener("resize", recalcHorizontal);
  window.addEventListener("scroll", update, { passive: true });
}
