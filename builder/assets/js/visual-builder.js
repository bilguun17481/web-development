// ==========================================
// VISUAL BUILDER - UNIFIED PROPERTIES PANEL
// Figma-style Inspector with Context-Aware Controls
// ==========================================

class VisualBuilder {
    constructor() {
        this.selectedElement = null;
        this.elementSchema = null;
        this.elementTypes = this.defineElementTypes();
        this.smartDefaults = this.defineSmartDefaults();
        this.conversionRules = this.defineConversionRules();

        this.init();
    }

    init() {
        this.setupLeftPanel();
        this.setupRightPanel();
        this.setupCanvasListeners();
        this.setupKeyboardShortcuts();
    }

    // ==========================================
    // ELEMENT TYPE DEFINITIONS
    // ==========================================

    defineElementTypes() {
        return {
            container: {
                name: 'Container',
                icon: '📦',
                description: 'A flexible box for grouping elements',
                category: 'layout',
                canContain: ['*'],
                defaultStyles: {
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    gap: '16px'
                },
                properties: ['content', 'styling', 'layout', 'behavior']
            },
            section: {
                name: 'Section',
                icon: '📐',
                description: 'Full-width page section',
                category: 'layout',
                canContain: ['container', 'grid', 'text', 'heading', 'image', 'button'],
                defaultStyles: {
                    width: '100%',
                    padding: '60px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                },
                properties: ['content', 'styling', 'layout', 'behavior']
            },
            grid: {
                name: 'Grid',
                icon: '▦',
                description: 'Multi-column layout grid',
                category: 'layout',
                canContain: ['*'],
                defaultStyles: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px'
                },
                properties: ['content', 'styling', 'layout', 'behavior']
            },
            heading: {
                name: 'Heading',
                icon: '📰',
                description: 'Title or heading text',
                category: 'content',
                canContain: [],
                defaultStyles: {
                    fontSize: '32px',
                    fontWeight: '700',
                    margin: '0 0 16px 0'
                },
                properties: ['content', 'styling']
            },
            text: {
                name: 'Text',
                icon: '📝',
                description: 'Paragraph or body text',
                category: 'content',
                canContain: [],
                defaultStyles: {
                    fontSize: '16px',
                    lineHeight: '1.6'
                },
                properties: ['content', 'styling']
            },
            image: {
                name: 'Image',
                icon: '🖼️',
                description: 'Image or media element',
                category: 'content',
                canContain: [],
                defaultStyles: {
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'cover'
                },
                properties: ['content', 'styling', 'behavior']
            },
            button: {
                name: 'Button',
                icon: '🔘',
                description: 'Clickable button element',
                category: 'content',
                canContain: [],
                defaultStyles: {
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                },
                properties: ['content', 'styling', 'behavior']
            },
            productCard: {
                name: 'Product Card',
                icon: '🛍️',
                description: 'E-commerce product display',
                category: 'component',
                canContain: [],
                defaultStyles: {
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                },
                properties: ['content', 'styling', 'behavior', 'data']
            },
            categoryCard: {
                name: 'Category Card',
                icon: '📂',
                description: 'Category navigation card',
                category: 'component',
                canContain: [],
                defaultStyles: {
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative'
                },
                properties: ['content', 'styling', 'behavior', 'data']
            },
            featureCard: {
                name: 'Feature Card',
                icon: '⭐',
                description: 'Feature highlight card',
                category: 'component',
                canContain: [],
                defaultStyles: {
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center'
                },
                properties: ['content', 'styling']
            },
            link: {
                name: 'Link',
                icon: '🔗',
                description: 'Hyperlink element',
                category: 'content',
                canContain: ['text', 'image'],
                defaultStyles: {
                    color: '#667eea',
                    textDecoration: 'none'
                },
                properties: ['content', 'styling', 'behavior']
            },
            divider: {
                name: 'Divider',
                icon: '➖',
                description: 'Horizontal line separator',
                category: 'layout',
                canContain: [],
                defaultStyles: {
                    width: '100%',
                    height: '1px',
                    background: '#e0e0e0',
                    margin: '20px 0'
                },
                properties: ['styling']
            },
            spacer: {
                name: 'Spacer',
                icon: '↕️',
                description: 'Vertical spacing element',
                category: 'layout',
                canContain: [],
                defaultStyles: {
                    height: '40px'
                },
                properties: ['styling']
            },
            hero: {
                name: 'Hero Section',
                icon: '🎯',
                description: 'Main hero/banner section',
                category: 'layout',
                canContain: ['*'],
                defaultStyles: {
                    minHeight: '500px',
                    padding: '80px 20px'
                },
                properties: ['content', 'styling', 'layout', 'behavior']
            }
        };
    }

    // ==========================================
    // SMART DEFAULTS BY CONTEXT
    // ==========================================

    defineSmartDefaults() {
        return {
            'section[data-type="products"]': ['productCard', 'grid'],
            'section[data-type="features"]': ['featureCard', 'grid'],
            'grid': ['container', 'image', 'text', 'productCard'],
            'container': ['heading', 'text', 'button', 'image'],
            'default': ['section', 'container', 'grid', 'heading', 'text', 'image', 'button']
        };
    }

    // ==========================================
    // TYPE CONVERSION RULES
    // ==========================================

    defineConversionRules() {
        return {
            container: ['section', 'grid', 'featureCard'],
            section: ['container', 'grid'],
            grid: ['container', 'section'],
            heading: ['text'],
            text: ['heading', 'button'],
            image: ['productCard', 'categoryCard', 'featureCard'],
            button: ['link', 'text'],
            productCard: ['categoryCard', 'featureCard', 'image'],
            categoryCard: ['productCard', 'featureCard', 'image'],
            featureCard: ['productCard', 'categoryCard', 'container'],
            link: ['button', 'text'],
            divider: ['spacer'],
            spacer: ['divider']
        };
    }

    // ==========================================
    // LEFT PANEL - ELEMENT TYPE & STRUCTURE
    // ==========================================

    setupLeftPanel() {
        this.renderElementTypePanel();
    }

    renderElementTypePanel() {
        const elementsPanel = document.getElementById('elementsPanel');
        if (!elementsPanel) return;

        let html = `
            <div class="element-panel-header">
                <h3>Elements</h3>
            </div>

            <!-- Selected Element Info -->
            <div class="selected-element-info" id="selectedElementInfo" style="display: none;">
                <div class="current-element-type">
                    <span class="element-icon" id="currentElementIcon">📦</span>
                    <div class="element-details">
                        <span class="element-name" id="currentElementName">Container</span>
                        <span class="element-tag" id="currentElementTag">&lt;div&gt;</span>
                    </div>
                </div>
                <div class="convert-options" id="convertOptions">
                    <span class="convert-label">Convert to:</span>
                    <div class="convert-buttons" id="convertButtons"></div>
                </div>
            </div>

            <!-- Element Categories -->
            <div class="element-categories-builder">
                ${this.renderElementCategories()}
            </div>

            <!-- Smart Suggestions -->
            <div class="smart-suggestions" id="smartSuggestions" style="display: none;">
                <h4>💡 Suggested</h4>
                <div class="suggestion-list" id="suggestionList"></div>
            </div>
        `;

        elementsPanel.innerHTML = html;
        this.setupElementDragHandlers();
    }

