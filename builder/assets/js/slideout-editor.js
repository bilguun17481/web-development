// ==========================================
// SLIDEOUT EDITOR COMPONENT
// ==========================================

class SlideoutEditor {
    constructor() {
        this.isOpen = false;
        this.editBtn = null;
        this.slideout = null;
        this.closeBtn = null;

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.editBtn = document.getElementById('floatingEditBtn');
        this.slideout = document.getElementById('slideoutEditor');
        this.closeBtn = document.getElementById('closeSlideoutBtn');

        if (!this.editBtn || !this.slideout || !this.closeBtn) {
            console.warn('SlideoutEditor: Required elements not found');
            return;
        }

        // Toggle on edit button click
        this.editBtn.addEventListener('click', () => this.toggle());

        // Close on close button click
        this.closeBtn.addEventListener('click', () => this.close());

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Close when clicking outside (optional behavior)
        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.slideout.contains(e.target) &&
                !this.editBtn.contains(e.target)) {
                this.close();
            }
        });

        // Setup quick action buttons
        this.setupQuickActions();

        // Setup color palette
        this.setupColorPalette();

        // Setup style presets
        this.setupStylePresets();

        console.log('SlideoutEditor initialized');
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.slideout.classList.add('open');
        this.editBtn.classList.add('active');
    }

    close() {
        this.isOpen = false;
        this.slideout.classList.remove('open');
        this.editBtn.classList.remove('active');
    }

    setupQuickActions() {
        const quickActionBtns = this.slideout.querySelectorAll('.quick-action-btn');

        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        // Get the drag-drop system if available
        const dragDrop = window.dragDrop;

        switch (action) {
            case 'add-text':
                if (dragDrop) {
                    dragDrop.createElement('text');
                }
                window.editor?.showToast('Text element ready - click on canvas to place');
                break;
            case 'add-image':
                if (dragDrop) {
                    dragDrop.createElement('image');
                }
                window.editor?.showToast('Image element ready - click on canvas to place');
                break;
            case 'add-button':
                if (dragDrop) {
                    dragDrop.createElement('button');
                }
                window.editor?.showToast('Button element ready - click on canvas to place');
                break;
            case 'add-section':
                if (dragDrop) {
                    dragDrop.createElement('section');
                }
                window.editor?.showToast('Section element ready - click on canvas to place');
                break;
            default:
                console.log('Unknown action:', action);
        }

        // Close sidebar after action
        this.close();
    }

    setupColorPalette() {
        const colorSwatches = this.slideout.querySelectorAll('.color-swatch');

        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                const color = swatch.dataset.color;
                this.applyColor(color);
            });
        });
    }

    applyColor(color) {
        // Apply to currently selected element if any
        const editor = window.editor;
        if (editor && editor.selectedElement) {
            editor.selectedElement.style.backgroundColor = color;
            editor.showToast(`Color ${color} applied`);
            editor.saveState('Changed element color');
        } else {
            // Copy color to clipboard
            navigator.clipboard.writeText(color).then(() => {
                window.editor?.showToast(`Color ${color} copied to clipboard`);
            }).catch(() => {
                window.editor?.showToast(`Select an element to apply color`);
            });
        }
    }

    setupStylePresets() {
        const presetBtns = this.slideout.querySelectorAll('.preset-btn');

        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.applyPreset(preset);
            });
        });
    }

    applyPreset(preset) {
        const presets = {
            modern: {
                primary: '#667eea',
                secondary: '#764ba2',
                background: '#f8f9fc',
                text: '#333333'
            },
            classic: {
                primary: '#2c3e50',
                secondary: '#34495e',
                background: '#ecf0f1',
                text: '#2c3e50'
            },
            minimal: {
                primary: '#333333',
                secondary: '#666666',
                background: '#ffffff',
                text: '#333333'
            },
            bold: {
                primary: '#e74c3c',
                secondary: '#f39c12',
                background: '#2c3e50',
                text: '#ffffff'
            }
        };

        const colors = presets[preset];
        if (colors) {
            window.editor?.showToast(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset selected`);
            // Store preset for future use
            localStorage.setItem('selectedPreset', preset);
            console.log('Applied preset:', preset, colors);
        }
    }
}

// Initialize slideout editor
window.slideoutEditor = new SlideoutEditor();
