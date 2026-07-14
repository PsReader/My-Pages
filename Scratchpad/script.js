const storageKey = "scratchpad-theme";
const themePicker = document.getElementById("themePicker");
const themeButton = document.getElementById("themeButton");
const themeMenu = document.getElementById("themeMenu");
const themeValue = document.getElementById("themeValue");
const focusToggle = document.getElementById("focusToggle");
const charCount = document.getElementById("charCount");
const clearBtn = document.getElementById("clearBtn");
const notepad = document.getElementById("notepad");
const lastSaved = document.getElementById("lastSaved");

const themes = [
  {
    value: "midnight-studio",
    label: "Midnight Studio",
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c-2.8 0-5.1 2.3-5.1 5.1 0 1.1.4 2.2 1.1 3.1L8 12.4a5.4 5.4 0 0 0-1.4 3.7c0 2.9 2.4 5.3 5.3 5.3 2.9 0 5.3-2.4 5.3-5.3 0-1.4-.6-2.7-1.5-3.6l-.5-.6c.7-.9 1.1-2 1.1-3.1C17.1 5.3 14.8 3 12 3Z" fill="currentColor"/></svg>',
    swatch: ["#6ec5ff", "#4cc9f0"],
  },
  {
    value: "forest-quiet",
    label: "Forest Quiet",
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 7 11h2l-3 6h4v3h4v-3h4l-3-6h2L12 4Z" fill="currentColor"/></svg>',
    swatch: ["#4f6f4a", "#7c8f5a"],
  },
  {
    value: "ink-paper",
    label: "Ink & Paper",
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h8a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H9l-3-3V6a3 3 0 0 1 3-3Zm2 4v2h6V7H9Zm0 4v2h4v-2H9Z" fill="currentColor"/></svg>',
    swatch: ["#4b433b", "#8b6c4c"],
  },
  {
    value: "moonlit-library",
    label: "Moonlit Library",
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 3v8h6V7H7Zm8 0h2v8h-2V7Z" fill="currentColor"/></svg>',
    swatch: ["#c7a4ff", "#8f7ce8"],
  },
  {
    value: "minimal-zen",
    label: "Minimal Zen",
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8Zm0 2a6 6 0 0 1 4.1 10.2 1 1 0 0 0-.2-.1l-3.9-2.8a1 1 0 0 0-1.2 0L8.1 16.1a1 1 0 0 0-.2.1A6 6 0 0 1 12 6Z" fill="currentColor"/></svg>',
    swatch: ["#6d8b6d", "#8aa487"],
  },
  {
    value: "retro-typewriter",
    label: "Retro Typewriter",
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12a2 2 0 0 1 2 2v2H4V6a2 2 0 0 1 2-2Zm-2 6h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Zm3 2v2h4v-2H7Zm6 0v2h4v-2h-4Z" fill="currentColor"/></svg>',
    swatch: ["#6a5b3c", "#8a7450"],
  },
  {
    value: "solar-desk",
    label: "Solar Desk",
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm7.1 4.9a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 1 1-1.4 1.4l-1.4-1.4a1 1 0 0 1 0-1.4ZM4.5 7.9a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 0 1-1.4 1.4L4.5 9.3a1 1 0 0 1 0-1.4ZM12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4Zm8 7a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm-16 0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm14.1 4.9a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0Zm-12.2 0a1 1 0 0 1 0 1.4L8.5 20.6a1 1 0 0 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0Z" fill="currentColor"/></svg>',
    swatch: ["#bf7a20", "#d99a37"],
  },
  {
    value: "cosmic-notes",
    label: "Cosmic Notes",
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-4 4V5a2 2 0 0 1 2-2Zm2 4v2h6V7H9Zm0 4v2h4v-2H9Z" fill="currentColor"/></svg>',
    swatch: ["#7c4dff", "#00d4ff"],
  },
];

let activeTheme = "midnight-studio";
let focusModeEnabled = false;

function closeThemeMenu() {
  if (!themePicker) return;
  themePicker.classList.remove("is-open");
  if (themeButton) {
    themeButton.setAttribute("aria-expanded", "false");
  }
}

