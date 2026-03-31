const STORAGE_KEY = "cadre_admin_films_v1";

const state = {
  films: [],
  filtered: [],
  selectedId: null
};

const refs = {
  searchInput: document.getElementById("searchInput"),
  yearFilter: document.getElementById("yearFilter"),
  countryFilter: document.getElementById("countryFilter"),
  filmsTableBody: document.getElementById("filmsTableBody"),
  stats: document.getElementById("stats"),
  filmForm: document.getElementById("filmForm"),
  peopleList: document.getElementById("peopleList"),
  screeningsList: document.getElementById("screeningsList"),
  mediaList: document.getElementById("mediaList"),
  newFilmBtn: document.getElementById("newFilmBtn"),
  deleteFilmBtn: document.getElementById("deleteFilmBtn"),
  addPersonBtn: document.getElementById("addPersonBtn"),
  addScreeningBtn: document.getElementById("addScreeningBtn"),
  addMediaBtn: document.getElementById("addMediaBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importInput: document.getElementById("importInput")
};

async function init() {
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData) {
    state.films = JSON.parse(localData);
  } else {
    const response = await fetch("../data/sample_short_films.json");
    state.films = await response.json();
    persist();
  }

  state.selectedId = state.films[0]?.id ?? null;
  state.filtered = [...state.films];

  bindEvents();
  refreshFilters();
  renderAll();
}

function bindEvents() {
  refs.searchInput.addEventListener("input", applyFilters);
  refs.yearFilter.addEventListener("change", applyFilters);
  refs.countryFilter.addEventListener("change", applyFilters);

  refs.newFilmBtn.addEventListener("click", createFilm);
  refs.deleteFilmBtn.addEventListener("click", deleteFilm);
  refs.addPersonBtn.addEventListener("click", () => addRow("people"));
  refs.addScreeningBtn.addEventListener("click", () => addRow("screenings"));
  refs.addMediaBtn.addEventListener("click", () => addRow("media_assets"));

  refs.filmForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveCurrentFilm();
  });

  refs.exportBtn.addEventListener("click", exportJson);
  refs.importInput.addEventListener("change", importJson);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.films));
}

function refreshFilters() {
  refs.yearFilter.innerHTML = '<option value="">Toutes les années</option>';
  refs.countryFilter.innerHTML = '<option value="">Tous les pays</option>';

  const years = [...new Set(state.films.map((f) => f.release_year).filter(Boolean))].sort((a, b) => b - a);
  years.forEach((year) => refs.yearFilter.append(new Option(String(year), String(year))));

  const countries = [...new Set(state.films.flatMap((f) => f.country_codes || []))].sort();
  countries.forEach((country) => refs.countryFilter.append(new Option(country, country)));
}

function applyFilters() {
  const query = refs.searchInput.value.trim().toLowerCase();
  const year = refs.yearFilter.value;
  const country = refs.countryFilter.value;

  state.filtered = state.films.filter((film) => {
    const queryText = [
      film.title,
      ...(film.people || []).map((p) => p.name),
      ...(film.screenings || []).map((s) => s.festival)
    ]
      .join(" ")
      .toLowerCase();

    const matchQuery = !query || queryText.includes(query);
    const matchYear = !year || String(film.release_year) === year;
    const matchCountry = !country || (film.country_codes || []).includes(country);
    return matchQuery && matchYear && matchCountry;
  });

  if (!state.filtered.find((f) => f.id === state.selectedId)) {
    state.selectedId = state.filtered[0]?.id ?? null;
  }

  renderAll();
}

function renderAll() {
  renderStats();
  renderTable();
  renderEditor();
}

function renderStats() {
  const festivalsCount = new Set(
    state.filtered.flatMap((film) => (film.screenings || []).map((s) => s.festival))
  ).size;
  const peopleCount = new Set(state.filtered.flatMap((film) => (film.people || []).map((p) => p.name))).size;

  const cards = [
    [state.filtered.length, "Films visibles"],
    [festivalsCount, "Festivals liés"],
    [peopleCount, "Personnes créditées"]
  ];

  refs.stats.innerHTML = cards
    .map(
      ([value, label]) =>
        `<article class="stat-card"><strong>${value}</strong><span>${label}</span></article>`
    )
    .join("");
}

function renderTable() {
  refs.filmsTableBody.innerHTML = "";

  state.filtered.forEach((film) => {
    const tr = document.createElement("tr");
    if (film.id === state.selectedId) tr.classList.add("active");
    tr.innerHTML = `
      <td><strong>${escapeHtml(film.title || "(Sans titre)")}</strong></td>
      <td>${film.release_year ?? "—"}</td>
      <td>${(film.country_codes || []).join(", ") || "—"}</td>
      <td>${(film.screenings || []).length}</td>
    `;
    tr.addEventListener("click", () => {
      state.selectedId = film.id;
      renderAll();
    });
    refs.filmsTableBody.appendChild(tr);
  });
}

function renderEditor() {
  const film = getSelectedFilm();
  if (!film) {
    refs.filmForm.reset();
    refs.peopleList.innerHTML = "";
    refs.screeningsList.innerHTML = "";
    refs.mediaList.innerHTML = "";
    return;
  }

  setValue("title", film.title);
  setValue("release_year", film.release_year);
  setValue("duration_minutes", film.duration_minutes);
  setValue("country_codes", (film.country_codes || []).join(", "));
  setValue("genres", (film.genres || []).join(", "));
  setValue("animation_techniques", (film.animation_techniques || []).join(", "));
  setValue("synopsis", film.synopsis || "");

  renderDynamicRows("people", film.people || []);
  renderDynamicRows("screenings", film.screenings || []);
  renderDynamicRows("media_assets", film.media_assets || []);
}

