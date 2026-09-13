// Navigation mobile (toggle burger)
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  initRegressionPlot();
  initTabs();
  initDataTables();
});

/* ============================================================
   TABS — menu de navigation des tableaux/sections interactifs
   ============================================================ */
function initTabs() {
  document.querySelectorAll("[data-tabgroup]").forEach((group) => {
    const groupName = group.getAttribute("data-tabgroup");
    const buttons = group.querySelectorAll(".tab-btn");
    const panels = document.querySelectorAll(
      `.tab-panel[data-tabgroup-panel="${groupName}"]`
    );

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        buttons.forEach((b) => b.classList.toggle("active", b === btn));
        panels.forEach((p) =>
          p.classList.toggle("active", p.getAttribute("data-tab") === target)
        );
        if (history.replaceState) {
          history.replaceState(null, "", `#${target}`);
        }
      });
    });

    // Ouvre l'onglet indiqué par le hash de l'URL, sinon le premier
    const hash = window.location.hash.replace("#", "");
    const match = Array.from(buttons).find((b) => b.getAttribute("data-tab") === hash);
    if (match) match.click();
  });
}

/* ============================================================
   DATA TABLES — tri par colonne + recherche texte live
   ============================================================ */
function initDataTables() {
  document.querySelectorAll("table.data-table").forEach((table) => {
    const tbody = table.querySelector("tbody");
    const headers = table.querySelectorAll("thead th[data-sort]");

    headers.forEach((th, colIndex) => {
      th.addEventListener("click", () => {
        const type = th.getAttribute("data-sort"); // "text" | "num"
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const asc = !th.classList.contains("sorted-asc");

        headers.forEach((h) => h.classList.remove("sorted-asc", "sorted-desc"));
        th.classList.add(asc ? "sorted-asc" : "sorted-desc");

        rows.sort((a, b) => {
          let va = a.children[colIndex].getAttribute("data-value") ?? a.children[colIndex].textContent.trim();
          let vb = b.children[colIndex].getAttribute("data-value") ?? b.children[colIndex].textContent.trim();
          if (type === "num") {
            va = parseFloat(va.replace(/[^0-9.\-]/g, "")) || 0;
            vb = parseFloat(vb.replace(/[^0-9.\-]/g, "")) || 0;
            return asc ? va - vb : vb - va;
          }
          return asc ? String(va).localeCompare(String(vb), "fr") : String(vb).localeCompare(String(va), "fr");
        });

        rows.forEach((r) => tbody.appendChild(r));
      });
    });

    // Recherche live liée via data-search-for="<id de la table>"
    const searchBox = document.querySelector(`[data-search-for="${table.id}"]`);
    if (searchBox) {
      searchBox.addEventListener("input", () => {
        const q = searchBox.value.trim().toLowerCase();
        tbody.querySelectorAll("tr").forEach((row) => {
          row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
        });
      });
    }
  });
}

/**
 * Anime un nuage de points avec droite de régression + intervalle de confiance.
 * Élément signature de la page d'accueil.
 */
function initRegressionPlot() {
  const svg = document.querySelector("#regression-plot");
  if (!svg) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const W = 480, H = 320, PAD = 30;
  const n = 28;
  const points = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < n; i++) {
    const x = PAD + (rand() * (W - PAD * 2));
    const trend = H - PAD - ((x - PAD) / (W - PAD * 2)) * (H - PAD * 2);
    const noise = (rand() - 0.5) * 90;
    const y = Math.min(H - PAD, Math.max(PAD, trend + noise));
    points.push([x, y]);
  }

  const ns = "http://www.w3.org/2000/svg";
  const gridGroup = document.createElementNS(ns, "g");
  gridGroup.setAttribute("stroke", "var(--line)");
  gridGroup.setAttribute("stroke-width", "1");
  for (let gx = PAD; gx <= W - PAD; gx += (W - PAD * 2) / 6) {
    const l = document.createElementNS(ns, "line");
    l.setAttribute("x1", gx); l.setAttribute("x2", gx);
    l.setAttribute("y1", PAD); l.setAttribute("y2", H - PAD);
    l.setAttribute("opacity", "0.5");
    gridGroup.appendChild(l);
  }
  for (let gy = PAD; gy <= H - PAD; gy += (H - PAD * 2) / 5) {
    const l = document.createElementNS(ns, "line");
    l.setAttribute("x1", PAD); l.setAttribute("x2", W - PAD);
    l.setAttribute("y1", gy); l.setAttribute("y2", gy);
    l.setAttribute("opacity", "0.5");
    gridGroup.appendChild(l);
  }
  svg.appendChild(gridGroup);

  const band = document.createElementNS(ns, "polygon");
  const bandPoints = [
    [PAD, H - PAD - 40], [W - PAD, PAD + 20],
    [W - PAD, PAD + 55], [PAD, H - PAD + 5]
  ].map(p => p.join(",")).join(" ");
  band.setAttribute("points", bandPoints);
  band.setAttribute("fill", "var(--teal)");
  band.setAttribute("opacity", "0");
  svg.appendChild(band);

  const line = document.createElementNS(ns, "line");
  line.setAttribute("x1", PAD); line.setAttribute("y1", H - PAD - 20);
  line.setAttribute("x2", PAD); line.setAttribute("y2", H - PAD - 20);
  line.setAttribute("stroke", "var(--ink)");
  line.setAttribute("stroke-width", "2");
  svg.appendChild(line);

  const dotsGroup = document.createElementNS(ns, "g");
  points.forEach(([x, y], i) => {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", 0);
    c.setAttribute("fill", i % 7 === 0 ? "var(--amber)" : "var(--teal)");
    c.setAttribute("opacity", "0.85");
    dotsGroup.appendChild(c);
    if (!reduceMotion) {
      c.animate(
        [{ r: 0 }, { r: 4.5 }],
        { duration: 500, delay: i * 25, fill: "forwards", easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    } else {
      c.setAttribute("r", 4);
    }
  });
  svg.appendChild(dotsGroup);

  const drawLine = () => {
    line.animate(
      [
        { x2: PAD, y2: H - PAD - 20 },
        { x2: W - PAD, y2: PAD + 35 }
      ],
      { duration: 900, fill: "forwards", easing: "cubic-bezier(.2,.8,.2,1)" }
    );
    band.animate([{ opacity: 0 }, { opacity: 0.12 }], { duration: 700, fill: "forwards" });
    line.setAttribute("x2", W - PAD);
    line.setAttribute("y2", PAD + 35);
    band.setAttribute("opacity", "0.12");
  };

  if (reduceMotion) {
    drawLine();
  } else {
    setTimeout(drawLine, n * 25 + 200);
  }
}
