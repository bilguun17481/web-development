// ==========================================
// IMAGE MANIPULATOR
// Drag-to-resize and reposition images on canvas
// ==========================================

class ImageManipulator {
    constructor() {
        this.selectedImage = null;
        this.overlay = null;
        this.handles = {};
        this.isResizing = false;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        this.startLeft = 0;
        this.startTop = 0;
        this.aspectRatio = 1;
        this.maintainAspectRatio = true;
        this.activeHandle = null;
        this.isBgImage = false;
        this.bgStartX = 0;
        this.bgStartY = 0;

        this.init();
    }

    init() {
        this.createOverlay();
        this.setupEventListeners();
    }

    // ==========================================
    // OVERLAY CREATION
    // ==========================================

    createOverlay() {
        // Create the manipulation overlay container
        this.overlay = document.createElement('div');
        this.overlay.className = 'image-manipulator-overlay';
        this.overlay.style.display = 'none';
        this.overlay.innerHTML = `
            <div class="manipulator-border"></div>
            <div class="resize-handle handle-nw" data-handle="nw"></div>
            <div class="resize-handle handle-n" data-handle="n"></div>
            <div class="resize-handle handle-ne" data-handle="ne"></div>
            <div class="resize-handle handle-e" data-handle="e"></div>
            <div class="resize-handle handle-se" data-handle="se"></div>
            <div class="resize-handle handle-s" data-handle="s"></div>
            <div class="resize-handle handle-sw" data-handle="sw"></div>
            <div class="resize-handle handle-w" data-handle="w"></div>
            <div class="manipulator-info">
                <span class="info-dimensions"></span>
            </div>
            <div class="manipulator-toolbar">
                <button class="manipulator-btn" data-action="aspectRatio" title="Lock Aspect Ratio">
                    <span class="icon-locked">🔒</span>
                    <span class="icon-unlocked" style="display:none">🔓</span>
                </button>
                <button class="manipulator-btn" data-action="fitContainer" title="Fit to Container">📐</button>
                <button class="manipulator-btn" data-action="resetSize" title="Reset to Original">↩️</button>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Store handle references
        this.overlay.querySelectorAll('.resize-handle').forEach(handle => {
            this.handles[handle.dataset.handle] = handle;
        });

        this.infoDisplay = this.overlay.querySelector('.info-dimensions');
        this.toolbar = this.overlay.querySelector('.manipulator-toolbar');
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================

    setupEventListeners() {
        // Listen for element selection
        document.addEventListener('elementSelected', (e) => {
            const element = e.detail.element;
            if (element.tagName === 'IMG') {
                this.attachToImage(element, false);
            } else if (this.hasBackgroundImage(element)) {
                this.attachToImage(element, true);
            } else {
                this.detach();
            }
        });

        document.addEventListener('elementDeselected', () => {
            this.detach();
        });

        // Handle resize start
        this.overlay.querySelectorAll('.resize-handle').forEach(handle => {
            handle.addEventListener('mousedown', (e) => this.startResize(e, handle.dataset.handle));
        });

        // Handle drag start on the border/overlay itself
        this.overlay.querySelector('.manipulator-border').addEventListener('mousedown', (e) => {
            if (!this.isBgImage) {
                this.startDrag(e);
            } else {
                this.startBgDrag(e);
            }
        });

        // Global mouse move and up
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Toolbar actions
        this.toolbar.querySelectorAll('.manipulator-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleToolbarAction(btn.dataset.action);
            });
        });

        // Update overlay position on scroll/resize
        window.addEventListener('resize', () => this.updateOverlayPosition());

        // Listen for iframe scroll
        const iframe = document.getElementById('editorFrame');
        if (iframe) {
            iframe.addEventListener('load', () => {
                const iframeDoc = iframe.contentDocument;
                if (iframeDoc) {
                    iframeDoc.addEventListener('scroll', () => this.updateOverlayPosition());
                }
            });
        }
    }

    // ==========================================
    // ATTACH/DETACH
    // ==========================================

    attachToImage(element, isBgImage = false) {
        this.selectedImage = element;
        this.isBgImage = isBgImage;

        if (!isBgImage) {
            // Regular image
            this.startWidth = element.offsetWidth;
            this.startHeight = element.offsetHeight;
            this.aspectRatio = this.startWidth / this.startHeight;

            // Store original dimensions if not already stored
            if (!element.dataset.originalWidth) {
                element.dataset.originalWidth = element.naturalWidth || element.offsetWidth;
                element.dataset.originalHeight = element.naturalHeight || element.offsetHeight;
            }
        } else {
            // Background image - get container dimensions
            this.startWidth = element.offsetWidth;
            this.startHeight = element.offsetHeight;
        }

        this.updateOverlayPosition();
        this.overlay.style.display = 'block';
        this.updateInfoDisplay();

        // Update toolbar for bg image mode
        if (isBgImage) {
            this.overlay.classList.add('bg-mode');
        } else {
            this.overlay.classList.remove('bg-mode');
        }
    }

    detach() {
        this.selectedImage = null;
        this.overlay.style.display = 'none';
        this.isResizing = false;
        this.isDragging = false;
    }

    hasBackgroundImage(element) {
        const bgImage = element.style.backgroundImage ||
                        window.getComputedStyle(element).backgroundImage;
        return bgImage && bgImage !== 'none';
    }

    // ==========================================
    // OVERLAY POSITIONING
    // ==========================================

    updateOverlayPosition() {
        if (!this.selectedImage) return;

        const iframe = document.getElementById('editorFrame');
        if (!iframe) return;

        const iframeRect = iframe.getBoundingClientRect();
        const elementRect = this.selectedImage.getBoundingClientRect();

        // Calculate position relative to the page
        const left = iframeRect.left + elementRect.left;
        const top = iframeRect.top + elementRect.top;

        this.overlay.style.left = left + 'px';
        this.overlay.style.top = top + 'px';
        this.overlay.style.width = elementRect.width + 'px';
        this.overlay.style.height = elementRect.height + 'px';
    }

    updateInfoDisplay() {
        if (!this.selectedImage) return;

        if (this.isBgImage) {
            const bgSize = window.getComputedStyle(this.selectedImage).backgroundSize;
            const bgPos = window.getComputedStyle(this.selectedImage).backgroundPosition;
            this.infoDisplay.textContent = `BG: ${bgSize} @ ${bgPos}`;
        } else {
            const width = Math.round(this.selectedImage.offsetWidth);
            const height = Math.round(this.selectedImage.offsetHeight);
            this.infoDisplay.textContent = `${width} × ${height}`;
        }
    }

    // ==========================================
    // RESIZE FUNCTIONALITY
    // ==========================================

    startResize(e, handle) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.selectedImage) return;

        this.isResizing = true;
        this.activeHandle = handle;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startWidth = this.selectedImage.offsetWidth;
        this.startHeight = this.selectedImage.offsetHeight;

        // Save state for undo
        window.editor?.saveState('Resize image');

        document.body.style.cursor = this.getCursorForHandle(handle);
        this.overlay.classList.add('resizing');
    }

    handleResize(e) {
        if (!this.isResizing || !this.selectedImage) return;

        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;

        let newWidth = this.startWidth;
        let newHeight = this.startHeight;

        // Calculate new dimensions based on which handle is being dragged
        switch (this.activeHandle) {
            case 'e':
                newWidth = this.startWidth + deltaX;
                if (this.maintainAspectRatio) {
                    newHeight = newWidth / this.aspectRatio;
                }
                break;
            case 'w':
                newWidth = this.startWidth - deltaX;
                if (this.maintainAspectRatio) {
                    newHeight = newWidth / this.aspectRatio;
                }
                break;
            case 's':
                newHeight = this.startHeight + deltaY;
                if (this.maintainAspectRatio) {
                    newWidth = newHeight * this.aspectRatio;
                }
                break;
            case 'n':
                newHeight = this.startHeight - deltaY;
                if (this.maintainAspectRatio) {
                    newWidth = newHeight * this.aspectRatio;
                }
                break;
            case 'se':
                if (this.maintainAspectRatio) {
                    const avgDelta = (deltaX + deltaY) / 2;
                    newWidth = this.startWidth + avgDelta;
                    newHeight = newWidth / this.aspectRatio;
                } else {
                    newWidth = this.startWidth + deltaX;
                    newHeight = this.startHeight + deltaY;
                }
                break;
            case 'sw':
                if (this.maintainAspectRatio) {
                    const avgDelta = (-deltaX + deltaY) / 2;
                    newWidth = this.startWidth + avgDelta;
                    newHeight = newWidth / this.aspectRatio;
                } else {
                    newWidth = this.startWidth - deltaX;
                    newHeight = this.startHeight + deltaY;
                }
                break;
            case 'ne':
                if (this.maintainAspectRatio) {
                    const avgDelta = (deltaX - deltaY) / 2;
                    newWidth = this.startWidth + avgDelta;
                    newHeight = newWidth / this.aspectRatio;
                } else {
                    newWidth = this.startWidth + deltaX;
                    newHeight = this.startHeight - deltaY;
                }
                break;
            case 'nw':
                if (this.maintainAspectRatio) {
                    const avgDelta = (-deltaX - deltaY) / 2;
                    newWidth = this.startWidth + avgDelta;
                    newHeight = newWidth / this.aspectRatio;
                } else {
                    newWidth = this.startWidth - deltaX;
                    newHeight = this.startHeight - deltaY;
                }
                break;
        }

        // Apply minimum size constraints
        newWidth = Math.max(20, newWidth);
        newHeight = Math.max(20, newHeight);

        // Apply the new dimensions
        if (this.isBgImage) {
            this.selectedImage.style.backgroundSize = `${newWidth}px ${newHeight}px`;
        } else {
            this.selectedImage.style.width = newWidth + 'px';
            this.selectedImage.style.height = newHeight + 'px';
        }

        this.updateOverlayPosition();
        this.updateInfoDisplay();
    }

    getCursorForHandle(handle) {
        const cursors = {
            'nw': 'nw-resize',
            'n': 'n-resize',
            'ne': 'ne-resize',
            'e': 'e-resize',
            'se': 'se-resize',
            's': 's-resize',
            'sw': 'sw-resize',
            'w': 'w-resize'
        };
        return cursors[handle] || 'default';
    }

    // ==========================================
    // DRAG FUNCTIONALITY (for repositioning)
    // ==========================================

    startDrag(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.selectedImage) return;

        // Only allow dragging if the image has position that allows it
        const position = window.getComputedStyle(this.selectedImage).position;
        if (position === 'static') {
            // Make it relative so it can be moved
            this.selectedImage.style.position = 'relative';
        }

        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;

        const rect = this.selectedImage.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(this.selectedImage);
        this.startLeft = parseInt(computedStyle.left) || 0;
        this.startTop = parseInt(computedStyle.top) || 0;

        // Save state for undo
        window.editor?.saveState('Move image');

        document.body.style.cursor = 'move';
        this.overlay.classList.add('dragging');
    }

    handleDrag(e) {
        if (!this.isDragging || !this.selectedImage) return;

        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;

        this.selectedImage.style.left = (this.startLeft + deltaX) + 'px';
        this.selectedImage.style.top = (this.startTop + deltaY) + 'px';

        this.updateOverlayPosition();
    }

    // ==========================================
    // BACKGROUND IMAGE DRAG (position adjustment)
    // ==========================================

    startBgDrag(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.selectedImage) return;

        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;

        // Parse current background position
        const bgPos = window.getComputedStyle(this.selectedImage).backgroundPosition;
        const parts = bgPos.split(' ');
        this.bgStartX = parseInt(parts[0]) || 0;
        this.bgStartY = parseInt(parts[1]) || 0;

        // Save state for undo
        window.editor?.saveState('Adjust background position');

        document.body.style.cursor = 'move';
        this.overlay.classList.add('dragging');
    }

    handleBgDrag(e) {
        if (!this.isDragging || !this.selectedImage || !this.isBgImage) return;

        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;

        const newX = this.bgStartX + deltaX;
        const newY = this.bgStartY + deltaY;

        this.selectedImage.style.backgroundPosition = `${newX}px ${newY}px`;

        this.updateInfoDisplay();
    }

    // ==========================================
    // MOUSE EVENTS
    // ==========================================

    onMouseMove(e) {
        if (this.isResizing) {
            this.handleResize(e);
        } else if (this.isDragging) {
            if (this.isBgImage) {
                this.handleBgDrag(e);
            } else {
                this.handleDrag(e);
            }
        }
    }

    onMouseUp(e) {
        if (this.isResizing || this.isDragging) {
            this.isResizing = false;
            this.isDragging = false;
            this.activeHandle = null;
            document.body.style.cursor = '';
            this.overlay.classList.remove('resizing', 'dragging');

            // Update the properties panel
            if (window.visualBuilder && this.selectedImage) {
                window.visualBuilder.renderSmartProperties(this.selectedImage);
            }
        }
    }

    // ==========================================
    // TOOLBAR ACTIONS
    // ==========================================

    handleToolbarAction(action) {
        if (!this.selectedImage) return;

        switch (action) {
            case 'aspectRatio':
                this.toggleAspectRatio();
                break;
            case 'fitContainer':
                this.fitToContainer();
                break;
            case 'resetSize':
                this.resetToOriginal();
                break;
        }
    }

    toggleAspectRatio() {
        this.maintainAspectRatio = !this.maintainAspectRatio;

        const lockedIcon = this.toolbar.querySelector('.icon-locked');
        const unlockedIcon = this.toolbar.querySelector('.icon-unlocked');

        if (this.maintainAspectRatio) {
            lockedIcon.style.display = '';
            unlockedIcon.style.display = 'none';
        } else {
            lockedIcon.style.display = 'none';
            unlockedIcon.style.display = '';
        }

        window.editor?.showToast(this.maintainAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked');
    }

    fitToContainer() {
        if (!this.selectedImage) return;

        window.editor?.saveState('Fit image to container');

        if (this.isBgImage) {
            this.selectedImage.style.backgroundSize = 'cover';
            this.selectedImage.style.backgroundPosition = 'center';
        } else {
            const parent = this.selectedImage.parentElement;
            if (parent) {
                this.selectedImage.style.width = '100%';
                this.selectedImage.style.height = 'auto';
                this.selectedImage.style.objectFit = 'cover';
            }
        }

        this.updateOverlayPosition();
        this.updateInfoDisplay();
        window.editor?.showToast('Image fit to container');

        // Update properties panel
        if (window.visualBuilder) {
            window.visualBuilder.renderSmartProperties(this.selectedImage);
        }
    }

    resetToOriginal() {
        if (!this.selectedImage) return;

        window.editor?.saveState('Reset image size');

        if (this.isBgImage) {
            this.selectedImage.style.backgroundSize = 'auto';
            this.selectedImage.style.backgroundPosition = 'center';
        } else {
            const originalWidth = this.selectedImage.dataset.originalWidth;
            const originalHeight = this.selectedImage.dataset.originalHeight;

            if (originalWidth && originalHeight) {
                this.selectedImage.style.width = originalWidth + 'px';
                this.selectedImage.style.height = originalHeight + 'px';
            } else {
                this.selectedImage.style.width = '';
                this.selectedImage.style.height = '';
            }

            this.selectedImage.style.left = '';
            this.selectedImage.style.top = '';
            this.selectedImage.style.position = '';
        }

        // Recalculate aspect ratio
        this.aspectRatio = this.selectedImage.offsetWidth / this.selectedImage.offsetHeight;

        this.updateOverlayPosition();
        this.updateInfoDisplay();
        window.editor?.showToast('Image reset to original');

        // Update properties panel
        if (window.visualBuilder) {
            window.visualBuilder.renderSmartProperties(this.selectedImage);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageManipulator = new ImageManipulator();
    });
} else {
    window.imageManipulator = new ImageManipulator();
}
