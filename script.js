if (theme) {
  theme.addEventListener("click", () => {
    document.body.classList.toggle("light");

    theme.textContent =
      document.body.classList.contains("light") ? "☀" : "☾";
  });
}


/* =========================================
   AUTOMATIC PHOTO + VIDEO GALLERY
========================================= */

async function loadGallery() {

  const gallery = document.querySelector(".gallery");

  if (!gallery) return;

  const API =
    "https://api.github.com/repos/Prashant10-dev/my-journey/contents/gallery?ref=main";

  const imageTypes =
    /\.(jpg|jpeg|png|webp|gif)$/i;

  const videoTypes =
    /\.(mp4|webm|ogg|mov)$/i;

  try {

    const response = await fetch(API, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("GitHub Gallery API Error");
    }

    const files = await response.json();

    const media = files.filter(file =>
      file.type === "file" &&
      (
        imageTypes.test(file.name) ||
        videoTypes.test(file.name)
      )
    );


    /* No media */

    if (media.length === 0) {

      gallery.innerHTML = `
        <div class="gallery-placeholder">
          <span>+</span>
          <p>Add your next photo or video here</p>
        </div>
      `;

      return;
    }


    /* Create Gallery */

    gallery.innerHTML = media.map(file => {

      const title = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, letter =>
          letter.toUpperCase()
        );


      /* VIDEO */

      if (videoTypes.test(file.name)) {

        return `
          <figure class="gallery-video">

            <video
              controls
              preload="metadata"
              playsinline
            >

              <source
                src="${file.download_url}"
                type="${getVideoType(file.name)}"
              >

              Your browser does not support video playback.

            </video>

            <figcaption>
              🎬 ${title}
            </figcaption>

          </figure>
        `;
      }


      /* PHOTO */

      return `
        <figure class="gallery-photo">

          <img
            src="${file.download_url}"
            alt="${title}"
            loading="lazy"
          >

          <figcaption>
            📸 ${title}
          </figcaption>

        </figure>
      `;

    }).join("");


  } catch (error) {

    console.error("Gallery Error:", error);

    gallery.innerHTML = `
      <div class="gallery-placeholder">
        <span>!</span>
        <p>Gallery could not be loaded</p>
      </div>
    `;
  }
}


/* =========================================
   VIDEO TYPE
========================================= */

function getVideoType(filename) {

  const extension =
    filename
      .split(".")
      .pop()
      .toLowerCase();

  if (extension === "webm") {
    return "video/webm";
  }

  if (extension === "ogg") {
    return "video/ogg";
  }

  return "video/mp4";
}


/* =========================================
   START GALLERY
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  loadGallery
);
