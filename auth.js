class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('AuthManager initializing...');
        
        // Check if user is already logged in
        this.checkAuthStatus();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI based on auth status
        this.updateUI();
        
        console.log('AuthManager initialized');
    }

    setupEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (this.isAuthenticated) {
                    // If already logged in, redirect to admin dashboard
                    window.location.href = '/admin.html';
                } else {
                    // If not logged in, show login modal
                    this.showLoginModal();
                }
            });
        }

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Close modal
        const closeBtn = document.getElementById('closeLoginModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideLoginModal());
        }

        // Close modal when clicking outside
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideLoginModal();
                }
            });
        }
    }

    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        
        if (token && user) {
            this.isAuthenticated = true;
            this.currentUser = JSON.parse(user);
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const authNav = document.getElementById('authNav');
        const creatorCard = document.getElementById('creatorCard');
        
        if (!loginBtn) return;

        if (this.isAuthenticated) {
            // Show authenticated navigation
            if (authNav) {
                authNav.style.display = 'flex';
            }
            
            // Show creator card
            if (creatorCard) {
                creatorCard.style.display = 'block';
            }
            
            // Update login button to show admin dashboard
            loginBtn.textContent = `Admin Dashboard (${this.currentUser.username})`;
            loginBtn.onclick = () => {
                window.location.href = '/admin.html';
            };
        } else {
            // Hide authenticated navigation
            if (authNav) {
                authNav.style.display = 'none';
            }
            
            // Hide creator card
            if (creatorCard) {
                creatorCard.style.display = 'none';
            }
            
            // Update login button to login
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => this.showLoginModal();
        }
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // Clear form and error
        const form = document.getElementById('loginForm');
        if (form) form.reset();
        
        const error = document.getElementById('loginError');
        if (error) error.style.display = 'none';
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');
        
        console.log('Attempting login with:', { username, password });
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok && data.success) {
                // Store auth data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                this.isAuthenticated = true;
                this.currentUser = data.user;
                
                this.hideLoginModal();
                this.updateUI();
                
                // Show success message
                this.showMessage('Login successful!', 'success');
                
                // Redirect to creator if coming from restricted page
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');
                if (redirect) {
                    window.location.href = redirect;
                }
            } else {
                this.showError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        this.isAuthenticated = false;
        this.currentUser = null;
        
        this.updateUI();
        this.showMessage('Logged out successfully', 'success');
        
        // Redirect to home if on restricted page
        if (window.location.pathname.includes('pinout-creator') || 
            window.location.pathname.includes('manage-pinouts')) {
            window.location.href = '/';
        }
    }

    showError(message) {
        const error = document.getElementById('loginError');
        if (error) {
            error.textContent = message;
            error.style.display = 'block';
        }
    }

    showMessage(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : '#667eea'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Static method to check if user can access a page
    static canAccess(page) {
        const restrictedPages = ['pinout-creator', 'manage-pinouts'];
        return !restrictedPages.some(restricted => page.includes(restricted)) || 
               (localStorage.getItem('authToken') && localStorage.getItem('currentUser'));
    }

    // Static method to redirect if not authenticated
    static requireAuth() {
        if (!AuthManager.canAccess(window.location.pathname)) {
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `/?redirect=${currentUrl}`;
            return false;
        }
        return true;
    }
}

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize auth manager
const authManager = new AuthManager();

// Export for use in other pages
window.AuthManager = AuthManager;