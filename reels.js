(function () {
  const main = document.querySelector("main");
  const productList = document.getElementById("product-list");
  if (!main || !productList) return;

  // Add the real channel name in creator for each one (it is shown on the site).
  const reels = [
    { title: "Reel 1", creator: "", url: "https://www.youtube.com/shorts/6VCksqNWFIQ" },
    { title: "Reel 2", creator: "", url: "https://www.youtube.com/shorts/xFym1_Vw-_w" },
    { title: "Reel 3", creator: "", url: "https://www.youtube.com/shorts/KSLa909yu7Q" },
    { title: "Reel 4", creator: "", url: "https://www.youtube.com/shorts/WFtiq1DlpAg" },
    { title: "Reel 5", creator: "", url: "https://www.youtube.com/shorts/jmAUZ-nHGCA" },
    { title: "Reel 6", creator: "", url: "https://www.youtube.com/shorts/5iJhusphxhM" }
  ];

  // turns any YouTube link into the 11-character video id
  function getVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : "";
  }

  function creatorName(reel) {
    return reel.creator || "a YouTube creator";
  }

  const valid = reels
    .map(function (r) { return { ...r, id: getVideoId(r.url) }; })
    .filter(function (r) { return r.id !== ""; });

  if (valid.length === 0) return;

  /* ---------- section with cards ---------- */
  const section = document.createElement("section");
  section.className = "reels";
  const heading = document.createElement("h2");
  heading.textContent = "Reels";
  const grid = document.createElement("div");
  grid.className = "reel-grid";

  for (const reel of valid) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "reel-card";
    card.setAttribute("aria-label", "Play reel: " + reel.title);

    const img = document.createElement("img");
    img.src = "https://i.ytimg.com/vi/" + reel.id + "/hqdefault.jpg";
    img.alt = "Video thumbnail: " + reel.title;

    const play = document.createElement("span");
    play.className = "reel-play";
    play.setAttribute("aria-hidden", "true");
    play.textContent = "▶";

    const title = document.createElement("span");
    title.className = "reel-title";
    title.textContent = reel.title;

    const by = document.createElement("span");
    by.className = "reel-by";
    by.textContent = "By " + creatorName(reel);

    card.append(img, play, title, by);
    card.addEventListener("click", function () { openReel(reel); });
    grid.append(card);
  }

  section.append(heading, grid);
  main.append(section);

  /* ---------- one shared video pop-up ---------- */
  document.body.insertAdjacentHTML("beforeend",
    '<div class="modal fade" id="reel-modal" tabindex="-1" aria-labelledby="reel-modal-title" aria-hidden="true">' +
      '<div class="modal-dialog modal-dialog-centered"><div class="modal-content reel-modal-content">' +
        '<div class="modal-header"><h2 class="modal-title" id="reel-modal-title"></h2>' +
          '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close video"></button></div>' +
        '<div class="modal-body"><div class="ratio reel-ratio" id="reel-frame"></div>' +
          '<p class="reel-credit" id="reel-credit"></p></div>' +
      '</div></div></div>');

  const modalEl = document.getElementById("reel-modal");
  const frame = document.getElementById("reel-frame");

  function openReel(reel) {
    document.getElementById("reel-modal-title").textContent = reel.title;
    document.getElementById("reel-credit").textContent =
      "Video by " + creatorName(reel) + " on YouTube. All rights belong to the creator.";

    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + reel.id + "?autoplay=1&rel=0";
    iframe.title = reel.title;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  // removing the iframe stops the video when the pop-up closes
  modalEl.addEventListener("hidden.bs.modal", function () {
    frame.replaceChildren();
  });
})();