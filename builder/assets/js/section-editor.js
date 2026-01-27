// ==========================================
// SECTION EDITOR - Direct editing of page sections
// ==========================================

class SectionEditor {
    constructor() {
        this.currentSection = null;
        this.quickToolbar = null;
        this.init();
    }

    init() {
        // Wait for iframe to be available and fully loaded
        const iframe = document.getElementById('editorFrame');
        if (!iframe) {
            console.warn('SectionEditor: iframe not found, waiting...');
            setTimeout(() => this.init(), 500);
            return;
        }

        // Check if iframe is already loaded
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            console.log('SectionEditor: iframe already loaded, setting up immediately');
            this.setupSectionEditing();
            this.createQuickToolbar();
        } else {
            console.log('SectionEditor: waiting for iframe load event');
            iframe.addEventListener('load', () => {
                console.log('SectionEditor: iframe loaded, setting up section editing');
                setTimeout(() => {
                    this.setupSectionEditing();
                    this.createQuickToolbar();
                }, 500);
            });
        }

        // Reinitialize when page changes
        iframe.addEventListener('load', () => {
            console.log('SectionEditor: page changed, reinitializing');
            setTimeout(() => {
                this.setupSectionEditing();
            }, 500);
        });
    }

    setupSectionEditing() {
        const iframe = document.getElementById('editorFrame');
        if (!iframe) {
            console.error('SectionEditor: iframe not found');
            return;
        }

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!iframeDoc || !iframeDoc.body) {
            console.error('SectionEditor: iframe document not ready');
            return;
        }

        // Find all major sections to make editable
        const editableSections = iframeDoc.querySelectorAll(`
            .hero,
            header,
            .features,
            .feature-card,
            .categories,
            .category-card,
            .products-section,
            .product-card,
            .company-info,
            footer,
            section
        `);

        console.log(`SectionEditor: Found ${editableSections.length} editable sections`);

        editableSections.forEach(section => {
            this.makeSectionEditable(section);
        });
    }

    makeSectionEditable(section) {
        // Add hover effect
        section.addEventListener('mouseenter', (e) => {
            if (section !== this.currentSection && !section.closest('.builder-selected')) {
                section.style.outline = '2px dashed #667eea';
                section.style.outlineOffset = '4px';
                section.style.cursor = 'pointer';
            }
        });

        section.addEventListener('mouseleave', (e) => {
            if (section !== this.currentSection) {
                section.style.outline = '';
                section.style.outlineOffset = '';
                section.style.cursor = '';
            }
        });

        // Click to show quick edit toolbar
        section.addEventListener('click', (e) => {
            // Only if clicking directly on section, not child elements
            if (e.target === section || e.target.closest('.section-overlay')) {
                e.preventDefault();
                e.stopPropagation();
                this.selectSection(section);
            }
        });
    }

    selectSection(section) {
        // Deselect previous
        if (this.currentSection) {
            this.currentSection.style.outline = '';
            this.currentSection.style.outlineOffset = '';
        }

        // Select new
        this.currentSection = section;
        section.style.outline = '3px solid #667eea';
        section.style.outlineOffset = '4px';

        // Show quick toolbar
        this.showQuickToolbar(section);
    }

    createQuickToolbar() {
        const iframe = document.getElementById('editorFrame');
        if (!iframe) return;

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Create toolbar
        const toolbar = iframeDoc.createElement('div');
        toolbar.id = 'sectionQuickToolbar';
        toolbar.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            display: none;
            flex-direction: column;
            gap: 8px;
            min-width: 200px;
        `;

        toolbar.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">
                <strong style="color: #333; font-size: 0.9rem;">✏️ Quick Edit</strong>
                <button id="closeSectionToolbar" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0; color: #999;">&times;</button>
            </div>
            <div id="toolbarControls"></div>
        `;

        iframeDoc.body.appendChild(toolbar);
        this.quickToolbar = toolbar;

        // Close button
        toolbar.querySelector('#closeSectionToolbar')?.addEventListener('click', () => {
            this.hideQuickToolbar();
        });
    }

    showQuickToolbar(section) {
        if (!this.quickToolbar) {
            this.createQuickToolbar();
        }

        const controls = this.quickToolbar.querySelector('#toolbarControls');
        if (!controls) return;

        // Determine section type and show appropriate controls
        const sectionType = this.detectSectionType(section);
        controls.innerHTML = this.getControlsForType(sectionType, section);

        this.quickToolbar.style.display = 'flex';

        // Setup control handlers
        this.setupControlHandlers(section, sectionType);
    }

    hideQuickToolbar() {
        if (this.quickToolbar) {
            this.quickToolbar.style.display = 'none';
        }

        if (this.currentSection) {
            this.currentSection.style.outline = '';
            this.currentSection.style.outlineOffset = '';
            this.currentSection = null;
        }
    }

    detectSectionType(section) {
        if (section.classList.contains('hero')) return 'hero';
        if (section.tagName === 'HEADER') return 'header';
        if (section.classList.contains('feature-card')) return 'feature-card';
        if (section.classList.contains('category-card')) return 'category-card';
        if (section.classList.contains('product-card')) return 'product-card';
        if (section.tagName === 'FOOTER') return 'footer';
        if (section.classList.contains('features')) return 'features-section';
        return 'section';
    }

    getControlsForType(type, section) {
        const baseControls = `
            <button class="toolbar-btn-small" data-action="background">
                🎨 Barva pozadí
            </button>
            <button class="toolbar-btn-small" data-action="text-color">
                📝 Barva textu
            </button>
        `;

        switch (type) {
            case 'hero':
                return `
                    ${baseControls}
                    <button class="toolbar-btn-small" data-action="bg-image">
                        🖼️ Obrázek pozadí
                    </button>
                    <button class="toolbar-btn-small" data-action="edit-title">
                        ✏️ Upravit nadpis
                    </button>
                    <button class="toolbar-btn-small" data-action="edit-subtitle">
                        ✏️ Upravit popis
                    </button>
                    <button class="toolbar-btn-small" data-action="edit-button">
                        🔗 Upravit tlačítko
                    </button>
                `;

            case 'feature-card':
            case 'category-card':
                return `
                    ${baseControls}
                    <button class="toolbar-btn-small" data-action="replace-icon">
                        😀 Změnit ikonu
                    </button>
                    <button class="toolbar-btn-small" data-action="edit-title">
                        ✏️ Upravit nadpis
                    </button>
                    <button class="toolbar-btn-small" data-action="edit-link">
                        🔗 Upravit odkaz
                    </button>
                `;

            case 'product-card':
                return `
                    <button class="toolbar-btn-small" data-action="replace-image">
                        📤 Změnit obrázek
                    </button>
                    <button class="toolbar-btn-small" data-action="edit-title">
                        ✏️ Upravit název
                    </button>
                    <button class="toolbar-btn-small" data-action="edit-price">
                        💰 Upravit cenu
                    </button>
                    <button class="toolbar-btn-small" data-action="edit-link">
                        🔗 Upravit odkaz
                    </button>
                `;

            default:
                return baseControls + `
                    <button class="toolbar-btn-small" data-action="edit-content">
                        ✏️ Upravit obsah
                    </button>
                `;
        }
    }

    setupControlHandlers(section, type) {
        const buttons = this.quickToolbar.querySelectorAll('.toolbar-btn-small');

        buttons.forEach(btn => {
            btn.style.cssText = `
                width: 100%;
                padding: 8px 12px;
                background: #f0f0f0;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85rem;
                text-align: left;
                transition: all 0.2s;
            `;

            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#667eea';
                btn.style.color = 'white';
                btn.style.borderColor = '#667eea';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.background = '#f0f0f0';
                btn.style.color = '';
                btn.style.borderColor = '#e0e0e0';
            });

            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.handleAction(action, section);
            });
        });
    }

    handleAction(action, section) {
        window.editor.saveState(`Section edit: ${action}`);

        switch (action) {
            case 'background':
                this.changeBackground(section);
                break;
            case 'text-color':
                this.changeTextColor(section);
                break;
            case 'bg-image':
                this.changeBackgroundImage(section);
                break;
            case 'replace-icon':
                this.replaceIcon(section);
                break;
            case 'replace-image':
                this.replaceImage(section);
                break;
            case 'edit-title':
                this.editTitle(section);
                break;
            case 'edit-subtitle':
                this.editSubtitle(section);
                break;
            case 'edit-button':
                this.editButton(section);
                break;
            case 'edit-link':
                this.editLink(section);
                break;
            case 'edit-price':
                this.editPrice(section);
                break;
            case 'edit-content':
                this.editContent(section);
                break;
        }
    }

    changeBackground(section) {
        const color = prompt('Zadejte barvu pozadí (např. #4169E1, blue, rgb(65, 105, 225)):', section.style.backgroundColor || '#ffffff');
        if (color) {
            section.style.backgroundColor = color;
            window.editor.showToast('Barva pozadí změněna!');
        }
    }

    changeTextColor(section) {
        const color = prompt('Zadejte barvu textu (např. #333, white):', section.style.color || '#333333');
        if (color) {
            section.style.color = color;
            // Also change all child text elements
            section.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, span').forEach(el => {
                el.style.color = color;
            });
            window.editor.showToast('Barva textu změněna!');
        }
    }

    changeBackgroundImage(section) {
        const url = prompt('Zadejte URL obrázku pozadí:', '');
        if (url) {
            section.style.backgroundImage = `url('${url}')`;
            section.style.backgroundSize = 'cover';
            section.style.backgroundPosition = 'center';
            window.editor.showToast('Obrázek pozadí nastaven!');
        }
    }

    replaceIcon(section) {
        const iconEl = section.querySelector('.feature-icon, .category-icon');
        if (!iconEl) {
            window.editor.showToast('Ikona nenalezena');
            return;
        }

        const newIcon = prompt('Zadejte novou ikonu (emoji nebo HTML):', iconEl.textContent);
        if (newIcon) {
            iconEl.textContent = newIcon;
            window.editor.showToast('Ikona změněna!');
        }
    }

    replaceImage(section) {
        const img = section.querySelector('img');
        if (!img) {
            window.editor.showToast('Obrázek nenalezen');
            return;
        }

        const newSrc = prompt('Zadejte URL obrázku:', img.src);
        if (newSrc) {
            img.src = newSrc;
            window.editor.showToast('Obrázek změněn!');
        }
    }

    editTitle(section) {
        const title = section.querySelector('h1, h2, h3, h4, .product-title, .category-title');
        if (!title) {
            window.editor.showToast('Nadpis nenalezen');
            return;
        }

        const newText = prompt('Zadejte nový nadpis:', title.textContent);
        if (newText) {
            title.textContent = newText;
            window.editor.showToast('Nadpis změněn!');
        }
    }

    editSubtitle(section) {
        const subtitle = section.querySelector('p');
        if (!subtitle) {
            window.editor.showToast('Popis nenalezen');
            return;
        }

        const newText = prompt('Zadejte nový popis:', subtitle.textContent);
        if (newText) {
            subtitle.textContent = newText;
            window.editor.showToast('Popis změněn!');
        }
    }

    editButton(section) {
        const btn = section.querySelector('button, .btn, .btn-primary, .btn-secondary');
        if (!btn) {
            window.editor.showToast('Tlačítko nenalezeno');
            return;
        }

        const newText = prompt('Zadejte nový text tlačítka:', btn.textContent);
        if (newText) {
            btn.textContent = newText;
        }

        const newLink = prompt('Zadejte URL odkazu:', btn.getAttribute('href') || btn.onclick || '');
        if (newLink) {
            if (btn.tagName === 'A') {
                btn.href = newLink;
            } else {
                btn.onclick = () => window.location.href = newLink;
            }
        }

        window.editor.showToast('Tlačítko upraveno!');
    }

    editLink(section) {
        const link = section.querySelector('a') || section;
        if (link.tagName !== 'A') {
            window.editor.showToast('Odkaz nenalezen');
            return;
        }

        const newHref = prompt('Zadejte nový URL:', link.href);
        if (newHref) {
            link.href = newHref;
            window.editor.showToast('Odkaz změněn!');
        }
    }

    editPrice(section) {
        const price = section.querySelector('.product-price');
        if (!price) {
            window.editor.showToast('Cena nenalezena');
            return;
        }

        const newPrice = prompt('Zadejte novou cenu:', price.textContent);
        if (newPrice) {
            price.textContent = newPrice;
            window.editor.showToast('Cena změněna!');
        }
    }

    editContent(section) {
        window.editor.selectElement(section);
        window.editor.showToast('Použijte panel Vlastnosti pro úpravu');
    }
}

// Initialize section editor
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('SectionEditor: DOM loaded, initializing');
        window.sectionEditor = new SectionEditor();
    });
} else {
    console.log('SectionEditor: DOM already loaded, initializing immediately');
    window.sectionEditor = new SectionEditor();
}
