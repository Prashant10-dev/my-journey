/* =========================================
   THEME TOGGLE
========================================= */

const theme = document.getElementById("theme");

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

  const imageTypes = /\.(jpg|jpeg|png|webp|gif)$/i;
  const videoTypes = /\.(mp4|webm|ogg)$/i;

  try {

    const response = await fetch(API, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Gallery API error");
    }

    const files = await response.json();

    const media = files.filter(file =>
      file.type === "file" &&
      (
        imageTypes.test(file.name) ||
        videoTypes.test(file.name)
      )
    );


    /* =========================================
       NO MEDIA
    ========================================= */

    if (media.length === 0) {

      gallery.innerHTML = `
        <div class="gallery-placeholder">
          <span>+</span>
          <p>Add your next photo or video here</p>
        </div>
      `;

      return;
    }


    /* =========================================
       GITHUB PAGES BASE PATH
    ========================================= */

    let basePath = window.location.pathname;

    if (!basePath.endsWith("/")) {
      basePath =
        basePath.substring(
          0,
          basePath.lastIndexOf("/") + 1
        );
    }


    /* =========================================
       CREATE GALLERY
    ========================================= */

    gallery.innerHTML = media.map(file => {

      const title = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, letter =>
          letter.toUpperCase()
        );


      /* Direct GitHub Pages URL */

      const mediaURL =
        window.location.origin +
        basePath +
        "gallery/" +
        encodeURIComponent(file.name);


      /* =========================================
         VIDEO
      ========================================= */

      if (videoTypes.test(file.name)) {

        return `
          <figure class="gallery-video">

            <div class="video-wrapper">

              <video
                controls
                playsinline
                preload="metadata"
                poster=""
              >

                <source
                  src="${mediaURL}"
                  type="${getVideoType(file.name)}"
                >

                Your browser does not support video.

              </video>

              <div class="video-label">
                🎬 VIDEO
              </div>

            </div>

            <figcaption>
              ${title}
            </figcaption>

          </figure>
        `;
      }


      /* =========================================
         PHOTO
      ========================================= */

      return `
        <figure class="gallery-photo">

          <img
            src="${mediaURL}"
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
        <p>Gallery loading error</p>
      </div>
    `;
  }
}


/* =========================================
   VIDEO MIME TYPE
========================================= */

function getVideoType(filename) {

  const extension =
    filename
      .split(".")
      .pop()
      .toLowerCase();

  switch (extension) {

    case "webm":
      return "video/webm";

    case "ogg":
      return "video/ogg";

    case "mp4":
    default:
      return "video/mp4";
  }
}


/* =========================================
   START
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  loadGallery
);
