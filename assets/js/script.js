// ============================================
// ELEKTRO DVOŘÁK - HLAVNÍ JAVASCRIPT
// ============================================

// ============================================
// MOBILNÍ MENU
// ============================================
class MobileMenu {
    constructor() {
        this.toggle = document.querySelector('.mobile-menu-toggle');
        this.nav = document.querySelector('.nav-links');
        this.init();
    }

    init() {
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleMenu());
        }
    }

    toggleMenu() {
        this.nav.classList.toggle('active');
        this.toggle.classList.toggle('active');
    }
}

// ============================================
// KOŠÍK
// ============================================
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartBadge();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Přidání produktu do košíku
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    this.addToCart(productCard);
                }
            });
        });
    }

    addToCart(productCard) {
        const product = {
            id: productCard.dataset.productId || Date.now(),
            name: productCard.querySelector('.product-title').textContent,
            price: this.extractPrice(productCard.querySelector('.product-price').textContent),
            category: productCard.querySelector('.product-category')?.textContent || '',
            image: productCard.querySelector('.product-image img')?.src || '',
            quantity: 1
        };

        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push(product);
        }

        this.saveCart();
        this.updateCartBadge();
        this.showNotification('Produkt přidán do košíku!');
    }

    extractPrice(priceText) {
        const match = priceText.match(/[\d\s]+/);
        return match ? parseInt(match[0].replace(/\s/g, '')) : 0;
    }

    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartBadge();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartBadge();
    }

    showNotification(message) {
        // Vytvoření notifikace
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// ============================================
// FILTRY PRODUKTŮ
// ============================================
class ProductFilters {
    constructor() {
        this.products = [];
        this.filters = {
            category: 'all',
            priceMin: 0,
            priceMax: Infinity,
            manufacturer: 'all',
            search: ''
        };
        this.init();
    }

    init() {
        this.collectProducts();
        this.attachEventListeners();
    }

    collectProducts() {
        document.querySelectorAll('.product-card').forEach(card => {
            this.products.push({
                element: card,
                category: card.dataset.category || '',
                price: this.extractPrice(card.querySelector('.product-price')?.textContent || '0'),
                manufacturer: card.dataset.manufacturer || '',
                name: card.querySelector('.product-title')?.textContent.toLowerCase() || ''
            });
        });
    }

    extractPrice(priceText) {
        const match = priceText.match(/[\d\s]+/);
        return match ? parseInt(match[0].replace(/\s/g, '')) : 0;
    }

    attachEventListeners() {
        // Filtry kategorie
        document.querySelectorAll('[data-filter-category]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filters.category = e.target.dataset.filterCategory;
                this.applyFilters();
            });
        });

        // Cenové filtry
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');

        if (priceMin) {
            priceMin.addEventListener('change', (e) => {
                this.filters.priceMin = parseInt(e.target.value) || 0;
                this.applyFilters();
            });
        }

        if (priceMax) {
            priceMax.addEventListener('change', (e) => {
                this.filters.priceMax = parseInt(e.target.value) || Infinity;
                this.applyFilters();
            });
        }

        // Vyhledávání
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        this.products.forEach(product => {
            const matchesCategory = this.filters.category === 'all' || product.category === this.filters.category;
            const matchesPrice = product.price >= this.filters.priceMin && product.price <= this.filters.priceMax;
            const matchesSearch = !this.filters.search || product.name.includes(this.filters.search);

            if (matchesCategory && matchesPrice && matchesSearch) {
                product.element.style.display = 'flex';
            } else {
                product.element.style.display = 'none';
            }
        });
    }
}

// ============================================
// TŘÍDĚNÍ PRODUKTŮ
// ============================================
class ProductSorter {
    constructor() {
        this.init();
    }

    init() {
        const sortSelect = document.getElementById('sort-products');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.sortProducts(e.target.value));
        }
    }

    sortProducts(sortBy) {
        const container = document.querySelector('.products-grid');
        if (!container) return;

        const products = Array.from(container.querySelectorAll('.product-card'));

        products.sort((a, b) => {
            switch(sortBy) {
                case 'price-asc':
                    return this.getPrice(a) - this.getPrice(b);
                case 'price-desc':
                    return this.getPrice(b) - this.getPrice(a);
                case 'name-asc':
                    return this.getName(a).localeCompare(this.getName(b), 'cs');
                case 'name-desc':
                    return this.getName(b).localeCompare(this.getName(a), 'cs');
                case 'newest':
                    return 0; // Ponechat původní pořadí
                default:
                    return 0;
            }
        });

        products.forEach(product => container.appendChild(product));
    }

    getPrice(element) {
        const priceText = element.querySelector('.product-price')?.textContent || '0';
        const match = priceText.match(/[\d\s]+/);
        return match ? parseInt(match[0].replace(/\s/g, '')) : 0;
    }

    getName(element) {
        return element.querySelector('.product-title')?.textContent || '';
    }
}

// ============================================
// GALERIE PRODUKTU
// ============================================
class ProductGallery {
    constructor() {
        this.init();
    }

    init() {
        const thumbnails = document.querySelectorAll('.gallery-thumbnail');
        const mainImage = document.querySelector('.main-product-image');

        if (thumbnails && mainImage) {
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', (e) => {
                    // Odstranit active třídu ze všech thumbnailů
                    thumbnails.forEach(t => t.classList.remove('active'));
                    // Přidat active třídu na kliknutý thumbnail
                    e.target.classList.add('active');
                    // Změnit hlavní obrázek
                    mainImage.src = e.target.src;
                });
            });
        }
    }
}

// ============================================
// KONTAKTNÍ FORMULÁŘ
// ============================================
class ContactForm {
    constructor() {
        this.init();
    }

    init() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Validace
        if (!this.validate(data)) {
            return;
        }

        // Simulace odeslání (zde by byl AJAX požadavek)
        console.log('Odesílání formuláře:', data);

        this.showSuccess();
        e.target.reset();
    }

    validate(data) {
        if (!data.name || !data.email || !data.message) {
            alert('Vyplňte prosím všechna povinná pole');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Zadejte prosím platnou e-mailovou adresu');
            return false;
        }

        return true;
    }

    showSuccess() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = 'Zpráva byla úspěšně odeslána!';
        message.style.cssText = `
            background: #28a745;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: center;
        `;

        const form = document.getElementById('contact-form');
        form.parentNode.insertBefore(message, form.nextSibling);

        setTimeout(() => message.remove(), 5000);
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ============================================
// LAZY LOADING OBRÁZKŮ
// ============================================
class LazyLoader {
    constructor() {
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback pro starší prohlížeče
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }
}

// ============================================
// ANIMACE PŘI SCROLLOVÁNÍ
// ============================================
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.product-card, .feature-card, .category-card').forEach(el => {
            observer.observe(el);
        });
    }
}

// ============================================
// INICIALIZACE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializace všech komponent
    new MobileMenu();
    window.cart = new ShoppingCart();
    new ProductFilters();
    new ProductSorter();
    new ProductGallery();
    new ContactForm();
    new SmoothScroll();
    new LazyLoader();
    new ScrollAnimations();

    console.log('🛒 Elektro Dvořák - E-shop initialized');
});

// ============================================
// EXPORT PRO POUŽITÍ V HTML
// ============================================
window.ElektroDvorak = {
    cart: null,

    // Přidat produkt do košíku (volat z HTML)
    addToCart: function(productId) {
        if (this.cart) {
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                this.cart.addToCart(productCard);
            }
        }
    },

    // Otevřít košík
    openCart: function() {
        window.location.href = 'pages/cart.html';
    }
};
