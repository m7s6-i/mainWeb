/**
 * Admin Menu Filters - Handles search and filtering for the card-based menu layout
 */
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const menuItems = document.querySelectorAll('.menu-item-card');
    
    // Search functionality
    searchInput.addEventListener('input', applyFilters);
    
    // Category filter
    categoryFilter.addEventListener('change', applyFilters);
    
    // Clear filters
    clearFiltersBtn.addEventListener('click', function() {
        searchInput.value = '';
        categoryFilter.value = '';
        applyFilters();
    });
    
    // Apply both search and category filters
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const categoryValue = categoryFilter.value.toLowerCase();
        
        menuItems.forEach(item => {
            const itemName = item.querySelector('.menu-item-details h3').textContent.toLowerCase();
            const itemDescription = item.querySelector('.menu-item-details p').textContent.toLowerCase();
            const itemCategory = item.querySelector('.category').textContent.toLowerCase();
            
            // Check if item matches both search term and category
            const matchesSearch = searchTerm === '' || 
                                  itemName.includes(searchTerm) || 
                                  itemDescription.includes(searchTerm);
                                  
            const matchesCategory = categoryValue === '' || 
                                    itemCategory === categoryValue;
            
            // Show/hide based on combined filters
            if (matchesSearch && matchesCategory) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Check if no items are visible
        let visibleItems = 0;
        menuItems.forEach(item => {
            if (item.style.display !== 'none') {
                visibleItems++;
            }
        });
        
        // Show or hide "no results" message
        let noResultsMessage = document.querySelector('.no-results-message');
        if (visibleItems === 0) {
            if (!noResultsMessage) {
                noResultsMessage = document.createElement('div');
                noResultsMessage.className = 'no-results-message';
                noResultsMessage.innerHTML = '<p>No menu items match your search criteria. <button class="btn btn-sm btn-outline reset-search">Clear filters</button></p>';
                document.querySelector('.menu-items-grid').appendChild(noResultsMessage);
                
                // Add event listener to the reset button
                noResultsMessage.querySelector('.reset-search').addEventListener('click', function() {
                    searchInput.value = '';
                    categoryFilter.value = '';
                    applyFilters();
                });
            }
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
});
