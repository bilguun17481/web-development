// ==========================================
// ELEMENT MANAGER
// Delete, Add, Copy/Paste, Drag & Drop for all elements
// ==========================================

class ElementManager {
    constructor() {
        this.clipboard = null;
        this.clipboardHTML = null;
        this.draggedElement = null;
        this.dropIndicator = null;
        this.contextMenu = null;
        this.insertMenu = null;
        this.isDragging = false;
        this.dragStartPos = { x: 0, y: 0 };
        this.dragThreshold = 5;

        // Container templates
        this.containerTemplates = {
            // Layout containers
            section: {
                name: 'Section',
                icon: '📦',
                html: `<section class="custom-section" style="padding: 60px 20px; min-height: 200px;">
                    <div class="container" style="max-width: 1200px; margin: 0 auto;">
                        <h2 style="text-align: center; margin-bottom: 20px;">New Section</h2>
                        <p style="text-align: center; color: #666;">Add your content here</p>
                    </div>
                </section>`
            },
            container: {
                name: 'Container',
                icon: '📋',
                html: `<div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
                    <p>Container content</p>
                </div>`
            },
            row: {
                name: 'Row (Flex)',
                icon: '↔️',
                html: `<div class="flex-row" style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px; padding: 20px; background: #f5f5f5; border-radius: 8px;">Column 1</div>
                    <div style="flex: 1; min-width: 200px; padding: 20px; background: #f5f5f5; border-radius: 8px;">Column 2</div>
                </div>`
            },
            grid2: {
                name: '2-Column Grid',
                icon: '⊞',
                html: `<div class="grid-2col" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">Grid Item 1</div>
                    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">Grid Item 2</div>
                </div>`
            },
            grid3: {
                name: '3-Column Grid',
                icon: '⊟',
                html: `<div class="grid-3col" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">Grid Item 1</div>
                    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">Grid Item 2</div>
                    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">Grid Item 3</div>
                </div>`
            },
            grid4: {
                name: '4-Column Grid',
                icon: '▦',
                html: `<div class="grid-4col" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
                    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">Item 1</div>
                    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">Item 2</div>
                    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">Item 3</div>
                    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">Item 4</div>
                </div>`
            },

            // Content blocks
            card: {
                name: 'Card',
                icon: '🃏',
                html: `<div class="card" style="background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); overflow: hidden;">
                    <div style="height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
                    <div style="padding: 20px;">
                        <h3 style="margin: 0 0 10px 0;">Card Title</h3>
                        <p style="color: #666; margin: 0;">Card description goes here</p>
                    </div>
                </div>`
            },
            featureBox: {
                name: 'Feature Box',
                icon: '⭐',
                html: `<div class="feature-box" style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 12px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🚀</div>
                    <h3 style="margin: 0 0 10px 0;">Feature Title</h3>
                    <p style="color: #666; margin: 0;">Describe your feature here</p>
                </div>`
            },
            testimonial: {
                name: 'Testimonial',
                icon: '💬',
                html: `<div class="testimonial" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
                    <p style="font-style: italic; color: #555; margin: 0 0 20px 0; font-size: 1.1rem;">"This is an amazing product! Highly recommended."</p>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 50px; height: 50px; border-radius: 50%; background: #667eea;"></div>
                        <div>
                            <strong style="display: block;">John Doe</strong>
                            <span style="color: #888; font-size: 0.9rem;">CEO, Company</span>
                        </div>
                    </div>
                </div>`
            },
            pricingCard: {
                name: 'Pricing Card',
                icon: '💳',
                html: `<div class="pricing-card" style="background: white; border-radius: 16px; padding: 30px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <h3 style="margin: 0 0 10px 0; color: #333;">Pro Plan</h3>
                    <div style="font-size: 2.5rem; font-weight: bold; color: #667eea; margin: 20px 0;">$29<span style="font-size: 1rem; color: #888;">/mo</span></div>
                    <ul style="list-style: none; padding: 0; margin: 20px 0; text-align: left;">
                        <li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ Feature one</li>
                        <li style="padding: 8px 0; border-bottom: 1px solid #eee;">✓ Feature two</li>
                        <li style="padding: 8px 0;">✓ Feature three</li>
                    </ul>
                    <button style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer;">Get Started</button>
                </div>`
            },

            // Hero sections
            heroBasic: {
                name: 'Hero Basic',
                icon: '🎯',
                html: `<section class="hero" style="padding: 100px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; color: white;">
                    <div style="max-width: 800px; margin: 0 auto;">
                        <h1 style="font-size: 3rem; margin: 0 0 20px 0;">Welcome to Our Site</h1>
                        <p style="font-size: 1.2rem; opacity: 0.9; margin: 0 0 30px 0;">Create something amazing with our tools</p>
                        <button style="padding: 15px 40px; background: white; color: #667eea; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer;">Get Started</button>
                    </div>
                </section>`
            },
            heroSplit: {
                name: 'Hero Split',
                icon: '🖼️',
                html: `<section class="hero-split" style="display: flex; min-height: 500px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px; padding: 60px 40px; display: flex; flex-direction: column; justify-content: center;">
                        <h1 style="font-size: 2.5rem; margin: 0 0 20px 0;">Headline Here</h1>
                        <p style="color: #666; margin: 0 0 30px 0;">Your compelling description that makes visitors want to learn more.</p>
                        <div><button style="padding: 12px 30px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Learn More</button></div>
                    </div>
                    <div style="flex: 1; min-width: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
                </section>`
            },

            // Content elements
            heading: {
                name: 'Heading',
                icon: 'H',
                html: `<h2 style="font-size: 2rem; margin: 20px 0;">New Heading</h2>`
            },
            paragraph: {
                name: 'Paragraph',
                icon: '¶',
                html: `<p style="line-height: 1.6; color: #555;">Add your paragraph text here. You can edit this text directly on the canvas.</p>`
            },
            image: {
                name: 'Image',
                icon: '🖼️',
                html: `<img src="https://via.placeholder.com/600x400" alt="Placeholder" style="max-width: 100%; height: auto; border-radius: 8px;">`
            },
            button: {
                name: 'Button',
                icon: '🔘',
                html: `<button style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">Click Me</button>`
            },
            divider: {
                name: 'Divider',
                icon: '➖',
                html: `<hr style="border: none; border-top: 2px solid #eee; margin: 30px 0;">`
            },
            spacer: {
                name: 'Spacer',
                icon: '↕️',
                html: `<div class="spacer" style="height: 60px;"></div>`
            },
            list: {
                name: 'List',
                icon: '📝',
                html: `<ul style="padding-left: 20px; line-height: 1.8;">
                    <li>List item one</li>
                    <li>List item two</li>
                    <li>List item three</li>
                </ul>`
            },
            video: {
                name: 'Video Embed',
                icon: '▶️',
                html: `<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; background: #000;">
                    <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
                </div>`
            },

            // Form elements
            form: {
                name: 'Contact Form',
                icon: '📧',
                html: `<form class="contact-form" style="max-width: 500px; padding: 30px; background: #f8f9fa; border-radius: 12px;">
                    <h3 style="margin: 0 0 20px 0;">Contact Us</h3>
                    <div style="margin-bottom: 15px;">
                        <input type="text" placeholder="Your Name" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <input type="email" placeholder="Your Email" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <textarea placeholder="Your Message" rows="4" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea>
                    </div>
                    <button type="submit" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer;">Send Message</button>
                </form>`
            },

            // Navigation
            navbar: {
                name: 'Navigation Bar',
                icon: '🧭',
                html: `<nav style="display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="font-weight: bold; font-size: 1.5rem;">Logo</div>
                    <div style="display: flex; gap: 30px;">
                        <a href="#" style="text-decoration: none; color: #333;">Home</a>
                        <a href="#" style="text-decoration: none; color: #333;">About</a>
                        <a href="#" style="text-decoration: none; color: #333;">Services</a>
                        <a href="#" style="text-decoration: none; color: #333;">Contact</a>
                    </div>
                </nav>`
            },

            // Footer
            footer: {
                name: 'Footer',
                icon: '🦶',
                html: `<footer style="background: #1a1a2e; color: white; padding: 60px 20px 30px;">
                    <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px;">
                        <div>
                            <h4 style="margin: 0 0 15px 0;">Company</h4>
                            <p style="color: #aaa; margin: 0;">Building amazing things together.</p>
                        </div>
                        <div>
                            <h4 style="margin: 0 0 15px 0;">Links</h4>
                            <a href="#" style="display: block; color: #aaa; text-decoration: none; margin-bottom: 8px;">About</a>
                            <a href="#" style="display: block; color: #aaa; text-decoration: none; margin-bottom: 8px;">Services</a>
                            <a href="#" style="display: block; color: #aaa; text-decoration: none;">Contact</a>
                        </div>
                        <div>
                            <h4 style="margin: 0 0 15px 0;">Contact</h4>
                            <p style="color: #aaa; margin: 0 0 8px 0;">email@example.com</p>
                            <p style="color: #aaa; margin: 0;">+1 234 567 890</p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; color: #666;">
                        © 2024 Company. All rights reserved.
                    </div>
                </footer>`
            }
        };

        this.init();
    }

