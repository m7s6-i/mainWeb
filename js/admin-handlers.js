/**
 * Admin Panel Button Handlers
 * Consolidated JavaScript for admin panel functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix for edit buttons
    document.querySelectorAll('.edit-button, .edit').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            editItem(id, this);
        });
    });

    // Fix for delete buttons
    document.querySelectorAll('.delete-button, .delete').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            const row = this.closest('tr');
            const itemName = row.querySelector('td:nth-child(2)').textContent;
            deleteItem(id, itemName, this, row);
        });
    });

    // Availability badge toggle handling
    document.querySelectorAll('.availability-badge').forEach(badge => {
        badge.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const currentStatus = this.getAttribute('data-status') === 'true';
            toggleAvailability(id, !currentStatus, this);
        });
    });

    // Edit item function
    function editItem(id, buttonElement) {
        const modal = document.getElementById('itemModal');
        const formContent = document.querySelector('.modal-content');
        const form = document.getElementById('itemForm');
        
        // Reset form
        form.reset();
        
        // Clear any previous error messages
        const prevErrors = formContent.querySelectorAll('.error-message');
        prevErrors.forEach(err => err.remove());
        
        // Show loading state
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'form-loading-overlay';
        loadingOverlay.innerHTML = '<div class="spinner"><i class="fas fa-spinner fa-spin"></i></div>';
        formContent.appendChild(loadingOverlay);
        
        // Show modal
        modal.style.display = 'block';
        
        // Fetch item data
        fetch(`get_item.php?id=${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Remove loading overlay
                formContent.removeChild(loadingOverlay);
                
                if (!data.success) {
                    throw new Error(data.message || 'Unknown error loading item');
                }
                
                document.getElementById('itemId').value = data.id;
                document.getElementById('name').value = data.name || '';
                document.getElementById('description').value = data.description || '';
                document.getElementById('price').value = data.price || '';
                document.getElementById('category').value = data.category || 'Classic';
                document.getElementById('featured').value = data.featured ? '1' : '0';
                
                const availabilitySelect = document.getElementById('availability');
                if (availabilitySelect) {
                    if (data.available === false) {
                        availabilitySelect.value = 'sold_out';
                    } else if (data.hasOwnProperty('in_truck') && !data.in_truck) {
                        availabilitySelect.value = 'not_in_truck';
                    } else {
                        availabilitySelect.value = 'available';
                    }
                }
                
                document.getElementById('image').value = data.image || '';
                
                // Show image preview
                const imagePreview = document.getElementById('imagePreview');
                if (data.image) {
                    imagePreview.src = data.image;
                    imagePreview.style.display = 'block';
                } else if (imagePreview) {
                    imagePreview.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching item:', error);
                
                // Remove loading overlay if it exists
                const existingOverlay = formContent.querySelector('.form-loading-overlay');
                if (existingOverlay) {
                    formContent.removeChild(existingOverlay);
                }
                
                // Show error message in the modal
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message || 'Error loading item data. Please try again.'}`;
                formContent.prepend(errorMsg);
                
                // Auto-remove error after 5 seconds
                setTimeout(() => {
                    if (errorMsg.parentNode) {
                        errorMsg.parentNode.removeChild(errorMsg);
                    }
                }, 5000);
            });
    }

    // Delete item function
    function deleteItem(id, itemName, buttonElement, rowElement) {
        if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
            // Show loading state
            const originalHtml = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            buttonElement.disabled = true;
            
            // Make AJAX request to delete item
            fetch('delete_item.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${id}`
            })
            .then(response => {
                if (!response.ok) {
                    console.error('Delete request failed:', {
                        status: response.status,
                        statusText: response.statusText
                    });
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.text().then(text => {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        console.error('JSON parse error in delete response:', e);
                        console.log('Raw delete response:', text);
                        throw new Error('Invalid JSON response from server');
                    }
                });
            })
            .then(data => {
                if (data.success) {
                    // Add success feedback
                    rowElement.classList.add('delete-success');
                    
                    // Animate removal
                    setTimeout(() => {
                        rowElement.style.height = rowElement.offsetHeight + 'px';
                        rowElement.classList.add('fade-out');
                        setTimeout(() => {
                            rowElement.remove();
                        }, 500);
                    }, 300);
                } else {
                    throw new Error(data.message || 'Unknown error deleting item');
                }
            })
            .catch(error => {
                console.error('Error deleting item:', error);
                
                // Reset button state
                buttonElement.innerHTML = originalHtml;
                buttonElement.disabled = false;
                
                // Show error message
                alert('Error deleting item: ' + error.message);
            });
        }
    }

    // Toggle availability function
    function toggleAvailability(id, newStatus, badgeElement) {
        const originalHtml = badgeElement.innerHTML;
        badgeElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        
        fetch('toggle_availability.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${id}&status=${newStatus ? 1 : 0}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update badge UI
                badgeElement.setAttribute('data-status', data.status ? 'true' : 'false');
                
                if (data.status) {
                    badgeElement.innerHTML = '<i class="fas fa-check-circle"></i> Available';
                    badgeElement.className = 'availability-badge available';
                } else {
                    badgeElement.innerHTML = '<i class="fas fa-times-circle"></i> Sold Out';
                    badgeElement.className = 'availability-badge sold-out';
                }
            } else {
                // Restore original state on error
                badgeElement.innerHTML = originalHtml;
                alert('Error updating availability: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error toggling availability:', error);
            badgeElement.innerHTML = originalHtml;
            alert('Error updating availability. Please try again.');
        });
    }
});
