// --- SHOP: filtering + sorting + quick view ---
const grid = document.getElementById("productGrid");
const count = document.getElementById("count");
const sortSel = document.getElementById("sort");
const resetBtn = document.getElementById("resetFilters");

const modal = document.getElementById("modal");
const mImg = document.getElementById("mImg");
const mTitle = document.getElementById("mTitle");
const mDesc = document.getElementById("mDesc");
const mNotes = document.getElementById("mNotes");
const mCode = document.getElementById("mCode");
const mAvail = document.getElementById("mAvail");
const mSize = document.getElementById("mSize");
const mPrice = document.getElementById("mPrice");
const mRequest = document.getElementById("mRequest");

let activeSize = "all";

function getProducts(){
  return Array.from(grid?.querySelectorAll(".product") || []);
}

function selectedValues(filterName){
  const boxes = Array.from(document.querySelectorAll(`input[data-filter="${filterName}"]`));
  return boxes.filter(b => b.checked).map(b => b.value);
}

function normalizeAvail(a){
  // keep labels consistent in modal
  if (a === "available") return "available";
  if (a === "sold") return "sold";
  return "archive";
}

function applyFilters(){
  if (!grid) return;

  const avail = selectedValues("availability");
  const cats  = selectedValues("category");
  const cols  = selectedValues("color");

  const products = getProducts();

  products.forEach(p => {
    const pa = p.dataset.availability;
    const pc = p.dataset.category;
    const pcol = p.dataset.color;
    const psz = p.dataset.size;

    const okAvail = avail.includes(pa);
    const okCat   = cats.includes(pc);
    const okCol   = cols.includes(pcol);
    const okSize  = (activeSize === "all") || (psz === activeSize);

    const show = okAvail && okCat && okCol && okSize;
    p.style.display = show ? "" : "none";
  });

  const visible = products.filter(p => p.style.display !== "none").length;
  if (count) count.textContent = String(visible);

  applySort();
}

function applySort(){
  if (!grid || !sortSel) return;

  const products = getProducts().filter(p => p.style.display !== "none");

  const mode = sortSel.value;

  products.sort((a,b) => {
    if (mode === "newest"){
      return new Date(b.dataset.date) - new Date(a.dataset.date);
    }
    if (mode === "price-asc"){
      return Number(a.dataset.price) - Number(b.dataset.price);
    }
    if (mode === "price-desc"){
      return Number(b.dataset.price) - Number(a.dataset.price);
    }
    return 0;
  });

  // Re-append in sorted order
  products.forEach(p => grid.appendChild(p));
}

function setActiveSize(value){
  activeSize = value;
  document.querySelectorAll("[data-filter-pill='size']").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.value === value);
  });
  applyFilters();
}

document.querySelectorAll("input[data-filter]").forEach(inp => {
  inp.addEventListener("change", applyFilters);
});

document.querySelectorAll("[data-filter-pill='size']").forEach(btn => {
  btn.addEventListener("click", () => setActiveSize(btn.dataset.value));
});

sortSel?.addEventListener("change", applyFilters);

resetBtn?.addEventListener("click", () => {
  document.querySelectorAll("input[data-filter]").forEach(inp => inp.checked = true);
  setActiveSize("all");
  if (sortSel) sortSel.value = "newest";
  applyFilters();
});

// QUICK VIEW
function openModal(product){
  if (!modal) return;
  const d = product.dataset;

  mImg.src = d.image || "";
  mImg.alt = `SEDAT ${d.title || "piece"}`;
  mTitle.textContent = d.title || "SEDAT";
  mDesc.textContent = d.desc || "";
  mNotes.textContent = d.notes || "";
  mCode.textContent = d.id || "SDT-—";
  mAvail.textContent = normalizeAvail(d.availability || "available");
  mSize.textContent = d.size || "—";

  // price: if sold/archive, show ARCHIVE
  if ((d.availability || "") === "sold") {
    mPrice.textContent = "ARCHIVE";
  } else {
    mPrice.textContent = `€${d.price || "—"}`;
  }

  // REQUEST link: send to contact with prefilled text via hash + dataset (demo)
  const msg = encodeURIComponent(`REQUEST: ${d.id || ""} — ${d.title || "SEDAT piece"} | size ${d.size || ""}`);
  mRequest.setAttribute("href", `#contact`);
  mRequest.dataset.prefill = msg;

  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(){
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

grid?.addEventListener("click", (e) => {
  const card = e.target.closest(".product");
  if (!card) return;
  openModal(card);
});

modal?.addEventListener("click", (e) => {
  if (e.target.matches("[data-close]")) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Optional: prefill contact textarea when coming from modal REQUEST
const contactForm = document.getElementById("contactForm");
contactForm?.addEventListener("submit", (e) => {
  // keep your demo alert or replace with real endpoint
});

// If you want prefill on click:
document.addEventListener("click", (e) => {
  const a = e.target.closest("#mRequest");
  if (!a) return;
  const encoded = a.dataset.prefill;
  const ta = document.querySelector("#contactForm textarea[name='message']");
  if (ta && encoded){
    ta.value = decodeURIComponent(encoded) + "\nCountry:\nShipping:\n";
  }
});

// Initialize
applyFilters();
