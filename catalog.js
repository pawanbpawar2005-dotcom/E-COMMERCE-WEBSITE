const CATALOG_CONFIGS = {
  Processor: {
    stockByTitle: {
      "Intel Core i5-12400F": true,
      "Intel Core i7-12700K": true,
      "AMD Ryzen 5 5600X": true,
      "AMD Ryzen 7 5800X3D": false,
      "Intel Core i9-12900K": true,
      "AMD Ryzen 9 5900X": false,
    },
    brand(title) {
      return title.startsWith("Intel") ? "Intel" : "AMD";
    },
    filterExtractors: {
      Socket: (product) => product.specs["Compatible Socket"],
      Brand: (product) => product.brand,
      Threads: (product) => product.specs["Threads"],
      Cache: (product) => cleanValue(product.specs["Cache"]),
      Series: (product) => {
        const match = product.title.match(/(Core i\d|Ryzen \d)/i);
        return match ? match[1].replace(/\s+/g, " ").trim() : "";
      },
      "Max Turbo Frequency": (product) =>
        cleanValue(product.specs["Boost Clock"]).replace(/^Up to\s*/i, ""),
      "Integrated Graphics": (product) => {
        if (product.title.endsWith("F")) {
          return "No";
        }

        if (product.title.startsWith("Intel")) {
          return "Yes";
        }

        return "No";
      },
    },
  },
  "Graphics Card": {
    stockByTitle: {
      "NVIDIA RTX 4060": true,
      "NVIDIA RTX 4070": true,
      "AMD RX 7600": false,
      "NVIDIA RTX 4080": true,
      "AMD RX 7800 XT": true,
      "NVIDIA RTX 4090": false,
    },
    brand(title) {
      return title.startsWith("NVIDIA") ? "NVIDIA" : "AMD";
    },
    filterExtractors: {
      Brand: (product) => product.brand,
      "Memory Type": (product) => {
        const match = cleanValue(product.specs["VRAM"]).match(/GDDR\dX?/i);
        return match ? match[0].toUpperCase() : "";
      },
      GPU: (product) => (product.title.includes("RTX") ? "GeForce RTX" : "Radeon RX"),
      "Memory Interface": (product) => cleanValue(product.specs["Bus Width"]),
      VRAM: (product) => {
        const match = cleanValue(product.specs["VRAM"]).match(/^\d+\s*GB/i);
        return match ? match[0].replace(/\s+/g, "") : "";
      },
    },
  },
  Motherboard: {
    stockByTitle: {
      "MSI B450 TOMAHAWK MAX": true,
      "ASUS ROG STRIX B550-F": true,
      "MSI MAG Z690 TOMAHAWK": false,
      "ASUS ROG CROSSHAIR X570": true,
      "Gigabyte Z790 AORUS ELITE": true,
      "ASRock B650M PRO RS": true,
    },
    brand(title) {
      if (title.startsWith("ASUS")) return "ASUS";
      if (title.startsWith("MSI")) return "MSI";
      if (title.startsWith("Gigabyte")) return "Gigabyte";
      return "ASRock";
    },
    filterExtractors: {
      Socket: (product) => cleanValue(product.specs["Socket"]),
      Brand: (product) => product.brand,
      "Form Factor": (product) => {
        if (product.title.includes("B650M")) return "Micro-ATX";
        return "ATX";
      },
      "Memory Type": (product) => {
        const match = cleanValue(product.specs["RAM Support"]).match(/DDR\d/i);
        return match ? match[0].toUpperCase() : "";
      },
      Chipset: (product) => cleanValue(product.specs["Chipset"]).toUpperCase(),
    },
  },
  RAM: {
    stockByTitle: {
      "Corsair Vengeance LPX 8GB DDR4": true,
      "G.Skill Ripjaws V 16GB DDR4": true,
      "Kingston HyperX Fury 32GB DDR4": true,
      "Corsair Vengeance 16GB DDR5": false,
      "TeamGroup T-Force Delta RGB 32GB DDR5": true,
      "G.Skill Trident Z RGB 64GB DDR4": true,
    },
    brand(title) {
      if (title.startsWith("G.Skill")) return "G.Skill";
      if (title.startsWith("Corsair")) return "Corsair";
      if (title.startsWith("Kingston")) return "Kingston";
      return "TeamGroup";
    },
    filterExtractors: {
      Brand: (product) => product.brand,
      "Memory Type": (product) => cleanValue(product.specs["Type"]).toUpperCase(),
      Colour: (product) => {
        if (product.title.includes("Delta")) return "White";
        return "Black";
      },
      "Kit Type": (product) =>
        cleanValue(product.specs["Capacity"]).includes("(1x")
          ? "Single Stick"
          : "Dual Channel Kit",
      "Memory Size": (product) => cleanValue(product.specs["Capacity"]).split(" ")[0],
      "Memory Speed": (product) => cleanValue(product.specs["Speed"]).toUpperCase(),
      RGB: (product) => (product.title.includes("RGB") ? "Yes" : "No"),
    },
  },
  "Internal SSD": {
    stockByTitle: {
      "Samsung 870 EVO 500GB SATA SSD": true,
      "WD Blue SN570 1TB NVMe SSD": true,
      "Seagate Barracuda 2TB HDD": false,
      "Crucial P5 Plus 1TB NVMe SSD": true,
      "WD Blue 4TB HDD": true,
      "Kingston NV2 2TB NVMe SSD": true,
    },
    brand(title) {
      if (title.startsWith("WD ")) return "WD";
      return title.split(" ")[0];
    },
    filterExtractors: {
      Brand: (product) => product.brand,
      "Form Factor": (product) => cleanValue(product.specs["Form Factor"]),
      Capacity: (product) => cleanValue(product.specs["Capacity"]),
    },
  },
  "Power Supply": {
    stockByTitle: {
      "Corsair CV450 450W 80+ Bronze": true,
      "Seasonic S12III 650W 80+ Bronze": true,
      "Corsair RM750x 750W 80+ Gold": true,
      "EVGA SuperNOVA 850W 80+ Gold": false,
      "Seasonic Prime TX-1000 1000W 80+ Titanium": true,
      "Cooler Master MWE 600W 80+ Bronze": true,
    },
    brand(title) {
      if (title.startsWith("Cooler Master")) return "Cooler Master";
      return title.split(" ")[0];
    },
    filterExtractors: {
      Brand: (product) => product.brand,
      Certification: (product) => cleanValue(product.specs["Efficiency"]),
      Modular: (product) => cleanValue(product.specs["Modularity"]),
      Wattage: (product) => cleanValue(product.specs["Wattage"]),
    },
  },
};

