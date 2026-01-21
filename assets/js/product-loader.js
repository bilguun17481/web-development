// ==========================================
// DYNAMIC PRODUCT LOADER
// ==========================================

class ProductLoader {
    constructor() {
        this.products = [];
        this.categories = [];
        this.manufacturers = [];
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.renderProducts();
    }

    async loadProducts() {
        try {
            // Try to load from localStorage first (if modified in builder)
            const builderData = localStorage.getItem('builderProducts');
            if (builderData) {
                const data = JSON.parse(builderData);
                this.products = data.products || [];
                this.categories = data.categories || [];
                this.manufacturers = data.manufacturers || [];
                console.log('Loaded products from builder:', this.products.length);
                return;
            }

            // Otherwise load from JSON file
            const response = await fetch('data/products.json');
            const data = await response.json();

            this.products = data.products || [];
            this.categories = data.categories || [];
            this.manufacturers = data.manufacturers || [];

            console.log('Loaded products from JSON:', this.products.length);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    renderProducts() {
        // Find product grids on the page
        const productGrids = document.querySelectorAll('.products-grid');

        productGrids.forEach(grid => {
            // Clear existing products
            grid.innerHTML = '';

            // Render all products
            this.products.forEach(product => {
                const productCard = this.createProductCard(product);
                grid.appendChild(productCard);
            });
        });

        console.log('Rendered products:', this.products.length);
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', product.id);
        card.setAttribute('data-category', product.category);
        card.setAttribute('data-manufacturer', product.manufacturer);

        // Product image
        const imageDiv = document.createElement('div');
        imageDiv.className = 'product-image';

        if (product.imageType === 'emoji') {
            imageDiv.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 80px;">
                    ${product.image}
                </div>
            `;
        } else {
            const img = document.createElement('img');
            img.src = product.image;
            img.alt = product.title;
            imageDiv.appendChild(img);
        }

        // Badge
        if (product.badge) {
            const badge = document.createElement('span');
            badge.className = `product-badge ${product.badge}`;
            badge.textContent = product.badgeText || '';
            imageDiv.appendChild(badge);
        }

        card.appendChild(imageDiv);

        // Product info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';

        // Category
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'product-category';
        categoryDiv.textContent = product.categoryName;
        infoDiv.appendChild(categoryDiv);

        // Title
        const title = document.createElement('h3');
        title.className = 'product-title';
        title.textContent = product.title;
        infoDiv.appendChild(title);

        // Rating
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'product-rating';

        const stars = document.createElement('span');
        stars.className = 'stars';
        stars.textContent = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
        ratingDiv.appendChild(stars);

        const ratingCount = document.createElement('span');
        ratingCount.className = 'rating-count';
        ratingCount.textContent = `(${product.ratingCount})`;
        ratingDiv.appendChild(ratingCount);

        infoDiv.appendChild(ratingDiv);

        // Description
        const description = document.createElement('p');
        description.className = 'product-description';
        description.textContent = product.description;
        infoDiv.appendChild(description);

        // Footer with price and button
        const footer = document.createElement('div');
        footer.className = 'product-footer';

        const priceDiv = document.createElement('div');
        priceDiv.className = 'product-price';

        if (product.oldPrice) {
            const oldPrice = document.createElement('span');
            oldPrice.className = 'old-price';
            oldPrice.textContent = `${product.oldPrice} Kč`;
            priceDiv.appendChild(oldPrice);
            priceDiv.appendChild(document.createTextNode(` ${product.price} Kč`));
        } else {
            priceDiv.textContent = `${product.price} Kč`;
        }

        footer.appendChild(priceDiv);

        const button = document.createElement('button');
        button.className = 'btn-add-cart';
        button.textContent = 'Do košíku';
        footer.appendChild(button);

        infoDiv.appendChild(footer);
        card.appendChild(infoDiv);

        return card;
    }

    getProductById(id) {
        return this.products.find(p => p.id === parseInt(id));
    }

    getProductsByCategory(categoryId) {
        if (categoryId === 'all') return this.products;
        return this.products.filter(p => p.category === categoryId);
    }

    getProductsByManufacturer(manufacturerId) {
        return this.products.filter(p => p.manufacturer === manufacturerId);
    }

    getAllProducts() {
        return this.products;
    }
}

// Initialize product loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.productLoader = new ProductLoader();
    });
} else {
    window.productLoader = new ProductLoader();
}
