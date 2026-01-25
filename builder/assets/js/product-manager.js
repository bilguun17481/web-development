// ==========================================
// PRODUCT MANAGEMENT SYSTEM
// ==========================================

class ProductManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.manufacturers = [];
        this.currentEditId = null;
        this.currentImageData = null; // Store uploaded image data
        this.apiBase = 'http://localhost:3000/api';
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupProductPanel();
        this.setupProductForm();
        this.setupCategoryManagement();
        this.setupManufacturerManagement();
        this.setupImageUpload();
        this.setupSearch();
        this.setupExportButton();
    }

    setupExportButton() {
        const exportBtn = document.getElementById('exportProductsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportProducts();
            });
        }
    }

    async loadProducts() {
        try {
            // Try to load from API server first
            const response = await fetch(`${this.apiBase}/products`);
            if (!response.ok) throw new Error('API not available');

            const data = await response.json();

            this.products = data.products || [];
            this.categories = data.categories || [];
            this.manufacturers = data.manufacturers || [];

            this.renderProductList();
            console.log('Loaded products from API server');
        } catch (error) {
            // Fallback to static JSON file
            try {
                const response = await fetch('../data/products.json');
                const data = await response.json();

                this.products = data.products || [];
                this.categories = data.categories || [];
                this.manufacturers = data.manufacturers || [];

                this.renderProductList();
                console.log('Loaded products from static JSON (API server not running)');
                window.editor?.showToast('Server not running - changes won\'t be saved');
            } catch (e) {
                console.error('Error loading products:', e);
                window.editor?.showToast('Error loading products');
            }
        }
    }

    setupProductPanel() {
        const productsPanel = document.getElementById('productsPanel');
        if (!productsPanel) return;

        productsPanel.innerHTML = `
            <div class="products-manager">
                <div class="products-header">
                    <h3>🛍 Produkty (${this.products.length})</h3>
                    <button class="btn-primary" id="addProductBtn">
                        <span>+</span> Přidat produkt
                    </button>
                </div>

                <div class="products-search">
                    <input type="text" id="productSearch" placeholder="🔍 Hledat produkt...">
                </div>

                <div class="products-list" id="productsList">
                    <!-- Products will be loaded here -->
                </div>
            </div>

            <!-- Product Form Modal -->
            <div class="product-modal" id="productModal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h2 id="modalTitle">Nový produkt</h2>
                        <button class="modal-close" id="closeProductModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="productForm" class="product-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="productTitle">Název produktu *</label>
                                    <input type="text" id="productTitle" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="productCategory">Kategorie *</label>
                                    <div style="display: flex; gap: 8px;">
                                        <select id="productCategory" required style="flex: 1;">
                                            <option value="">Vyberte kategorii</option>
                                            ${this.categories.map(cat => `
                                                <option value="${cat.id}">${cat.name}</option>
                                            `).join('')}
                                        </select>
                                        <button type="button" class="btn-icon" id="addCategoryBtn" title="Přidat kategorii">
                                            ➕
                                        </button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="productManufacturer">Výrobce *</label>
                                    <div style="display: flex; gap: 8px;">
                                        <select id="productManufacturer" required style="flex: 1;">
                                            <option value="">Vyberte výrobce</option>
                                            ${this.manufacturers.map(man => `
                                                <option value="${man.id}">${man.name}</option>
                                            `).join('')}
                                        </select>
                                        <button type="button" class="btn-icon" id="addManufacturerBtn" title="Přidat výrobce">
                                            ➕
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="productPrice">Cena (Kč) *</label>
                                    <input type="number" id="productPrice" min="0" step="1" required>
                                </div>
                                <div class="form-group">
                                    <label for="productOldPrice">Původní cena (Kč)</label>
                                    <input type="number" id="productOldPrice" min="0" step="1">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="productImage">Obrázek (emoji, URL, nebo nahrát)</label>
                                    <div style="display: flex; gap: 8px; align-items: flex-end;">
                                        <input type="text" id="productImage" placeholder="💡 nebo https://..." style="flex: 1;">
                                        <button type="button" class="btn-upload-small" id="uploadProductImageBtn" title="Nahrát obrázek">
                                            📤 Nahrát
                                        </button>
                                    </div>
                                    <input type="file" id="productImageUpload" accept="image/jpeg,image/png,image/jpg,image/gif,image/webp" style="display: none;">
                                    <div id="imagePreview" style="margin-top: 8px; display: none;">
                                        <img id="previewImg" style="max-width: 100px; max-height: 100px; border-radius: 4px; border: 1px solid #e0e0e0;">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="productBadge">Odznak</label>
                                    <select id="productBadge">
                                        <option value="">Žádný</option>
                                        <option value="new">Novinka</option>
                                        <option value="sale">Sleva</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="productRating">Hodnocení (1-5)</label>
                                    <input type="number" id="productRating" min="1" max="5" value="5">
                                </div>
                                <div class="form-group">
                                    <label for="productRatingCount">Počet hodnocení</label>
                                    <input type="number" id="productRatingCount" min="0" value="0">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="productDescription">Popis *</label>
                                <textarea id="productDescription" rows="3" required></textarea>
                            </div>

                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="productInStock" checked>
                                    Skladem
                                </label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" id="cancelProduct">Zrušit</button>
                        <button class="btn-primary" id="saveProduct">
                            <span>💾</span> Uložit produkt
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Setup add button
        document.getElementById('addProductBtn')?.addEventListener('click', () => {
            this.showProductForm();
        });
    }

    renderProductList() {
        const productsList = document.getElementById('productsList');
        if (!productsList) return;

        if (this.products.length === 0) {
            productsList.innerHTML = '<p class="no-products">Žádné produkty. Klikněte na "Přidat produkt" pro vytvoření.</p>';
            return;
        }

        productsList.innerHTML = this.products.map(product => `
            <div class="product-item" data-id="${product.id}">
                <div class="product-item-image">
                    ${product.imageType === 'emoji' ? product.image : `<img src="${product.image}" alt="${product.title}">`}
                </div>
                <div class="product-item-info">
                    <h4>${product.title}</h4>
                    <div class="product-item-meta">
                        <span class="product-item-category">${product.categoryName}</span>
                        <span class="product-item-price">${product.price} Kč</span>
                    </div>
                </div>
                <div class="product-item-actions">
                    <button class="btn-icon" onclick="window.productManager.editProduct(${product.id})" title="Upravit">
                        ✏️
                    </button>
                    <button class="btn-icon btn-danger" onclick="window.productManager.deleteProduct(${product.id})" title="Smazat">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        // Update count
        const header = document.querySelector('.products-header h3');
        if (header) {
            header.textContent = `🛍 Produkty (${this.products.length})`;
        }
    }

    setupProductForm() {
        const modal = document.getElementById('productModal');
        const closeBtn = document.getElementById('closeProductModal');
        const cancelBtn = document.getElementById('cancelProduct');
        const saveBtn = document.getElementById('saveProduct');

        closeBtn?.addEventListener('click', () => this.hideProductForm());
        cancelBtn?.addEventListener('click', () => this.hideProductForm());

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.hideProductForm();
        });

        saveBtn?.addEventListener('click', () => this.saveProduct());
    }

    setupCategoryManagement() {
        // Wait for modal to be in DOM
        setTimeout(() => {
            const addCategoryBtn = document.getElementById('addCategoryBtn');
            if (addCategoryBtn) {
                addCategoryBtn.addEventListener('click', () => this.addNewCategory());
            }
        }, 500);
    }

    setupManufacturerManagement() {
        setTimeout(() => {
            const addManufacturerBtn = document.getElementById('addManufacturerBtn');
            if (addManufacturerBtn) {
                addManufacturerBtn.addEventListener('click', () => this.addNewManufacturer());
            }
        }, 500);
    }

    setupImageUpload() {
        setTimeout(() => {
            const uploadBtn = document.getElementById('uploadProductImageBtn');
            const fileInput = document.getElementById('productImageUpload');

            if (uploadBtn && fileInput) {
                uploadBtn.addEventListener('click', () => {
                    fileInput.click();
                });

                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        this.handleProductImageUpload(file);
                    }
                });
            }
        }, 500);
    }

    handleProductImageUpload(file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            window.editor.showToast('Pouze JPG, PNG, GIF nebo WebP soubory');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            window.editor.showToast('Obrázek musí být menší než 5MB');
            return;
        }

        // Read file as data URL
        const reader = new FileReader();

        reader.onload = (e) => {
            const dataUrl = e.target.result;

            // Store the image data for sending to server
            this.currentImageData = dataUrl;

            // Show preview
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');

            if (preview && previewImg) {
                previewImg.src = dataUrl;
                preview.style.display = 'block';
            }

            // Clear the text input since we're using uploaded file
            document.getElementById('productImage').value = '';
            document.getElementById('productImage').placeholder = 'Obrázek nahrán';

            window.editor.showToast('Obrázek nahrán!');
        };

        reader.onerror = () => {
            window.editor.showToast('Chyba při nahrávání obrázku');
        };

        reader.readAsDataURL(file);
    }

    async addNewCategory() {
        const categoryName = prompt('Zadejte název kategorie:');
        if (!categoryName || categoryName.trim() === '') return;

        const categoryId = categoryName.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        // Check if already exists
        if (this.categories.find(c => c.id === categoryId)) {
            window.editor.showToast('Kategorie již existuje');
            return;
        }

        const categoryIcon = prompt('Zadejte emoji ikonu (např. 💡):', '📦');

        const newCategory = {
            id: categoryId,
            name: categoryName.trim(),
            icon: categoryIcon || '📦'
        };

        try {
            const response = await fetch(`${this.apiBase}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: newCategory })
            });

            if (!response.ok) throw new Error('Server error');

            this.categories.push(newCategory);

            // Refresh the form
            this.setupProductPanel();
            this.setupProductForm();
            this.setupCategoryManagement();
            this.setupManufacturerManagement();
            this.setupImageUpload();

            // Reopen modal if it was open
            if (this.currentEditId !== null) {
                this.showProductForm(this.currentEditId);
            } else {
                this.showProductForm();
            }

            // Select the new category
            setTimeout(() => {
                const select = document.getElementById('productCategory');
                if (select) {
                    select.value = categoryId;
                }
            }, 100);

            window.editor.showToast(`Kategorie "${categoryName}" přidána!`);
        } catch (error) {
            console.error('Error adding category:', error);
            window.editor.showToast('Chyba: Server neběží');
        }
    }

    async addNewManufacturer() {
        const manufacturerName = prompt('Zadejte název výrobce:');
        if (!manufacturerName || manufacturerName.trim() === '') return;

        const manufacturerId = manufacturerName.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        // Check if already exists
        if (this.manufacturers.find(m => m.id === manufacturerId)) {
            window.editor.showToast('Výrobce již existuje');
            return;
        }

        const newManufacturer = {
            id: manufacturerId,
            name: manufacturerName.trim()
        };

        try {
            const response = await fetch(`${this.apiBase}/manufacturers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manufacturer: newManufacturer })
            });

            if (!response.ok) throw new Error('Server error');

            this.manufacturers.push(newManufacturer);

            // Refresh the form
            this.setupProductPanel();
            this.setupProductForm();
            this.setupCategoryManagement();
            this.setupManufacturerManagement();
            this.setupImageUpload();

            // Reopen modal if it was open
            if (this.currentEditId !== null) {
                this.showProductForm(this.currentEditId);
            } else {
                this.showProductForm();
            }

            // Select the new manufacturer
            setTimeout(() => {
                const select = document.getElementById('productManufacturer');
                if (select) {
                    select.value = manufacturerId;
                }
            }, 100);

            window.editor.showToast(`Výrobce "${manufacturerName}" přidán!`);
        } catch (error) {
            console.error('Error adding manufacturer:', error);
            window.editor.showToast('Chyba: Server neběží');
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('productSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            this.filterProducts(e.target.value);
        });
    }

    filterProducts(query) {
        const items = document.querySelectorAll('.product-item');
        const lowerQuery = query.toLowerCase();

        items.forEach(item => {
            const title = item.querySelector('h4').textContent.toLowerCase();
            const category = item.querySelector('.product-item-category').textContent.toLowerCase();

            if (title.includes(lowerQuery) || category.includes(lowerQuery)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    showProductForm(productId = null) {
        if (!window.AuthSystem.hasPermission('edit')) {
            window.editor.showToast('Nemáte oprávnění přidávat/upravovat produkty');
            return;
        }

        const modal = document.getElementById('productModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('productForm');

        this.currentEditId = productId;
        this.currentImageData = null; // Reset image data

        // Reset image preview
        const preview = document.getElementById('imagePreview');
        if (preview) preview.style.display = 'none';

        if (productId) {
            // Edit mode
            const product = this.products.find(p => p.id === productId);
            if (!product) return;

            title.textContent = 'Upravit produkt';
            this.fillForm(product);
        } else {
            // Add mode
            title.textContent = 'Nový produkt';
            form.reset();
            document.getElementById('productInStock').checked = true;
            document.getElementById('productRating').value = 5;
            document.getElementById('productRatingCount').value = 0;
            document.getElementById('productImage').placeholder = 'Nahrát obrázek nebo zadat emoji';
        }

        modal.classList.add('show');
    }

    hideProductForm() {
        const modal = document.getElementById('productModal');
        modal.classList.remove('show');
        this.currentEditId = null;
    }

    fillForm(product) {
        document.getElementById('productTitle').value = product.title;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productManufacturer').value = product.manufacturer;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productOldPrice').value = product.oldPrice || '';
        document.getElementById('productImage').value = product.image;
        document.getElementById('productBadge').value = product.badge || '';
        document.getElementById('productRating').value = product.rating;
        document.getElementById('productRatingCount').value = product.ratingCount;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productInStock').checked = product.inStock;
    }

    async saveProduct() {
        const form = document.getElementById('productForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Get product ID - prompt for kat# if new product
        let productId = this.currentEditId;
        if (!productId) {
            productId = prompt('Zadejte ID produktu (např. kat17144):');
            if (!productId || productId.trim() === '') {
                window.editor.showToast('ID produktu je povinné');
                return;
            }
            productId = productId.trim();

            // Check if ID already exists
            if (this.products.find(p => p.id === productId)) {
                window.editor.showToast('Produkt s tímto ID již existuje');
                return;
            }
        }

        // Save state for undo
        window.editor.saveState(this.currentEditId ? 'Updated product' : 'Added new product');

        const categoryId = document.getElementById('productCategory').value;
        const category = this.categories.find(c => c.id === categoryId);

        const badge = document.getElementById('productBadge').value;
        let badgeText = null;
        if (badge === 'new') badgeText = 'Novinka';
        else if (badge === 'sale') {
            badgeText = prompt('Zadejte text slevy (např. -20%, SUPER CENA):', '-20%') || '-20%';
        }

        const image = document.getElementById('productImage').value;
        let imageType = 'file'; // Default to file when using uploaded image

        // Check if it's an emoji
        if (image && /^[\p{Emoji}]+$/u.test(image)) {
            imageType = 'emoji';
        }

        const productData = {
            id: productId,
            title: document.getElementById('productTitle').value,
            category: categoryId,
            categoryName: category?.name || '',
            manufacturer: document.getElementById('productManufacturer').value,
            price: parseInt(document.getElementById('productPrice').value),
            oldPrice: parseInt(document.getElementById('productOldPrice').value) || null,
            image: this.currentImageData ? productId : image, // Use productId as image name if uploaded
            imageType: this.currentImageData ? 'file' : imageType,
            badge: badge || null,
            badgeText: badgeText,
            rating: parseInt(document.getElementById('productRating').value),
            ratingCount: parseInt(document.getElementById('productRatingCount').value),
            description: document.getElementById('productDescription').value,
            inStock: document.getElementById('productInStock').checked
        };

        try {
            const isUpdate = !!this.currentEditId;
            const url = isUpdate
                ? `${this.apiBase}/products/${productId}`
                : `${this.apiBase}/products`;

            const response = await fetch(url, {
                method: isUpdate ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product: productData,
                    imageData: this.currentImageData // Send image data if uploaded
                })
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            const result = await response.json();

            if (isUpdate) {
                const index = this.products.findIndex(p => p.id === this.currentEditId);
                if (index !== -1) {
                    this.products[index] = productData;
                }
                window.editor.addToHistory(`Updated product: ${productData.title}`);
                window.editor.showToast('Produkt aktualizován!');
            } else {
                this.products.push(productData);
                window.editor.addToHistory(`Added product: ${productData.title}`);
                window.editor.showToast('Produkt přidán a obrázek uložen!');
            }

            this.renderProductList();
            this.hideProductForm();
            this.currentImageData = null;

        } catch (error) {
            console.error('Error saving product:', error);
            window.editor.showToast('Chyba: Server neběží. Spusťte "node server.js"');
        }
    }

    editProduct(id) {
        this.showProductForm(id);
    }

    async deleteProduct(id) {
        if (!window.AuthSystem.hasPermission('delete')) {
            window.editor.showToast('Nemáte oprávnění mazat produkty');
            return;
        }

        const product = this.products.find(p => p.id === id);
        if (!product) return;

        if (!confirm(`Opravdu smazat "${product.title}"?`)) return;

        try {
            const response = await fetch(`${this.apiBase}/products/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            // Save state for undo
            window.editor.saveState(`Deleted product: ${product.title}`);

            this.products = this.products.filter(p => p.id !== id);
            this.renderProductList();

            window.editor.addToHistory(`Deleted product: ${product.title}`);
            window.editor.showToast('Produkt smazán');
        } catch (error) {
            console.error('Error deleting product:', error);
            window.editor.showToast('Chyba: Server neběží. Spusťte "node server.js"');
        }
    }

    updateProductsJSON() {
        // This will be used when exporting
        // Store in localStorage for now
        const data = {
            products: this.products,
            categories: this.categories,
            manufacturers: this.manufacturers
        };

        localStorage.setItem('builderProducts', JSON.stringify(data));
    }

    exportProducts() {
        const data = {
            products: this.products,
            categories: this.categories,
            manufacturers: this.manufacturers
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.editor.showToast('Products.json exportován!');
    }

    getAllProducts() {
        return this.products;
    }
}

// Initialize product manager when editor is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.productManager = new ProductManager();
        }, 1000);
    });
} else {
    setTimeout(() => {
        window.productManager = new ProductManager();
    }, 1000);
}
