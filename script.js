/* =========================================================
   Wellness Warriors — SPA Interactions (Vanilla JS)
   ========================================================= */

/* ---------- ISO WEEK NUMBER ---------- */
function getISOWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function setWeekUI() {
  const weekNo = getISOWeekNumber(new Date());
  const parity = weekNo % 2 === 0 ? "Even week" : "Odd week";
  const satLocation = weekNo % 2 === 0 ? "Busse Woods" : "Century Park";

  const weekBadge = document.getElementById("weekBadge");
  const parityBadge = document.getElementById("parityBadge");
  const satLocationInline = document.getElementById("satLocationInline");
  const satLocationEl = document.getElementById("satLocation");
  const weekInline = document.getElementById("weekInline");

  if (weekBadge) weekBadge.textContent = `Week ${weekNo}`;
  if (weekInline) weekInline.textContent = `Week ${weekNo} (${parity.toLowerCase()})`;
  if (parityBadge) parityBadge.textContent = parity;
  if (satLocationInline) satLocationInline.textContent = satLocation;
  if (satLocationEl) satLocationEl.textContent = satLocation;
}

/* ---------- THEME TOGGLE ---------- */
function initTheme() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const saved = localStorage.getItem("ww-theme");
  if (saved === "light") document.documentElement.setAttribute("data-theme", "light");

  toggle.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (isLight) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("ww-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("ww-theme", "light");
    }
  });
}

/* ---------- MOBILE DRAWER ---------- */
function initDrawer() {
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const openBtn = document.getElementById("drawerOpen");
  const closeBtn = document.getElementById("drawerClose");

  if (!drawer || !backdrop || !openBtn || !closeBtn) return;

  const open = () => {
    drawer.setAttribute("aria-hidden", "false");
    drawer.classList.add("open");
    backdrop.hidden = false;
    backdrop.classList.add("show");
    document.body.classList.add("no-scroll");
  };

  const close = () => {
    drawer.setAttribute("aria-hidden", "true");
    drawer.classList.remove("open");
    backdrop.classList.remove("show");
    setTimeout(() => (backdrop.hidden = true), 150);
    document.body.classList.remove("no-scroll");
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  drawer.querySelectorAll("[data-close]").forEach((a) => {
    a.addEventListener("click", () => {
      close();
    });
  });

  // Escape closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ---------- TRAINING TABS ---------- */
function initTabs() {
  const tabHalf = document.getElementById("tabHalf");
  const tabFull = document.getElementById("tabFull");
  const panelHalf = document.getElementById("panelHalf");
  const panelFull = document.getElementById("panelFull");

  if (!tabHalf || !tabFull || !panelHalf || !panelFull) return;

  const setActive = (which) => {
    const isHalf = which === "half";

    tabHalf.classList.toggle("active", isHalf);
    tabFull.classList.toggle("active", !isHalf);

    tabHalf.setAttribute("aria-selected", String(isHalf));
    tabFull.setAttribute("aria-selected", String(!isHalf));

    panelHalf.classList.toggle("active", isHalf);
    panelFull.classList.toggle("active", !isHalf);

    panelHalf.hidden = !isHalf;
    panelFull.hidden = isHalf;
  };

  tabHalf.addEventListener("click", () => setActive("half"));
  tabFull.addEventListener("click", () => setActive("full"));
}

/* ---------- GALLERY LIGHTBOX ---------- */
function initLightbox() {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  const close = document.getElementById("lightboxClose");

  if (!lb || !img || !close) return;

  const openLB = (src) => {
    img.src = src;
    lb.hidden = false;
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  };

  const closeLB = () => {
    lb.setAttribute("aria-hidden", "true");
    lb.hidden = true;
    img.src = "";
    document.body.classList.remove("no-scroll");
  };

  document.querySelectorAll(".shot").forEach((btn) => {
    btn.addEventListener("click", () => {
      const full = btn.getAttribute("data-full");
      if (full) openLB(full);
    });
  });

  close.addEventListener("click", closeLB);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLB();
  });

  document.addEventListener("keydown", (e) => {
    if (!lb.hidden && e.key === "Escape") closeLB();
  });
}

/* ---------- FOOTER YEAR ---------- */
function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  setWeekUI();
  initTheme();
  initDrawer();
  initTabs();
  initLightbox();
  setYear();
});
