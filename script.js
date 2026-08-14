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


  const ITEMS_PER_LOAD = 6;


  /* =======================================================
     WEBP OPTIMIZATION
     
     If WebP exists for an image, WebP is used.
     If WebP does not exist, original image is used.
  ======================================================= */

  function prepareGalleryMedia(files) {

    const images = new Map();
    const webps = new Map();
    const videos = [];

    files.forEach(file => {

      if (file.type !== "file") return;


      /* Videos */

      if (/\.(mp4|webm|ogg|mov)$/i.test(file.name)) {

        videos.push(file);

        return;
      }


      /* Original images */

      if (/\.(jpg|jpeg|png|gif|avif)$/i.test(file.name)) {

        const key = file.name
          .replace(/\.(jpg|jpeg|png|gif|avif)$/i, "")
          .toLowerCase();

        images.set(key, file);

        return;
      }


      /* WebP */

      if (/\.webp$/i.test(file.name)) {

        const key = file.name
          .replace(/\.webp$/i, "")
          .toLowerCase();

        webps.set(key, file);

      }

    });


    const result = [];


    /* Prefer WebP */

    images.forEach((original, key) => {

      if (webps.has(key)) {

        result.push(webps.get(key));

      } else {

        result.push(original);

      }

    });


    /*
      If a WebP exists without an original image,
      still show the WebP.
    */

    webps.forEach((webp, key) => {

      if (!images.has(key)) {

        result.push(webp);

      }

    });


    return [...result, ...videos];

  }


  let allMedia = [];
  let visibleCount = 0;


  /* =======================================================
     VIEWER STATE
  ======================================================= */

  let currentViewerIndex = 0;
  let viewerElement = null;

  let touchStartX = 0;
  let touchEndX = 0;


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
        cache: "default"
      });


      if (!response.ok) {
        throw new Error("Gallery could not be loaded");
      }


      const files = await response.json();


      /* Prepare photos + videos */

      allMedia = prepareGalleryMedia(files);


      /* Stable numeric/alphabetical order */

      allMedia.sort((a, b) =>
        a.name.localeCompare(
          b.name,
          undefined,
          {
            numeric: true,
            sensitivity: "base"
          }
        )
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
        <p>
          Add photos or videos inside the
          <b>gallery</b> folder.
        </p>
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
        <p>
          Please refresh the page and try again.
        </p>
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


    const title =
      createTitle(file.name);


    const mediaIndex =
      allMedia.findIndex(item =>
        item.name === file.name
      );


    const card =
      document.createElement("figure");


    card.className =
      isVideo
        ? "media-card video-card"
        : "media-card photo-card";


    /* =====================================================
       PHOTO
    ===================================================== */

    if (!isVideo) {

      card.innerHTML = `

        <div class="media-wrapper photo-wrapper">

          <img
            src="${escapeHTML(file.download_url)}"
            alt="${escapeHTML(title)}"
            loading="lazy"
            decoding="async"
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


      gallery.appendChild(card);


      const image =
        card.querySelector("img");


      image.addEventListener("click", () => {

        openMediaViewer(mediaIndex);

      });

    }


    /* =====================================================
       VIDEO
    ===================================================== */

    else {

      card.innerHTML = `

        <div class="media-wrapper video-wrapper">

          <video
            src="${escapeHTML(file.download_url)}"
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
            <span>▶</span>
            VIDEO
          </div>

        </div>


        <figcaption>
          ${escapeHTML(title)}
        </figcaption>

      `;


      gallery.appendChild(card);


      const video =
        card.querySelector("video");


      const playButton =
        card.querySelector(".video-play-button");


      /* Play button */

      playButton.addEventListener(
        "click",
        event => {

          event.stopPropagation();


          if (video.paused) {

            video.play()
              .then(() => {
                playButton.classList.add("playing");
              })
              .catch(() => {});

          } else {

            video.pause();

            playButton.classList.remove(
              "playing"
            );

          }

        }
      );


      /* Video events */

      video.addEventListener(
        "play",
        () => {
          playButton.classList.add("playing");
        }
      );


      video.addEventListener(
        "pause",
        () => {
          playButton.classList.remove("playing");
        }
      );


      video.addEventListener(
        "ended",
        () => {
          playButton.classList.remove("playing");
        }
      );


      /* Click video itself → viewer */

      video.addEventListener(
        "click",
        event => {

          event.preventDefault();

          openMediaViewer(mediaIndex);

        }
      );

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


    /* Create once */

    if (!button) {

      button =
        document.createElement("button");


      button.className =
        "load-more-btn";


      button.type =
        "button";


      button.addEventListener(
        "click",
        renderMore
      );


      gallery.insertAdjacentElement(
        "afterend",
        button
      );

    }


    /* Everything loaded */

    if (visibleCount >= allMedia.length) {

      button.style.display = "none";

      return;

    }


    /* More available */

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
     OPEN PHOTO + VIDEO VIEWER
  ======================================================= */

  function openMediaViewer(index) {

    if (
      index < 0 ||
      index >= allMedia.length
    ) {
      return;
    }


    currentViewerIndex = index;


    /* Remove old viewer */

    if (viewerElement) {

      viewerElement.remove();

      viewerElement = null;

    }


    /* Create viewer */

    viewerElement =
      document.createElement("div");


    viewerElement.className =
      "photo-viewer";


    viewerElement.innerHTML = `

      <button
        class="viewer-close"
        type="button"
        aria-label="Close viewer"
      >
        ×
      </button>


      <button
        class="viewer-prev"
        type="button"
        aria-label="Previous media"
      >
        ‹
      </button>


      <div class="viewer-content">

        <div class="viewer-media"></div>

        <div class="viewer-info">

          <span class="viewer-type"></span>

          <strong class="viewer-title"></strong>

          <small class="viewer-counter"></small>

        </div>

      </div>


      <button
        class="viewer-next"
        type="button"
        aria-label="Next media"
      >
        ›
      </button>

    `;


    document.body.appendChild(
      viewerElement
    );


    document.body.classList.add(
      "viewer-open"
    );


    /* Render current item */

    renderViewerMedia();


    /* Animation */

    requestAnimationFrame(() => {

      if (viewerElement) {

        viewerElement.classList.add(
          "active"
        );

      }

    });


    /* Close */

    viewerElement
      .querySelector(".viewer-close")
      .addEventListener(
        "click",
        closeMediaViewer
      );


    /* Previous */

    viewerElement
      .querySelector(".viewer-prev")
      .addEventListener(
        "click",
        event => {

          event.stopPropagation();

          showPreviousMedia();

        }
      );


    /* Next */

    viewerElement
      .querySelector(".viewer-next")
      .addEventListener(
        "click",
        event => {

          event.stopPropagation();

          showNextMedia();

        }
      );


    /* Click background */

    viewerElement.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          viewerElement
        ) {

          closeMediaViewer();

        }

      }
    );


    /* =====================================================
       TOUCH SWIPE
    ===================================================== */

    viewerElement.addEventListener(
      "touchstart",
      event => {

        touchStartX =
          event.changedTouches[0].screenX;

      },
      { passive: true }
    );


    viewerElement.addEventListener(
      "touchend",
      event => {

        touchEndX =
          event.changedTouches[0].screenX;


        handleSwipe();

      },
      { passive: true }
    );

  }


  /* =======================================================
     RENDER CURRENT VIEWER MEDIA
  ======================================================= */

  function renderViewerMedia() {

    if (!viewerElement) return;


    const media =
      allMedia[currentViewerIndex];


    if (!media) return;


    const isVideo =
      /\.(mp4|webm|ogg|mov)$/i.test(
        media.name
      );


    const title =
      createTitle(media.name);


    const mediaBox =
      viewerElement.querySelector(
        ".viewer-media"
      );


    const typeBox =
      viewerElement.querySelector(
        ".viewer-type"
      );


    const titleBox =
      viewerElement.querySelector(
        ".viewer-title"
      );


    const counterBox =
      viewerElement.querySelector(
        ".viewer-counter"
      );


    /* Clear previous */

    mediaBox.innerHTML = "";


    /* =====================================================
       PHOTO
    ===================================================== */

    if (!isVideo) {

      const image =
        document.createElement("img");


      image.src =
        media.download_url;


      image.alt =
        title;


      image.draggable =
        false;


      mediaBox.appendChild(
        image
      );


      typeBox.textContent =
        "PHOTO";

    }


    /* =====================================================
       VIDEO
    ===================================================== */

    else {

      const video =
        document.createElement("video");


      video.src =
        media.download_url;


      video.controls =
        true;


      video.autoplay =
        true;


      video.playsInline =
        true;


      video.preload =
        "metadata";


      video.setAttribute(
        "playsinline",
        ""
      );


      mediaBox.appendChild(
        video
      );


      typeBox.textContent =
        "VIDEO";


      video.play()
        .catch(() => {});

    }


    titleBox.textContent =
      title;


    counterBox.textContent =
      `${currentViewerIndex + 1} / ${allMedia.length}`;


    /* Update navigation */

    updateViewerNavigation();

  }


  /* =======================================================
     PREVIOUS
  ======================================================= */

  function showPreviousMedia() {

    if (!allMedia.length) return;


    currentViewerIndex--;


    if (currentViewerIndex < 0) {

      currentViewerIndex =
        allMedia.length - 1;

    }


    renderViewerMedia();

  }


  /* =======================================================
     NEXT
  ======================================================= */

  function showNextMedia() {

    if (!allMedia.length) return;


    currentViewerIndex++;


    if (
      currentViewerIndex >=
      allMedia.length
    ) {

      currentViewerIndex = 0;

    }


    renderViewerMedia();

  }


  /* =======================================================
     NAVIGATION BUTTON STATE
  ======================================================= */

  function updateViewerNavigation() {

    if (!viewerElement) return;


    const previous =
      viewerElement.querySelector(
        ".viewer-prev"
      );


    const next =
      viewerElement.querySelector(
        ".viewer-next"
      );


    /*
      Loop navigation:
      first → last
      last → first
    */

    if (previous) {

      previous.disabled =
        allMedia.length <= 1;

    }


    if (next) {

      next.disabled =
        allMedia.length <= 1;

    }

  }


  /* =======================================================
     SWIPE
  ======================================================= */

  function handleSwipe() {

    const distance =
      touchEndX - touchStartX;


    const minimumSwipe =
      55;


    if (
      Math.abs(distance) <
      minimumSwipe
    ) {

      return;

    }


    if (distance < 0) {

      /* Swipe left → next */

      showNextMedia();

    } else {

      /* Swipe right → previous */

      showPreviousMedia();

    }

  }


  /* =======================================================
     CLOSE VIEWER
  ======================================================= */

  function closeMediaViewer() {

    if (!viewerElement) return;


    viewerElement.classList.remove(
      "active"
    );


    setTimeout(() => {

      if (viewerElement) {

        viewerElement.remove();

        viewerElement = null;

      }


      document.body.classList.remove(
        "viewer-open"
      );

    }, 250);

  }


  /* =======================================================
     KEYBOARD CONTROLS
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (!viewerElement) return;


      switch (event.key) {

        case "Escape":

          closeMediaViewer();

          break;


        case "ArrowLeft":

          event.preventDefault();

          showPreviousMedia();

          break;


        case "ArrowRight":

          event.preventDefault();

          showNextMedia();

          break;

      }

    }
  );


  /* =======================================================
     SECURITY — ESCAPE HTML
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
