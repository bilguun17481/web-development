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
        this.uploadedImages = new Map(); // Store uploaded images

        this.init();
    }

    init() {
        this.setupSidebarTabs();
        this.setupPageNavigation();
        this.setupViewportControls();
        this.setupIframe();
        this.setupKeyboardShortcuts();
        this.setupUndoRedoButtons();
        this.setupEditButtonContext();
        this.loadAssets();
    }

    setupEditButtonContext() {
        // Update Edit button to show selection context
        const editBtn = document.getElementById('floatingEditBtn');
        if (editBtn) {
            // Store original content
            editBtn.dataset.originalText = editBtn.innerHTML;
        }
    }

    updateEditButtonContext() {
        const editBtn = document.getElementById('floatingEditBtn');
        if (!editBtn) return;

        if (this.selectedElement) {
            const tagName = this.selectedElement.tagName.toLowerCase();
            const displayName = this.getElementDisplayName(tagName);
            editBtn.innerHTML = `
                <span class="edit-icon">✏️</span>
                <span class="edit-text">Edit ${displayName}</span>
            `;
            editBtn.classList.add('has-selection');
        } else {
            editBtn.innerHTML = editBtn.dataset.originalText || `
                <span class="edit-icon">✏️</span>
                <span class="edit-text">Edit</span>
            `;
            editBtn.classList.remove('has-selection');
        }
    }

    getElementDisplayName(tagName) {
        const names = {
            'h1': 'Heading 1',
            'h2': 'Heading 2',
            'h3': 'Heading 3',
            'h4': 'Heading 4',
            'h5': 'Heading 5',
            'h6': 'Heading 6',
            'p': 'Paragraph',
            'a': 'Link',
            'img': 'Image',
            'button': 'Button',
            'span': 'Text Span',
            'div': 'Container',
            'section': 'Section',
            'header': 'Header',
            'footer': 'Footer',
            'nav': 'Navigation',
            'ul': 'Unordered List',
            'ol': 'Ordered List',
            'li': 'List Item',
            'label': 'Label',
            'input': 'Input Field',
            'textarea': 'Text Area',
            'form': 'Form'
        };
        return names[tagName] || tagName.toUpperCase();
    }

    getElementIcon(tagName) {
        const icons = {
            'h1': '📰', 'h2': '📰', 'h3': '📰', 'h4': '📰', 'h5': '📰', 'h6': '📰',
            'p': '📝', 'a': '🔗', 'img': '🖼️', 'button': '🔘',
            'span': '✏️', 'div': '📦', 'section': '📐',
            'header': '🔝', 'footer': '🔚', 'nav': '🧭',
            'ul': '📋', 'ol': '🔢', 'li': '•',
            'label': '🏷️', 'input': '⌨️', 'textarea': '📄', 'form': '📋'
        };
        return icons[tagName] || '📋';
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
        // Deselect current element before loading new page
        this.deselectElement();

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

        // Inject editor styles into iframe
        this.injectEditorStyles(iframeDoc);

        // Save initial state if this is the first initialization
        if (this.undoStack.length === 0) {
            setTimeout(() => {
                this.saveState('Initial page load');
            }, 500);
        }

        // Add hover and click effects to all editable elements
        const editableElements = iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, img, span, div, section, .product-card, .feature-card, .category-card');

        editableElements.forEach(el => {
            // Skip if already has listener
            if (el.dataset.builderInit) return;
            el.dataset.builderInit = 'true';

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

        // Click on empty space to deselect
        iframeDoc.addEventListener('click', (e) => {
            if (e.target === iframeDoc.body || e.target === iframeDoc.documentElement) {
                this.deselectElement();
            }
        });
    }

    injectEditorStyles(iframeDoc) {
        // Check if styles already injected
        if (iframeDoc.getElementById('builder-styles')) return;

        const styleEl = iframeDoc.createElement('style');
        styleEl.id = 'builder-styles';
        styleEl.textContent = `
            /* Hover state */
            .builder-hover {
                outline: 2px dashed #667eea !important;
                outline-offset: 2px !important;
                cursor: pointer !important;
                transition: outline 0.15s ease !important;
            }

            /* Selected state */
            .builder-selected {
                outline: 3px solid #667eea !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2) !important;
                position: relative !important;
            }

            .builder-selected::after {
                content: attr(data-element-type);
                position: absolute;
                top: -28px;
                left: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-size: 11px;
                font-weight: 600;
                padding: 4px 10px;
                border-radius: 4px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                z-index: 10000;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
            }

            /* Animation for selection */
            @keyframes builder-pulse {
                0%, 100% { box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2); }
                50% { box-shadow: 0 0 0 6px rgba(102, 126, 234, 0.3); }
            }

            .builder-selected {
                animation: builder-pulse 2s ease-in-out infinite;
            }
        `;
        iframeDoc.head.appendChild(styleEl);
    }

    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('builder-selected');
            this.selectedElement.removeAttribute('data-element-type');
            this.selectedElement = null;
        }

        // Reset properties panel
        const propertiesContent = document.getElementById('propertiesContent');
        if (propertiesContent) {
            propertiesContent.innerHTML = '<p class="no-selection">Select an element to edit its properties</p>';
        }

        // Update Edit button context
        this.updateEditButtonContext();

        // Dispatch event for visual builder
        document.dispatchEvent(new CustomEvent('elementDeselected'));
    }

    selectElement(element) {
        // Remove previous selection
        if (this.selectedElement) {
            this.selectedElement.classList.remove('builder-selected');
            this.selectedElement.removeAttribute('data-element-type');
        }

        // Add new selection
        this.selectedElement = element;
        const tagName = element.tagName.toLowerCase();
        const displayName = this.getElementDisplayName(tagName);

        element.classList.add('builder-selected');
        element.classList.remove('builder-hover');
        element.setAttribute('data-element-type', displayName);

        // Update properties panel (use visual builder if available)
        if (window.visualBuilder) {
            window.visualBuilder.renderSmartProperties(element);
        } else {
            this.updatePropertiesPanel(element);
        }

        // Update Edit button context
        this.updateEditButtonContext();

        // Switch to Properties tab in right sidebar
        const propertiesTab = document.querySelector('.sidebar-right .sidebar-tab[data-panel="properties"]');
        if (propertiesTab) {
            propertiesTab.click();
        }

        // Dispatch event for visual builder
        document.dispatchEvent(new CustomEvent('elementSelected', {
            detail: { element: element }
        }));

        this.addToHistory(`Selected element: ${tagName}`);
    }

    updatePropertiesPanel(element) {
        const propertiesContent = document.getElementById('propertiesContent');
        const tagName = element.tagName.toLowerCase();
        const displayName = this.getElementDisplayName(tagName);
        const elementIcon = this.getElementIcon(tagName);

        // Get iframe context for computed styles
        const iframe = document.getElementById('editorFrame');
        const iframeWindow = iframe.contentWindow;
        const computedStyle = iframeWindow.getComputedStyle(element);

        // Get element ID and classes
        const elementId = element.id || '';
        const elementClasses = element.className.replace(/builder-\S+/g, '').trim() || '';

        let html = '<div class="properties-form">';

        // Element header with enhanced display
        html += `
            <div class="property-section element-info-section">
                <div class="property-section-header">
                    <span class="section-icon">${elementIcon}</span>
                    <h4>Element Info</h4>
                </div>
                <div class="element-type-badge">
                    <span class="badge-icon">${elementIcon}</span>
                    <span class="badge-text">${displayName}</span>
                    <span class="badge-tag">&lt;${tagName}&gt;</span>
                </div>
                ${elementId ? `
                <div class="form-group">
                    <label>ID</label>
                    <input type="text" value="#${elementId}" disabled class="element-id-display">
                </div>
                ` : ''}
                ${elementClasses ? `
                <div class="form-group">
                    <label>Classes</label>
                    <input type="text" value="${elementClasses}" disabled class="element-classes-display">
                </div>
                ` : ''}
            </div>
        `;

        // Content section for text elements
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'span', 'label', 'li'].includes(tagName)) {
            html += `
                <div class="property-section">
                    <div class="property-section-header">
                        <span class="section-icon">✏️</span>
                        <h4>Content</h4>
                    </div>
                    <div class="form-group">
                        <label>Text Content</label>
                        <textarea id="propTextContent" rows="3" class="live-preview">${this.escapeHtml(element.textContent)}</textarea>
                    </div>
                </div>
            `;
        }

        // Image section for images
        if (tagName === 'img') {
            html += `
                <div class="property-section">
                    <div class="property-section-header">
                        <span class="section-icon">🖼️</span>
                        <h4>Image Settings</h4>
                    </div>
                    <div class="form-group">
                        <label>Current Image</label>
                        <div class="image-preview-container">
                            <img src="${element.src}" alt="Preview" class="image-preview-thumb" id="imagePreviewThumb">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Target URL (src)</label>
                        <input type="text" id="propImageSrc" value="${element.src}" class="live-preview" placeholder="https://... or /path/to/image">
                    </div>
                    <div class="form-group">
                        <label>Upload New Image</label>
                        <div class="image-upload-area">
                            <input type="file" id="propImageUpload" accept=".jpg,.jpeg,.png" style="display:none;">
                            <button type="button" class="btn-upload-image" id="uploadImageTrigger">
                                <span>📤</span> Choose File (.jpg, .png)
                            </button>
                            <span class="upload-filename" id="uploadFilename">No file selected</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Alt Text</label>
                        <input type="text" id="propImageAlt" value="${this.escapeHtml(element.alt)}" placeholder="Describe the image...">
                    </div>
                </div>
            `;
        }

        // Link section for anchors
        if (tagName === 'a') {
            html += `
                <div class="property-section">
                    <div class="property-section-header">
                        <span class="section-icon">🔗</span>
                        <h4>Link Settings</h4>
                    </div>
                    <div class="form-group">
                        <label>Target URL (href)</label>
                        <input type="text" id="propLinkHref" value="${element.href}" placeholder="https://... or /page.html">
                    </div>
                    <div class="form-group">
                        <label>Open In</label>
                        <select id="propLinkTarget">
                            <option value="_self" ${element.target !== '_blank' ? 'selected' : ''}>Same Window</option>
                            <option value="_blank" ${element.target === '_blank' ? 'selected' : ''}>New Tab</option>
                        </select>
                    </div>
                </div>
            `;
        }

        // Button section with URL/action
        if (tagName === 'button') {
            const onclickValue = element.getAttribute('onclick') || '';
            const dataHref = element.getAttribute('data-href') || '';
            html += `
                <div class="property-section">
                    <div class="property-section-header">
                        <span class="section-icon">🔘</span>
                        <h4>Button Settings</h4>
                    </div>
                    <div class="form-group">
                        <label>Target URL (data-href)</label>
                        <input type="text" id="propButtonHref" value="${dataHref}" placeholder="https://... or /page.html">
                        <small class="form-hint">URL to navigate to when clicked</small>
                    </div>
                    <div class="form-group">
                        <label>Button Type</label>
                        <select id="propButtonType">
                            <option value="button" ${element.type === 'button' ? 'selected' : ''}>Button</option>
                            <option value="submit" ${element.type === 'submit' ? 'selected' : ''}>Submit</option>
                            <option value="reset" ${element.type === 'reset' ? 'selected' : ''}>Reset</option>
                        </select>
                    </div>
                </div>
            `;
        }

        // Size section for ALL elements
        html += `
            <div class="property-section">
                <div class="property-section-header">
                    <span class="section-icon">📐</span>
                    <h4>Size</h4>
                </div>
                <div class="form-row-2col">
                    <div class="form-group">
                        <label>Width</label>
                        <div class="input-with-unit">
                            <input type="text" id="propWidth" value="${element.style.width || computedStyle.width}" placeholder="auto" class="live-preview">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Height</label>
                        <div class="input-with-unit">
                            <input type="text" id="propHeight" value="${element.style.height || computedStyle.height}" placeholder="auto" class="live-preview">
                        </div>
                    </div>
                </div>
                <div class="form-row-2col">
                    <div class="form-group">
                        <label>Min Width</label>
                        <div class="input-with-unit">
                            <input type="text" id="propMinWidth" value="${element.style.minWidth || ''}" placeholder="none">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Max Width</label>
                        <div class="input-with-unit">
                            <input type="text" id="propMaxWidth" value="${element.style.maxWidth || ''}" placeholder="none">
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Style section
        html += `
            <div class="property-section">
                <div class="property-section-header">
                    <span class="section-icon">🎨</span>
                    <h4>Styling</h4>
                </div>
                <div class="form-row-2col">
                    <div class="form-group">
                        <label>Background</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="propBgColor" value="${this.rgbToHex(computedStyle.backgroundColor)}" class="live-preview">
                            <span class="color-value">${this.rgbToHex(computedStyle.backgroundColor)}</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Text Color</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="propTextColor" value="${this.rgbToHex(computedStyle.color)}" class="live-preview">
                            <span class="color-value">${this.rgbToHex(computedStyle.color)}</span>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Font Size</label>
                    <div class="slider-input-wrapper">
                        <input type="range" id="propFontSizeSlider" min="8" max="72" value="${parseInt(computedStyle.fontSize)}" class="live-preview">
                        <input type="number" id="propFontSize" value="${parseInt(computedStyle.fontSize)}" min="8" max="72" class="slider-value live-preview">
                        <span>px</span>
                    </div>
                </div>
                <div class="form-row-2col">
                    <div class="form-group">
                        <label>Padding</label>
                        <div class="input-with-unit">
                            <input type="number" id="propPadding" value="${parseInt(computedStyle.padding) || 0}" min="0" max="100" class="live-preview">
                            <span>px</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Margin</label>
                        <div class="input-with-unit">
                            <input type="number" id="propMargin" value="${parseInt(computedStyle.margin) || 0}" min="0" max="100" class="live-preview">
                            <span>px</span>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Border Radius</label>
                    <div class="input-with-unit">
                        <input type="number" id="propBorderRadius" value="${parseInt(computedStyle.borderRadius) || 0}" min="0" max="100" class="live-preview">
                        <span>px</span>
                    </div>
                </div>
            </div>
        `;

        // Action buttons
        html += `
            <div class="property-actions">
                <button class="btn-secondary" id="resetPropertiesBtn">
                    <span>↩️</span> Reset
                </button>
                <button class="btn-primary" id="applyPropertiesBtn">
                    <span>✅</span> Apply Changes
                </button>
            </div>
        `;

        html += '</div>';

        propertiesContent.innerHTML = html;

        // Setup property change handlers
        this.setupPropertyHandlers(element);
        this.setupLivePreview(element);
        this.setupImageUpload(element);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupPropertyHandlers(element) {
        const applyBtn = document.getElementById('applyPropertiesBtn');
        const resetBtn = document.getElementById('resetPropertiesBtn');

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                // Save state before making changes
                this.saveState('Updated element properties');

                // Apply all current values
                this.applyAllProperties(element);

                this.addToHistory('Applied element properties');
                this.showToast('Properties applied successfully!');
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                // Re-read element and update panel
                this.updatePropertiesPanel(element);
                this.showToast('Properties reset');
            });
        }

        // Sync font size slider with input
        const fontSizeSlider = document.getElementById('propFontSizeSlider');
        const fontSizeInput = document.getElementById('propFontSize');
        if (fontSizeSlider && fontSizeInput) {
            fontSizeSlider.addEventListener('input', () => {
                fontSizeInput.value = fontSizeSlider.value;
            });
            fontSizeInput.addEventListener('input', () => {
                fontSizeSlider.value = fontSizeInput.value;
            });
        }

        // Update color value displays
        const bgColor = document.getElementById('propBgColor');
        const textColor = document.getElementById('propTextColor');
        if (bgColor) {
            bgColor.addEventListener('input', () => {
                bgColor.nextElementSibling.textContent = bgColor.value;
            });
        }
        if (textColor) {
            textColor.addEventListener('input', () => {
                textColor.nextElementSibling.textContent = textColor.value;
            });
        }
    }

    applyAllProperties(element) {
        // Text content
        const textContent = document.getElementById('propTextContent');
        if (textContent) {
            element.textContent = textContent.value;
        }

        // Image properties
        const imageSrc = document.getElementById('propImageSrc');
        const imageAlt = document.getElementById('propImageAlt');
        if (imageSrc && imageSrc.value) element.src = imageSrc.value;
        if (imageAlt) element.alt = imageAlt.value;

        // Link properties
        const linkHref = document.getElementById('propLinkHref');
        const linkTarget = document.getElementById('propLinkTarget');
        if (linkHref) element.href = linkHref.value;
        if (linkTarget) element.target = linkTarget.value;

        // Button properties
        const buttonHref = document.getElementById('propButtonHref');
        const buttonType = document.getElementById('propButtonType');
        if (buttonHref && buttonHref.value) {
            element.setAttribute('data-href', buttonHref.value);
            // Add onclick handler if not exists
            if (!element.onclick) {
                element.onclick = function() {
                    window.location.href = this.getAttribute('data-href');
                };
            }
        }
        if (buttonType) element.type = buttonType.value;

        // Size properties (for ALL elements)
        const width = document.getElementById('propWidth');
        const height = document.getElementById('propHeight');
        const minWidth = document.getElementById('propMinWidth');
        const maxWidth = document.getElementById('propMaxWidth');

        if (width && width.value) {
            element.style.width = this.formatSizeValue(width.value);
        }
        if (height && height.value) {
            element.style.height = this.formatSizeValue(height.value);
        }
        if (minWidth && minWidth.value) {
            element.style.minWidth = this.formatSizeValue(minWidth.value);
        }
        if (maxWidth && maxWidth.value) {
            element.style.maxWidth = this.formatSizeValue(maxWidth.value);
        }

        // Style properties
        const bgColor = document.getElementById('propBgColor');
        const textColor = document.getElementById('propTextColor');
        const fontSize = document.getElementById('propFontSize');
        const padding = document.getElementById('propPadding');
        const margin = document.getElementById('propMargin');
        const borderRadius = document.getElementById('propBorderRadius');

        if (bgColor) element.style.backgroundColor = bgColor.value;
        if (textColor) element.style.color = textColor.value;
        if (fontSize) element.style.fontSize = fontSize.value + 'px';
        if (padding) element.style.padding = padding.value + 'px';
        if (margin) element.style.margin = margin.value + 'px';
        if (borderRadius) element.style.borderRadius = borderRadius.value + 'px';
    }

    formatSizeValue(value) {
        // If it's just a number, add 'px'
        // If it already has a unit (px, %, em, rem, vw, vh), keep it
        if (!value || value === 'auto' || value === 'none') return value;
        if (/^\d+(\.\d+)?$/.test(value)) {
            return value + 'px';
        }
        return value;
    }

    setupLivePreview(element) {
        // Add live preview for inputs marked with .live-preview
        const liveInputs = document.querySelectorAll('.live-preview');

        liveInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.previewProperty(element, input);
            });
        });
    }

    previewProperty(element, input) {
        const id = input.id;

        switch (id) {
            case 'propTextContent':
                element.textContent = input.value;
                break;
            case 'propImageSrc':
                element.src = input.value;
                // Update preview thumbnail
                const thumb = document.getElementById('imagePreviewThumb');
                if (thumb) thumb.src = input.value;
                break;
            case 'propBgColor':
                element.style.backgroundColor = input.value;
                break;
            case 'propTextColor':
                element.style.color = input.value;
                break;
            case 'propFontSize':
            case 'propFontSizeSlider':
                element.style.fontSize = input.value + 'px';
                // Sync both inputs
                const slider = document.getElementById('propFontSizeSlider');
                const number = document.getElementById('propFontSize');
                if (slider && id !== 'propFontSizeSlider') slider.value = input.value;
                if (number && id !== 'propFontSize') number.value = input.value;
                break;
            case 'propPadding':
                element.style.padding = input.value + 'px';
                break;
            case 'propMargin':
                element.style.margin = input.value + 'px';
                break;
            case 'propBorderRadius':
                element.style.borderRadius = input.value + 'px';
                break;
            case 'propWidth':
                element.style.width = this.formatSizeValue(input.value);
                break;
            case 'propHeight':
                element.style.height = this.formatSizeValue(input.value);
                break;
        }
    }

    setupImageUpload(element) {
        const uploadTrigger = document.getElementById('uploadImageTrigger');
        const uploadInput = document.getElementById('propImageUpload');
        const filenameDisplay = document.getElementById('uploadFilename');

        if (!uploadTrigger || !uploadInput) return;

        uploadTrigger.addEventListener('click', () => {
            uploadInput.click();
        });

        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                this.showToast('Only .jpg and .png files are allowed');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('File size must be under 5MB');
                return;
            }

            // Update filename display
            if (filenameDisplay) {
                filenameDisplay.textContent = file.name;
            }

            // Read file and create data URL
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;

                // Update image source input
                const srcInput = document.getElementById('propImageSrc');
                if (srcInput) {
                    srcInput.value = dataUrl;
                }

                // Update preview thumbnail
                const thumb = document.getElementById('imagePreviewThumb');
                if (thumb) {
                    thumb.src = dataUrl;
                }

                // Live preview on the element
                element.src = dataUrl;

                // Store in uploaded images map
                this.uploadedImages.set(file.name, dataUrl);

                this.showToast(`Image "${file.name}" loaded`);
            };

            reader.onerror = () => {
                this.showToast('Error reading file');
            };

            reader.readAsDataURL(file);
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
