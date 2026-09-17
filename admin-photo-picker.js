(() => {
  const pickers = new WeakMap();
  const previewFor = (input, root) => {
    const selectors = [
      ["[data-inline-show-gallery]", "[data-inline-show-gallery-preview]"],
      ["[data-inline-show-banner]", "[data-inline-show-banner-shell], .inline-preview-shell, .inline-preview"],
      ["[data-inline-banner]", ".inline-preview"],
      ["[data-artist-photos]", "[data-artist-inline-preview]"],
      ["[data-affiliate-image]", ".affiliate-admin-preview"],
      ["#upcoming-form input[name=bannerUpload]", "#upcoming-banner-preview"],
      ["#artist-profile-form input[name=photos]", "#artist-photo-preview-grid"],
      ["#show-form input[name=galleryUpload]", "#show-gallery-preview-grid"],
      ["#affiliate-form input[name=imageUpload]", "#affiliate-image-preview"]
    ];
    const match = selectors.find(([selector]) => input.matches(selector));
    return match ? root.querySelector(match[1]) : null;
  };
  const upgrade = () => {
    document.querySelectorAll('#owner-shell input[type="file"][accept*="image"]').forEach((input) => {
      const root = input.closest(".inline-editor, form") || input.parentElement.parentElement;
      let picker = pickers.get(input);
      if (!picker) {
        const label = input.closest("label");
        const grid = document.createElement("div");
        grid.className = "photo-picker";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "photo-picker-add";
        button.textContent = "+";
        const labelText = label?.textContent.trim() || "photo";
        button.setAttribute("aria-label", input.multiple ? "Add photos" : "Add or replace photo");
        button.title = input.multiple ? "Add photos" : "Add or replace photo";
        grid.setAttribute("role", "group");
        grid.setAttribute("aria-label", labelText);
        button.addEventListener("click", () => input.click());
        grid.append(button);
        (label || input).after(grid);
        const caption = document.createElement("p");
        caption.className = "photo-picker-caption";
        caption.textContent = input.multiple ? "Photos" : (input.name === "bannerUpload" || input.matches("[data-inline-banner], [data-inline-show-banner]") ? "Flyer" : "Image");
        grid.before(caption);
        if (label) label.classList.add("photo-picker-native");
        else input.classList.add("photo-picker-native");
        picker = { grid, button, fallback: null };
        pickers.set(input, picker);
        // Existing multi-photo handlers retain their queues and removal buttons.
        input.addEventListener("change", () => {
          if (input.multiple || !input.files[0]) return;
          const reader = new FileReader();
          reader.onload = () => {
            if (!input.isConnected) return;
            let preview = previewFor(input, root);
            let image = (preview?.matches("img") ? preview : preview?.querySelector("img")) || picker.fallback;
            if (!image) {
              image = document.createElement("img");
              image.alt = "Selected photo";
              picker.fallback = image;
              picker.grid.insertBefore(image, picker.button);
            }
            image.src = String(reader.result || "");
            image.classList.remove("hidden");
            upgrade();
          };
          reader.readAsDataURL(input.files[0]);
        });
        input.form?.addEventListener("reset", () => {
          picker.fallback?.remove();
          picker.fallback = null;
        });
      }
      const preview = previewFor(input, root);
      if (preview && preview.parentElement !== picker.grid) {
        picker.fallback?.remove();
        picker.fallback = null;
        preview.classList.add("photo-picker-previews");
        picker.grid.insertBefore(preview, picker.button);
      }
      picker.grid.querySelectorAll("img").forEach((image) => {
        const tile = image.closest(".inline-thumb") || image;
        tile.hidden = !image.getAttribute("src") || image.src === window.__soundwavArtistPlaceholder;
      });
    });
  };
  const start = () => {
    upgrade();
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; upgrade(); });
    }).observe(document.getElementById("owner-shell"), { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
