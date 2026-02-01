// ==========================================
// SIDEBAR TOGGLE COMPONENT
// ==========================================

class SidebarToggle {
    constructor() {
        this.isOpen = false;
        this.editBtn = null;
        this.sidebar = null;

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
        this.sidebar = document.querySelector('.sidebar-left');

        if (!this.editBtn || !this.sidebar) {
            console.warn('SidebarToggle: Required elements not found');
            return;
        }

        // Toggle on edit button click
        this.editBtn.addEventListener('click', () => this.toggle());

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Optional: Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.sidebar.contains(e.target) &&
                !this.editBtn.contains(e.target)) {
                this.close();
            }
        });

        console.log('SidebarToggle initialized');
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
        this.sidebar.classList.add('open');
        this.editBtn.classList.add('active');
    }

    close() {
        this.isOpen = false;
        this.sidebar.classList.remove('open');
        this.editBtn.classList.remove('active');
    }
}

// Initialize sidebar toggle
window.sidebarToggle = new SidebarToggle();
