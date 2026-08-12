const theme = document.getElementById("theme");

if (theme) {
  theme.addEventListener("click", () => {
    document.body.classList.toggle("light");
  });
}

/* ================================
   AUTOMATIC PHOTO + VIDEO GALLERY
   + LOAD MORE
================================ */

async function loadGallery() {
  const gallery = document.querySelector(".gallery");

  if (!gallery) return;

  const API =
    "https://api.github.com/repos/Prashant10-dev/my-journey/contents/gallery";

  const ITEMS_PER_LOAD = 6;
  let allMedia = [];
  let visibleCount = 0;

  try {
    const response = await fetch(API);

    if (!response.ok) {
      throw new Error("Gallery could not be loaded");
    }

    const files = await response.json();

    allMedia = files.filter(file =>
      /\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg|mov)$/i.test(file.name)
    );

    if (allMedia.length === 0) {
      gallery.innerHTML = `
        <div class="gallery-empty">
          <span>＋</span>
          <p>Add your photos or videos here</p>
        </div>
      `;
      return;
    }

    renderMore();

  } catch (error) {
    console.error("Gallery Error:", error);

    gallery.innerHTML = `
      <div class="gallery-empty">
        <span>!</span>
        <p>Gallery is loading...</p>
      </div>
    `;
  }

  function renderMore() {
    const nextItems = allMedia.slice(
      visibleCount,
      visibleCount + ITEMS_PER_LOAD
    );

    nextItems.forEach(file => {
      const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(file.name);

      const title = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());

      const card = document.createElement("figure");
      card.className = isVideo
        ? "media-card video-card"
        : "media-card";

      if (isVideo) {
        card.innerHTML = `
          <div class="media-wrapper">
            <video
              src="${file.download_url}"
              controls
              preload="metadata"
              playsinline>
            </video>

            <span class="video-badge">▶ VIDEO</span>
          </div>

          <figcaption>${title}</figcaption>
        `;
      } else {
        card.innerHTML = `
          <div class="media-wrapper">
            <img
              src="${file.download_url}"
              alt="${title}"
              loading="lazy">
          </div>

          <figcaption>${title}</figcaption>
        `;
      }

      gallery.appendChild(card);
    });

    visibleCount += nextItems.length;

    updateLoadMoreButton();
  }

  function updateLoadMoreButton() {
    let button = document.querySelector(".load-more-btn");

    if (!button) {
      button = document.createElement("button");
      button.className = "load-more-btn";
      button.textContent = "Load More";
      button.addEventListener("click", renderMore);

      gallery.parentElement.appendChild(button);
    }

    if (visibleCount >= allMedia.length) {
      button.style.display = "none";
    } else {
      button.style.display = "block";

      const remaining = allMedia.length - visibleCount;
      button.textContent = `Load More (${remaining} remaining)`;
    }
  }
}

/* Load gallery */
document.addEventListener("DOMContentLoaded", loadGallery);
/* =================================
   FULLSCREEN PHOTO VIEWER
================================= */

document.addEventListener("click", (e) => {
  const img = e.target.closest(".media-card img");

  if (!img) return;

  const viewer = document.createElement("div");
  viewer.className = "photo-viewer";

  viewer.innerHTML = `
    <button class="viewer-close">×</button>

    <div class="viewer-image-box">
      <img src="${img.src}" alt="${img.alt || "Photo"}">
    </div>

    <div class="viewer-caption">
      ${img.alt || "Memory"}
    </div>
  `;

  document.body.appendChild(viewer);

  requestAnimationFrame(() => {
    viewer.classList.add("active");
  });

  document.body.classList.add("viewer-open");

  viewer.querySelector(".viewer-close").onclick = () => {
    viewer.classList.remove("active");

    setTimeout(() => {
      viewer.remove();
      document.body.classList.remove("viewer-open");
    }, 250);
  };

  viewer.onclick = (event) => {
    if (event.target === viewer) {
      viewer.querySelector(".viewer-close").click();
    }
  };
});


/* ESC KEY TO CLOSE */

document.addEventListener("keydown", (e) => {

  if (e.key === "Escape") {

    const viewer = document.querySelector(".photo-viewer");

    if (viewer) {
      viewer.querySelector(".viewer-close").click();
    }

  }

});
