// product-filter.js
// Industry-standard product filter component for Shopify

const filterTemplate = document.createElement("template");
filterTemplate.innerHTML = /*html*/`
<style>
  :host {
    display: block;
    margin-bottom: 30px;
  }

  .filter-container {
    background: #fff;
    padding: 20px 0;
    border-bottom: 1px solid #eee;
  }

  .filter-content {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .filter-label {
    font-weight: 600;
    color: #333;
    margin-right: 10px;
  }

  .category-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .category-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: white;
    color: #333;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .category-btn:hover {
    border-color: #333;
    background: #f5f5f5;
  }

  .category-btn.active {
    background: #000;
    color: white;
    border-color: #000;
  }

  .price-filter {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-left: auto;
  }

  .price-input {
    width: 70px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .btn-reset {
    padding: 8px 16px;
    background: #f0f0f0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .btn-reset:hover {
    background: #e0e0e0;
  }

  @media (max-width: 768px) {
    .filter-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .price-filter {
      margin-left: 0;
      width: 100%;
    }

    .category-buttons {
      width: 100%;
    }
  }
</style>

<div class="filter-container">
  <div class="filter-content">
    <span class="filter-label">Filter by Category</span>
    
    <div class="category-buttons" id="category-buttons-container">
      <button class="category-btn active" data-category="all">All</button>
      <!-- Category buttons will be dynamically added here -->
    </div>

    <button class="btn-reset" id="reset-btn">Reset</button>
  </div>
</div>
`;

class ProductFilter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    /** @type {string[]} */
    this.selectedCategories = [];
    /** @type {Array<{id: string, title: string, price: number, type: string, image: string, handle: string, vendor: string, url: string}>} */
    this.allProducts = [];
    /** @type {HTMLInputElement|null} */
    this.minPriceInput = null;
    /** @type {HTMLInputElement|null} */
    this.maxPriceInput = null;
    /** @type {HTMLButtonElement|null} */
    this.resetBtn = null;
  }

  connectedCallback() {
    if (!this.shadowRoot) return;
    this.shadowRoot.appendChild(filterTemplate.content.cloneNode(true));

    // Get products from data attribute
    const productsData = this.getAttribute("data-products");
    if (productsData) {
      try {
        this.allProducts = JSON.parse(productsData);
        this.initializeFilters();
      } catch (error) {
        console.error("Error parsing products data:", error);
      }
    }

    this.setupEventListeners();
  }

  initializeFilters() {
    // Extract unique categories from products - EXCLUDE EMPTY TYPES
    const categories = new Set();

    this.allProducts.forEach(product => {
      // Only add non-empty product types
      if (product.type && product.type.trim() && product.type.trim() !== '') {
        categories.add(product.type.trim());
      }
    });

    // Build category buttons
    const buttonsContainer = /** @type {HTMLElement|null} */ (
      this.shadowRoot?.querySelector("#category-buttons-container")
    );
    if (!buttonsContainer) return;

    const sortedCategories = Array.from(categories).sort();

    console.log('🏷️ Categories found:', sortedCategories);

    sortedCategories.forEach((category) => {
      const btn = document.createElement("button");
      btn.className = "category-btn";
      btn.textContent = category;
      btn.setAttribute("data-category", category);

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleCategory(category, btn);
      });

      buttonsContainer.appendChild(btn);
    });
  }

  setupEventListeners() {
    // All button
    const allBtn = /** @type {HTMLButtonElement|null} */ (
      this.shadowRoot?.querySelector('[data-category="all"]')
    );
    if (allBtn) {
      allBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.resetFilters();
      });
    }

    // Reset button
    this.resetBtn = /** @type {HTMLButtonElement|null} */ (
      this.shadowRoot?.querySelector("#reset-btn")
    );

    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => this.resetFilters());
    }
  }

  toggleCategory(/** @type {string} */ category, /** @type {HTMLElement} */ btnElement) {
    const index = this.selectedCategories.indexOf(category);

    if (index > -1) {
      // Remove category
      this.selectedCategories.splice(index, 1);
      btnElement.classList.remove("active");
    } else {
      // Add category
      this.selectedCategories.push(category);
      btnElement.classList.add("active");
    }

    // Uncheck "All" when selecting specific categories
    if (this.selectedCategories.length > 0) {
      const allBtn = /** @type {HTMLButtonElement|null} */ (
        this.shadowRoot?.querySelector('[data-category="all"]')
      );
      if (allBtn) {
        allBtn.classList.remove("active");
      }
    }

    this.applyFilters();
  }

  getPriceRange() {
    return {
      min: parseInt(this.minPriceInput?.value || "0") || 0,
      max: parseInt(this.maxPriceInput?.value || "100000") || 100000,
    };
  }

  applyFilters() {
    const filterData = {
      categories: this.selectedCategories.length > 0 ? this.selectedCategories : [],
    };

    this.dispatchEvent(
      new CustomEvent("filter-applied", {
        detail: filterData,
        bubbles: true,
        composed: true,
      })
    );

    console.log("Filters applied:", filterData);
  }

  resetFilters() {
    // Clear selected categories
    this.selectedCategories = [];

    // Update button states
    const buttons = /** @type {NodeListOf<HTMLElement>|null} */ (
      this.shadowRoot?.querySelectorAll(".category-btn")
    );
    if (buttons) {
      buttons.forEach(btn => {
        btn.classList.remove("active");
      });
    }

    const allBtn = /** @type {HTMLButtonElement|null} */ (
      this.shadowRoot?.querySelector('[data-category="all"]')
    );
    if (allBtn) {
      allBtn.classList.add("active");
    }

    // Dispatch reset event
    this.dispatchEvent(
      new CustomEvent("filter-reset", {
        bubbles: true,
        composed: true,
      })
    );

    console.log("Filters reset");
  }
}

customElements.define("product-filter", ProductFilter);