    init() {
        this.createContextMenu();
        this.createInsertMenu();
        this.createDropIndicator();
        this.setupEventListeners();
    }

    // ==========================================
    // UI CREATION
    // ==========================================

    createContextMenu() {
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'element-context-menu';
        this.contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="copy">
                <span class="context-icon">📋</span> Copy
                <span class="context-shortcut">Ctrl+C</span>
            </div>
            <div class="context-menu-item" data-action="cut">
                <span class="context-icon">✂️</span> Cut
                <span class="context-shortcut">Ctrl+X</span>
            </div>
            <div class="context-menu-item" data-action="paste">
                <span class="context-icon">📄</span> Paste
                <span class="context-shortcut">Ctrl+V</span>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="duplicate">
                <span class="context-icon">⧉</span> Duplicate
                <span class="context-shortcut">Ctrl+D</span>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="insertBefore">
                <span class="context-icon">⬆️</span> Insert Before
            </div>
            <div class="context-menu-item" data-action="insertAfter">
                <span class="context-icon">⬇️</span> Insert After
            </div>
            <div class="context-menu-item" data-action="insertInto">
                <span class="context-icon">📥</span> Insert Into
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item" data-action="moveUp">
                <span class="context-icon">↑</span> Move Up
            </div>
            <div class="context-menu-item" data-action="moveDown">
                <span class="context-icon">↓</span> Move Down
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item context-menu-item-danger" data-action="delete">
                <span class="context-icon">🗑️</span> Delete
                <span class="context-shortcut">Del</span>
            </div>
        `;
        this.contextMenu.style.display = 'none';
        document.body.appendChild(this.contextMenu);

        // Add click handlers
        this.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.dataset.action;
                if (action === 'insertBefore' || action === 'insertAfter' || action === 'insertInto') {
                    this.showInsertMenu(action);
                } else {
                    this.handleContextAction(action);
                }
                this.hideContextMenu();
            });
        });
    }

    createInsertMenu() {
        this.insertMenu = document.createElement('div');
        this.insertMenu.className = 'element-insert-menu';

        // Group templates by category
        const categories = {
            'Layout': ['section', 'container', 'row', 'grid2', 'grid3', 'grid4'],
            'Content Blocks': ['card', 'featureBox', 'testimonial', 'pricingCard'],
            'Hero Sections': ['heroBasic', 'heroSplit'],
            'Elements': ['heading', 'paragraph', 'image', 'button', 'divider', 'spacer', 'list', 'video'],
            'Forms': ['form'],
            'Navigation': ['navbar', 'footer']
        };

        let menuHTML = `
            <div class="insert-menu-header">
                <span>Insert Element</span>
                <button class="insert-menu-close">✕</button>
            </div>
            <div class="insert-menu-search">
                <input type="text" placeholder="Search elements..." class="insert-search-input">
            </div>
            <div class="insert-menu-content">
        `;

        for (const [category, templates] of Object.entries(categories)) {
            menuHTML += `
                <div class="insert-category">
                    <div class="insert-category-title">${category}</div>
                    <div class="insert-category-items">
            `;
            templates.forEach(key => {
                const template = this.containerTemplates[key];
                if (template) {
                    menuHTML += `
                        <div class="insert-menu-item" data-template="${key}">
                            <span class="insert-icon">${template.icon}</span>
                            <span class="insert-name">${template.name}</span>
                        </div>
                    `;
                }
            });
            menuHTML += `</div></div>`;
        }

        menuHTML += `</div>`;
        this.insertMenu.innerHTML = menuHTML;
        this.insertMenu.style.display = 'none';
        document.body.appendChild(this.insertMenu);

        // Close button
        this.insertMenu.querySelector('.insert-menu-close').addEventListener('click', () => {
            this.hideInsertMenu();
        });

        // Search functionality
        const searchInput = this.insertMenu.querySelector('.insert-search-input');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.insertMenu.querySelectorAll('.insert-menu-item').forEach(item => {
                const name = item.querySelector('.insert-name').textContent.toLowerCase();
                item.style.display = name.includes(query) ? 'flex' : 'none';
            });
            // Hide empty categories
            this.insertMenu.querySelectorAll('.insert-category').forEach(cat => {
                const visibleItems = cat.querySelectorAll('.insert-menu-item[style*="flex"], .insert-menu-item:not([style*="display"])');
                cat.style.display = visibleItems.length > 0 ? 'block' : 'none';
            });
        });

        // Item click handlers
        this.insertMenu.querySelectorAll('.insert-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const templateKey = item.dataset.template;
                this.insertElement(templateKey, this.insertPosition);
                this.hideInsertMenu();
            });
        });
    }

    createDropIndicator() {
        this.dropIndicator = document.createElement('div');
        this.dropIndicator.className = 'element-drop-indicator';
        this.dropIndicator.style.display = 'none';
        document.body.appendChild(this.dropIndicator);
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Skip if in input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            const selectedElement = window.editor?.selectedElement;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedElement && !e.target.isContentEditable) {
                    e.preventDefault();
                    this.deleteElement(selectedElement);
                }
            } else if (e.ctrlKey || e.metaKey) {
                if (e.key === 'c') {
                    if (selectedElement) {
                        e.preventDefault();
                        this.copyElement(selectedElement);
                    }
                } else if (e.key === 'x') {
                    if (selectedElement) {
                        e.preventDefault();
                        this.cutElement(selectedElement);
                    }
                } else if (e.key === 'v') {
                    e.preventDefault();
                    this.pasteElement(selectedElement);
                } else if (e.key === 'd') {
                    if (selectedElement) {
                        e.preventDefault();
                        this.duplicateElement(selectedElement);
                    }
                }
            }
        });

        // Hide context menu on click outside
        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
            if (!this.insertMenu.contains(e.target)) {
                this.hideInsertMenu();
            }
        });

        // Setup iframe event listeners after load
        const iframe = document.getElementById('editorFrame');
        if (iframe) {
            const setupIframeListeners = () => {
                const iframeDoc = iframe.contentDocument;
                if (iframeDoc) {
                    // Context menu in iframe
                    iframeDoc.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        const selectedElement = window.editor?.selectedElement;
                        if (selectedElement) {
                            this.showContextMenu(e.clientX, e.clientY, iframe);
                        }
                    });

                    // Setup drag and drop
                    this.setupDragAndDrop(iframeDoc);
                }
            };

            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                setupIframeListeners();
            }
            iframe.addEventListener('load', () => {
                setTimeout(setupIframeListeners, 500);
            });
        }

        // Escape key to close menus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideContextMenu();
                this.hideInsertMenu();
            }
        });
    }

    setupDragAndDrop(iframeDoc) {
        // Make elements draggable when selected
        iframeDoc.addEventListener('mousedown', (e) => {
            const selectedElement = window.editor?.selectedElement;
            if (!selectedElement) return;

            // Check if clicking on the selected element
            if (selectedElement.contains(e.target) || selectedElement === e.target) {
                // Don't drag if clicking on resize handles or if element is being edited
                if (e.target.classList.contains('resize-handle') || e.target.isContentEditable) {
                    return;
                }

                this.dragStartPos = { x: e.clientX, y: e.clientY };
                this.potentialDragElement = selectedElement;

                // Add move listeners
                const onMouseMove = (moveEvent) => {
                    const deltaX = Math.abs(moveEvent.clientX - this.dragStartPos.x);
                    const deltaY = Math.abs(moveEvent.clientY - this.dragStartPos.y);

                    if ((deltaX > this.dragThreshold || deltaY > this.dragThreshold) && !this.isDragging) {
                        this.startDrag(this.potentialDragElement, moveEvent);
                    }

                    if (this.isDragging) {
                        this.handleDragMove(moveEvent, iframeDoc);
                    }
                };

                const onMouseUp = (upEvent) => {
                    if (this.isDragging) {
                        this.endDrag(iframeDoc);
                    }
                    this.potentialDragElement = null;
                    iframeDoc.removeEventListener('mousemove', onMouseMove);
                    iframeDoc.removeEventListener('mouseup', onMouseUp);
                };

                iframeDoc.addEventListener('mousemove', onMouseMove);
                iframeDoc.addEventListener('mouseup', onMouseUp);
            }
        });
    }

    // ==========================================
    // DRAG AND DROP
    // ==========================================

    startDrag(element, e) {
        this.isDragging = true;
        this.draggedElement = element;

        // Save state for undo
        window.editor?.saveState('Move element');

        // Add dragging class
        element.classList.add('element-dragging');

        // Show visual feedback
        this.dropIndicator.style.display = 'block';
    }

    handleDragMove(e, iframeDoc) {
        if (!this.isDragging || !this.draggedElement) return;

        const iframe = document.getElementById('editorFrame');
        const iframeRect = iframe.getBoundingClientRect();

        // Find drop target
        const elementsUnderMouse = iframeDoc.elementsFromPoint(e.clientX, e.clientY);
        let dropTarget = null;
        let dropPosition = 'after';

        for (const el of elementsUnderMouse) {
            if (el === this.draggedElement || this.draggedElement.contains(el)) continue;
            if (el.tagName === 'BODY' || el.tagName === 'HTML') continue;

            dropTarget = el;
            break;
        }

        if (dropTarget) {
            const rect = dropTarget.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;

            dropPosition = e.clientY < midY ? 'before' : 'after';

            // Update drop indicator position
            const indicatorY = dropPosition === 'before' ? rect.top : rect.bottom;
            this.dropIndicator.style.left = (iframeRect.left + rect.left) + 'px';
            this.dropIndicator.style.top = (iframeRect.top + indicatorY) + 'px';
            this.dropIndicator.style.width = rect.width + 'px';

            this.currentDropTarget = dropTarget;
            this.currentDropPosition = dropPosition;
        }
    }

    endDrag(iframeDoc) {
        if (!this.isDragging || !this.draggedElement) return;

        // Remove dragging class
        this.draggedElement.classList.remove('element-dragging');

        // Perform the move if we have a valid drop target
        if (this.currentDropTarget && this.currentDropTarget !== this.draggedElement) {
            if (this.currentDropPosition === 'before') {
                this.currentDropTarget.parentNode.insertBefore(this.draggedElement, this.currentDropTarget);
            } else {
                this.currentDropTarget.parentNode.insertBefore(this.draggedElement, this.currentDropTarget.nextSibling);
            }

            window.editor?.showToast('Element moved');
        }

        // Hide drop indicator
        this.dropIndicator.style.display = 'none';

        // Reset state
        this.isDragging = false;
        this.draggedElement = null;
        this.currentDropTarget = null;
        this.currentDropPosition = null;

        // Re-initialize interactions
        setTimeout(() => {
            window.editor?.initializeIframeInteractions();
        }, 100);
    }

    // ==========================================
    // COPY/PASTE/CUT
    // ==========================================

    copyElement(element) {
        if (!element) return;

        // Clone the element without builder attributes
        const clone = element.cloneNode(true);
        this.cleanElementForClipboard(clone);

        this.clipboard = clone;
        this.clipboardHTML = clone.outerHTML;

        window.editor?.showToast('Element copied');
    }

    cutElement(element) {
        if (!element) return;

        this.copyElement(element);
        this.deleteElement(element, false);

        window.editor?.showToast('Element cut');
    }

    pasteElement(targetElement) {
        if (!this.clipboard) {
            window.editor?.showToast('Nothing to paste');
            return;
        }

        const iframe = document.getElementById('editorFrame');
        const iframeDoc = iframe?.contentDocument;
        if (!iframeDoc) return;

        window.editor?.saveState('Paste element');

        // Create new element from clipboard
        const newElement = this.clipboard.cloneNode(true);

        if (targetElement) {
            // Paste after target element
            targetElement.parentNode.insertBefore(newElement, targetElement.nextSibling);
        } else {
            // Paste at the end of body
            iframeDoc.body.appendChild(newElement);
        }

        // Re-initialize interactions
        setTimeout(() => {
            window.editor?.initializeIframeInteractions();
            window.editor?.selectElement(newElement);
        }, 100);

        window.editor?.showToast('Element pasted');
    }

    duplicateElement(element) {
        if (!element) return;

        window.editor?.saveState('Duplicate element');

        // Clone without builder attributes
        const clone = element.cloneNode(true);
        this.cleanElementForClipboard(clone);

        // Insert after original
        element.parentNode.insertBefore(clone, element.nextSibling);

        // Re-initialize interactions
        setTimeout(() => {
            window.editor?.initializeIframeInteractions();
            window.editor?.selectElement(clone);
        }, 100);

        window.editor?.showToast('Element duplicated');
    }

    cleanElementForClipboard(element) {
        // Remove builder-specific attributes
        element.removeAttribute('data-builder-init');
        element.removeAttribute('data-element-type');
        element.classList.remove('builder-selected', 'builder-hover');

        // Clean all child elements too
        element.querySelectorAll('*').forEach(child => {
            child.removeAttribute('data-builder-init');
            child.removeAttribute('data-element-type');
            child.classList.remove('builder-selected', 'builder-hover');
        });
    }

    // ==========================================
    // DELETE
    // ==========================================

    deleteElement(element, showToast = true) {
        if (!element) return;

        // Prevent deleting body or html
        if (element.tagName === 'BODY' || element.tagName === 'HTML') {
            window.editor?.showToast('Cannot delete this element');
            return;
        }

        window.editor?.saveState('Delete element');

        // Deselect first
        window.editor?.deselectElement();

        // Remove the element
        element.remove();

        if (showToast) {
            window.editor?.showToast('Element deleted');
        }

        // Update history
        window.editor?.addToHistory('Deleted element');
    }

    // ==========================================
    // INSERT
    // ==========================================

    insertElement(templateKey, position = 'after') {
        const template = this.containerTemplates[templateKey];
        if (!template) return;

        const iframe = document.getElementById('editorFrame');
        const iframeDoc = iframe?.contentDocument;
        if (!iframeDoc) return;

        window.editor?.saveState('Insert element');

        // Create element from template
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = template.html.trim();
        const newElement = tempContainer.firstChild;

        const targetElement = window.editor?.selectedElement;

        if (targetElement) {
            switch (position) {
                case 'before':
                    targetElement.parentNode.insertBefore(newElement, targetElement);
                    break;
                case 'after':
                    targetElement.parentNode.insertBefore(newElement, targetElement.nextSibling);
                    break;
                case 'into':
                    targetElement.appendChild(newElement);
                    break;
            }
        } else {
            // No selection - add to body
            iframeDoc.body.appendChild(newElement);
        }

        // Re-initialize and select new element
        setTimeout(() => {
            window.editor?.initializeIframeInteractions();
            window.editor?.selectElement(newElement);
        }, 100);

        window.editor?.showToast(`${template.name} inserted`);
    }

    // ==========================================
    // MOVE UP/DOWN
    // ==========================================

    moveUp(element) {
        if (!element) return;

        const prev = element.previousElementSibling;
        if (prev) {
            window.editor?.saveState('Move element up');
            element.parentNode.insertBefore(element, prev);
            window.editor?.showToast('Element moved up');
        }
    }

    moveDown(element) {
        if (!element) return;

        const next = element.nextElementSibling;
        if (next) {
            window.editor?.saveState('Move element down');
            element.parentNode.insertBefore(next, element);
            window.editor?.showToast('Element moved down');
        }
    }

    // ==========================================
    // CONTEXT MENU
    // ==========================================

    showContextMenu(x, y, iframe) {
        const iframeRect = iframe.getBoundingClientRect();
        const menuX = iframeRect.left + x;
        const menuY = iframeRect.top + y;

        // Position menu
        this.contextMenu.style.left = menuX + 'px';
        this.contextMenu.style.top = menuY + 'px';
        this.contextMenu.style.display = 'block';

        // Adjust if off screen
        const menuRect = this.contextMenu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            this.contextMenu.style.left = (menuX - menuRect.width) + 'px';
        }
        if (menuRect.bottom > window.innerHeight) {
            this.contextMenu.style.top = (menuY - menuRect.height) + 'px';
        }

        // Update paste state
        const pasteItem = this.contextMenu.querySelector('[data-action="paste"]');
        if (pasteItem) {
            pasteItem.classList.toggle('disabled', !this.clipboard);
        }
    }

    hideContextMenu() {
        this.contextMenu.style.display = 'none';
    }

    handleContextAction(action) {
        const element = window.editor?.selectedElement;

        switch (action) {
            case 'copy':
                this.copyElement(element);
                break;
            case 'cut':
                this.cutElement(element);
                break;
            case 'paste':
                this.pasteElement(element);
                break;
            case 'duplicate':
                this.duplicateElement(element);
                break;
            case 'delete':
                this.deleteElement(element);
                break;
            case 'moveUp':
                this.moveUp(element);
                break;
            case 'moveDown':
                this.moveDown(element);
                break;
        }
    }

    // ==========================================
    // INSERT MENU
    // ==========================================

    showInsertMenu(position) {
        this.insertPosition = position;

        // Position near context menu or center
        const rect = this.contextMenu.getBoundingClientRect();
        this.insertMenu.style.left = rect.left + 'px';
        this.insertMenu.style.top = rect.top + 'px';
        this.insertMenu.style.display = 'block';

        // Clear search
        const searchInput = this.insertMenu.querySelector('.insert-search-input');
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));

        // Focus search
        setTimeout(() => searchInput.focus(), 100);
    }

    hideInsertMenu() {
        this.insertMenu.style.display = 'none';
    }

    // ==========================================
    // PUBLIC API - For toolbar buttons
    // ==========================================

    addElementToPage(templateKey) {
        this.insertElement(templateKey, 'after');
    }

    deleteSelectedElement() {
        const element = window.editor?.selectedElement;
        if (element) {
            this.deleteElement(element);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.elementManager = new ElementManager();
    });
} else {
    window.elementManager = new ElementManager();
}