function renderDynamicRows(type, rows) {
  const container =
    type === "people" ? refs.peopleList : type === "screenings" ? refs.screeningsList : refs.mediaList;
  container.innerHTML = "";

  rows.forEach((row, idx) => {
    const block = document.createElement("div");
    block.className = "row-block";

    if (type === "people") {
      block.innerHTML = `
        <input data-type="people" data-idx="${idx}" data-field="name" placeholder="Nom" value="${escapeAttr(row.name)}" />
        <input data-type="people" data-idx="${idx}" data-field="role" placeholder="Rôle" value="${escapeAttr(row.role)}" />
        <span></span><span></span>
        <button type="button" data-remove="people" data-idx="${idx}">🗑</button>`;
    }

    if (type === "screenings") {
      block.innerHTML = `
        <input data-type="screenings" data-idx="${idx}" data-field="festival" placeholder="Festival" value="${escapeAttr(row.festival)}" />
        <input data-type="screenings" data-idx="${idx}" data-field="edition_year" type="number" placeholder="Année" value="${escapeAttr(row.edition_year)}" />
        <input data-type="screenings" data-idx="${idx}" data-field="section_name" placeholder="Section" value="${escapeAttr(row.section_name)}" />
        <input data-type="screenings" data-idx="${idx}" data-field="award_name" placeholder="Prix" value="${escapeAttr(row.award_name)}" />
        <button type="button" data-remove="screenings" data-idx="${idx}">🗑</button>`;
    }

    if (type === "media_assets") {
      block.innerHTML = `
        <input data-type="media_assets" data-idx="${idx}" data-field="asset_type" placeholder="Type" value="${escapeAttr(row.asset_type)}" />
        <input data-type="media_assets" data-idx="${idx}" data-field="platform" placeholder="Plateforme" value="${escapeAttr(row.platform)}" />
        <input data-type="media_assets" data-idx="${idx}" data-field="url" placeholder="URL" value="${escapeAttr(row.url)}" />
        <input data-type="media_assets" data-idx="${idx}" data-field="language" placeholder="Langue" value="${escapeAttr(row.language)}" />
        <button type="button" data-remove="media_assets" data-idx="${idx}">🗑</button>`;
    }

    container.appendChild(block);
  });

  container.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", handleDynamicInput);
  });

  container.querySelectorAll("button[data-remove]").forEach((button) => {
    button.addEventListener("click", removeDynamicRow);
  });
}

function handleDynamicInput(event) {
  const { type, idx, field } = event.target.dataset;
  const film = getSelectedFilm();
  film[type][Number(idx)][field] = event.target.value;
  persist();
  applyFilters();
}

function removeDynamicRow(event) {
  const { remove: type, idx } = event.currentTarget.dataset;
  const film = getSelectedFilm();
  film[type].splice(Number(idx), 1);
  persist();
  renderEditor();
  applyFilters();
}

function addRow(type) {
  const film = getSelectedFilm();
  if (!film) return;

  if (type === "people") film.people = [...(film.people || []), { name: "", role: "" }];
  if (type === "screenings") {
    film.screenings = [
      ...(film.screenings || []),
      { festival: "", edition_year: "", section_name: "", award_name: "" }
    ];
  }
  if (type === "media_assets") {
    film.media_assets = [...(film.media_assets || []), { asset_type: "trailer", platform: "", url: "", language: "" }];
  }

  persist();
  renderEditor();
  applyFilters();
}

function createFilm() {
  const newFilm = {
    id: generateId(),
    title: "Nouveau film",
    release_year: new Date().getFullYear(),
    duration_minutes: 1,
    country_codes: [],
    genres: [],
    animation_techniques: [],
    synopsis: "",
    people: [],
    screenings: [],
    media_assets: []
  };
  state.films.unshift(newFilm);
  state.selectedId = newFilm.id;
  persist();
  refreshFilters();
  applyFilters();
}

function saveCurrentFilm() {
  const film = getSelectedFilm();
  if (!film) return;

  film.title = getValue("title").trim();
  film.release_year = toNumberOrNull(getValue("release_year"));
  film.duration_minutes = toNumberOrNull(getValue("duration_minutes"));
  film.country_codes = parseList(getValue("country_codes"));
  film.genres = parseList(getValue("genres"));
  film.animation_techniques = parseList(getValue("animation_techniques"));
  film.synopsis = getValue("synopsis").trim();

  persist();
  refreshFilters();
  applyFilters();
}

function deleteFilm() {
  if (!state.selectedId) return;
  const ok = confirm("Supprimer ce film ?");
  if (!ok) return;

  state.films = state.films.filter((film) => film.id !== state.selectedId);
  state.selectedId = state.films[0]?.id ?? null;
  persist();
  refreshFilters();
  applyFilters();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state.films, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cadre_films_export.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!Array.isArray(parsed)) throw new Error("Format invalide");
      state.films = parsed;
      state.selectedId = state.films[0]?.id ?? null;
      persist();
      refreshFilters();
      applyFilters();
      alert("Import effectué.");
    } catch {
      alert("JSON invalide. Import annulé.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function getSelectedFilm() {
  return state.films.find((film) => film.id === state.selectedId) || null;
}

function parseList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumberOrNull(value) {
  if (!value) return null;
  const asNumber = Number(value);
  return Number.isNaN(asNumber) ? null : asNumber;
}

function generateId() {
  return Math.max(0, ...state.films.map((film) => Number(film.id) || 0)) + 1;
}

function getValue(name) {
  return refs.filmForm.elements[name].value;
}

function setValue(name, value) {
  refs.filmForm.elements[name].value = value ?? "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value ?? "");
}

init();
