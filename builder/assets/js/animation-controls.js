// ==========================================
// ANIMATION CONTROLS
// ==========================================

class AnimationController {
    constructor() {
        this.currentAnimation = {
            type: 'none',
            duration: 600,
            delay: 0,
            easing: 'ease'
        };

        this.init();
    }

    init() {
        this.setupAnimationControls();
        this.setupPreview();
        this.addAnimationStyles();
    }

    setupAnimationControls() {
        const typeSelect = document.getElementById('animationType');
        const durationRange = document.getElementById('animationDuration');
        const durationValue = document.getElementById('durationValue');
        const delayRange = document.getElementById('animationDelay');
        const delayValue = document.getElementById('delayValue');
        const easingSelect = document.getElementById('animationEasing');
        const applyBtn = document.getElementById('applyAnimationBtn');
        const previewBtn = document.getElementById('previewAnimationBtn');

        if (!typeSelect || !durationRange || !delayRange || !easingSelect) return;

        // Update values on change
        typeSelect.addEventListener('change', (e) => {
            this.currentAnimation.type = e.target.value;
            this.updatePreview();
        });

        durationRange.addEventListener('input', (e) => {
            this.currentAnimation.duration = parseInt(e.target.value);
            durationValue.textContent = `${e.target.value}ms`;
            this.updatePreview();
        });

        delayRange.addEventListener('input', (e) => {
            this.currentAnimation.delay = parseInt(e.target.value);
            delayValue.textContent = `${e.target.value}ms`;
            this.updatePreview();
        });

        easingSelect.addEventListener('change', (e) => {
            this.currentAnimation.easing = e.target.value;
            this.updatePreview();
        });

        // Apply animation to selected element
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyAnimation();
            });
        }

        // Preview animation
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.playPreview();
            });
        }
    }

    setupPreview() {
        this.previewElement = document.querySelector('.preview-element');
    }

    updatePreview() {
        if (!this.previewElement) return;

        // Remove all animation classes
        this.previewElement.className = 'preview-element';

        // Apply animation style
        this.previewElement.style.animation = 'none';
        this.previewElement.offsetHeight; // Trigger reflow

        if (this.currentAnimation.type !== 'none') {
            const animation = `${this.currentAnimation.type} ${this.currentAnimation.duration}ms ${this.currentAnimation.easing} ${this.currentAnimation.delay}ms forwards`;
            this.previewElement.style.animation = animation;
        }
    }

    playPreview() {
        this.updatePreview();

        // Reset after animation completes
        setTimeout(() => {
            if (this.previewElement) {
                this.previewElement.style.animation = 'none';
                this.previewElement.offsetHeight;
                this.updatePreview();
            }
        }, this.currentAnimation.duration + this.currentAnimation.delay + 100);
    }

    applyAnimation() {
        const selectedElement = window.editor.selectedElement;

        if (!selectedElement) {
            window.editor.showToast('Please select an element first');
            return;
        }

        if (!window.AuthSystem.hasPermission('edit')) {
            window.editor.showToast('You don\'t have permission to edit animations');
            return;
        }

        // Remove existing animation classes
        selectedElement.classList.remove('fade-in', 'slide-in-left', 'slide-in-right', 'slide-in-up', 'slide-in-down', 'zoom-in', 'bounce');

        if (this.currentAnimation.type !== 'none') {
            // Add new animation class
            selectedElement.classList.add(this.currentAnimation.type);

            // Set custom properties
            selectedElement.style.setProperty('--animation-duration', `${this.currentAnimation.duration}ms`);
            selectedElement.style.setProperty('--animation-delay', `${this.currentAnimation.delay}ms`);
            selectedElement.style.setProperty('--animation-easing', this.currentAnimation.easing);

            // Apply animation
            selectedElement.style.animation = `${this.currentAnimation.type} ${this.currentAnimation.duration}ms ${this.currentAnimation.easing} ${this.currentAnimation.delay}ms forwards`;

            window.editor.addToHistory(`Applied animation: ${this.currentAnimation.type}`);
            window.editor.showToast('Animation applied!');
        } else {
            selectedElement.style.animation = 'none';
            window.editor.addToHistory('Removed animation');
            window.editor.showToast('Animation removed');
        }
    }

    addAnimationStyles() {
        // Add animation keyframes to iframe
        setTimeout(() => {
            this.injectAnimationStyles();
        }, 1000);

        const iframe = document.getElementById('editorFrame');
        if (iframe) {
            iframe.addEventListener('load', () => {
                setTimeout(() => {
                    this.injectAnimationStyles();
                }, 800);
            });
        }
    }

    injectAnimationStyles() {
        const iframe = document.getElementById('editorFrame');
        if (!iframe) return;

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Check if styles already exist
        if (iframeDoc.getElementById('builder-animations')) return;

        const style = iframeDoc.createElement('style');
        style.id = 'builder-animations';
        style.textContent = `
            /* Builder Animation Keyframes */
            @keyframes fade-in {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            @keyframes slide-in-left {
                from {
                    opacity: 0;
                    transform: translateX(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes slide-in-right {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes slide-in-up {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes slide-in-down {
                from {
                    opacity: 0;
                    transform: translateY(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes zoom-in {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-20px);
                }
                60% {
                    transform: translateY(-10px);
                }
            }

            /* Builder helper classes */
            .builder-selected {
                outline: 2px solid #667eea !important;
                outline-offset: 2px;
            }

            .builder-hover {
                outline: 2px dashed #667eea !important;
                outline-offset: 2px;
                cursor: pointer;
            }
        `;

        iframeDoc.head.appendChild(style);
    }

    removeAnimation(element) {
        if (!element) return;

        element.classList.remove('fade-in', 'slide-in-left', 'slide-in-right', 'slide-in-up', 'slide-in-down', 'zoom-in', 'bounce');
        element.style.animation = 'none';
    }
}

// Initialize animation controller when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.animationController = new AnimationController();
    });
} else {
    window.animationController = new AnimationController();
}
