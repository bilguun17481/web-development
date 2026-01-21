// ==========================================
// IMAGE MANAGEMENT FUNCTIONALITY
// ==========================================

class ImageManager {
    constructor() {
        this.uploadedImages = [];
        this.init();
    }

    init() {
        this.setupImageUpload();
        this.loadSavedImages();
    }

    setupImageUpload() {
        const uploadBtn = document.getElementById('uploadImageBtn');
        const fileInput = document.getElementById('imageUpload');

        if (!uploadBtn || !fileInput) return;

        uploadBtn.addEventListener('click', () => {
            if (!window.AuthSystem.hasPermission('edit')) {
                window.editor.showToast('You don\'t have permission to upload images');
                return;
            }

            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length === 0) return;

            Array.from(files).forEach(file => {
                this.processImageFile(file);
            });

            // Clear input
            fileInput.value = '';
        });
    }

    processImageFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            window.editor.showToast('Please upload only image files');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            window.editor.showToast('Image size must be less than 5MB');
            return;
        }

        // Read file as data URL
        const reader = new FileReader();

        reader.onload = (e) => {
            const imageData = {
                name: file.name,
                data: e.target.result,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
            };

            this.uploadedImages.push(imageData);
            this.saveImages();
            this.addImageToGrid(imageData);

            window.editor.addToHistory(`Uploaded image: ${file.name}`);
            window.editor.showToast(`${file.name} uploaded successfully!`);
        };

        reader.onerror = () => {
            window.editor.showToast('Error reading image file');
        };

        reader.readAsDataURL(file);
    }

    addImageToGrid(imageData) {
        const assetGrid = document.getElementById('assetGrid');
        if (!assetGrid) return;

        const div = document.createElement('div');
        div.className = 'asset-item';
        div.setAttribute('data-image-name', imageData.name);

        div.innerHTML = `
            <img src="${imageData.data}" alt="${imageData.name}">
            <div class="asset-name">${imageData.name}</div>
        `;

        // Click to replace image in selected element
        div.addEventListener('click', () => {
            this.replaceImage(imageData);
        });

        // Right-click to delete (context menu)
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.deleteImage(imageData, div);
        });

        assetGrid.appendChild(div);
    }

    replaceImage(imageData) {
        const selectedElement = window.editor.selectedElement;

        if (!selectedElement) {
            window.editor.showToast('Please select an element first');
            return;
        }

        if (selectedElement.tagName !== 'IMG') {
            window.editor.showToast('Please select an image element');
            return;
        }

        if (!window.AuthSystem.hasPermission('edit')) {
            window.editor.showToast('You don\'t have permission to change images');
            return;
        }

        // Save state before changing image
        window.editor.saveState(`Changed image to: ${imageData.name}`);

        selectedElement.src = imageData.data;
        selectedElement.alt = imageData.name;

        window.editor.addToHistory(`Changed image to: ${imageData.name}`);
        window.editor.showToast('Image replaced successfully!');
    }

    deleteImage(imageData, element) {
        if (!window.AuthSystem.hasPermission('delete')) {
            window.editor.showToast('You don\'t have permission to delete images');
            return;
        }

        if (confirm(`Delete "${imageData.name}"?`)) {
            // Remove from array
            const index = this.uploadedImages.findIndex(img => img.name === imageData.name && img.uploadedAt === imageData.uploadedAt);
            if (index > -1) {
                this.uploadedImages.splice(index, 1);
                this.saveImages();
            }

            // Remove from DOM
            element.remove();

            window.editor.addToHistory(`Deleted image: ${imageData.name}`);
            window.editor.showToast('Image deleted');
        }
    }

    saveImages() {
        try {
            // Save to localStorage
            localStorage.setItem('builderImages', JSON.stringify(this.uploadedImages));
        } catch (e) {
            console.error('Error saving images:', e);
            window.editor.showToast('Warning: Could not save images to storage');
        }
    }

    loadSavedImages() {
        try {
            const saved = localStorage.getItem('builderImages');
            if (saved) {
                this.uploadedImages = JSON.parse(saved);

                // Add all saved images to grid
                this.uploadedImages.forEach(imageData => {
                    this.addImageToGrid(imageData);
                });
            }
        } catch (e) {
            console.error('Error loading saved images:', e);
        }
    }

    getAllImages() {
        return this.uploadedImages;
    }

    clearAllImages() {
        if (confirm('Are you sure you want to delete all uploaded images?')) {
            this.uploadedImages = [];
            localStorage.removeItem('builderImages');

            const assetGrid = document.getElementById('assetGrid');
            if (assetGrid) {
                // Remove all uploaded images, keep original assets
                const uploadedItems = assetGrid.querySelectorAll('.asset-item[data-image-name]');
                uploadedItems.forEach(item => item.remove());
            }

            window.editor.showToast('All uploaded images cleared');
        }
    }
}

// Initialize image manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageManager = new ImageManager();
    });
} else {
    window.imageManager = new ImageManager();
}
