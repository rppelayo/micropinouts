// Manage Pinouts JavaScript

class PinoutManager {
    constructor() {
        this.pinouts = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.currentCategory = '';
        this.currentSearch = '';
        this.deleteTargetId = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadPinouts();
    }
    
    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.currentPage = 1;
            this.loadPinouts();
        });
        
        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.currentPage = 1;
            this.loadPinouts();
        });
        
        // Action buttons
        document.getElementById('createNewBtn').addEventListener('click', () => {
            window.location.href = 'pinout-creator.html';
        });
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadPinouts();
        });
        
        // Modal functionality
        this.setupModalEventListeners();
    }
    
    setupModalEventListeners() {
        const modal = document.getElementById('deleteModal');
        const closeBtn = document.querySelector('.modal-close');
        const cancelBtn = document.getElementById('cancelDeleteBtn');
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        confirmBtn.addEventListener('click', () => {
            this.deletePinout();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    async loadPinouts() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 12
            });
            
            if (this.currentCategory) {
                params.append('category', this.currentCategory);
            }
            
            if (this.currentSearch) {
                params.append('search', this.currentSearch);
            }
            
            const response = await fetch(`api/pinouts.php?${params}`);
            const result = await response.json();
            
            if (result.success) {
                this.pinouts = result.data.pinouts;
                this.totalPages = result.data.pagination.pages;
                this.renderPinouts();
                this.renderPagination();
            } else {
                this.showError(result.error || 'Failed to load pinouts');
            }
        } catch (error) {
            console.error('Error loading pinouts:', error);
            this.showError('Failed to load pinouts. Please check your connection.');
        }
    }
    
    renderPinouts() {
        const grid = document.getElementById('pinoutsGrid');
        
        if (this.pinouts.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-microchip"></i>
                    <h3>No Pinouts Found</h3>
                    <p>No pinouts match your current filters. Try adjusting your search or create a new pinout.</p>
                    <button class="btn btn-primary" onclick="window.location.href='pinout-creator.html'">
                        <i class="fas fa-plus"></i> Create New Pinout
                    </button>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = this.pinouts.map(pinout => this.createPinoutCard(pinout)).join('');
    }
    
    createPinoutCard(pinout) {
        const createdDate = new Date(pinout.created_at).toLocaleDateString();
        const categoryIcon = this.getCategoryIcon(pinout.category_id);
        
        return `
            <div class="pinout-card" data-id="${pinout.id}">
                <div class="card-header">
                    <div class="card-title">
                        <h3>${categoryIcon} ${pinout.chip_name}</h3>
                        <span class="card-category">${pinout.category_name}</span>
                        <div class="published-status">
                            <span class="status-badge ${pinout.page_slug ? 'published' : 'draft'}">
                                <i class="fas ${pinout.page_slug ? 'fa-globe' : 'fa-edit'}"></i>
                                ${pinout.page_slug ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="action-btn preview-btn" onclick="pinoutManager.previewPinout(${pinout.id})" title="Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="pinoutManager.editPinout(${pinout.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="pinoutManager.showDeleteModal(${pinout.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="pinout-info">
                        <div class="info-item">
                            <span class="info-label">Pins:</span>
                            <span class="info-value">${pinout.pin_count}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Size:</span>
                            <span class="info-value">${pinout.board_width}×${pinout.board_height}mm</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Views:</span>
                            <span class="info-value">${pinout.view_count || 0}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Created:</span>
                            <span class="info-value">${createdDate}</span>
                        </div>
                    </div>
                    
                    <div class="pinout-preview">
                        <div class="mini-pinout">
                            ${this.createMiniPinout(pinout)}
                        </div>
                    </div>
                </div>
                
                <div class="card-footer">
                    <div class="pinout-stats">
                        <span class="stat-item">
                            <i class="fas fa-eye"></i> ${pinout.view_count || 0}
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-calendar"></i> ${createdDate}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
    
    createMiniPinout(pinout) {
        // Create a simplified visual representation
        const leftPins = pinout.pins ? pinout.pins.filter(p => p.side === 'left') : [];
        const rightPins = pinout.pins ? pinout.pins.filter(p => p.side === 'right') : [];
        
        return `
            <div class="mini-chip">
                <div class="mini-left-pins">
                    ${leftPins.slice(0, 3).map(pin => `<div class="mini-pin" title="${pin.pin_name}">${pin.pin_number}</div>`).join('')}
                    ${leftPins.length > 3 ? '<div class="mini-pin more">...</div>' : ''}
                </div>
                <div class="mini-chip-body">
                    <div class="mini-chip-label">${pinout.chip_name.substring(0, 8)}</div>
                </div>
                <div class="mini-right-pins">
                    ${rightPins.slice(0, 3).map(pin => `<div class="mini-pin" title="${pin.pin_name}">${pin.pin_number}</div>`).join('')}
                    ${rightPins.length > 3 ? '<div class="mini-pin more">...</div>' : ''}
                </div>
            </div>
        `;
    }
    
    renderPagination() {
        const pagination = document.getElementById('pagination');
        
        if (this.totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination-controls">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="pinoutManager.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i> Previous
            </button>`;
        }
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                onclick="pinoutManager.goToPage(${i})">${i}</button>`;
        }
        
        // Next button
        if (this.currentPage < this.totalPages) {
            paginationHTML += `<button class="page-btn" onclick="pinoutManager.goToPage(${this.currentPage + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>`;
        }
        
        paginationHTML += '</div>';
        pagination.innerHTML = paginationHTML;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.loadPinouts();
    }
    
    previewPinout(id) {
        const pinout = this.pinouts.find(p => p.id === id);
        if (pinout && pinout.page_slug) {
            // Published pinout - use slug-based URL
            window.open(`/${pinout.page_slug}`, '_blank');
        } else {
            // Draft/unpublished pinout - use preview.html with ID
            window.open(`preview.html?id=${id}`, '_blank');
        }
    }
    
    editPinout(id) {
        window.location.href = `pinout-creator.html?edit=${id}`;
    }
    
    showDeleteModal(id) {
        this.deleteTargetId = id;
        const pinout = this.pinouts.find(p => p.id === id);
        
        if (pinout) {
            document.getElementById('deletePreview').innerHTML = `
                <div class="delete-preview">
                    <h4>${pinout.chip_name}</h4>
                    <p>Category: ${pinout.category_name}</p>
                    <p>Pins: ${pinout.pin_count} | Size: ${pinout.board_width}×${pinout.board_height}mm</p>
                </div>
            `;
        }
        
        document.getElementById('deleteModal').style.display = 'block';
    }
    
    async deletePinout() {
        if (!this.deleteTargetId) return;
        
        try {
            const response = await fetch(`api/pinouts.php/${this.deleteTargetId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Pinout deleted successfully!');
                document.getElementById('deleteModal').style.display = 'none';
                this.loadPinouts(); // Refresh the list
            } else {
                alert('Failed to delete pinout: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting pinout:', error);
            alert('Failed to delete pinout. Please try again.');
        }
    }
    
    getCategoryIcon(categoryId) {
        const categories = {
            1: '🔧', // microcontroller-8bit
            2: '⚙️', // microcontroller-16bit
            3: '🔩', // microcontroller-32bit
            4: '📱', // development-board
            5: '📡', // sensor-module
            6: '📶', // communication-ic
            7: '⚡', // power-management
            8: '💾', // memory-storage
            9: '🔧'  // custom-other
        };
        return categories[categoryId] || '🔧';
    }
    
    showLoading() {
        const grid = document.getElementById('pinoutsGrid');
        grid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner-enhanced">
                    <div class="spinner-ring">
                        <div class="spinner-ring-inner"></div>
                    </div>
                    <div class="loading-content">
                        <h3>Loading Pinouts</h3>
                        <p>Fetching data from database...</p>
                        <div class="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    showError(message) {
        const grid = document.getElementById('pinoutsGrid');
        grid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="pinoutManager.loadPinouts()">
                    <i class="fas fa-sync"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Initialize manager when page loads
let pinoutManager;
document.addEventListener('DOMContentLoaded', function() {
    pinoutManager = new PinoutManager();
});