// ==========================================
// DRAG AND DROP FUNCTIONALITY
// ==========================================

class DragDropController {
    constructor() {
        this.draggedElement = null;
        this.dropZone = null;
        this.init();
    }

    init() {
        this.setupDraggableElements();
        this.setupIframeDropZones();
    }

    setupDraggableElements() {
        const elementItems = document.querySelectorAll('.element-item');

        elementItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.draggedElement = item;
                const elementType = item.getAttribute('data-type');

                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('text/html', elementType);

                item.style.opacity = '0.5';
            });

            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
                this.draggedElement = null;
            });
        });
    }

    setupIframeDropZones() {
        // Wait for iframe to load
        const iframe = document.getElementById('editorFrame');
        if (!iframe) return;

        iframe.addEventListener('load', () => {
            setTimeout(() => {
                this.initializeIframeDropZones();
            }, 600);
        });
    }

    initializeIframeDropZones() {
        const iframe = document.getElementById('editorFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Make all container elements drop zones
        const dropZones = iframeDoc.querySelectorAll('section, .container, .products-grid, .features, .categories');

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                zone.style.outline = '2px dashed #667eea';
                zone.style.outlineOffset = '4px';
            });

            zone.addEventListener('dragleave', (e) => {
                zone.style.outline = '';
                zone.style.outlineOffset = '';
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();

                zone.style.outline = '';
                zone.style.outlineOffset = '';

                const elementType = e.dataTransfer.getData('text/html');
                this.createElement(elementType, zone, iframeDoc);
            });
        });

        // Also make the body a drop zone
        iframeDoc.body.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        iframeDoc.body.addEventListener('drop', (e) => {
            e.preventDefault();
            const elementType = e.dataTransfer.getData('text/html');
            this.createElement(elementType, iframeDoc.body, iframeDoc);
        });
    }

    createElement(type, container, doc) {
        if (!window.AuthSystem.hasPermission('edit')) {
            window.editor.showToast('You don\'t have permission to add elements');
            return;
        }

        let newElement;

        switch (type) {
            case 'section':
                newElement = doc.createElement('section');
                newElement.style.padding = '40px 20px';
                newElement.style.margin = '20px 0';
                newElement.style.backgroundColor = '#f8f8f8';
                newElement.innerHTML = '<div class="container"><h2>New Section</h2><p>Click to edit content</p></div>';
                break;

            case 'container':
                newElement = doc.createElement('div');
                newElement.className = 'container';
                newElement.innerHTML = '<p>New Container - Click to edit</p>';
                newElement.style.padding = '20px';
                newElement.style.border = '1px solid #e0e0e0';
                newElement.style.borderRadius = '8px';
                newElement.style.margin = '10px 0';
                break;

            case 'grid':
                newElement = doc.createElement('div');
                newElement.style.display = 'grid';
                newElement.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
                newElement.style.gap = '20px';
                newElement.style.padding = '20px';
                newElement.innerHTML = `
                    <div style="padding: 20px; background: #f8f8f8; border-radius: 8px;">Grid Item 1</div>
                    <div style="padding: 20px; background: #f8f8f8; border-radius: 8px;">Grid Item 2</div>
                    <div style="padding: 20px; background: #f8f8f8; border-radius: 8px;">Grid Item 3</div>
                `;
                break;

            case 'heading':
                newElement = doc.createElement('h2');
                newElement.textContent = 'New Heading';
                newElement.style.margin = '20px 0';
                break;

            case 'text':
                newElement = doc.createElement('p');
                newElement.textContent = 'New paragraph. Click to edit this text.';
                newElement.style.margin = '10px 0';
                break;

            case 'image':
                newElement = doc.createElement('img');
                newElement.src = 'https://via.placeholder.com/400x300';
                newElement.alt = 'New Image';
                newElement.style.maxWidth = '100%';
                newElement.style.height = 'auto';
                newElement.style.borderRadius = '8px';
                newElement.style.margin = '10px 0';
                break;

            case 'button':
                newElement = doc.createElement('button');
                newElement.textContent = 'Click Me';
                newElement.className = 'btn-primary';
                newElement.style.margin = '10px 0';
                break;

            case 'product-card':
                newElement = doc.createElement('div');
                newElement.className = 'product-card';
                newElement.innerHTML = `
                    <div class="product-badge new">Nový</div>
                    <img src="https://via.placeholder.com/280x200" alt="Product">
                    <div class="product-category">Kategorie</div>
                    <h3 class="product-title">Nový Produkt</h3>
                    <div class="product-rating">
                        <span class="star">★</span>
                        <span class="star">★</span>
                        <span class="star">★</span>
                        <span class="star">★</span>
                        <span class="star">★</span>
                    </div>
                    <p class="product-description">Popis produktu...</p>
                    <div class="product-footer">
                        <span class="product-price">999 Kč</span>
                        <button class="btn-primary btn-small">Do košíku</button>
                    </div>
                `;
                break;

            case 'feature-card':
                newElement = doc.createElement('div');
                newElement.className = 'feature-card';
                newElement.innerHTML = `
                    <div class="feature-icon">⭐</div>
                    <h3>Nová Vlastnost</h3>
                    <p>Popis vlastnosti produktu nebo služby.</p>
                `;
                break;

            case 'category-card':
                newElement = doc.createElement('div');
                newElement.className = 'category-card';
                newElement.innerHTML = `
                    <div class="category-icon">📦</div>
                    <h3>Nová Kategorie</h3>
                    <p>15 produktů</p>
                `;
                break;

            default:
                console.warn('Unknown element type:', type);
                return;
        }

        // Save state before adding element
        window.editor.saveState(`Added ${type} element`);

        // Add the new element to the container
        container.appendChild(newElement);

        // Make it interactive
        this.makeElementInteractive(newElement, doc);

        // Add to history
        window.editor.addToHistory(`Added ${type} element`);
        window.editor.showToast(`${type} added successfully!`);
    }

    makeElementInteractive(element, doc) {
        // Add hover effect
        element.addEventListener('mouseenter', () => {
            if (element !== window.editor.selectedElement) {
                element.classList.add('builder-hover');
            }
        });

        element.addEventListener('mouseleave', () => {
            element.classList.remove('builder-hover');
        });

        // Add click to select
        element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.editor.selectElement(element);
        });

        // Make child elements interactive too
        const children = element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, img');
        children.forEach(child => {
            this.makeElementInteractive(child, doc);
        });
    }
}

// Initialize drag and drop when editor is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dragDrop = new DragDropController();
    });
} else {
    window.dragDrop = new DragDropController();
}
