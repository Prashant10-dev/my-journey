const theme=document.getElementById("theme");
theme.addEventListener("click",()=>{document.body.classList.toggle("light");theme.textContent=document.body.classList.contains("light")?"☀":"☾";});
/* =========================================
   AUTOMATIC GALLERY
========================================= */

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

    const photos = files.filter(file =>
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
    );

    if (photos.length === 0) {
      gallery.innerHTML = `
        <div class="gallery-placeholder">
          <span>+</span>
          <p>Add your next photo here</p>
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

    console.error("Gallery Error:", error);

    gallery.innerHTML = `
      <div class="gallery-placeholder">
        <span>!</span>
        <p>Gallery is loading...</p>
      </div>
    `;
  }
}

/* Load gallery */
document.addEventListener("DOMContentLoaded", loadGallery);
