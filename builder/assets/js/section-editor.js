// ==========================================
// SECTION EDITOR - Direct editing of page sections
// Now redirects to the unified Properties Panel
// ==========================================

class SectionEditor {
    constructor() {
        this.currentSection = null;
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
        } else {
            console.log('SectionEditor: waiting for iframe load event');
            iframe.addEventListener('load', () => {
                console.log('SectionEditor: iframe loaded, setting up section editing');
                setTimeout(() => {
                    this.setupSectionEditing();
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
        // Skip if already initialized
        if (section.dataset.sectionEditorInit) return;
        section.dataset.sectionEditorInit = 'true';

        // Add hover effect for sections
        section.addEventListener('mouseenter', (e) => {
            if (section !== this.currentSection && !section.classList.contains('builder-selected')) {
                section.style.outline = '2px dashed rgba(102, 126, 234, 0.5)';
                section.style.outlineOffset = '4px';
                section.style.cursor = 'pointer';
            }
        });

        section.addEventListener('mouseleave', (e) => {
            if (section !== this.currentSection && !section.classList.contains('builder-selected')) {
                section.style.outline = '';
                section.style.outlineOffset = '';
                section.style.cursor = '';
            }
        });

        // Click to select and show in Properties panel
        section.addEventListener('click', (e) => {
            // Only if clicking directly on section background, not child elements
            // This allows child elements to be selected individually
            if (e.target === section || this.isBackgroundClick(e, section)) {
                e.preventDefault();
                e.stopPropagation();
                this.selectSection(section);
            }
        });
    }

    isBackgroundClick(e, section) {
        // Check if click is on a background element or overlay
        const target = e.target;
        if (target.classList.contains('section-overlay') ||
            target.classList.contains('hero-overlay') ||
            target.classList.contains('section-bg')) {
            return true;
        }
        return false;
    }

    selectSection(section) {
        // Clear previous section styling
        if (this.currentSection && this.currentSection !== section) {
            this.currentSection.style.outline = '';
            this.currentSection.style.outlineOffset = '';
        }

        this.currentSection = section;

        // Use the main editor's selectElement to handle selection
        // This will trigger the Properties panel to update
        if (window.editor) {
            window.editor.selectElement(section);
        }

        // Switch to Properties tab in right sidebar
        const propertiesTab = document.querySelector('.sidebar-right .sidebar-tab[data-panel="properties"]');
        if (propertiesTab) {
            propertiesTab.click();
        }
    }

    deselectSection() {
        if (this.currentSection) {
            this.currentSection.style.outline = '';
            this.currentSection.style.outlineOffset = '';
            this.currentSection = null;
        }
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
