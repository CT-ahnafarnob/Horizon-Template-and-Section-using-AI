/**
 * Product Filter Web Component
 * 
 * This component creates a filterable product list that:
 * 1. Fetches all products from Shopify
 * 2. Extracts categories from product tags/collections
 * 3. Displays filter buttons for each category
 * 4. Shows/hides products based on selected category
 */

class ProductFilter extends HTMLElement {
  constructor() {
    super();
    // Create shadow DOM for isolated styling
    this.attachShadow({ mode: 'open' });

    // Store products and categories
    /** @type {Array<any>} */
    this.products = [];

    /** @type {Array<string>} */
    this.categories = [];
  }

  // Called when component is added to the page
  connectedCallback() {
    this.renderHTML();
    this.loadProducts();
  }

  // Render the HTML structure and styles
  renderHTML() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        /* Main container styles */
        :host {
          display: block;
          font-family: Arial, sans-serif;
        }
        
        /* Filter section background */
        .filter-container {
          margin-bottom: 20px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        
        /* Filter title */
        .filter-title {
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        /* Category buttons container */
        .category-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        /* Individual button styles */
        button {
          padding: 8px 16px;
          border: 2px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s;
        }
        
        button:hover {
          border-color: #333;
        }
        
        /* Active/selected button */
        button.active {
          background: #333;
          color: white;
          border-color: #333;
        }
        
        /* Products grid */
        .products-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }
        
        /* Individual product card */
        .product-card {
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 4px;
          display: none; /* Hidden by default */
        }
        
        /* Visible product card */
        .product-card.visible {
          display: block;
        }
        
        /* Product name */
        .product-name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        /* Product category label */
        .product-category {
          color: #666;
          font-size: 0.9em;
        }
      </style>
      
      <!-- Filter Section -->
      <div class="filter-container">
        <div class="filter-title">Filter by Category</div>
        <div class="category-buttons" id="categoryButtons"></div>
      </div>
      
      <!-- Products Grid -->
      <div class="products-container" id="productsContainer"></div>
    `;
  }

  // Fetch products from Shopify API
  async loadProducts() {
    try {
      // Get products from Shopify's JSON endpoint
      const response = await fetch('/products.json?limit=250');
      const data = await response.json();
      this.products = data.products;

      // Extract unique categories from products
      this.findAllCategories();

      // Display filter buttons and products
      this.createFilterButtons();
      this.displayProducts();
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  // Extract all unique categories from products
  findAllCategories() {
    const uniqueCategories = new Set();

    // Loop through each product
    this.products.forEach(product => {
      // Add collections as categories
      if (product.collections && Array.isArray(product.collections)) {
        product.collections.forEach((/** @type {any} */ collection) => {
          uniqueCategories.add(collection);
        });
      }

      // Add tags as categories
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((/** @type {any} */ tag) => {
          uniqueCategories.add(tag);
        });
      }
    });

    // Convert Set to sorted array
    this.categories = Array.from(uniqueCategories).sort();
  }

  // Create filter buttons for each category
  createFilterButtons() {
    if (!this.shadowRoot) return;

    const buttonsContainer = this.shadowRoot.getElementById('categoryButtons');
    if (!buttonsContainer) return;

    // Clear existing buttons
    buttonsContainer.innerHTML = '';

    // Create "All" button (shows all products)
    const allButton = document.createElement('button');
    allButton.textContent = 'All';
    allButton.classList.add('active'); // Selected by default
    allButton.addEventListener('click', () => this.applyFilter(null));
    buttonsContainer.appendChild(allButton);

    // Create button for each category
    this.categories.forEach(category => {
      const button = document.createElement('button');
      button.textContent = category;
      button.addEventListener('click', () => this.applyFilter(category));
      buttonsContainer.appendChild(button);
    });
  }

  // Display all products in the grid
  displayProducts() {
    if (!this.shadowRoot) return;

    const productsContainer = this.shadowRoot.getElementById('productsContainer');
    if (!productsContainer) return;

    // Clear existing products
    productsContainer.innerHTML = '';

    // Create a card for each product
    this.products.forEach(product => {
      const card = document.createElement('div');
      card.classList.add('product-card', 'visible'); // Show all initially

      // Get all categories for this product
      const productCollections = product.collections || [];
      const productTags = product.tags || [];
      const allProductCategories = productCollections.concat(productTags);

      // Store categories in data attribute for filtering
      card.dataset.categories = JSON.stringify(allProductCategories);

      // Get first category for display
      const displayCategory = allProductCategories.length > 0
        ? allProductCategories[0]
        : 'Uncategorized';

      // Set card content
      card.innerHTML = `
        <div class="product-name">${product.title}</div>
        <div class="product-category">${displayCategory}</div>
      `;

      productsContainer.appendChild(card);
    });
  }

  /**
   * Filter products by selected category
   * @param {string | null} selectedCategory - Category to filter by, or null for all
   */
  applyFilter(selectedCategory) {
    if (!this.shadowRoot) return;

    // Update active button styling
    this.updateActiveButton(selectedCategory);

    // Show/hide products based on category
    this.filterProductCards(selectedCategory);
  }

  /**
   * Update which button appears active
   * @param {string | null} selectedCategory
   */
  updateActiveButton(selectedCategory) {
    if (!this.shadowRoot) return;

    const allButtons = this.shadowRoot.querySelectorAll('button');

    // Remove active class from all buttons
    allButtons.forEach(button => button.classList.remove('active'));

    // Add active class to selected button
    if (selectedCategory === null) {
      // "All" button is first
      if (allButtons[0]) {
        allButtons[0].classList.add('active');
      }
    } else {
      // Find and activate the matching category button
      const matchingButton = Array.from(allButtons).find(
        button => button.textContent === selectedCategory
      );
      if (matchingButton) {
        matchingButton.classList.add('active');
      }
    }
  }

  /**
   * Show/hide product cards based on category
   * @param {string | null} selectedCategory
   */
  filterProductCards(selectedCategory) {
    if (!this.shadowRoot) return;

    const allCards = this.shadowRoot.querySelectorAll('.product-card');

    allCards.forEach(card => {
      // Get product's categories from data attribute
      const htmlCard = /** @type {HTMLElement} */ (card);
      const categoriesData = htmlCard.dataset.categories;

      if (!categoriesData) return;

      const productCategories = JSON.parse(categoriesData);

      // Show all products if no category selected
      if (selectedCategory === null) {
        card.classList.add('visible');
      } else {
        // Show only if product has the selected category
        if (productCategories.includes(selectedCategory)) {
          card.classList.add('visible');
        } else {
          card.classList.remove('visible');
        }
      }
    });
  }
}

// Register the custom element
customElements.define('product-filter', ProductFilter);