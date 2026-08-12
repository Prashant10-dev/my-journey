const theme = document.getElementById("theme");

if (theme) {
  theme.addEventListener("click", () => {
    document.body.classList.toggle("light");
  });
}

/* ================================
   AUTOMATIC PHOTO + VIDEO GALLERY
================================ */

async function loadGallery() {

  const gallery = document.querySelector(".gallery");

  if (!gallery) return;

  const API =
    "https://api.github.com/repos/Prashant10-dev/my-journey/contents/gallery";

  try {

    const response = await fetch(API);

    if (!response.ok) {
      throw new Error("Gallery could not be loaded");
    }

    const files = await response.json();

    const mediaFiles = files.filter(file => {

      return /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|ogg)$/i
        .test(file.name);

    });

    if (mediaFiles.length === 0) {

      gallery.innerHTML = `
        <div class="gallery-empty">
          <span>＋</span>
          <p>No photos or videos yet.</p>
        </div>
      `;

      return;
    }

    gallery.innerHTML = mediaFiles.map(file => {

      const name = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());

      const isVideo =
        /\.(mp4|webm|mov|ogg)$/i.test(file.name);

      if (isVideo) {

        return `
          <figure class="media-card video-card">

            <video
              src="${file.download_url}"
              preload="metadata"
              playsinline
              controls>
            </video>

            <div class="video-badge">▶ VIDEO</div>

            <figcaption>${name}</figcaption>

          </figure>
        `;

      }

      return `
        <figure class="media-card">

          <img
            src="${file.download_url}"
            alt="${name}"
            loading="lazy">

          <figcaption>${name}</figcaption>

        </figure>
      `;

    }).join("");

  }

  catch (error) {

    console.error("Gallery Error:", error);

    gallery.innerHTML = `
      <div class="gallery-empty">
        <span>!</span>
        <p>Gallery is temporarily unavailable.</p>
      </div>
    `;

  }
}

document.addEventListener("DOMContentLoaded", loadGallery);
