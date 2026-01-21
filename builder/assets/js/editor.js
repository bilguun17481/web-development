// ==========================================
// MAIN EDITOR CONTROLLER
// ==========================================

class EditorController {
    constructor() {
        this.selectedElement = null;
        this.currentPage = 'index.html';
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        this.undoStack = [];
        this.redoStack = [];

        this.init();
    }

    init() {
        this.setupSidebarTabs();
        this.setupPageNavigation();
        this.setupViewportControls();
        this.setupIframe();
        this.setupKeyboardShortcuts();
        this.setupUndoRedoButtons();
        this.loadAssets();
    }

    setupUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }

        if (redoBtn) {
            redoBtn.addEventListener('click', () => this.redo());
        }

        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) {
            undoBtn.disabled = this.undoStack.length === 0;
            undoBtn.style.opacity = this.undoStack.length === 0 ? '0.5' : '1';
        }

        if (redoBtn) {
            redoBtn.disabled = this.redoStack.length === 0;
            redoBtn.style.opacity = this.redoStack.length === 0 ? '0.5' : '1';
        }
    }

    setupSidebarTabs() {
        const tabs = document.querySelectorAll('.sidebar-tab');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const panelName = tab.getAttribute('data-panel');
                const sidebar = tab.closest('.sidebar');

                // Remove active from all tabs and panels in this sidebar
                sidebar.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
                sidebar.querySelectorAll('.sidebar-panel').forEach(p => p.classList.remove('active'));

                // Add active to clicked tab and corresponding panel
                tab.classList.add('active');
                const panel = sidebar.querySelector(`#${panelName}Panel`);
                if (panel) {
                    panel.classList.add('active');
                }
            });
        });
    }

    setupPageNavigation() {
        const pageItems = document.querySelectorAll('.page-item');

        pageItems.forEach(item => {
            item.addEventListener('click', () => {
                const pagePath = item.getAttribute('data-page');
                this.loadPage(pagePath);

                // Update active state
                pageItems.forEach(p => p.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    loadPage(pagePath) {
        this.currentPage = pagePath;
        const iframe = document.getElementById('editorFrame');
        iframe.src = `../${pagePath}`;

        this.addToHistory(`Loaded page: ${pagePath}`);
    }

    setupViewportControls() {
        const canvasWrapper = document.getElementById('canvasWrapper');

        document.getElementById('desktopView').addEventListener('click', () => {
            canvasWrapper.className = 'canvas-wrapper';
            this.addToHistory('Changed to desktop view');
        });

        document.getElementById('tabletView').addEventListener('click', () => {
            canvasWrapper.className = 'canvas-wrapper tablet-view';
            this.addToHistory('Changed to tablet view');
        });

        document.getElementById('mobileView').addEventListener('click', () => {
            canvasWrapper.className = 'canvas-wrapper mobile-view';
            this.addToHistory('Changed to mobile view');
        });
    }

    setupIframe() {
        const iframe = document.getElementById('editorFrame');

        iframe.addEventListener('load', () => {
            // Wait a bit for iframe to fully load
            setTimeout(() => {
                this.initializeIframeInteractions();
            }, 500);
        });
    }

    initializeIframeInteractions() {
        const iframe = document.getElementById('editorFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Save initial state if this is the first initialization
        if (this.undoStack.length === 0) {
            setTimeout(() => {
                this.saveState('Initial page load');
            }, 500);
        }

        // Add hover and click effects to all editable elements
        const editableElements = iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, img, .product-card, .feature-card, .category-card');

        editableElements.forEach(el => {
            // Hover effect
            el.addEventListener('mouseenter', () => {
                if (el !== this.selectedElement) {
                    el.classList.add('builder-hover');
                }
            });

            el.addEventListener('mouseleave', () => {
                el.classList.remove('builder-hover');
            });

            // Click to select
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectElement(el);
            });
        });
    }

    selectElement(element) {
        // Remove previous selection
        if (this.selectedElement) {
            this.selectedElement.classList.remove('builder-selected');
        }

        // Add new selection
        this.selectedElement = element;
        element.classList.add('builder-selected');
        element.classList.remove('builder-hover');

        // Update properties panel
        this.updatePropertiesPanel(element);

        this.addToHistory(`Selected element: ${element.tagName.toLowerCase()}`);
    }

    updatePropertiesPanel(element) {
        const propertiesContent = document.getElementById('propertiesContent');
        const tagName = element.tagName.toLowerCase();

        let html = '<div class="properties-form">';

        // Common properties
        html += `
            <div class="form-group">
                <label>Element Type</label>
                <input type="text" value="${tagName}" disabled>
            </div>
        `;

        // Text content for text elements
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'span'].includes(tagName)) {
            html += `
                <div class="form-group">
                    <label>Text Content</label>
                    <textarea id="propTextContent">${element.textContent}</textarea>
                </div>
            `;
        }

        // Image source for images
        if (tagName === 'img') {
            html += `
                <div class="form-group">
                    <label>Image Source</label>
                    <input type="text" id="propImageSrc" value="${element.src}">
                </div>
                <div class="form-group">
                    <label>Alt Text</label>
                    <input type="text" id="propImageAlt" value="${element.alt}">
                </div>
            `;
        }

        // Link href for anchors
        if (tagName === 'a') {
            html += `
                <div class="form-group">
                    <label>Link URL</label>
                    <input type="text" id="propLinkHref" value="${element.href}">
                </div>
            `;
        }

        // Style properties
        const computedStyle = window.getComputedStyle(element);
        html += `
            <div class="form-group">
                <label>Background Color</label>
                <input type="color" id="propBgColor" value="${this.rgbToHex(computedStyle.backgroundColor)}">
            </div>
            <div class="form-group">
                <label>Text Color</label>
                <input type="color" id="propTextColor" value="${this.rgbToHex(computedStyle.color)}">
            </div>
            <div class="form-group">
                <label>Font Size (px)</label>
                <input type="number" id="propFontSize" value="${parseInt(computedStyle.fontSize)}" min="8" max="72">
            </div>
            <div class="form-group">
                <label>Padding (px)</label>
                <input type="number" id="propPadding" value="${parseInt(computedStyle.padding)}" min="0" max="100">
            </div>
            <div class="form-group">
                <label>Margin (px)</label>
                <input type="number" id="propMargin" value="${parseInt(computedStyle.margin)}" min="0" max="100">
            </div>
        `;

        html += '<button class="btn-primary" id="applyPropertiesBtn">Apply Changes</button>';
        html += '</div>';

        propertiesContent.innerHTML = html;

        // Setup property change handlers
        this.setupPropertyHandlers(element);
    }

    setupPropertyHandlers(element) {
        const applyBtn = document.getElementById('applyPropertiesBtn');
        if (!applyBtn) return;

        applyBtn.addEventListener('click', () => {
            // Save state before making changes
            this.saveState('Updated element properties');

            // Text content
            const textContent = document.getElementById('propTextContent');
            if (textContent) {
                element.textContent = textContent.value;
            }

            // Image properties
            const imageSrc = document.getElementById('propImageSrc');
            const imageAlt = document.getElementById('propImageAlt');
            if (imageSrc) element.src = imageSrc.value;
            if (imageAlt) element.alt = imageAlt.value;

            // Link properties
            const linkHref = document.getElementById('propLinkHref');
            if (linkHref) element.href = linkHref.value;

            // Style properties
            const bgColor = document.getElementById('propBgColor');
            const textColor = document.getElementById('propTextColor');
            const fontSize = document.getElementById('propFontSize');
            const padding = document.getElementById('propPadding');
            const margin = document.getElementById('propMargin');

            if (bgColor) element.style.backgroundColor = bgColor.value;
            if (textColor) element.style.color = textColor.value;
            if (fontSize) element.style.fontSize = fontSize.value + 'px';
            if (padding) element.style.padding = padding.value + 'px';
            if (margin) element.style.margin = margin.value + 'px';

            this.addToHistory('Updated element properties');
            this.showToast('Properties updated successfully!');
        });
    }

    rgbToHex(rgb) {
        // Convert rgb(r, g, b) to #rrggbb
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') {
            return '#ffffff';
        }

        const result = rgb.match(/\d+/g);
        if (!result) return '#ffffff';

        const r = parseInt(result[0]).toString(16).padStart(2, '0');
        const g = parseInt(result[1]).toString(16).padStart(2, '0');
        const b = parseInt(result[2]).toString(16).padStart(2, '0');

        return `#${r}${g}${b}`;
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Undo: Ctrl+Z
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }

            // Redo: Ctrl+Y or Ctrl+Shift+Z
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                this.redo();
            }

            // Delete: Delete or Backspace (when element is selected)
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedElement) {
                e.preventDefault();
                this.deleteSelectedElement();
            }
        });
    }

    saveState(action) {
        const iframe = document.getElementById('editorFrame');
        if (!iframe) return;

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc || !iframeDoc.body) return;

        // Save current state
        const state = {
            html: iframeDoc.body.innerHTML,
            action: action,
            timestamp: new Date().toISOString()
        };

        this.undoStack.push(state);

        // Clear redo stack when new action is performed
        this.redoStack = [];

        // Limit stack size
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }

        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.undoStack.length === 0) {
            this.showToast('Nothing to undo');
            return;
        }

        const iframe = document.getElementById('editorFrame');
        if (!iframe) return;

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc || !iframeDoc.body) return;

        // Save current state to redo stack
        const currentState = {
            html: iframeDoc.body.innerHTML,
            action: 'Current state',
            timestamp: new Date().toISOString()
        };
        this.redoStack.push(currentState);

        // Pop and restore previous state
        const previousState = this.undoStack.pop();
        iframeDoc.body.innerHTML = previousState.html;

        // Re-initialize interactions
        setTimeout(() => {
            this.initializeIframeInteractions();
        }, 100);

        this.updateUndoRedoButtons();
        this.showToast(`Undid: ${previousState.action}`);
        this.addToHistory(`Undid: ${previousState.action}`);
    }

    redo() {
        if (this.redoStack.length === 0) {
            this.showToast('Nothing to redo');
            return;
        }

        const iframe = document.getElementById('editorFrame');
        if (!iframe) return;

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc || !iframeDoc.body) return;

        // Save current state to undo stack
        const currentState = {
            html: iframeDoc.body.innerHTML,
            action: 'Current state',
            timestamp: new Date().toISOString()
        };
        this.undoStack.push(currentState);

        // Pop and restore next state
        const nextState = this.redoStack.pop();
        iframeDoc.body.innerHTML = nextState.html;

        // Re-initialize interactions
        setTimeout(() => {
            this.initializeIframeInteractions();
        }, 100);

        this.updateUndoRedoButtons();
        this.showToast('Redone action');
        this.addToHistory('Redone action');
    }

    deleteSelectedElement() {
        if (!this.selectedElement) return;

        if (!window.AuthSystem.hasPermission('delete')) {
            this.showToast('You don\'t have permission to delete elements');
            return;
        }

        if (confirm('Are you sure you want to delete this element?')) {
            // Save state before deleting
            this.saveState(`Deleted element: ${this.selectedElement.tagName.toLowerCase()}`);

            const elementType = this.selectedElement.tagName.toLowerCase();
            this.selectedElement.remove();
            this.selectedElement = null;

            document.getElementById('propertiesContent').innerHTML = '<p class="no-selection">Select an element to edit its properties</p>';

            this.addToHistory(`Deleted element: ${elementType}`);
            this.showToast('Element deleted');
        }
    }

    addToHistory(action) {
        const historyItem = {
            action,
            timestamp: new Date().toISOString(),
            page: this.currentPage
        };

        this.history.push(historyItem);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        this.updateHistoryPanel();
    }

    updateHistoryPanel() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        historyList.innerHTML = '';

        // Show most recent first
        const recentHistory = this.history.slice().reverse().slice(0, 20);

        recentHistory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div>${item.action}</div>
                <div class="timestamp">${new Date(item.timestamp).toLocaleTimeString()}</div>
            `;
            historyList.appendChild(div);
        });
    }

    loadAssets() {
        // Load existing images from the project
        const assetGrid = document.getElementById('assetGrid');
        if (!assetGrid) return;

        const assets = [
            { name: 'logo.png', path: '../assets/images/logo.png' },
            { name: 'heureka-badge.png', path: '../assets/images/7469-12.png' }
        ];

        assets.forEach(asset => {
            this.addAssetToGrid(asset.name, asset.path);
        });
    }

    addAssetToGrid(name, path) {
        const assetGrid = document.getElementById('assetGrid');
        if (!assetGrid) return;

        const div = document.createElement('div');
        div.className = 'asset-item';
        div.innerHTML = `
            <img src="${path}" alt="${name}">
            <div class="asset-name">${name}</div>
        `;

        div.addEventListener('click', () => {
            if (this.selectedElement && this.selectedElement.tagName === 'IMG') {
                this.selectedElement.src = path;
                this.addToHistory(`Changed image to: ${name}`);
                this.showToast('Image updated!');
            } else {
                this.showToast('Select an image element first');
            }
        });

        assetGrid.appendChild(div);
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInUp 0.3s ease-out;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize editor when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.editor = new EditorController();
    });
} else {
    window.editor = new EditorController();
}