const PRODUCT_MEDIA = {
  "Intel Core i5-12400F": {
    src: "PHOTOS/CPUS/gearvn-intel_core_i5_12400f-3_16688825e0c044b48ca050c912cfca09.png",
    alt: "Intel Core i5-12400F processor",
  },
  "Intel Core i7-12700K": {
    src: "PHOTOS/CPUS/i7 12700k.jpg",
    alt: "Intel Core i7-12700K processor",
  },
  "AMD Ryzen 5 5600X": {
    src: "PHOTOS/CPUS/ryzen 5 5600x.webp",
    alt: "AMD Ryzen 5 5600X processor",
  },
  "AMD Ryzen 7 5800X3D": {
    src: "https://loremflickr.com/640/480/cpu,processor?lock=104",
    alt: "AMD Ryzen 7 5800X3D processor",
  },
  "Intel Core i9-12900K": {
    src: "PHOTOS/CPUS/i9 12900k.jpg",
    alt: "Intel Core i9-12900K processor",
  },
  "AMD Ryzen 9 5900X": {
    src: "https://loremflickr.com/640/480/cpu,processor?lock=106",
    alt: "AMD Ryzen 9 5900X processor",
  },
  "NVIDIA RTX 4060": {
    src: "PHOTOS/GPUS/rtx 4060.jpg",
    alt: "NVIDIA RTX 4060 graphics card",
  },
  "NVIDIA RTX 4070": {
    src: "PHOTOS/GPUS/rtx 4070.webp",
    alt: "NVIDIA RTX 4070 graphics card",
  },
  "AMD RX 7600": {
    src: "https://loremflickr.com/640/480/gpu,graphics-card?lock=203",
    alt: "AMD RX 7600 graphics card",
  },
  "NVIDIA RTX 4080": {
    src: "PHOTOS/GPUS/rtx 4080.webp",
    alt: "NVIDIA RTX 4080 graphics card",
  },
  "AMD RX 7800 XT": {
    src: "PHOTOS/GPUS/rx 7800 xt.jpg",
    alt: "AMD RX 7800 XT graphics card",
  },
  "NVIDIA RTX 4090": {
    src: "https://loremflickr.com/640/480/gpu,graphics-card?lock=206",
    alt: "NVIDIA RTX 4090 graphics card",
  },
  "MSI B450 TOMAHAWK MAX": {
    src: "PHOTOS/MOTHERBOARDS/msi b450 tomahawk max.jpg",
    alt: "MSI B450 TOMAHAWK MAX motherboard",
  },
  "ASUS ROG STRIX B550-F": {
    src: "PHOTOS/MOTHERBOARDS/ASUS ROG STRIX B550-F.webp",
    alt: "ASUS ROG STRIX B550-F motherboard",
  },
  "MSI MAG Z690 TOMAHAWK": {
    src: "https://loremflickr.com/640/480/motherboard,pc?lock=303",
    alt: "MSI MAG Z690 TOMAHAWK motherboard",
  },
  "ASUS ROG CROSSHAIR X570": {
    src: "PHOTOS/MOTHERBOARDS/ASUS ROG CROSSHAIR X570.webp",
    alt: "ASUS ROG CROSSHAIR X570 motherboard",
  },
  "Gigabyte Z790 AORUS ELITE": {
    src: "PHOTOS/MOTHERBOARDS/Gigabyte Z790 AORUS ELITE.webp",
    alt: "Gigabyte Z790 AORUS ELITE motherboard",
  },
  "ASRock B650M PRO RS": {
    src: "PHOTOS/MOTHERBOARDS/asrock-b650m-pro-rs.jpg",
    alt: "ASRock B650M PRO RS motherboard",
  },
  "Corsair Vengeance LPX 8GB DDR4": {
    src: "https://loremflickr.com/640/480/ram,memory?lock=401",
    alt: "Corsair Vengeance LPX 8GB DDR4 memory kit",
  },
  "G.Skill Ripjaws V 16GB DDR4": {
    src: "PHOTOS/RAM/G.Skill Ripjaws V 16GB DDR4.webp",
    alt: "G.Skill Ripjaws V 16GB DDR4 memory kit",
  },
  "Kingston HyperX Fury 32GB DDR4": {
    src: "PHOTOS/RAM/Kingston HyperX Fury 32GB DDR4.jpg",
    alt: "Kingston HyperX Fury 32GB DDR4 memory kit",
  },
  "Corsair Vengeance 16GB DDR5": {
    src: "https://loremflickr.com/640/480/ram,memory?lock=404",
    alt: "Corsair Vengeance 16GB DDR5 memory kit",
  },
  "TeamGroup T-Force Delta RGB 32GB DDR5": {
    src: "PHOTOS/RAM/TeamGroup T-Force Delta RGB 32GB DDR5.webp",
    alt: "TeamGroup T-Force Delta RGB 32GB DDR5 memory kit",
  },
  "G.Skill Trident Z RGB 64GB DDR4": {
    src: "PHOTOS/RAM/G.Skill Trident Z RGB 64GB DDR4.webp",
    alt: "G.Skill Trident Z RGB 64GB DDR4 memory kit",
  },
  "Samsung 870 EVO 500GB SATA SSD": {
    src: "PHOTOS/STORAGE/Samsung 870 EVO 500GB SATA SSD.webp",
    alt: "Samsung 870 EVO 500GB SATA SSD",
  },
  "WD Blue SN570 1TB NVMe SSD": {
    src: "PHOTOS/STORAGE/WD Blue SN570 1TB NVMe SSD.webp",
    alt: "WD Blue SN570 1TB NVMe SSD",
  },
  "Seagate Barracuda 2TB HDD": {
    src: "https://loremflickr.com/640/480/hard-drive,storage?lock=503",
    alt: "Seagate Barracuda 2TB HDD",
  },
  "Crucial P5 Plus 1TB NVMe SSD": {
    src: "PHOTOS/STORAGE/Crucial P5 Plus 1TB NVMe SSD.webp",
    alt: "Crucial P5 Plus 1TB NVMe SSD",
  },
  "WD Blue 4TB HDD": {
    src: "PHOTOS/STORAGE/WD Blue 4TB HDD.webp",
    alt: "WD Blue 4TB HDD",
  },
  "Kingston NV2 2TB NVMe SSD": {
    src: "PHOTOS/STORAGE/Kingston NV2 2TB NVMe SSD.webp",
    alt: "Kingston NV2 2TB NVMe SSD",
  },
  "Corsair CV450 450W 80+ Bronze": {
    src: "PHOTOS/PSU/Corsair CV450 450W 80+ Bronze.webp",
    alt: "Corsair CV450 450W power supply",
  },
  "Seasonic S12III 650W 80+ Bronze": {
    src: "PHOTOS/PSU/Seasonic S12III 650W 80+ Bronze.webp",
    alt: "Seasonic S12III 650W power supply",
  },
  "Corsair RM750x 750W 80+ Gold": {
    src: "PHOTOS/PSU/Corsair RM750x 750W 80+ Gold.webp",
    alt: "Corsair RM750x 750W power supply",
  },
  "EVGA SuperNOVA 850W 80+ Gold": {
    src: "https://loremflickr.com/640/480/power-supply,computer?lock=604",
    alt: "EVGA SuperNOVA 850W power supply",
  },
  "Seasonic Prime TX-1000 1000W 80+ Titanium": {
    src: "PHOTOS/PSU/Seasonic Prime TX-1000 1000W 80+ Titanium.webp",
    alt: "Seasonic Prime TX-1000 1000W power supply",
  },
  "Cooler Master MWE 600W 80+ Bronze": {
    src: "PHOTOS/PSU/Cooler Master MWE 600W 80+ Bronze.webp",
    alt: "Cooler Master MWE 600W power supply",
  },
};

