// ==========================================
// TEXT EDITING FUNCTIONALITY
// ==========================================

class TextEditor {
    constructor() {
        this.editingElement = null;
        this.originalContent = '';
        this.init();
    }

    init() {
        // Double-click to edit text will be set up in iframe
        setTimeout(() => {
            this.setupIframeTextEditing();
        }, 1000);
    }

    setupIframeTextEditing() {
        const iframe = document.getElementById('editorFrame');
        if (!iframe) return;

        iframe.addEventListener('load', () => {
            setTimeout(() => {
                this.initializeTextEditing();
            }, 700);
        });
    }

    initializeTextEditing() {
        const iframe = document.getElementById('editorFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Add double-click to edit for text elements
        const textElements = iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, span, li');

        textElements.forEach(el => {
            el.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.enableInlineEditing(el);
            });
        });
    }

    enableInlineEditing(element) {
        if (!window.AuthSystem.hasPermission('edit')) {
            window.editor.showToast('You don\'t have permission to edit content');
            return;
        }

        // If already editing, return
        if (this.editingElement) {
            this.disableInlineEditing();
        }

        this.editingElement = element;
        this.originalContent = element.textContent;

        // Make element editable
        element.contentEditable = true;
        element.style.outline = '2px solid #667eea';
        element.style.outlineOffset = '2px';
        element.focus();

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Handle keyboard events
        element.addEventListener('keydown', this.handleKeydown.bind(this));
        element.addEventListener('blur', this.handleBlur.bind(this));

        window.editor.showToast('Editing text... Press Enter to save, Esc to cancel');
    }

    handleKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.saveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.cancelEdit();
        }
    }

    handleBlur(e) {
        // Save on blur
        setTimeout(() => {
            if (this.editingElement && this.editingElement === e.target) {
                this.saveEdit();
            }
        }, 100);
    }

    saveEdit() {
        if (!this.editingElement) return;

        const newContent = this.editingElement.textContent.trim();

        if (newContent !== this.originalContent) {
            // Save state before changing text
            window.editor.saveState(`Edited text: "${this.originalContent}" → "${newContent}"`);
            window.editor.addToHistory(`Edited text: "${this.originalContent}" → "${newContent}"`);
            window.editor.showToast('Text updated!');
        }

        this.disableInlineEditing();
    }

    cancelEdit() {
        if (!this.editingElement) return;

        this.editingElement.textContent = this.originalContent;
        window.editor.showToast('Edit cancelled');

        this.disableInlineEditing();
    }

    disableInlineEditing() {
        if (!this.editingElement) return;

        this.editingElement.contentEditable = false;
        this.editingElement.style.outline = '';
        this.editingElement.style.outlineOffset = '';

        this.editingElement.removeEventListener('keydown', this.handleKeydown);
        this.editingElement.removeEventListener('blur', this.handleBlur);

        this.editingElement = null;
        this.originalContent = '';
    }
}

// Initialize text editor when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.textEditor = new TextEditor();
    });
} else {
    window.textEditor = new TextEditor();
}
