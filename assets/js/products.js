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
            const response = await fetch('/assets/data/products.json');
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
        const stockHTML = this.getStockHTML(product);
        const rating = this.getRatingHTML(product);

        return `
            <div class="product-card"
                 data-product-id="${product.id}"
                 data-category="${product.category}"
                 data-manufacturer="${product.brand}">
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                    ${badge}
                </div>
                <div class="product-info">
                    <div class="product-category">${product.categoryName}</div>
                    <h3 class="product-title">
                        <a href="pages/product.html?id=${product.id}">${product.name}</a>
                    </h3>
                    ${rating}
                    <p class="product-description">${product.shortDescription || product.description.substring(0, 100) + '...'}</p>
                    ${stockHTML}
                    <div class="product-footer">
                        ${priceHTML}
                        ${product.inStock ? '<button class="btn-add-cart">Do košíku</button>' : '<button class="btn-add-cart" disabled>Vyprodáno</button>'}
                    </div>
                </div>
            </div>
        `;
    }

    getBadgeHTML(product) {
        if (!product.badges || product.badges.length === 0) return '';

        const badgeClass = product.badges[0] === 'new' ? 'new' : 'sale';
        const badgeText = product.badges[0] === 'new' ? 'Novinka' : product.badges[0];

        return `<span class="product-badge ${badgeClass}">${badgeText}</span>`;
    }

    getPriceHTML(product) {
        if (product.oldPrice) {
            return `
                <div class="product-price">
                    <span class="old-price">${product.oldPrice.toLocaleString('cs-CZ')} ${product.currency}</span>
                    ${product.price.toLocaleString('cs-CZ')} ${product.currency}
                </div>
            `;
        }
        return `<div class="product-price">${product.price.toLocaleString('cs-CZ')} ${product.currency}</div>`;
    }

    getStockHTML(product) {
        if (product.inStock) {
            return '<div class="product-stock in-stock">✓ Skladem</div>';
        }
        return '<div class="product-stock out-of-stock">✗ Vyprodáno</div>';
    }

    getRatingHTML(product) {
        if (!product.rating || product.rating === 0) return '';

        const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
        return `
            <div class="product-rating">
                <span class="stars">${stars}</span>
                <span class="rating-count">(${product.reviewCount})</span>
            </div>
        `;
    }

    attachEventListeners() {
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                if (productCard && window.cart) {
                    const productId = productCard.dataset.productId;
                    const product = this.products.find(p => p.id === productId);
                    if (product) {
                        window.cart.addToCart(product);
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

    filterByBrand(brand) {
        if (brand === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(p => p.brand === brand);
        }
        this.renderProducts();
    }

    search(query) {
        const searchTerm = query.toLowerCase();
        this.filteredProducts = this.products.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
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
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
                break;
            case 'name-desc':
                this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name, 'cs'));
                break;
            case 'newest':
            default:
                // Ponechat původní pořadí
                break;
        }
        this.renderProducts();
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
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
