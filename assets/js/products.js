// ============================================
// SPRÁVA PRODUKTŮ - ELEKTRO DVOŘÁK
// ============================================

class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.renderProducts();
    }

    async loadProducts() {
        try {
            // Detect if we're in pages/ subdirectory or root
            const isInPagesDir = window.location.pathname.includes('/pages/');
            const jsonPath = isInPagesDir ? '../data/products.json' : 'data/products.json';

            const response = await fetch(jsonPath);
            const data = await response.json();
            this.products = data.products;
            this.filteredProducts = [...this.products];
            console.log(`✅ Načteno ${this.products.length} produktů`);
        } catch (error) {
            console.error('❌ Chyba při načítání produktů:', error);
        }
    }

    renderProducts(containerId = 'products-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        this.filteredProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            container.innerHTML += productCard;
        });

        // Přidat event listenery pro tlačítka "Do košíku"
        this.attachEventListeners();
    }

    createProductCard(product) {
        const badge = this.getBadgeHTML(product);
        const priceHTML = this.getPriceHTML(product);
        const rating = this.getRatingHTML(product);

        // Detect if we're in pages/ subdirectory or root
        const isInPagesDir = window.location.pathname.includes('/pages/');
        const productLink = isInPagesDir ? `product.html?id=${product.id}` : `pages/product.html?id=${product.id}`;
        
        // Handle image based on imageType
        let imageHTML = '';
        if (product.imageType === 'emoji') {
            imageHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 80px;">${product.image}</div>`;
        } else if (product.imageType === 'file') {
            const imagePath = isInPagesDir ? `../assets/images/products/${product.image}-1.jpg` : `assets/images/products/${product.image}-1.jpg`;
            imageHTML = `<img src="${imagePath}" alt="${product.title}" loading="lazy">`;
        }

        return `
            <div class="product-card"
                 data-product-id="${product.id}"
                 data-category="${product.category}"
                 data-manufacturer="${product.manufacturer}">
                <div class="product-image">
                    ${imageHTML}
                    ${badge}
                </div>
                <div class="product-info">
                    <div class="product-category">${product.categoryName}</div>
                    <h3 class="product-title">
                        <a href="${productLink}">${product.title}</a>
                    </h3>
                    ${rating}
                    <p class="product-description">${product.description.substring(0, 100)}...</p>
                    <div class="product-footer">
                        ${priceHTML}
                        ${product.inStock ? '<button class="btn-add-cart">Do košíku</button>' : '<button class="btn-add-cart" disabled>Vyprodáno</button>'}
                    </div>
                </div>
            </div>
        `;
    }

    getBadgeHTML(product) {
        if (!product.badge) return '';
        return `<span class="product-badge ${product.badge}">${product.badgeText}</span>`;
    }

    getPriceHTML(product) {
        if (product.oldPrice) {
            return `
                <div class="product-price">
                    <span class="old-price">${product.oldPrice.toLocaleString('cs-CZ')} Kč</span>
                    ${product.price.toLocaleString('cs-CZ')} Kč
                </div>
            `;
        }
        return `<div class="product-price">${product.price.toLocaleString('cs-CZ')} Kč</div>`;
    }

    getRatingHTML(product) {
        if (!product.rating || product.rating === 0) return '';

        const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
        return `
            <div class="product-rating">
                <span class="stars">${stars}</span>
                <span class="rating-count">(${product.ratingCount})</span>
            </div>
        `;
    }

    attachEventListeners() {
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                if (productCard && window.cart) {
                    const productId = productCard.dataset.productId;
                    const product = this.products.find(p => p.id == productId);
                    if (product) {
                        window.cart.addToCart(productCard);
                    }
                }
            });
        });
    }

    filterByCategory(category) {
        if (category === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(p => p.category === category);
        }
        this.renderProducts();
    }

    filterByPrice(min, max) {
        this.filteredProducts = this.products.filter(p =>
            p.price >= min && p.price <= max
        );
        this.renderProducts();
    }

    filterByManufacturer(manufacturer) {
        if (manufacturer === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(p => p.manufacturer === manufacturer);
        }
        this.renderProducts();
    }

    search(query) {
        const searchTerm = query.toLowerCase();
        this.filteredProducts = this.products.filter(p =>
            p.title.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.categoryName.toLowerCase().includes(searchTerm)
        );
        this.renderProducts();
    }

    sortProducts(sortBy) {
        switch(sortBy) {
            case 'price-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                this.filteredProducts.sort((a, b) => a.title.localeCompare(b.title, 'cs'));
                break;
            case 'name-desc':
                this.filteredProducts.sort((a, b) => b.title.localeCompare(a.title, 'cs'));
                break;
            case 'newest':
            default:
                // Ponechat původní pořadí
                break;
        }
        this.renderProducts();
    }

    getProductById(id) {
        return this.products.find(p => p.id == id);
    }
}

// Inicializace při načtení stránky
let productManager;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('products-container')) {
        productManager = new ProductManager();
        window.productManager = productManager;
    }
});