function openThemeMenu() {
  if (!themePicker) return;
  themePicker.classList.add("is-open");
  if (themeButton) {
    themeButton.setAttribute("aria-expanded", "true");
  }
}

function renderThemeMenu() {
  if (!themeMenu) return;

  const badgeMap = {
    "midnight-studio": "Glow",
    "forest-quiet": "Cozy",
    "ink-paper": "Classic",
    "moonlit-library": "Mystic",
    "minimal-zen": "Calm",
    "retro-typewriter": "Vintage",
    "solar-desk": "Bright",
    "cosmic-notes": "Cosmic",
  };

  themeMenu.innerHTML = themes
    .map(
      (theme) => `
        <button
          class="theme-option ${theme.value === activeTheme ? "is-active" : ""}"
          type="button"
          data-theme="${theme.value}"
          role="menuitem"
        >
          <span class="theme-option__left">
            <span class="theme-option__icon" aria-hidden="true">${theme.icon}</span>
            <span class="theme-option__text">
              <span class="theme-option__name">${theme.label}</span>
            </span>
          </span>
          <span class="theme-option__meta">
            <span class="theme-option__swatch" style="--swatch-a:${theme.swatch[0]}; --swatch-b:${theme.swatch[1]};"></span>
            <span class="theme-option__badge">${badgeMap[theme.value] || "Theme"}</span>
          </span>
          <span class="theme-option__check">✓</span>
        </button>
      `,
    )
    .join("");

  themeMenu.querySelectorAll(".theme-option").forEach((option) => {
    option.addEventListener("click", () => {
      applyTheme(option.dataset.theme);
      closeThemeMenu();
    });
  });
}

function applyTheme(themeName) {
  activeTheme = themeName;
  document.body.setAttribute("data-theme", themeName);
  if (themeValue) {
    const selectedTheme = themes.find((theme) => theme.value === themeName);
    themeValue.textContent = selectedTheme ? selectedTheme.label : themeName;
  }
  renderThemeMenu();
  localStorage.setItem(storageKey, themeName);
}

function loadTheme() {
  const savedTheme = localStorage.getItem(storageKey);
  const initialTheme =
    savedTheme && themes.some((theme) => theme.value === savedTheme)
      ? savedTheme
      : "midnight-studio";
  applyTheme(initialTheme);
}

function applyFocusMode(enabled) {
  focusModeEnabled = enabled;
  document.body.toggleAttribute("data-focus-mode", enabled);
  if (focusToggle) {
    focusToggle.classList.toggle("is-active", enabled);
    focusToggle.setAttribute("aria-pressed", String(enabled));
  }
  localStorage.setItem("scratchpad-focus-mode", String(enabled));
}

function loadFocusMode() {
  const savedFocusMode = localStorage.getItem("scratchpad-focus-mode");
  applyFocusMode(savedFocusMode === "true");
}

function saveDraft() {
  if (!notepad) return;

  localStorage.setItem("scratchpad-draft", notepad.value);
  if (lastSaved) {
    const time = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    lastSaved.textContent = `Saved at ${time}`;
  }
}

function loadDraft() {
  if (!notepad) return;

  const draft = localStorage.getItem("scratchpad-draft");
  if (draft !== null) {
    notepad.value = draft;
  }
}

function updateCharCount() {
  if (!charCount || !notepad) return;
  charCount.textContent = notepad.value.length;
}

if (themeButton) {
  themeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (themePicker?.classList.contains("is-open")) {
      closeThemeMenu();
    } else {
      openThemeMenu();
    }
  });
}

document.addEventListener("click", (event) => {
  if (themePicker && !themePicker.contains(event.target)) {
    closeThemeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeThemeMenu();
  }
});

if (notepad) {
  loadDraft();
  updateCharCount();

  notepad.addEventListener("input", () => {
    updateCharCount();
    saveDraft();
  });
}

if (clearBtn && notepad) {
  clearBtn.addEventListener("click", () => {
    notepad.value = "";
    updateCharCount();
    saveDraft();
  });
}

if (focusToggle) {
  focusToggle.addEventListener("click", () => {
    applyFocusMode(!focusModeEnabled);
  });
}

loadTheme();
loadFocusMode();