function cleanValue(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function parsePrice(text = "") {
  const digits = text.replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : 0;
}

function formatCurrency(value) {
  return `Rs ${Number(value).toLocaleString("en-IN")}`;
}

function compareAlphaNumeric(a, b) {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function parseSpecs(modal) {
  const specs = {};
  modal?.querySelectorAll(".modal-body li").forEach((item) => {
    const text = cleanValue(item.textContent || "");
    const separatorIndex = text.indexOf(":");

    if (separatorIndex === -1) {
      return;
    }

    const key = cleanValue(text.slice(0, separatorIndex));
    const value = cleanValue(text.slice(separatorIndex + 1));
    specs[key] = value;
  });

  return specs;
}

function buildProducts(row, config) {
  const cards = Array.from(row.children);

  return cards.map((column, index) => {
    const card = column.querySelector(".card");
    const title = cleanValue(card?.querySelector(".card-title")?.textContent || "");
    const price = parsePrice(card?.querySelector(".fw-bold")?.textContent || "");
    const detailsButton = card?.querySelector('[data-bs-target^="#modal-"]');
    const modal = detailsButton
      ? document.querySelector(detailsButton.getAttribute("data-bs-target"))
      : null;
    const specs = parseSpecs(modal);
    const meta = {
      title,
      price,
      column,
      card,
      specs,
      originalIndex: index,
      stock: config.stockByTitle?.[title] ?? true,
      brand: config.brand ? config.brand(title) : title.split(" ")[0],
    };

    meta.values = {};

    Object.entries(config.filterExtractors || {}).forEach(([filterName, extractor]) => {
      meta.values[filterName] = cleanValue(extractor(meta) || "");
    });

    meta.bestSellerRank = index;
    meta.newestRank = cards.length - index;

    return meta;
  });
}

function buildFilterOptions(products, filterNames) {
  return filterNames.map((filterName) => ({
    name: filterName,
    options: Array.from(
      new Set(products.map((product) => product.values[filterName]).filter(Boolean))
    ).sort(compareAlphaNumeric),
  }));
}

function applyProductMedia(products) {
  products.forEach((product) => {
    const media = PRODUCT_MEDIA[product.title];

    if (!media) {
      return;
    }

    const cardImage = product.card?.querySelector(".card-img-top");
    if (cardImage) {
      cardImage.src = media.src;
      cardImage.alt = media.alt;
      cardImage.loading = "lazy";
    }

    const detailsButton = product.card?.querySelector('[data-bs-target^="#modal-"]');
    const modal = detailsButton
      ? document.querySelector(detailsButton.getAttribute("data-bs-target"))
      : null;
    const modalBody = modal?.querySelector(".modal-body");

    if (modalBody && !modalBody.querySelector(".modal-product-figure")) {
      const figure = document.createElement("figure");
      figure.className = "modal-product-figure";
      figure.innerHTML = `
        <img
          src="${media.src}"
          alt="${media.alt}"
          class="modal-product-image"
          loading="lazy"
        >
      `;
      modalBody.prepend(figure);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  if (!body.classList.contains("catalog-page")) {
    return;
  }

  const section = document.querySelector(".features");
  const row = section?.querySelector(".row");

  if (!section || !row) {
    return;
  }

  const catalogTitle = body.dataset.catalogTitle || "Products";
  const breadcrumb = body.dataset.breadcrumb || "Home / Products";
  const configuredPriceMin = Number.parseInt(body.dataset.priceMin || "0", 10);
  const configuredPriceMax = Number.parseInt(body.dataset.priceMax || "0", 10);
  const filterNames = (body.dataset.filters || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  const config = CATALOG_CONFIGS[catalogTitle] || {
    filterExtractors: {},
    stockByTitle: {},
    brand: (title) => title.split(" ")[0],
  };

  section.classList.add("catalog-shell");
  row.classList.add("product-grid");

  const products = buildProducts(row, config);
  applyProductMedia(products);
  const filterGroups = buildFilterOptions(products, filterNames);
  const detectedPriceMin = Math.min(...products.map((product) => product.price));
  const detectedPriceMax = Math.max(...products.map((product) => product.price));
  const absolutePriceMin = Number.isFinite(configuredPriceMin)
    ? configuredPriceMin
    : detectedPriceMin;
  const absolutePriceMax = Number.isFinite(configuredPriceMax) && configuredPriceMax > 0
    ? configuredPriceMax
    : detectedPriceMax;

  const layout = document.createElement("div");
  layout.className = "catalog-layout";

  const popup = document.createElement("aside");
  popup.className = "catalog-popup";
  popup.setAttribute("aria-hidden", "true");
  popup.innerHTML = `
    <div class="catalog-popup-header">
      <h2><i class="bi bi-sliders me-2"></i>Filters</h2>
      <button type="button" class="catalog-close" aria-label="Close filters">&times;</button>
    </div>
    <div class="catalog-switch">
      <span>In Stock Only</span>
      <label class="catalog-toggle" aria-label="In stock only">
        <input type="checkbox" checked id="catalog-stock-toggle">
        <span></span>
      </label>
    </div>
    <div class="catalog-price">
      <h3>Price</h3>
      <div class="catalog-price-bar"></div>
      <div class="catalog-price-values">
        <label class="catalog-price-field">
          <span>Min</span>
          <input
            type="number"
            class="catalog-price-input"
            id="catalog-price-min"
            min="${absolutePriceMin}"
            max="${absolutePriceMax}"
            step="10"
            value="${absolutePriceMin}"
          >
        </label>
        <span class="catalog-price-separator">to</span>
        <label class="catalog-price-field">
          <span>Max</span>
          <input
            type="number"
            class="catalog-price-input"
            id="catalog-price-max"
            min="${absolutePriceMin}"
            max="${absolutePriceMax}"
            step="10"
            value="${absolutePriceMax}"
          >
        </label>
      </div>
      <div class="catalog-range-track">
        <input
          type="range"
          class="catalog-range-input"
          id="catalog-range-min"
          min="${absolutePriceMin}"
          max="${absolutePriceMax}"
          step="10"
          value="${absolutePriceMin}"
        >
        <input
          type="range"
          class="catalog-range-input"
          id="catalog-range-max"
          min="${absolutePriceMin}"
          max="${absolutePriceMax}"
          step="10"
          value="${absolutePriceMax}"
        >
      </div>
      <p class="catalog-price-summary">
        Showing prices from
        <strong>${formatCurrency(absolutePriceMin)}</strong>
        to
        <strong>${formatCurrency(absolutePriceMax)}</strong>
      </p>
    </div>
    ${filterGroups
      .map(
        (group) => `
          <details class="filter-group" open>
            <summary>${group.name}</summary>
            <div class="filter-options">
              ${group.options
                .map(
                  (option) => `
                    <label class="filter-option">
                      <input
                        type="checkbox"
                        data-filter-name="${group.name}"
                        value="${option}"
                      >
                      <span>${option}</span>
                    </label>
                  `
                )
                .join("")}
            </div>
          </details>
        `
      )
      .join("")}
  `;

  const content = document.createElement("div");
  content.className = "catalog-content";
  content.innerHTML = `
    <div class="catalog-toolbar">
      <div class="catalog-toolbar-main">
        <div>
          <p class="catalog-breadcrumb">${breadcrumb}</p>
          <h1 class="catalog-title">${catalogTitle}</h1>
        </div>
        <div class="catalog-actions">
          <label class="catalog-search" for="catalog-search-input">
            <i class="bi bi-search"></i>
            <input
              type="search"
              id="catalog-search-input"
              placeholder="Search products..."
              aria-label="Search products"
            >
          </label>
          <button type="button" class="filter-toggle-btn">
            <i class="bi bi-sliders"></i>
            Filters
          </button>
          <select class="catalog-sort" aria-label="Sort products">
            <option value="low-to-high">Sort by price: Low to High</option>
            <option value="high-to-low">Sort by price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="best-sellers">Best Sellers</option>
          </select>
        </div>
      </div>
      <div class="catalog-count">${products.length} Products</div>
    </div>
  `;

  const emptyState = document.createElement("div");
  emptyState.className = "catalog-results-empty";
  emptyState.hidden = true;
  emptyState.innerHTML = `
    <h3>No matching products</h3>
    <p>Try changing the selected filters or the stock toggle.</p>
  `;

  content.appendChild(row);
  content.appendChild(emptyState);

  const overlay = document.createElement("button");
  overlay.type = "button";
  overlay.className = "catalog-overlay";
  overlay.setAttribute("aria-label", "Close filters");

  layout.appendChild(popup);
  layout.appendChild(content);

  section.innerHTML = "";
  section.appendChild(layout);
  section.appendChild(overlay);

  const openButton = section.querySelector(".filter-toggle-btn");
  const closeButton = section.querySelector(".catalog-close");
  const countNode = section.querySelector(".catalog-count");
  const sortSelect = section.querySelector(".catalog-sort");
  const stockToggle = section.querySelector("#catalog-stock-toggle");
  const searchInput = section.querySelector("#catalog-search-input");
  const minPriceInput = section.querySelector("#catalog-price-min");
  const maxPriceInput = section.querySelector("#catalog-price-max");
  const minRangeInput = section.querySelector("#catalog-range-min");
  const maxRangeInput = section.querySelector("#catalog-range-max");
  const priceSummaryNode = section.querySelector(".catalog-price-summary");

  const closeFilters = () => {
    body.classList.remove("filter-open");
    popup.setAttribute("aria-hidden", "true");
  };

  const openFilters = () => {
    body.classList.add("filter-open");
    popup.setAttribute("aria-hidden", "false");
  };

  const syncPriceControls = (source) => {
    let minValue = Number.parseInt(minPriceInput?.value || `${absolutePriceMin}`, 10);
    let maxValue = Number.parseInt(maxPriceInput?.value || `${absolutePriceMax}`, 10);

    if (source === "range-min" && minRangeInput) {
      minValue = Number.parseInt(minRangeInput.value, 10);
    }

    if (source === "range-max" && maxRangeInput) {
      maxValue = Number.parseInt(maxRangeInput.value, 10);
    }

    minValue = Math.max(absolutePriceMin, Math.min(minValue, absolutePriceMax));
    maxValue = Math.max(absolutePriceMin, Math.min(maxValue, absolutePriceMax));

    if (minValue > maxValue) {
      if (source === "range-min" || source === "input-min") {
        maxValue = minValue;
      } else {
        minValue = maxValue;
      }
    }

    if (minPriceInput) minPriceInput.value = `${minValue}`;
    if (maxPriceInput) maxPriceInput.value = `${maxValue}`;
    if (minRangeInput) minRangeInput.value = `${minValue}`;
    if (maxRangeInput) maxRangeInput.value = `${maxValue}`;

    if (priceSummaryNode) {
      priceSummaryNode.innerHTML = `
        Showing prices from
        <strong>${formatCurrency(minValue)}</strong>
        to
        <strong>${formatCurrency(maxValue)}</strong>
      `;
    }
  };

  const applyCatalogState = () => {
    syncPriceControls();
    const searchQuery = cleanValue(searchInput?.value || "").toLowerCase();

    const selectedFilters = {};
    popup
      .querySelectorAll('input[type="checkbox"][data-filter-name]:checked')
      .forEach((input) => {
        const filterName = input.dataset.filterName;
        if (!selectedFilters[filterName]) {
          selectedFilters[filterName] = new Set();
        }

        selectedFilters[filterName].add(input.value);
      });

    let visibleProducts = products.filter((product) => {
      if (searchQuery) {
        const searchableText = [
          product.title,
          product.brand,
          ...Object.values(product.specs),
          ...Object.values(product.values),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(searchQuery)) {
          return false;
        }
      }

      if (stockToggle?.checked && !product.stock) {
        return false;
      }

      const minSelectedPrice = Number.parseInt(
        minPriceInput?.value || `${absolutePriceMin}`,
        10
      );
      const maxSelectedPrice = Number.parseInt(
        maxPriceInput?.value || `${absolutePriceMax}`,
        10
      );

      if (product.price < minSelectedPrice || product.price > maxSelectedPrice) {
        return false;
      }

      return Object.entries(selectedFilters).every(([filterName, values]) =>
        values.has(product.values[filterName])
      );
    });

    const sortValue = sortSelect?.value || "low-to-high";
    visibleProducts = [...visibleProducts].sort((first, second) => {
      if (sortValue === "high-to-low") {
        return second.price - first.price;
      }

      if (sortValue === "newest") {
        return second.newestRank - first.newestRank;
      }

      if (sortValue === "best-sellers") {
        return first.bestSellerRank - second.bestSellerRank;
      }

      return first.price - second.price;
    });

    products.forEach((product) => {
      product.column.hidden = true;
    });

    visibleProducts.forEach((product) => {
      product.column.hidden = false;
      row.appendChild(product.column);
    });

    countNode.textContent = `${visibleProducts.length} Products`;
    emptyState.hidden = visibleProducts.length !== 0;
  };

  popup.addEventListener("change", applyCatalogState);
  minPriceInput?.addEventListener("input", () => {
    syncPriceControls("input-min");
    applyCatalogState();
  });
  maxPriceInput?.addEventListener("input", () => {
    syncPriceControls("input-max");
    applyCatalogState();
  });
  minRangeInput?.addEventListener("input", () => {
    syncPriceControls("range-min");
    applyCatalogState();
  });
  maxRangeInput?.addEventListener("input", () => {
    syncPriceControls("range-max");
    applyCatalogState();
  });
  searchInput?.addEventListener("input", applyCatalogState);
  sortSelect?.addEventListener("change", applyCatalogState);

  openButton?.addEventListener("click", () => {
    if (body.classList.contains("filter-open")) {
      closeFilters();
      return;
    }

    openFilters();
  });

  closeButton?.addEventListener("click", closeFilters);
  overlay.addEventListener("click", closeFilters);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFilters();
    }
  });

  syncPriceControls();
  applyCatalogState();
});
