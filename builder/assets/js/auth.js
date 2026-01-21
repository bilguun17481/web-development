// ==========================================
// AUTHENTICATION SYSTEM
// ==========================================

class AuthSystem {
    constructor() {
        this.users = {
            admin: { password: 'admin123', role: 'admin', name: 'Admin User' },
            editor: { password: 'editor123', role: 'editor', name: 'Editor User' },
            viewer: { password: 'viewer123', role: 'viewer', name: 'Viewer User' }
        };

        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if already logged in
        const savedUser = localStorage.getItem('builderUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);

            // If on login page and already logged in, redirect to editor
            if (window.location.pathname.includes('index.html') ||
                window.location.pathname.endsWith('/builder/') ||
                window.location.pathname.endsWith('/builder')) {
                window.location.href = 'editor.html';
            }
        } else {
            // If on editor page and not logged in, redirect to login
            if (window.location.pathname.includes('editor.html')) {
                window.location.href = 'index.html';
            }
        }

        this.setupLoginForm();
        this.setupLogout();
        this.updateUserInfo();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const errorMessage = document.getElementById('errorMessage');

        // Validate credentials
        const user = this.users[username];

        if (!user) {
            this.showError('Invalid username');
            return;
        }

        if (user.password !== password) {
            this.showError('Invalid password');
            return;
        }

        if (user.role !== role) {
            this.showError('Invalid role selected');
            return;
        }

        // Login successful
        this.currentUser = {
            username,
            role: user.role,
            name: user.name,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('builderUser', JSON.stringify(this.currentUser));
        window.location.href = 'editor.html';
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');

            setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 3000);
        }
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    logout() {
        localStorage.removeItem('builderUser');
        window.location.href = 'index.html';
    }

    updateUserInfo() {
        const userInfo = document.getElementById('userInfo');
        if (userInfo && this.currentUser) {
            userInfo.textContent = `${this.currentUser.name} (${this.currentUser.role})`;
        }
    }

    hasPermission(action) {
        if (!this.currentUser) return false;

        const permissions = {
            admin: ['view', 'edit', 'delete', 'export', 'manage-users'],
            editor: ['view', 'edit', 'export'],
            viewer: ['view']
        };

        return permissions[this.currentUser.role]?.includes(action) || false;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth system
const authSystem = new AuthSystem();

// Export for use in other modules
window.AuthSystem = authSystem;
