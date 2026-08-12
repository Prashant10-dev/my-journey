const theme = document.getElementById("theme");

if (theme) {
  theme.addEventListener("click", () => {
    document.body.classList.toggle("light");

    theme.textContent =
      document.body.classList.contains("light") ? "☀" : "☾";
  });
}


/* =========================================
   AUTOMATIC GALLERY
========================================= */

async function loadGallery() {

  const gallery = document.querySelector(".gallery");

  if (!gallery) return;

  const api =
    "https://api.github.com/repos/Prashant10-dev/my-journey/contents/gallery?ref=main";

  try {

    const response = await fetch(api, {
      headers: {
        "Accept": "application/vnd.github+json"
      }
    });

    if (!response.ok) {
      throw new Error("GitHub Gallery API Error");
    }

    const files = await response.json();

    const photos = files.filter(file =>
      file.type === "file" &&
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
    );

    if (photos.length === 0) {

      gallery.innerHTML = `
        <div class="gallery-placeholder">
          <span>+</span>
          <p>No photos yet</p>
        </div>
      `;

      return;
    }

    gallery.innerHTML = photos.map(photo => {

      const title = photo.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());

      return `
        <figure>
          <img
            src="${photo.download_url}"
            alt="${title}"
            loading="lazy"
          >
          <figcaption>${title}</figcaption>
        </figure>
      `;

    }).join("");

  } catch (error) {

    console.error(error);

    gallery.innerHTML = `
      <div class="gallery-placeholder">
        <span>!</span>
        <p>Photos could not be loaded</p>
      </div>
    `;
  }
}


/* Start Gallery */
document.addEventListener("DOMContentLoaded", loadGallery);
