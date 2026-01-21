// ==========================================
// WEBSITE EXPORTER
// ==========================================

class WebsiteExporter {
    constructor() {
        this.init();
    }

    init() {
        this.setupExportModal();
        this.setupPreviewButton();
    }

    setupExportModal() {
        const exportBtn = document.getElementById('exportBtn');
        const exportModal = document.getElementById('exportModal');
        const closeModal = document.getElementById('closeExportModal');
        const cancelBtn = document.getElementById('cancelExport');
        const confirmBtn = document.getElementById('confirmExport');

        if (!exportBtn || !exportModal) return;

        exportBtn.addEventListener('click', () => {
            if (!window.AuthSystem.hasPermission('export')) {
                window.editor.showToast('You don\'t have permission to export');
                return;
            }

            exportModal.classList.add('show');
        });

        closeModal?.addEventListener('click', () => {
            exportModal.classList.remove('show');
        });

        cancelBtn?.addEventListener('click', () => {
            exportModal.classList.remove('show');
        });

        confirmBtn?.addEventListener('click', () => {
            this.exportWebsite();
            exportModal.classList.remove('show');
        });

        // Close on outside click
        exportModal.addEventListener('click', (e) => {
            if (e.target === exportModal) {
                exportModal.classList.remove('show');
            }
        });
    }

    setupPreviewButton() {
        const previewBtn = document.getElementById('previewBtn');
        if (!previewBtn) return;

        previewBtn.addEventListener('click', () => {
            this.openPreview();
        });
    }

    openPreview() {
        const iframe = document.getElementById('editorFrame');
        if (!iframe) return;

        // Open current page in new window
        const previewWindow = window.open('', '_blank');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        previewWindow.document.write(iframeDoc.documentElement.outerHTML);
        previewWindow.document.close();

        window.editor.showToast('Preview opened in new window');
    }

    async exportWebsite() {
        window.editor.showToast('Preparing export...');

        const includeImages = document.getElementById('includeImages')?.checked ?? true;
        const includeAssets = document.getElementById('includeAssets')?.checked ?? true;
        const minifyCode = document.getElementById('minifyCode')?.checked ?? false;

        try {
            // Get modified HTML from iframe
            const iframe = document.getElementById('editorFrame');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            // Get the modified HTML
            let modifiedHTML = this.getCleanHTML(iframeDoc);

            if (minifyCode) {
                modifiedHTML = this.minifyHTML(modifiedHTML);
            }

            // Create export package
            const exportData = {
                html: modifiedHTML,
                timestamp: new Date().toISOString(),
                page: window.editor.currentPage,
                user: window.AuthSystem.getCurrentUser()?.username
            };

            // Download as HTML file
            this.downloadHTML(exportData.html, window.editor.currentPage.split('/').pop());

            window.editor.addToHistory('Exported website');
            window.editor.showToast('Website exported successfully!');

        } catch (error) {
            console.error('Export error:', error);
            window.editor.showToast('Error exporting website: ' + error.message);
        }
    }

    getCleanHTML(doc) {
        // Clone the document
        const clone = doc.documentElement.cloneNode(true);

        // Remove builder-specific classes and attributes
        const elements = clone.querySelectorAll('.builder-selected, .builder-hover');
        elements.forEach(el => {
            el.classList.remove('builder-selected', 'builder-hover');
        });

        // Remove builder styles
        const builderStyles = clone.querySelector('#builder-animations');
        if (builderStyles) {
            builderStyles.remove();
        }

        // Remove contenteditable attributes
        const editableElements = clone.querySelectorAll('[contenteditable]');
        editableElements.forEach(el => {
            el.removeAttribute('contenteditable');
        });

        // Clean up inline styles added by builder
        const styledElements = clone.querySelectorAll('[style]');
        styledElements.forEach(el => {
            // Keep only important styles, remove builder helpers
            const style = el.getAttribute('style');
            if (style && (style.includes('outline') || style.includes('cursor'))) {
                const cleanedStyle = style
                    .split(';')
                    .filter(s => !s.includes('outline') && !s.includes('cursor'))
                    .join(';');

                if (cleanedStyle.trim()) {
                    el.setAttribute('style', cleanedStyle);
                } else {
                    el.removeAttribute('style');
                }
            }
        });

        return '<!DOCTYPE html>\n' + clone.outerHTML;
    }

    minifyHTML(html) {
        // Simple minification: remove extra whitespace and comments
        return html
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/\s+/g, ' ') // Multiple spaces to single space
            .replace(/>\s+</g, '><') // Remove space between tags
            .trim();
    }

    downloadHTML(content, filename) {
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async createZipExport() {
        // This would require a library like JSZip
        // For now, we'll download individual files
        window.editor.showToast('ZIP export coming soon! Downloading HTML file instead.');
        return this.exportWebsite();
    }

    // Export all pages at once
    async exportAllPages() {
        const pages = [
            'index.html',
            'pages/about.html',
            'pages/categories.html',
            'pages/product.html',
            'pages/cart.html',
            'pages/contact.html'
        ];

        for (const page of pages) {
            // Load page
            await new Promise(resolve => {
                window.editor.loadPage(page);
                setTimeout(resolve, 2000); // Wait for page to load
            });

            // Export page
            await this.exportWebsite();
        }

        window.editor.showToast('All pages exported!');
    }

    // Save project to localStorage
    saveProject(name) {
        const iframe = document.getElementById('editorFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        const project = {
            name: name || 'Untitled Project',
            pages: {},
            images: window.imageManager?.getAllImages() || [],
            history: window.editor?.history || [],
            savedAt: new Date().toISOString(),
            savedBy: window.AuthSystem.getCurrentUser()?.username
        };

        // Save current page HTML
        project.pages[window.editor.currentPage] = this.getCleanHTML(iframeDoc);

        // Save to localStorage
        const projects = JSON.parse(localStorage.getItem('builderProjects') || '[]');
        projects.push(project);
        localStorage.setItem('builderProjects', JSON.stringify(projects));

        window.editor.showToast('Project saved!');
        return project;
    }

    // Load project from localStorage
    loadProject(projectName) {
        const projects = JSON.parse(localStorage.getItem('builderProjects') || '[]');
        const project = projects.find(p => p.name === projectName);

        if (!project) {
            window.editor.showToast('Project not found');
            return null;
        }

        // Load images
        if (project.images && window.imageManager) {
            project.images.forEach(img => {
                window.imageManager.addImageToGrid(img);
            });
        }

        window.editor.showToast('Project loaded!');
        return project;
    }
}

// Initialize exporter when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.websiteExporter = new WebsiteExporter();
    });
} else {
    window.websiteExporter = new WebsiteExporter();
}
