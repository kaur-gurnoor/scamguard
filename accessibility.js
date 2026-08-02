// ScamGuard Senior - Accessibility Settings
// Handles text size, high-contrast mode, and dark/light theme.
// Settings persist in localStorage and apply globally via <html> attributes.

const Accessibility = (() => {
  const STORAGE_KEY = "scamguard_a11y";

  const TEXT_SIZES = ["small", "medium", "large", "xlarge"];
  const TEXT_SIZE_LABELS = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    xlarge: "Extra Large",
  };

  const defaults = {
    textSize: "medium",
    highContrast: false,
    theme: "light",
  };

  let settings = { ...defaults };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        settings = { ...defaults, ...JSON.parse(raw) };
      }
    } catch (e) {
      settings = { ...defaults };
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      /* storage unavailable, ignore */
    }
  }

  function apply() {
    const root = document.documentElement;
    root.setAttribute("data-text-size", settings.textSize);
    root.setAttribute("data-contrast", settings.highContrast ? "high" : "normal");
    root.setAttribute("data-theme", settings.theme);
  }

  function setTextSize(size) {
    if (!TEXT_SIZES.includes(size)) return;
    settings.textSize = size;
    save();
    apply();
    renderPanelState();
  }

  function setHighContrast(enabled) {
    settings.highContrast = !!enabled;
    save();
    apply();
    renderPanelState();
  }

  function setTheme(theme) {
    settings.theme = theme === "dark" ? "dark" : "light";
    save();
    apply();
    renderPanelState();
  }

  function get() {
    return { ...settings };
  }

  // ---- UI ----
  let panelEl, overlayEl, toggleBtn;

  function buildUI() {
    toggleBtn = document.createElement("button");
    toggleBtn.id = "a11y-toggle-btn";
    toggleBtn.className = "a11y-fab";
    toggleBtn.setAttribute("aria-label", "Open accessibility settings");
    toggleBtn.title = "Accessibility settings";
    toggleBtn.innerHTML = "&#9881;<span class=\"a11y-fab-label\">Settings</span>";
    document.body.appendChild(toggleBtn);

    overlayEl = document.createElement("div");
    overlayEl.id = "a11y-overlay";
    overlayEl.className = "modal-overlay hidden";

    overlayEl.innerHTML = `
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="a11y-panel-title">
        <div class="modal-header">
          <h2 id="a11y-panel-title">Accessibility Settings</h2>
          <button class="modal-close" id="a11y-close-btn" aria-label="Close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="settings-group">
            <p class="settings-label">Text Size</p>
            <div class="segmented" id="a11y-textsize-group">
              ${TEXT_SIZES.map(
                (s) => `<button class="segmented-btn" data-size="${s}">${TEXT_SIZE_LABELS[s]}</button>`
              ).join("")}
            </div>
          </div>

          <div class="settings-group">
            <p class="settings-label">Display Mode</p>
            <div class="segmented" id="a11y-theme-group">
              <button class="segmented-btn" data-theme="light">&#9728; Light</button>
              <button class="segmented-btn" data-theme="dark">&#9790; Dark</button>
            </div>
          </div>

          <div class="settings-group">
            <div class="toggle-row">
              <div>
                <p class="settings-label" style="margin-bottom:2px;">High-Contrast Mode</p>
                <p class="settings-hint">Stronger colors and outlines for easier reading.</p>
              </div>
              <label class="switch">
                <input type="checkbox" id="a11y-contrast-toggle">
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlayEl);
    panelEl = overlayEl.querySelector(".modal-panel");

    toggleBtn.addEventListener("click", openPanel);
    overlayEl.querySelector("#a11y-close-btn").addEventListener("click", closePanel);
    overlayEl.addEventListener("click", (e) => {
      if (e.target === overlayEl) closePanel();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlayEl.classList.contains("hidden")) closePanel();
    });

    overlayEl.querySelectorAll("#a11y-textsize-group .segmented-btn").forEach((btn) => {
      btn.addEventListener("click", () => setTextSize(btn.dataset.size));
    });
    overlayEl.querySelectorAll("#a11y-theme-group .segmented-btn").forEach((btn) => {
      btn.addEventListener("click", () => setTheme(btn.dataset.theme));
    });
    overlayEl.querySelector("#a11y-contrast-toggle").addEventListener("change", (e) => {
      setHighContrast(e.target.checked);
    });
  }

  function renderPanelState() {
    if (!overlayEl) return;
    overlayEl.querySelectorAll("#a11y-textsize-group .segmented-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.size === settings.textSize);
    });
    overlayEl.querySelectorAll("#a11y-theme-group .segmented-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.theme === settings.theme);
    });
    overlayEl.querySelector("#a11y-contrast-toggle").checked = settings.highContrast;
  }

  function openPanel() {
    overlayEl.classList.remove("hidden");
  }

  function closePanel() {
    overlayEl.classList.add("hidden");
  }

  function init() {
    load();
    apply();
    buildUI();
    renderPanelState();
  }

  return { init, setTextSize, setHighContrast, setTheme, get, openPanel, closePanel };
})();

document.addEventListener("DOMContentLoaded", () => Accessibility.init());