    renderElementCategories() {
        const categories = {
            layout: { name: 'Layout', icon: '📐' },
            content: { name: 'Content', icon: '✏️' },
            component: { name: 'Components', icon: '🧩' }
        };

        let html = '';

        for (const [catKey, catInfo] of Object.entries(categories)) {
            const elements = Object.entries(this.elementTypes)
                .filter(([_, type]) => type.category === catKey);

            html += `
                <div class="element-category-section">
                    <div class="category-header">
                        <span>${catInfo.icon}</span>
                        <h4>${catInfo.name}</h4>
                    </div>
                    <div class="element-grid">
                        ${elements.map(([key, type]) => `
                            <div class="element-type-card"
                                 draggable="true"
                                 data-element-type="${key}"
                                 title="${type.description}">
                                <div class="element-type-preview ${key}">
                                    <span class="preview-icon">${type.icon}</span>
                                </div>
                                <span class="element-type-name">${type.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return html;
    }

    setupElementDragHandlers() {
        const elementCards = document.querySelectorAll('.element-type-card');

        elementCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('elementType', card.dataset.elementType);
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });

            card.addEventListener('click', () => {
                const type = card.dataset.elementType;
                this.insertElement(type);
            });
        });
    }

    updateSelectedElementInfo(element) {
        const infoPanel = document.getElementById('selectedElementInfo');
        if (!infoPanel) return;

        if (!element) {
            infoPanel.style.display = 'none';
            return;
        }

        infoPanel.style.display = 'block';

        const detectedType = this.detectElementType(element);
        const typeInfo = this.elementTypes[detectedType] || {
            name: element.tagName,
            icon: '📋'
        };

        document.getElementById('currentElementIcon').textContent = typeInfo.icon;
        document.getElementById('currentElementName').textContent = typeInfo.name;
        document.getElementById('currentElementTag').textContent = `<${element.tagName.toLowerCase()}>`;

        this.renderConversionOptions(detectedType);
        this.showSmartSuggestions(element);
    }

    renderConversionOptions(currentType) {
        const convertButtons = document.getElementById('convertButtons');
        if (!convertButtons) return;

        const conversions = this.conversionRules[currentType] || [];

        if (conversions.length === 0) {
            convertButtons.innerHTML = '<span class="no-conversions">No conversions available</span>';
            return;
        }

        convertButtons.innerHTML = conversions.map(targetType => {
            const typeInfo = this.elementTypes[targetType];
            return `
                <button class="convert-btn" data-target-type="${targetType}" title="Convert to ${typeInfo.name}">
                    <span>${typeInfo.icon}</span>
                    <span>${typeInfo.name}</span>
                </button>
            `;
        }).join('');

        convertButtons.querySelectorAll('.convert-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.convertElement(this.selectedElement, btn.dataset.targetType);
            });
        });
    }

    showSmartSuggestions(element) {
        const suggestionsPanel = document.getElementById('smartSuggestions');
        const suggestionList = document.getElementById('suggestionList');
        if (!suggestionsPanel || !suggestionList) return;

        const parentType = this.detectElementType(element.parentElement);
        const suggestions = this.smartDefaults[parentType] || this.smartDefaults['default'];

        suggestionList.innerHTML = suggestions.slice(0, 4).map(type => {
            const typeInfo = this.elementTypes[type];
            if (!typeInfo) return '';
            return `
                <button class="suggestion-btn" data-type="${type}">
                    <span>${typeInfo.icon}</span>
                    <span>${typeInfo.name}</span>
                </button>
            `;
        }).join('');

        suggestionsPanel.style.display = 'block';

        suggestionList.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.insertElement(btn.dataset.type, element);
            });
        });
    }

    // ==========================================
    // RIGHT PANEL - UNIFIED SMART PROPERTIES
    // ==========================================

    setupRightPanel() {
        // Panel setup is handled dynamically when elements are selected
    }

    renderSmartProperties(element) {
        const propertiesContent = document.getElementById('propertiesContent');
        if (!propertiesContent || !element) return;

        this.selectedElement = element;
        const detectedType = this.detectElementType(element);
        const typeInfo = this.elementTypes[detectedType] || { properties: ['content', 'styling'] };

        const iframe = document.getElementById('editorFrame');
        const iframeWindow = iframe?.contentWindow;
        const computedStyle = iframeWindow ? iframeWindow.getComputedStyle(element) : window.getComputedStyle(element);

        // Detect child elements for context-aware content editing
        const childElements = this.detectChildElements(element);

        let html = '<div class="smart-properties">';

        // Element type header
        html += this.renderPropertyHeader(element, detectedType, typeInfo);

        // Content section - context-aware
        if (typeInfo.properties.includes('content')) {
            html += this.renderContentSection(element, detectedType, typeInfo, childElements);
        }

        // Styling section - with background image support
        if (typeInfo.properties.includes('styling')) {
            html += this.renderStylingSection(element, computedStyle);
        }

        // Layout section
        if (typeInfo.properties.includes('layout')) {
            html += this.renderLayoutSection(element, detectedType, computedStyle);
        }

        // Behavior section
        if (typeInfo.properties.includes('behavior')) {
            html += this.renderBehaviorSection(element, detectedType);
        }

        // Data section (for components)
        if (typeInfo.properties.includes('data')) {
            html += this.renderDataSection(element, detectedType, typeInfo);
        }

        // Action buttons
        html += `
            <div class="property-actions sticky-actions">
                <button class="btn-secondary" id="resetPropertiesBtn">
                    <span>↩️</span> Reset
                </button>
                <button class="btn-primary" id="applyPropertiesBtn">
                    <span>✅</span> Apply
                </button>
            </div>
        `;

        html += '</div>';

        propertiesContent.innerHTML = html;

        // Setup interactions
        this.setupCollapsibleSections();
        this.setupSmartPropertyHandlers(element);

        // Auto-scroll to most relevant section
        this.scrollToRelevantSection(detectedType);
    }

    // ==========================================
    // CHILD ELEMENT DETECTION
    // ==========================================

    detectChildElements(element) {
        const children = {
            headings: [],
            paragraphs: [],
            buttons: [],
            links: [],
            images: [],
            icons: []
        };

        // Find headings
        element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el, i) => {
            children.headings.push({
                element: el,
                tag: el.tagName.toLowerCase(),
                text: el.textContent.trim(),
                index: i
            });
        });

        // Find paragraphs/descriptions
        element.querySelectorAll('p').forEach((el, i) => {
            children.paragraphs.push({
                element: el,
                text: el.textContent.trim(),
                index: i
            });
        });

        // Find buttons
        element.querySelectorAll('button, .btn, .btn-primary, .btn-secondary, a.btn').forEach((el, i) => {
            children.buttons.push({
                element: el,
                text: el.textContent.trim(),
                href: el.getAttribute('href') || el.getAttribute('data-href') || '',
                index: i
            });
        });

        // Find links (excluding button-styled links)
        element.querySelectorAll('a:not(.btn):not(.btn-primary):not(.btn-secondary)').forEach((el, i) => {
            children.links.push({
                element: el,
                text: el.textContent.trim(),
                href: el.href,
                index: i
            });
        });

        // Find images
        element.querySelectorAll('img').forEach((el, i) => {
            children.images.push({
                element: el,
                src: el.src,
                alt: el.alt,
                index: i
            });
        });

        // Find icons (emoji spans, icon classes)
        element.querySelectorAll('.feature-icon, .category-icon, [class*="icon"]').forEach((el, i) => {
            children.icons.push({
                element: el,
                content: el.textContent.trim() || el.innerHTML,
                index: i
            });
        });

        return children;
    }

    // ==========================================
    // PROPERTY SECTIONS
    // ==========================================

    renderPropertyHeader(element, detectedType, typeInfo) {
        return `
            <div class="property-header">
                <div class="element-badge large">
                    <span class="badge-icon">${typeInfo.icon || '📋'}</span>
                    <div class="badge-info">
                        <span class="badge-name">${typeInfo.name || element.tagName}</span>
                        <span class="badge-tag">&lt;${element.tagName.toLowerCase()}&gt;</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderContentSection(element, detectedType, typeInfo, childElements) {
        const tagName = element.tagName.toLowerCase();
        let content = '';

        // Direct text content for text-based elements
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label'].includes(tagName)) {
            content += `
                <div class="form-group">
                    <label>Text Content</label>
                    <textarea id="propTextContent" rows="3" class="live-preview">${this.escapeHtml(element.textContent)}</textarea>
                </div>
            `;
        }

        // Button text and URL
        if (tagName === 'button' || (tagName === 'a' && element.classList.contains('btn'))) {
            content += `
                <div class="form-group">
                    <label>Button Text</label>
                    <input type="text" id="propButtonText" value="${this.escapeHtml(element.textContent.trim())}" class="live-preview">
                </div>
                <div class="form-group">
                    <label>Link URL</label>
                    <input type="text" id="propButtonUrl" value="${element.getAttribute('data-href') || element.href || ''}" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label>Open In</label>
                    <select id="propButtonTarget">
                        <option value="_self">Same Window</option>
                        <option value="_blank">New Tab</option>
                    </select>
                </div>
            `;
        }

        // Link-specific
        if (tagName === 'a' && !element.classList.contains('btn')) {
            content += `
                <div class="form-group">
                    <label>Link Text</label>
                    <input type="text" id="propLinkText" value="${this.escapeHtml(element.textContent.trim())}" class="live-preview">
                </div>
                <div class="form-group">
                    <label>Link URL</label>
                    <input type="text" id="propLinkHref" value="${element.href}" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label>Open In</label>
                    <select id="propLinkTarget">
                        <option value="_self" ${element.target !== '_blank' ? 'selected' : ''}>Same Window</option>
                        <option value="_blank" ${element.target === '_blank' ? 'selected' : ''}>New Tab</option>
                    </select>
                </div>
            `;
        }

        // Image-specific
        if (tagName === 'img') {
            content += `
                <div class="form-group">
                    <label>Image Preview</label>
                    <div class="image-preview-container">
                        <img src="${element.src}" alt="Preview" class="image-preview-thumb" id="imagePreviewThumb">
                    </div>
                </div>
                <div class="form-group">
                    <label>Image Source</label>
                    <div class="source-input-group">
                        <input type="text" id="propImageSrc" value="${element.src}" class="live-preview" placeholder="URL or upload">
                        <button type="button" class="btn-icon" id="uploadImageBtn" title="Upload">📤</button>
                    </div>
                    <input type="file" id="propImageUpload" accept=".jpg,.jpeg,.png,.webp,.gif" style="display:none;">
                </div>
                <div class="form-group">
                    <label>Alt Text</label>
                    <input type="text" id="propImageAlt" value="${element.alt || ''}" placeholder="Describe the image...">
                </div>
            `;
        }

        // Child elements editing for containers/sections
        if (['div', 'section', 'header', 'footer', 'article', 'main'].includes(tagName) ||
            element.classList.contains('hero') ||
            element.classList.contains('feature-card') ||
            element.classList.contains('product-card') ||
            element.classList.contains('category-card')) {

            // Child Headings
            if (childElements.headings.length > 0) {
                content += `<div class="child-section"><h5 class="child-section-title">📰 Headings</h5>`;
                childElements.headings.forEach((h, i) => {
                    content += `
                        <div class="form-group child-edit-group">
                            <label>${h.tag.toUpperCase()} ${i > 0 ? `#${i + 1}` : ''}</label>
                            <input type="text"
                                   class="child-heading-input live-preview"
                                   data-child-type="heading"
                                   data-child-index="${i}"
                                   value="${this.escapeHtml(h.text)}">
                        </div>
                    `;
                });
                content += '</div>';
            }

            // Child Paragraphs/Descriptions
            if (childElements.paragraphs.length > 0) {
                content += `<div class="child-section"><h5 class="child-section-title">📝 Descriptions</h5>`;
                childElements.paragraphs.forEach((p, i) => {
                    content += `
                        <div class="form-group child-edit-group">
                            <label>Paragraph ${i > 0 ? `#${i + 1}` : ''}</label>
                            <textarea class="child-paragraph-input live-preview"
                                      data-child-type="paragraph"
                                      data-child-index="${i}"
                                      rows="2">${this.escapeHtml(p.text)}</textarea>
                        </div>
                    `;
                });
                content += '</div>';
            }

            // Child Buttons
            if (childElements.buttons.length > 0) {
                content += `<div class="child-section"><h5 class="child-section-title">🔘 Buttons</h5>`;
                childElements.buttons.forEach((b, i) => {
                    content += `
                        <div class="form-group child-edit-group">
                            <label>Button ${i > 0 ? `#${i + 1}` : ''} Text</label>
                            <input type="text"
                                   class="child-button-text live-preview"
                                   data-child-type="button-text"
                                   data-child-index="${i}"
                                   value="${this.escapeHtml(b.text)}">
                        </div>
                        <div class="form-group child-edit-group">
                            <label>Button ${i > 0 ? `#${i + 1}` : ''} URL</label>
                            <input type="text"
                                   class="child-button-url"
                                   data-child-type="button-url"
                                   data-child-index="${i}"
                                   value="${b.href}"
                                   placeholder="https://...">
                        </div>
                    `;
                });
                content += '</div>';
            }

            // Child Icons
            if (childElements.icons.length > 0) {
                content += `<div class="child-section"><h5 class="child-section-title">😀 Icons</h5>`;
                childElements.icons.forEach((icon, i) => {
                    content += `
                        <div class="form-group child-edit-group">
                            <label>Icon ${i > 0 ? `#${i + 1}` : ''}</label>
                            <input type="text"
                                   class="child-icon-input live-preview"
                                   data-child-type="icon"
                                   data-child-index="${i}"
                                   value="${this.escapeHtml(icon.content)}">
                            <small class="form-hint">Enter emoji or icon HTML</small>
                        </div>
                    `;
                });
                content += '</div>';
            }

            // Child Images (for cards/containers)
            if (childElements.images.length > 0) {
                content += `<div class="child-section"><h5 class="child-section-title">🖼️ Images</h5>`;
                childElements.images.forEach((img, i) => {
                    content += `
                        <div class="form-group child-edit-group">
                            <label>Image ${i > 0 ? `#${i + 1}` : ''}</label>
                            <div class="mini-preview">
                                <img src="${img.src}" class="child-image-preview" data-child-index="${i}">
                            </div>
                            <input type="text"
                                   class="child-image-src live-preview"
                                   data-child-type="image-src"
                                   data-child-index="${i}"
                                   value="${img.src}"
                                   placeholder="Image URL">
                        </div>
                    `;
                });
                content += '</div>';
            }
        }

        if (!content) {
            content = '<p class="no-content-props">No content properties for this element</p>';
        }

        return `
            <div class="property-section collapsible" data-section="content">
                <div class="section-header" data-toggle="content">
                    <span class="section-icon">✏️</span>
                    <h4>CONTENT</h4>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="section-body">
                    ${content}
                </div>
            </div>
        `;
    }

    renderStylingSection(element, computedStyle) {
        // Get background image if exists
        const bgImage = element.style.backgroundImage || computedStyle.backgroundImage;
        const hasBgImage = bgImage && bgImage !== 'none';
        const bgImageUrl = hasBgImage ? bgImage.replace(/url\(['"]?(.+?)['"]?\)/i, '$1') : '';

        return `
            <div class="property-section collapsible" data-section="styling">
                <div class="section-header" data-toggle="styling">
                    <span class="section-icon">🎨</span>
                    <h4>STYLING</h4>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="section-body">
                    <!-- Colors -->
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

                    <!-- Background Image -->
                    <div class="form-group">
                        <label>Background Image</label>
                        <div class="source-input-group">
                            <input type="text" id="propBgImage" value="${bgImageUrl}" placeholder="URL or upload" class="live-preview">
                            <button type="button" class="btn-icon" id="uploadBgImageBtn" title="Upload">📤</button>
                        </div>
                        <input type="file" id="propBgImageUpload" accept=".jpg,.jpeg,.png,.webp" style="display:none;">
                        ${hasBgImage ? `
                            <div class="bg-image-preview">
                                <img src="${bgImageUrl}" alt="Background preview">
                                <button type="button" class="btn-remove-bg" id="removeBgImage" title="Remove">✕</button>
                            </div>
                        ` : ''}
                    </div>

                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Background Size</label>
                            <select id="propBgSize" class="live-preview">
                                <option value="cover" ${computedStyle.backgroundSize === 'cover' ? 'selected' : ''}>Cover</option>
                                <option value="contain" ${computedStyle.backgroundSize === 'contain' ? 'selected' : ''}>Contain</option>
                                <option value="auto" ${computedStyle.backgroundSize === 'auto' ? 'selected' : ''}>Auto</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Background Position</label>
                            <select id="propBgPosition" class="live-preview">
                                <option value="center" ${computedStyle.backgroundPosition.includes('center') ? 'selected' : ''}>Center</option>
                                <option value="top" ${computedStyle.backgroundPosition.includes('top') ? 'selected' : ''}>Top</option>
                                <option value="bottom" ${computedStyle.backgroundPosition.includes('bottom') ? 'selected' : ''}>Bottom</option>
                            </select>
                        </div>
                    </div>

                    <!-- Font Size -->
                    <div class="form-group">
                        <label>Font Size</label>
                        <div class="slider-input-wrapper">
                            <input type="range" id="propFontSizeSlider" min="8" max="72" value="${parseInt(computedStyle.fontSize)}" class="live-preview">
                            <input type="number" id="propFontSize" value="${parseInt(computedStyle.fontSize)}" min="8" max="72" class="slider-value live-preview">
                            <span>px</span>
                        </div>
                    </div>

                    <!-- Border Radius -->
                    <div class="form-group">
                        <label>Border Radius</label>
                        <div class="slider-input-wrapper">
                            <input type="range" id="propBorderRadiusSlider" min="0" max="50" value="${parseInt(computedStyle.borderRadius) || 0}" class="live-preview">
                            <input type="number" id="propBorderRadius" value="${parseInt(computedStyle.borderRadius) || 0}" min="0" max="50" class="slider-value live-preview">
                            <span>px</span>
                        </div>
                    </div>

                    <!-- Padding & Margin -->
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Padding</label>
                            <div class="input-with-unit">
                                <input type="number" id="propPadding" value="${parseInt(computedStyle.padding) || 0}" min="0" class="live-preview">
                                <span>px</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Margin</label>
                            <div class="input-with-unit">
                                <input type="number" id="propMargin" value="${parseInt(computedStyle.margin) || 0}" min="0" class="live-preview">
                                <span>px</span>
                            </div>
                        </div>
                    </div>

                    <!-- Box Shadow -->
                    <div class="form-group">
                        <label>Box Shadow</label>
                        <select id="propBoxShadow" class="live-preview">
                            <option value="none">None</option>
                            <option value="0 2px 4px rgba(0,0,0,0.1)">Subtle</option>
                            <option value="0 4px 15px rgba(0,0,0,0.1)">Medium</option>
                            <option value="0 8px 30px rgba(0,0,0,0.15)">Strong</option>
                            <option value="0 20px 50px rgba(0,0,0,0.2)">Dramatic</option>
                            <option value="inset 0 2px 10px rgba(0,0,0,0.1)">Inner</option>
                        </select>
                    </div>

                    <!-- Border -->
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Border Width</label>
                            <div class="input-with-unit">
                                <input type="number" id="propBorderWidth" value="${parseInt(computedStyle.borderWidth) || 0}" min="0" max="10" class="live-preview">
                                <span>px</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Border Color</label>
                            <div class="color-input-wrapper">
                                <input type="color" id="propBorderColor" value="${this.rgbToHex(computedStyle.borderColor)}" class="live-preview">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLayoutSection(element, detectedType, computedStyle) {
        const isGrid = computedStyle.display === 'grid';
        const isFlex = computedStyle.display === 'flex';

        return `
            <div class="property-section collapsible" data-section="layout">
                <div class="section-header" data-toggle="layout">
                    <span class="section-icon">📐</span>
                    <h4>LAYOUT</h4>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="section-body">
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Width</label>
                            <input type="text" id="propWidth" value="${element.style.width || 'auto'}" placeholder="auto" class="live-preview">
                        </div>
                        <div class="form-group">
                            <label>Height</label>
                            <input type="text" id="propHeight" value="${element.style.height || 'auto'}" placeholder="auto" class="live-preview">
                        </div>
                    </div>

                    <div class="form-row-2col">
                        <div class="form-group">
                            <label>Min Width</label>
                            <input type="text" id="propMinWidth" value="${element.style.minWidth || ''}" placeholder="none">
                        </div>
                        <div class="form-group">
                            <label>Max Width</label>
                            <input type="text" id="propMaxWidth" value="${element.style.maxWidth || ''}" placeholder="none">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Display</label>
                        <select id="propDisplay" class="live-preview">
                            <option value="block" ${computedStyle.display === 'block' ? 'selected' : ''}>Block</option>
                            <option value="flex" ${isFlex ? 'selected' : ''}>Flex</option>
                            <option value="grid" ${isGrid ? 'selected' : ''}>Grid</option>
                            <option value="inline-block" ${computedStyle.display === 'inline-block' ? 'selected' : ''}>Inline Block</option>
                            <option value="inline" ${computedStyle.display === 'inline' ? 'selected' : ''}>Inline</option>
                        </select>
                    </div>

                    ${isGrid ? this.renderGridControls(element, computedStyle) : ''}
                    ${isFlex ? this.renderFlexControls(element, computedStyle) : ''}

                    <div class="form-group">
                        <label>Gap</label>
                        <div class="input-with-unit">
                            <input type="number" id="propGap" value="${parseInt(computedStyle.gap) || 0}" min="0" class="live-preview">
                            <span>px</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Position</label>
                        <select id="propPosition" class="live-preview">
                            <option value="static" ${computedStyle.position === 'static' ? 'selected' : ''}>Static</option>
                            <option value="relative" ${computedStyle.position === 'relative' ? 'selected' : ''}>Relative</option>
                            <option value="absolute" ${computedStyle.position === 'absolute' ? 'selected' : ''}>Absolute</option>
                            <option value="fixed" ${computedStyle.position === 'fixed' ? 'selected' : ''}>Fixed</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    renderGridControls(element, computedStyle) {
        return `
            <div class="grid-controls">
                <div class="form-row-2col">
                    <div class="form-group">
                        <label>Columns</label>
                        <input type="number" id="propGridCols" value="3" min="1" max="12" class="live-preview">
                    </div>
                    <div class="form-group">
                        <label>Rows</label>
                        <select id="propGridRows">
                            <option value="auto">Auto</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    renderFlexControls(element, computedStyle) {
        return `
            <div class="flex-controls">
                <div class="form-group">
                    <label>Direction</label>
                    <select id="propFlexDirection" class="live-preview">
                        <option value="row" ${computedStyle.flexDirection === 'row' ? 'selected' : ''}>Row</option>
                        <option value="column" ${computedStyle.flexDirection === 'column' ? 'selected' : ''}>Column</option>
                        <option value="row-reverse">Row Reverse</option>
                        <option value="column-reverse">Column Reverse</option>
                    </select>
                </div>
                <div class="form-row-2col">
                    <div class="form-group">
                        <label>Justify</label>
                        <select id="propJustifyContent" class="live-preview">
                            <option value="flex-start" ${computedStyle.justifyContent === 'flex-start' ? 'selected' : ''}>Start</option>
                            <option value="center" ${computedStyle.justifyContent === 'center' ? 'selected' : ''}>Center</option>
                            <option value="flex-end" ${computedStyle.justifyContent === 'flex-end' ? 'selected' : ''}>End</option>
                            <option value="space-between" ${computedStyle.justifyContent === 'space-between' ? 'selected' : ''}>Space Between</option>
                            <option value="space-around" ${computedStyle.justifyContent === 'space-around' ? 'selected' : ''}>Space Around</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Align</label>
                        <select id="propAlignItems" class="live-preview">
                            <option value="stretch" ${computedStyle.alignItems === 'stretch' ? 'selected' : ''}>Stretch</option>
                            <option value="flex-start" ${computedStyle.alignItems === 'flex-start' ? 'selected' : ''}>Start</option>
                            <option value="center" ${computedStyle.alignItems === 'center' ? 'selected' : ''}>Center</option>
                            <option value="flex-end" ${computedStyle.alignItems === 'flex-end' ? 'selected' : ''}>End</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Wrap</label>
                    <select id="propFlexWrap" class="live-preview">
                        <option value="nowrap" ${computedStyle.flexWrap === 'nowrap' ? 'selected' : ''}>No Wrap</option>
                        <option value="wrap" ${computedStyle.flexWrap === 'wrap' ? 'selected' : ''}>Wrap</option>
                        <option value="wrap-reverse">Wrap Reverse</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderBehaviorSection(element, detectedType) {
        const tagName = element.tagName.toLowerCase();
        let content = '';

        // Click actions for buttons and links
        if (tagName === 'button' || tagName === 'a') {
            content += `
                <div class="form-group">
                    <label>Hover Animation</label>
                    <select id="propHoverAnimation">
                        <option value="none">None</option>
                        <option value="lift">Lift Up</option>
                        <option value="scale">Scale</option>
                        <option value="glow">Glow</option>
                        <option value="underline">Underline</option>
                        <option value="slide">Slide Background</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Click Action</label>
                    <select id="propClickAction">
                        <option value="navigate">Navigate to URL</option>
                        <option value="scroll">Scroll to Section</option>
                        <option value="modal">Open Modal</option>
                        <option value="none">No Action</option>
                    </select>
                </div>
            `;
        }

        // Image behaviors
        if (tagName === 'img') {
            content += `
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="propLazyLoad" ${element.loading === 'lazy' ? 'checked' : ''}>
                        Lazy Load
                    </label>
                </div>
                <div class="form-group">
                    <label>Object Fit</label>
                    <select id="propObjectFit" class="live-preview">
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                        <option value="none">None</option>
                        <option value="scale-down">Scale Down</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>On Click</label>
                    <select id="propImageClick">
                        <option value="none">Nothing</option>
                        <option value="lightbox">Open Lightbox</option>
                        <option value="link">Navigate to URL</option>
                    </select>
                </div>
            `;
        }

        // Visibility controls for all elements
        content += `
            <div class="visibility-controls">
                <h5 class="child-section-title">👁️ Visibility</h5>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="propHideOnMobile" ${element.classList.contains('hide-mobile') ? 'checked' : ''}>
                        Hide on Mobile
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="propHideOnTablet" ${element.classList.contains('hide-tablet') ? 'checked' : ''}>
                        Hide on Tablet
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="propHideOnDesktop" ${element.classList.contains('hide-desktop') ? 'checked' : ''}>
                        Hide on Desktop
                    </label>
                </div>
            </div>
        `;

        return `
            <div class="property-section collapsible" data-section="behavior">
                <div class="section-header" data-toggle="behavior">
                    <span class="section-icon">⚡</span>
                    <h4>BEHAVIOR</h4>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="section-body">
                    ${content}
                </div>
            </div>
        `;
    }

    renderDataSection(element, detectedType, typeInfo) {
        let content = '';

        if (detectedType === 'productCard') {
            // Find price element
            const priceEl = element.querySelector('.product-price, .price');
            const priceText = priceEl ? priceEl.textContent : '';

            content = `
                <div class="form-group">
                    <label>Price</label>
                    <input type="text" id="propProductPrice" value="${this.escapeHtml(priceText)}" placeholder="e.g. 1 299 Kč">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="propShowPrice" checked>
                        Show Price
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="propShowRating" checked>
                        Show Rating
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="propShowBadge">
                        Show Badge (Sale/New)
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="propQuickAdd" checked>
                        Quick Add to Cart
                    </label>
                </div>
            `;
        }

        if (detectedType === 'categoryCard') {
            content = `
                <div class="form-group">
                    <label>Category Name</label>
                    <input type="text" id="propCategoryName" value="${element.querySelector('.category-title')?.textContent || ''}">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="propShowCount" checked>
                        Show Product Count
                    </label>
                </div>
                <div class="form-group">
                    <label>Overlay Style</label>
                    <select id="propOverlayStyle">
                        <option value="gradient">Gradient</option>
                        <option value="solid">Solid Color</option>
                        <option value="none">None</option>
                    </select>
                </div>
            `;
        }

        if (!content) return '';

        return `
            <div class="property-section collapsible" data-section="data">
                <div class="section-header" data-toggle="data">
                    <span class="section-icon">📊</span>
                    <h4>DATA</h4>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="section-body">
                    ${content}
                </div>
            </div>
        `;
    }

    // ==========================================
    // INTERACTION HANDLERS
    // ==========================================

    setupCollapsibleSections() {
        document.querySelectorAll('.section-header[data-toggle]').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.property-section');
                section.classList.toggle('collapsed');
            });
        });
    }

    scrollToRelevantSection(detectedType) {
        // Scroll to the most relevant section based on element type
        let targetSection = 'content';

        if (['container', 'section', 'grid', 'divider', 'spacer'].includes(detectedType)) {
            targetSection = 'layout';
        } else if (['productCard', 'categoryCard'].includes(detectedType)) {
            targetSection = 'data';
        }

        const section = document.querySelector(`[data-section="${targetSection}"]`);
        if (section) {
            setTimeout(() => {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }

    setupSmartPropertyHandlers(element) {
        // Live preview handlers
        document.querySelectorAll('.live-preview').forEach(input => {
            input.addEventListener('input', () => {
                this.previewProperty(element, input);
            });
        });

        // Child element handlers
        this.setupChildElementHandlers(element);

        // Slider sync
        this.syncSliders();

        // Color value displays
        this.setupColorDisplays();

        // Apply button
        const applyBtn = document.getElementById('applyPropertiesBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                window.editor?.saveState('Updated element properties');
                this.applyAllProperties(element);
                window.editor?.showToast('Properties applied!');
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetPropertiesBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.renderSmartProperties(element);
                window.editor?.showToast('Properties reset');
            });
        }

        // Image upload handlers
        this.setupImageUploadHandlers(element);

        // Background image upload
        this.setupBgImageUploadHandlers(element);
    }

    setupChildElementHandlers(element) {
        // Heading inputs
        document.querySelectorAll('.child-heading-input').forEach(input => {
            input.addEventListener('input', () => {
                const index = parseInt(input.dataset.childIndex);
                const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
                if (headings[index]) {
                    headings[index].textContent = input.value;
                }
            });
        });

        // Paragraph inputs
        document.querySelectorAll('.child-paragraph-input').forEach(input => {
            input.addEventListener('input', () => {
                const index = parseInt(input.dataset.childIndex);
                const paragraphs = element.querySelectorAll('p');
                if (paragraphs[index]) {
                    paragraphs[index].textContent = input.value;
                }
            });
        });

        // Button text inputs
        document.querySelectorAll('.child-button-text').forEach(input => {
            input.addEventListener('input', () => {
                const index = parseInt(input.dataset.childIndex);
                const buttons = element.querySelectorAll('button, .btn, .btn-primary, .btn-secondary, a.btn');
                if (buttons[index]) {
                    buttons[index].textContent = input.value;
                }
            });
        });

        // Button URL inputs
        document.querySelectorAll('.child-button-url').forEach(input => {
            input.addEventListener('change', () => {
                const index = parseInt(input.dataset.childIndex);
                const buttons = element.querySelectorAll('button, .btn, .btn-primary, .btn-secondary, a.btn');
                if (buttons[index]) {
                    if (buttons[index].tagName === 'A') {
                        buttons[index].href = input.value;
                    } else {
                        buttons[index].setAttribute('data-href', input.value);
                    }
                }
            });
        });

        // Icon inputs
        document.querySelectorAll('.child-icon-input').forEach(input => {
            input.addEventListener('input', () => {
                const index = parseInt(input.dataset.childIndex);
                const icons = element.querySelectorAll('.feature-icon, .category-icon, [class*="icon"]');
                if (icons[index]) {
                    icons[index].textContent = input.value;
                }
            });
        });

        // Image src inputs
        document.querySelectorAll('.child-image-src').forEach(input => {
            input.addEventListener('input', () => {
                const index = parseInt(input.dataset.childIndex);
                const images = element.querySelectorAll('img');
                if (images[index]) {
                    images[index].src = input.value;
                    // Update preview
                    const preview = document.querySelector(`.child-image-preview[data-child-index="${index}"]`);
                    if (preview) preview.src = input.value;
                }
            });
        });
    }

    syncSliders() {
        const sliderPairs = [
            ['propFontSizeSlider', 'propFontSize'],
            ['propBorderRadiusSlider', 'propBorderRadius']
        ];

        sliderPairs.forEach(([sliderId, numberId]) => {
            const slider = document.getElementById(sliderId);
            const number = document.getElementById(numberId);
            if (slider && number) {
                slider.addEventListener('input', () => number.value = slider.value);
                number.addEventListener('input', () => slider.value = number.value);
            }
        });
    }

    setupColorDisplays() {
        ['propBgColor', 'propTextColor', 'propBorderColor'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    const valueDisplay = input.nextElementSibling;
                    if (valueDisplay && valueDisplay.classList.contains('color-value')) {
                        valueDisplay.textContent = input.value;
                    }
                });
            }
        });
    }

    setupImageUploadHandlers(element) {
        const uploadBtn = document.getElementById('uploadImageBtn');
        const uploadInput = document.getElementById('propImageUpload');

        if (uploadBtn && uploadInput) {
            uploadBtn.addEventListener('click', () => uploadInput.click());
            uploadInput.addEventListener('change', (e) => this.handleImageUpload(e, element));
        }
    }

    setupBgImageUploadHandlers(element) {
        const uploadBtn = document.getElementById('uploadBgImageBtn');
        const uploadInput = document.getElementById('propBgImageUpload');
        const removeBtn = document.getElementById('removeBgImage');

        if (uploadBtn && uploadInput) {
            uploadBtn.addEventListener('click', () => uploadInput.click());
            uploadInput.addEventListener('change', (e) => this.handleBgImageUpload(e, element));
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                element.style.backgroundImage = 'none';
                document.getElementById('propBgImage').value = '';
                removeBtn.parentElement.remove();
                window.editor?.showToast('Background image removed');
            });
        }
    }

    handleImageUpload(e, element) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const srcInput = document.getElementById('propImageSrc');
            const previewThumb = document.getElementById('imagePreviewThumb');

            if (srcInput) srcInput.value = event.target.result;
            if (previewThumb) previewThumb.src = event.target.result;
            element.src = event.target.result;

            window.editor?.showToast('Image uploaded');
        };
        reader.readAsDataURL(file);
    }

    handleBgImageUpload(e, element) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const bgInput = document.getElementById('propBgImage');
            if (bgInput) bgInput.value = event.target.result;

            element.style.backgroundImage = `url('${event.target.result}')`;
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';

            window.editor?.showToast('Background image uploaded');

            // Refresh panel to show preview
            this.renderSmartProperties(element);
        };
        reader.readAsDataURL(file);
    }

    // ==========================================
    // PROPERTY APPLICATION
    // ==========================================

    previewProperty(element, input) {
        const id = input.id;
        const value = input.type === 'checkbox' ? input.checked : input.value;

        const propertyMap = {
            propTextContent: () => element.textContent = value,
            propButtonText: () => element.textContent = value,
            propLinkText: () => element.textContent = value,
            propImageSrc: () => element.src = value,
            propBgColor: () => element.style.backgroundColor = value,
            propTextColor: () => {
                element.style.color = value;
                // Also apply to child text elements
                element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a').forEach(el => {
                    el.style.color = value;
                });
            },
            propBgImage: () => {
                if (value) {
                    element.style.backgroundImage = `url('${value}')`;
                    element.style.backgroundSize = 'cover';
                    element.style.backgroundPosition = 'center';
                } else {
                    element.style.backgroundImage = 'none';
                }
            },
            propBgSize: () => element.style.backgroundSize = value,
            propBgPosition: () => element.style.backgroundPosition = value,
            propFontSize: () => element.style.fontSize = value + 'px',
            propFontSizeSlider: () => element.style.fontSize = value + 'px',
            propBorderRadius: () => element.style.borderRadius = value + 'px',
            propBorderRadiusSlider: () => element.style.borderRadius = value + 'px',
            propPadding: () => element.style.padding = value + 'px',
            propMargin: () => element.style.margin = value + 'px',
            propWidth: () => element.style.width = this.formatSize(value),
            propHeight: () => element.style.height = this.formatSize(value),
            propGap: () => element.style.gap = value + 'px',
            propDisplay: () => element.style.display = value,
            propFlexDirection: () => element.style.flexDirection = value,
            propJustifyContent: () => element.style.justifyContent = value,
            propAlignItems: () => element.style.alignItems = value,
            propFlexWrap: () => element.style.flexWrap = value,
            propBoxShadow: () => element.style.boxShadow = value,
            propObjectFit: () => element.style.objectFit = value,
            propPosition: () => element.style.position = value,
            propBorderWidth: () => element.style.borderWidth = value + 'px',
            propBorderColor: () => element.style.borderColor = value,
            propGridCols: () => element.style.gridTemplateColumns = `repeat(${value}, 1fr)`
        };

        if (propertyMap[id]) {
            propertyMap[id]();
        }
    }

    applyAllProperties(element) {
        // Apply all property inputs
        const propertyIds = [
            'propTextContent', 'propButtonText', 'propLinkText', 'propImageSrc', 'propImageAlt',
            'propBgColor', 'propTextColor', 'propBgImage', 'propBgSize', 'propBgPosition',
            'propFontSize', 'propBorderRadius', 'propPadding', 'propMargin',
            'propWidth', 'propHeight', 'propMinWidth', 'propMaxWidth',
            'propGap', 'propDisplay', 'propFlexDirection', 'propJustifyContent', 'propAlignItems',
            'propFlexWrap', 'propBoxShadow', 'propObjectFit', 'propPosition',
            'propBorderWidth', 'propBorderColor', 'propGridCols',
            'propButtonUrl', 'propLinkHref', 'propButtonTarget', 'propLinkTarget'
        ];

        propertyIds.forEach(propId => {
            const input = document.getElementById(propId);
            if (input) {
                this.previewProperty(element, input);
            }
        });

        // Apply button/link URLs
        const buttonUrl = document.getElementById('propButtonUrl');
        const buttonTarget = document.getElementById('propButtonTarget');
        if (buttonUrl && buttonUrl.value) {
            if (element.tagName === 'A') {
                element.href = buttonUrl.value;
            } else {
                element.setAttribute('data-href', buttonUrl.value);
            }
        }
        if (buttonTarget) {
            element.target = buttonTarget.value;
        }

        // Apply link href
        const linkHref = document.getElementById('propLinkHref');
        const linkTarget = document.getElementById('propLinkTarget');
        if (linkHref) element.href = linkHref.value;
        if (linkTarget) element.target = linkTarget.value;

        // Apply image alt
        const imageAlt = document.getElementById('propImageAlt');
        if (imageAlt) element.alt = imageAlt.value;
    }

    // ==========================================
    // ELEMENT OPERATIONS
    // ==========================================

    detectElementType(element) {
        if (!element) return 'container';

        const tagName = element.tagName.toLowerCase();
        const classes = element.className || '';

        // Check for specific component classes
        if (classes.includes('hero')) return 'hero';
        if (classes.includes('product-card')) return 'productCard';
        if (classes.includes('category-card')) return 'categoryCard';
        if (classes.includes('feature-card')) return 'featureCard';

        // Check by tag name
        const tagMapping = {
            'section': 'section',
            'header': 'section',
            'footer': 'section',
            'div': 'container',
            'h1': 'heading', 'h2': 'heading', 'h3': 'heading',
            'h4': 'heading', 'h5': 'heading', 'h6': 'heading',
            'p': 'text',
            'span': 'text',
            'img': 'image',
            'button': 'button',
            'a': 'link',
            'hr': 'divider'
        };

        // Check for grid display
        const style = element.style;
        if (style.display === 'grid') return 'grid';

        return tagMapping[tagName] || 'container';
    }

    convertElement(element, targetType) {
        if (!element || !targetType) return;

        const typeInfo = this.elementTypes[targetType];
        if (!typeInfo) return;

        window.editor?.saveState(`Converted to ${typeInfo.name}`);

        Object.entries(typeInfo.defaultStyles || {}).forEach(([prop, value]) => {
            element.style[prop] = value;
        });

        element.className = element.className.replace(/builder-type-\S+/g, '').trim();
        element.classList.add(`builder-type-${targetType}`);
        element.setAttribute('data-builder-type', targetType);

        this.renderSmartProperties(element);
        this.updateSelectedElementInfo(element);

        window.editor?.showToast(`Converted to ${typeInfo.name}`);
    }

    insertElement(type, afterElement = null) {
        const typeInfo = this.elementTypes[type];
        if (!typeInfo) return;

        const iframe = document.getElementById('editorFrame');
        const iframeDoc = iframe?.contentDocument;
        if (!iframeDoc) return;

        window.editor?.saveState(`Added ${typeInfo.name}`);

        const newElement = iframeDoc.createElement(this.getTagForType(type));
        newElement.setAttribute('data-builder-type', type);
        newElement.classList.add(`builder-type-${type}`);

        Object.entries(typeInfo.defaultStyles || {}).forEach(([prop, value]) => {
            newElement.style[prop] = value;
        });

        this.addDefaultContent(newElement, type, typeInfo);

        if (afterElement) {
            afterElement.parentNode.insertBefore(newElement, afterElement.nextSibling);
        } else if (this.selectedElement) {
            this.selectedElement.appendChild(newElement);
        } else {
            iframeDoc.body.appendChild(newElement);
        }

        window.editor?.selectElement(newElement);
        window.editor?.showToast(`Added ${typeInfo.name}`);
    }

    getTagForType(type) {
        const tagMap = {
            container: 'div',
            section: 'section',
            hero: 'section',
            grid: 'div',
            heading: 'h2',
            text: 'p',
            image: 'img',
            button: 'button',
            link: 'a',
            divider: 'hr',
            spacer: 'div',
            productCard: 'div',
            categoryCard: 'div',
            featureCard: 'div'
        };
        return tagMap[type] || 'div';
    }

    addDefaultContent(element, type, typeInfo) {
        switch (type) {
            case 'heading':
                element.textContent = 'Your Heading';
                break;
            case 'text':
                element.textContent = 'Your text content goes here. Click to edit.';
                break;
            case 'button':
                element.textContent = 'Click Me';
                break;
            case 'image':
                element.src = 'https://via.placeholder.com/400x300';
                element.alt = 'Placeholder image';
                break;
            case 'featureCard':
                element.innerHTML = `
                    <div class="feature-icon">⭐</div>
                    <h3>Feature Title</h3>
                    <p>Feature description goes here</p>
                `;
                break;
        }
    }

    // ==========================================
    // CANVAS LISTENERS
    // ==========================================

    setupCanvasListeners() {
        document.addEventListener('elementSelected', (e) => {
            this.selectedElement = e.detail.element;
            this.updateSelectedElementInfo(e.detail.element);
            this.renderSmartProperties(e.detail.element);
        });

        document.addEventListener('elementDeselected', () => {
            this.selectedElement = null;
            this.updateSelectedElementInfo(null);

            const propertiesContent = document.getElementById('propertiesContent');
            if (propertiesContent) {
                propertiesContent.innerHTML = '<p class="no-selection">Select an element to edit its properties</p>';
            }
        });
    }

    // ==========================================
    // KEYBOARD SHORTCUTS
    // ==========================================

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.selectedElement) return;

            // Skip if typing in input
            if (document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA' ||
                document.activeElement.tagName === 'SELECT') {
                return;
            }

            // Delete element
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                this.deleteElement(this.selectedElement);
            }

            // Duplicate element
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.duplicateElement(this.selectedElement);
            }

            // Move element up
            if (e.ctrlKey && e.key === 'ArrowUp') {
                e.preventDefault();
                this.moveElement(this.selectedElement, 'up');
            }

            // Move element down
            if (e.ctrlKey && e.key === 'ArrowDown') {
                e.preventDefault();
                this.moveElement(this.selectedElement, 'down');
            }
        });
    }

    deleteElement(element) {
        if (!element || !confirm('Delete this element?')) return;
        window.editor?.saveState('Deleted element');
        element.remove();
        this.selectedElement = null;
        this.updateSelectedElementInfo(null);
        window.editor?.deselectElement();
        window.editor?.showToast('Element deleted');
    }

    duplicateElement(element) {
        if (!element) return;
        window.editor?.saveState('Duplicated element');
        const clone = element.cloneNode(true);
        element.parentNode.insertBefore(clone, element.nextSibling);
        window.editor?.selectElement(clone);
        window.editor?.showToast('Element duplicated');
    }

    moveElement(element, direction) {
        if (!element) return;
        const parent = element.parentNode;
        window.editor?.saveState(`Moved element ${direction}`);
        if (direction === 'up' && element.previousElementSibling) {
            parent.insertBefore(element, element.previousElementSibling);
        } else if (direction === 'down' && element.nextElementSibling) {
            parent.insertBefore(element.nextElementSibling, element);
        }
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    formatSize(value) {
        if (!value || value === 'auto' || value === 'none') return value;
        if (/^\d+$/.test(value)) return value + 'px';
        return value;
    }

    rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
        const result = rgb.match(/\d+/g);
        if (!result) return '#ffffff';
        const r = parseInt(result[0]).toString(16).padStart(2, '0');
        const g = parseInt(result[1]).toString(16).padStart(2, '0');
        const b = parseInt(result[2]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
}

// Initialize Visual Builder
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.visualBuilder = new VisualBuilder();
    });
} else {
    window.visualBuilder = new VisualBuilder();
}
