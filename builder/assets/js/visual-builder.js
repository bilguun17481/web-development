// ==========================================
// VISUAL BUILDER - WIX-LEVEL EDITOR SYSTEM
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
                properties: ['content', 'styling', 'layout', 'behavior'],
                specificProps: {
                    columns: 3,
                    rows: 'auto',
                    gap: '20px',
                    responsive: {
                        tablet: { columns: 2 },
                        mobile: { columns: 1 }
                    }
                }
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
                properties: ['content', 'styling'],
                specificProps: {
                    level: 'h2',
                    text: 'Your Heading'
                }
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
                properties: ['content', 'styling', 'behavior'],
                specificProps: {
                    src: '',
                    alt: '',
                    aspectRatio: 'auto',
                    lazyLoad: true,
                    objectFit: 'cover'
                }
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
                properties: ['content', 'styling', 'behavior'],
                specificProps: {
                    label: 'Click Me',
                    url: '',
                    target: '_self',
                    icon: null,
                    hoverAnimation: 'lift'
                }
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
                properties: ['content', 'styling', 'behavior', 'data'],
                specificProps: {
                    dataSource: 'manual',
                    showPrice: true,
                    showRating: true,
                    showBadge: true,
                    quickAddToCart: true,
                    priceFormat: 'Kč'
                }
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
                properties: ['content', 'styling', 'behavior', 'data'],
                specificProps: {
                    dataSource: 'manual',
                    showCount: true,
                    overlayStyle: 'gradient'
                }
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
                properties: ['content', 'styling'],
                specificProps: {
                    icon: '⭐',
                    title: 'Feature Title',
                    description: 'Feature description goes here'
                }
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
            }
        };
    }

    // ==========================================
    // SMART DEFAULTS BY CONTEXT
    // ==========================================

    defineSmartDefaults() {
        return {
            // Inside a product section, suggest product cards
            'section[data-type="products"]': ['productCard', 'grid'],
            // Inside a features section, suggest feature cards
            'section[data-type="features"]': ['featureCard', 'grid'],
            // Inside a grid, suggest various content
            'grid': ['container', 'image', 'text', 'productCard'],
            // Inside a container, suggest content elements
            'container': ['heading', 'text', 'button', 'image'],
            // Default suggestions
            'default': ['section', 'container', 'grid', 'heading', 'text', 'image', 'button']
        };
    }

    // ==========================================
    // TYPE CONVERSION RULES
    // ==========================================

    defineConversionRules() {
        return {
            // What each type can be converted to
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

        // Create new structure
        let html = `
            <div class="element-panel-header">
                <h3>Elements</h3>
            </div>

            <!-- Selected Element Info (shown when element selected) -->
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

            <!-- Smart Suggestions (context-aware) -->
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

            // Click to insert at selected position
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

        // Render conversion options
        this.renderConversionOptions(detectedType);

        // Show smart suggestions
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

        // Add click handlers
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
    // RIGHT PANEL - SMART PROPERTIES
    // ==========================================

    setupRightPanel() {
        // This will be called by the editor when an element is selected
    }

    renderSmartProperties(element) {
        const propertiesContent = document.getElementById('propertiesContent');
        if (!propertiesContent || !element) return;

        const detectedType = this.detectElementType(element);
        const typeInfo = this.elementTypes[detectedType] || { properties: ['content', 'styling'] };

        const iframe = document.getElementById('editorFrame');
        const iframeWindow = iframe?.contentWindow;
        const computedStyle = iframeWindow ? iframeWindow.getComputedStyle(element) : window.getComputedStyle(element);

        let html = '<div class="smart-properties">';

        // Element type header
        html += this.renderPropertyHeader(element, detectedType, typeInfo);

        // Content section
        if (typeInfo.properties.includes('content')) {
            html += this.renderContentSection(element, detectedType, typeInfo);
        }

        // Styling section
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

        // Setup collapsible sections
        this.setupCollapsibleSections();

        // Setup property handlers
        this.setupSmartPropertyHandlers(element);
    }

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

    renderContentSection(element, detectedType, typeInfo) {
        const tagName = element.tagName.toLowerCase();
        let content = '';

        // Text content for text-based elements
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'a', 'label'].includes(tagName)) {
            content += `
                <div class="form-group">
                    <label>Text Content</label>
                    <textarea id="propTextContent" rows="3" class="live-preview">${this.escapeHtml(element.textContent)}</textarea>
                </div>
            `;
        }

        // Image-specific
        if (tagName === 'img') {
            content += `
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
                <div class="form-group">
                    <label>Aspect Ratio</label>
                    <select id="propAspectRatio">
                        <option value="auto">Auto</option>
                        <option value="1/1">1:1 Square</option>
                        <option value="4/3">4:3</option>
                        <option value="16/9">16:9 Widescreen</option>
                        <option value="3/2">3:2</option>
                        <option value="2/3">2:3 Portrait</option>
                    </select>
                </div>
            `;
        }

        // Button-specific
        if (tagName === 'button' || (tagName === 'a' && element.classList.contains('btn'))) {
            content += `
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
                <div class="form-group">
                    <label>Icon</label>
                    <div class="icon-picker" id="iconPicker">
                        <button class="icon-option" data-icon="">None</button>
                        <button class="icon-option" data-icon="→">→</button>
                        <button class="icon-option" data-icon="↗">↗</button>
                        <button class="icon-option" data-icon="🛒">🛒</button>
                        <button class="icon-option" data-icon="📧">📧</button>
                        <button class="icon-option" data-icon="📞">📞</button>
                    </div>
                </div>
            `;
        }

        // Link-specific
        if (tagName === 'a') {
            content += `
                <div class="form-group">
                    <label>Link URL</label>
                    <input type="text" id="propLinkHref" value="${element.href}" placeholder="https://...">
                </div>
            `;
        }

        if (!content) {
            content = '<p class="no-content-props">No content properties for this element</p>';
        }

        return `
            <div class="property-section collapsible" data-section="content">
                <div class="section-header" data-toggle="content">
                    <span class="section-icon">✏️</span>
                    <h4>Content</h4>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="section-body">
                    ${content}
                </div>
            </div>
        `;
    }

    renderStylingSection(element, computedStyle) {
        return `
            <div class="property-section collapsible" data-section="styling">
                <div class="section-header" data-toggle="styling">
                    <span class="section-icon">🎨</span>
                    <h4>Styling</h4>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="section-body">
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

                    <div class="form-group">
                        <label>Border Radius</label>
                        <div class="slider-input-wrapper">
                            <input type="range" id="propBorderRadiusSlider" min="0" max="50" value="${parseInt(computedStyle.borderRadius) || 0}" class="live-preview">
                            <input type="number" id="propBorderRadius" value="${parseInt(computedStyle.borderRadius) || 0}" min="0" max="50" class="slider-value live-preview">
                            <span>px</span>
                        </div>
                    </div>

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

                    <div class="form-group">
                        <label>Box Shadow</label>
                        <select id="propBoxShadow" class="live-preview">
                            <option value="none">None</option>
                            <option value="0 2px 4px rgba(0,0,0,0.1)">Subtle</option>
                            <option value="0 4px 15px rgba(0,0,0,0.1)">Medium</option>
                            <option value="0 8px 30px rgba(0,0,0,0.15)">Strong</option>
                            <option value="0 20px 50px rgba(0,0,0,0.2)">Dramatic</option>
                        </select>
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
                    <h4>Layout</h4>
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

                    <div class="form-group">
                        <label>Display</label>
                        <select id="propDisplay" class="live-preview">
                            <option value="block" ${computedStyle.display === 'block' ? 'selected' : ''}>Block</option>
                            <option value="flex" ${isFlex ? 'selected' : ''}>Flex</option>
                            <option value="grid" ${isGrid ? 'selected' : ''}>Grid</option>
                            <option value="inline-block" ${computedStyle.display === 'inline-block' ? 'selected' : ''}>Inline Block</option>
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
                </div>
            </div>
        `;
    }

    renderGridControls(element, computedStyle) {
        return `
            <div class="grid-controls">
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
                    </select>
                </div>
                <div class="form-group">
                    <label>Justify</label>
                    <select id="propJustifyContent" class="live-preview">
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="space-between">Space Between</option>
                        <option value="space-around">Space Around</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Align</label>
                    <select id="propAlignItems" class="live-preview">
                        <option value="stretch">Stretch</option>
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderBehaviorSection(element, detectedType) {
        const tagName = element.tagName.toLowerCase();
        let content = '';

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
                    </select>
                </div>
            `;
        }

        if (tagName === 'img') {
            content += `
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="propLazyLoad" checked>
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
                    </select>
                </div>
            `;
        }

        content += `
            <div class="form-group">
                <label>
                    <input type="checkbox" id="propHideOnMobile">
                    Hide on Mobile
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="propHideOnDesktop">
                    Hide on Desktop
                </label>
            </div>
        `;

        return `
            <div class="property-section collapsible" data-section="behavior">
                <div class="section-header" data-toggle="behavior">
                    <span class="section-icon">⚡</span>
                    <h4>Behavior</h4>
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
            content = `
                <div class="form-group">
                    <label>Data Source</label>
                    <select id="propDataSource">
                        <option value="manual">Manual</option>
                        <option value="collection">From Collection</option>
                        <option value="category">By Category</option>
                    </select>
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
                        <input type="checkbox" id="propShowBadge" checked>
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
                    <label>Category</label>
                    <select id="propCategory">
                        <option value="">Select Category</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="propShowCount" checked>
                        Show Product Count
                    </label>
                </div>
            `;
        }

        if (!content) return '';

        return `
            <div class="property-section collapsible" data-section="data">
                <div class="section-header" data-toggle="data">
                    <span class="section-icon">📊</span>
                    <h4>Data</h4>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="section-body">
                    ${content}
                </div>
            </div>
        `;
    }

    setupCollapsibleSections() {
        document.querySelectorAll('.section-header[data-toggle]').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.property-section');
                section.classList.toggle('collapsed');
            });
        });
    }

    setupSmartPropertyHandlers(element) {
        // Live preview handlers
        document.querySelectorAll('.live-preview').forEach(input => {
            input.addEventListener('input', () => {
                this.previewProperty(element, input);
            });
        });

        // Slider sync
        this.syncSliders();

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

        // Image upload
        const uploadBtn = document.getElementById('uploadImageBtn');
        const uploadInput = document.getElementById('propImageUpload');
        if (uploadBtn && uploadInput) {
            uploadBtn.addEventListener('click', () => uploadInput.click());
            uploadInput.addEventListener('change', (e) => this.handleImageUpload(e, element));
        }
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

    // ==========================================
    // ELEMENT OPERATIONS
    // ==========================================

    detectElementType(element) {
        if (!element) return 'container';

        const tagName = element.tagName.toLowerCase();
        const classes = element.className || '';

        // Check for specific component classes
        if (classes.includes('product-card')) return 'productCard';
        if (classes.includes('category-card')) return 'categoryCard';
        if (classes.includes('feature-card')) return 'featureCard';

        // Check by tag name
        const tagMapping = {
            'section': 'section',
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
        if (element.style.display === 'grid' || window.getComputedStyle(element).display === 'grid') {
            return 'grid';
        }

        return tagMapping[tagName] || 'container';
    }

    convertElement(element, targetType) {
        if (!element || !targetType) return;

        const typeInfo = this.elementTypes[targetType];
        if (!typeInfo) return;

        window.editor?.saveState(`Converted to ${typeInfo.name}`);

        // Store children
        const children = Array.from(element.children);
        const content = element.textContent;

        // Apply default styles
        Object.entries(typeInfo.defaultStyles || {}).forEach(([prop, value]) => {
            element.style[prop] = value;
        });

        // Add type class
        element.className = element.className.replace(/builder-\S+/g, '').trim();
        element.classList.add(`builder-type-${targetType}`);
        element.setAttribute('data-builder-type', targetType);

        // Update properties panel
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

        // Create new element
        const newElement = iframeDoc.createElement(this.getTagForType(type));
        newElement.setAttribute('data-builder-type', type);
        newElement.classList.add(`builder-type-${type}`);

        // Apply default styles
        Object.entries(typeInfo.defaultStyles || {}).forEach(([prop, value]) => {
            newElement.style[prop] = value;
        });

        // Add default content
        this.addDefaultContent(newElement, type, typeInfo);

        // Insert element
        if (afterElement) {
            afterElement.parentNode.insertBefore(newElement, afterElement.nextSibling);
        } else if (this.selectedElement) {
            this.selectedElement.appendChild(newElement);
        } else {
            iframeDoc.body.appendChild(newElement);
        }

        // Select the new element
        window.editor?.selectElement(newElement);
        window.editor?.showToast(`Added ${typeInfo.name}`);
    }

    getTagForType(type) {
        const tagMap = {
            container: 'div',
            section: 'section',
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
        // Listen for selection changes from main editor
        document.addEventListener('elementSelected', (e) => {
            this.selectedElement = e.detail.element;
            this.updateSelectedElementInfo(e.detail.element);
            this.renderSmartProperties(e.detail.element);
        });

        document.addEventListener('elementDeselected', () => {
            this.selectedElement = null;
            this.updateSelectedElementInfo(null);
        });
    }

    // ==========================================
    // KEYBOARD SHORTCUTS
    // ==========================================

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.selectedElement) return;

            // Delete element
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (document.activeElement.tagName !== 'INPUT' &&
                    document.activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.deleteElement(this.selectedElement);
                }
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
        if (direction === 'up' && element.previousElementSibling) {
            parent.insertBefore(element, element.previousElementSibling);
        } else if (direction === 'down' && element.nextElementSibling) {
            parent.insertBefore(element.nextElementSibling, element);
        }
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    previewProperty(element, input) {
        const id = input.id;
        const value = input.type === 'checkbox' ? input.checked : input.value;

        const propertyMap = {
            propTextContent: () => element.textContent = value,
            propImageSrc: () => element.src = value,
            propBgColor: () => element.style.backgroundColor = value,
            propTextColor: () => element.style.color = value,
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
            propBoxShadow: () => element.style.boxShadow = value,
            propObjectFit: () => element.style.objectFit = value
        };

        if (propertyMap[id]) {
            propertyMap[id]();
        }
    }

    applyAllProperties(element) {
        // This applies all current form values to the element
        const props = [
            'propTextContent', 'propImageSrc', 'propImageAlt', 'propBgColor',
            'propTextColor', 'propFontSize', 'propBorderRadius', 'propPadding',
            'propMargin', 'propWidth', 'propHeight', 'propGap', 'propDisplay',
            'propFlexDirection', 'propJustifyContent', 'propAlignItems',
            'propBoxShadow', 'propObjectFit', 'propButtonUrl', 'propLinkHref'
        ];

        props.forEach(propId => {
            const input = document.getElementById(propId);
            if (input) {
                this.previewProperty(element, input);
            }
        });
    }

    handleImageUpload(e, element) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const srcInput = document.getElementById('propImageSrc');
            if (srcInput) srcInput.value = event.target.result;
            element.src = event.target.result;
            window.editor?.showToast('Image uploaded');
        };
        reader.readAsDataURL(file);
    }

    formatSize(value) {
        if (!value || value === 'auto') return value;
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
