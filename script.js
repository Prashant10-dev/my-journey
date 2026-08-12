/* =========================================================
   GAUTAM — MY JOURNEY
   FINAL PHOTO + VIDEO GALLERY SYSTEM
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     THEME TOGGLE
  ======================================================= */

  const themeButton = document.getElementById("theme");

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      document.body.classList.toggle("light");

      localStorage.setItem(
        "theme",
        document.body.classList.contains("light")
          ? "light"
          : "dark"
      );
    });

    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light");
    }
  }


  /* =======================================================
     GALLERY
  ======================================================= */

  const gallery = document.querySelector(".gallery");

  if (!gallery) return;


  const API =
    "https://api.github.com/repos/Prashant10-dev/my-journey/contents/gallery";


  /* How many media items appear at one time */
  const ITEMS_PER_LOAD = 6;


  let allMedia = [];
  let visibleCount = 0;


  /* =======================================================
     LOAD GALLERY
  ======================================================= */

  async function loadGallery() {

    gallery.innerHTML = `
      <div class="gallery-loading">
        <div class="gallery-spinner"></div>
        <p>Loading memories...</p>
      </div>
    `;


    try {

      const response = await fetch(API, {
        cache: "no-store"
      });


      if (!response.ok) {
        throw new Error("Gallery could not be loaded");
      }


      const files = await response.json();


      /* ---------------------------------------------------
         Only photos + videos
      --------------------------------------------------- */

      allMedia = files.filter(file => {

        if (file.type !== "file") return false;

        return /\.(jpg|jpeg|png|gif|webp|avif|mp4|webm|ogg|mov)$/i
          .test(file.name);

      });


      /* ---------------------------------------------------
         Sort alphabetically for stable gallery
      --------------------------------------------------- */

      allMedia.sort((a, b) =>
        a.name.localeCompare(b.name)
      );


      visibleCount = 0;


      if (allMedia.length === 0) {

        showEmptyGallery();

        return;

      }


      gallery.innerHTML = "";

      renderMore();


    } catch (error) {

      console.error("Gallery Error:", error);

      showGalleryError();

    }

  }


  /* =======================================================
     EMPTY GALLERY
  ======================================================= */

  function showEmptyGallery() {

    gallery.innerHTML = `
      <div class="gallery-empty">
        <span>＋</span>
        <h3>No memories yet</h3>
        <p>Add photos or videos inside the <b>gallery</b> folder.</p>
      </div>
    `;

  }


  /* =======================================================
     ERROR
  ======================================================= */

  function showGalleryError() {

    gallery.innerHTML = `
      <div class="gallery-empty gallery-error">
        <span>!</span>
        <h3>Gallery unavailable</h3>
        <p>Please refresh the page and try again.</p>
      </div>
    `;

  }


  /* =======================================================
     RENDER MORE
  ======================================================= */

  function renderMore() {

    const nextItems = allMedia.slice(
      visibleCount,
      visibleCount + ITEMS_PER_LOAD
    );


    nextItems.forEach(file => {

      createMediaCard(file);

    });


    visibleCount += nextItems.length;


    updateLoadMoreButton();

  }


  /* =======================================================
     CREATE MEDIA CARD
  ======================================================= */

  function createMediaCard(file) {

    const isVideo =
      /\.(mp4|webm|ogg|mov)$/i.test(file.name);


    const title = createTitle(file.name);


    const card = document.createElement("figure");


    card.className =
      isVideo
        ? "media-card video-card"
        : "media-card photo-card";


    /* ---------------------------------------------------
       PHOTO
    --------------------------------------------------- */

    if (!isVideo) {

      card.innerHTML = `

        <div class="media-wrapper photo-wrapper">

          <img
            src="${file.download_url}"
            alt="${escapeHTML(title)}"
            loading="lazy"
          >

          <div class="photo-overlay">
            <span>⛶</span>
            <small>View</small>
          </div>

        </div>

        <figcaption>
          ${escapeHTML(title)}
        </figcaption>

      `;

    }


    /* ---------------------------------------------------
       VIDEO
    --------------------------------------------------- */

    else {

      card.innerHTML = `

        <div class="media-wrapper video-wrapper">

          <video
            src="${file.download_url}"
            preload="metadata"
            playsinline
            controls
          ></video>


          <button
            class="video-play-button"
            type="button"
            aria-label="Play video"
          >
            <span>▶</span>
          </button>


          <div class="video-top-label">
            <span>▶</span> VIDEO
          </div>

        </div>


        <figcaption>
          ${escapeHTML(title)}
        </figcaption>

      `;

    }


    gallery.appendChild(card);


    /* ===================================================
       PHOTO CLICK
    =================================================== */

    if (!isVideo) {

      const image =
        card.querySelector("img");


      image.addEventListener("click", () => {

        openPhotoViewer(
          file.download_url,
          title
        );

      });

    }


    /* ===================================================
       VIDEO PLAY BUTTON
    =================================================== */

    else {

      const video =
        card.querySelector("video");

      const playButton =
        card.querySelector(".video-play-button");


      playButton.addEventListener("click", event => {

        event.stopPropagation();


        if (video.paused) {

          video.play()
            .then(() => {
              playButton.classList.add("playing");
            })
            .catch(() => {});

        } else {

          video.pause();

          playButton.classList.remove("playing");

        }

      });


      video.addEventListener("play", () => {

        playButton.classList.add("playing");

      });


      video.addEventListener("pause", () => {

        playButton.classList.remove("playing");

      });


      video.addEventListener("ended", () => {

        playButton.classList.remove("playing");

      });

    }

  }


  /* =======================================================
     TITLE FROM FILE NAME
  ======================================================= */

  function createTitle(filename) {

    return filename

      .replace(/\.[^/.]+$/, "")

      .replace(/[-_]+/g, " ")

      .replace(/\b\w/g, letter =>
        letter.toUpperCase()
      );

  }


  /* =======================================================
     LOAD MORE BUTTON
  ======================================================= */

  function updateLoadMoreButton() {

    let button =
      document.querySelector(".load-more-btn");


    /* Create button once */

    if (!button) {

      button =
        document.createElement("button");

      button.className =
        "load-more-btn";


      button.type = "button";


      button.addEventListener(
        "click",
        renderMore
      );


      gallery.insertAdjacentElement(
        "afterend",
        button
      );

    }


    /* ---------------------------------------------------
       Everything loaded
    --------------------------------------------------- */

    if (visibleCount >= allMedia.length) {

      button.style.display = "none";

      return;

    }


    /* ---------------------------------------------------
       More available
    --------------------------------------------------- */

    const remaining =
      allMedia.length - visibleCount;


    button.style.display = "flex";


    button.innerHTML = `
      <span>＋</span>
      Load More
      <small>${remaining} remaining</small>
    `;

  }


  /* =======================================================
     FULLSCREEN PHOTO VIEWER
  ======================================================= */

  function openPhotoViewer(src, title) {

    /* Prevent duplicate viewer */

    const oldViewer =
      document.querySelector(".photo-viewer");

    if (oldViewer) {
      oldViewer.remove();
    }


    const viewer =
      document.createElement("div");


    viewer.className =
      "photo-viewer";


    viewer.innerHTML = `

      <button
        class="viewer-close"
        type="button"
        aria-label="Close"
      >
        ×
      </button>


      <div class="viewer-content">

        <img
          src="${src}"
          alt="${escapeHTML(title)}"
        >

        <div class="viewer-info">

          <span>PHOTO</span>

          <strong>
            ${escapeHTML(title)}
          </strong>

        </div>

      </div>

    `;


    document.body.appendChild(viewer);


    /* Prevent background scroll */

    document.body.classList.add(
      "viewer-open"
    );


    /* Animation */

    requestAnimationFrame(() => {

      viewer.classList.add("active");

    });


    /* Close button */

    const closeButton =
      viewer.querySelector(
        ".viewer-close"
      );


    closeButton.addEventListener(
      "click",
      closePhotoViewer
    );


    /* Click outside image */

    viewer.addEventListener(
      "click",
      event => {

        if (
          event.target === viewer ||
          event.target.classList.contains(
            "viewer-content"
          )
        ) {

          closePhotoViewer();

        }

      }
    );


    /* ESC */

    function closePhotoViewer() {

      viewer.classList.remove(
        "active"
      );


      setTimeout(() => {

        viewer.remove();

        document.body.classList.remove(
          "viewer-open"
        );

      }, 250);

    }

  }


  /* =======================================================
     ESC KEY
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (event.key !== "Escape") return;


      const viewer =
        document.querySelector(
          ".photo-viewer"
        );


      if (viewer) {

        const close =
          viewer.querySelector(
            ".viewer-close"
          );

        if (close) {
          close.click();
        }

      }

    }
  );


  /* =======================================================
     SECURITY — ESCAPE FILE NAMES
  ======================================================= */

  function escapeHTML(value) {

    return String(value)

      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");

  }


  /* =======================================================
     START
  ======================================================= */

  loadGallery();

});
