/**
 * Admin Button Fix - A direct solution for fixing button alignment issues
 * This script completely replaces the button elements in the admin panel
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wait for a moment to ensure all other scripts have run
    setTimeout(function() {
        // Find all action cells in the admin table
        const actionCells = document.querySelectorAll('.menu-table td:last-child');
        
        if (actionCells.length === 0) {
            console.log('No action cells found to fix');
            return;
        }
        
        console.log('Fixing button alignment for ' + actionCells.length + ' rows');
        
        // Process each cell containing action buttons
        actionCells.forEach(function(cell) {
            // Get the item ID from existing buttons
            let itemId = '';
            const existingEditButton = cell.querySelector('.edit, button[data-id], a[data-id]');
            if (existingEditButton) {
                itemId = existingEditButton.getAttribute('data-id');
            }
            
            if (!itemId) {
                console.log('Could not find item ID for a row, skipping');
                return;
            }
            
            // Clear the cell content
            cell.innerHTML = '';
            
            // Set cell styling
            cell.style.width = '80px';
            cell.style.maxWidth = '80px';
            cell.style.padding = '5px';
            cell.style.textAlign = 'center';
            cell.style.verticalAlign = 'middle';
            cell.style.position = 'relative';
            
            // Create button container
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.flexDirection = 'column';
            buttonContainer.style.alignItems = 'center';
            buttonContainer.style.justifyContent = 'center';
            buttonContainer.style.gap = '8px';
            buttonContainer.style.margin = '0 auto';
            
            // Create edit button
            const editButton = document.createElement('a');
            editButton.href = '#';
            editButton.className = 'edit-button';
            editButton.setAttribute('data-id', itemId);
            editButton.title = 'Edit Item';
            editButton.style.display = 'flex';
            editButton.style.alignItems = 'center';
            editButton.style.justifyContent = 'center';
            editButton.style.width = '36px';
            editButton.style.height = '36px';
            editButton.style.borderRadius = '4px';
            editButton.style.backgroundColor = '#2196F3';
            editButton.style.color = 'white';
            editButton.style.margin = '0 auto';
            editButton.style.lineHeight = '36px';
            editButton.style.textDecoration = 'none';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            
            // Create delete button
            const deleteButton = document.createElement('a');
            deleteButton.href = '#';
            deleteButton.className = 'delete-button';
            deleteButton.setAttribute('data-id', itemId);
            deleteButton.title = 'Delete Item';
            deleteButton.style.display = 'flex';
            deleteButton.style.alignItems = 'center';
            deleteButton.style.justifyContent = 'center';
            deleteButton.style.width = '36px';
            deleteButton.style.height = '36px';
            deleteButton.style.borderRadius = '4px';
            deleteButton.style.backgroundColor = '#F44336';
            deleteButton.style.color = 'white';
            deleteButton.style.margin = '0 auto';
            deleteButton.style.lineHeight = '36px';
            deleteButton.style.textDecoration = 'none';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            
            // Add buttons to container
            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);
            
            // Add container to cell
            cell.appendChild(buttonContainer);
            
            // Restore click event handlers
            editButton.addEventListener('click', function(e) {
                e.preventDefault();
                // Trigger the edit functionality by dispatching a custom event
                const event = new CustomEvent('edit-item', { 
                    detail: { id: itemId, element: editButton }
                });
                document.dispatchEvent(event);
                
                // Also try to trigger Alpine.js event if it exists
                if (typeof Alpine !== 'undefined') {
                    Alpine.store('menuItem').edit(itemId);
                }
            });
            
            deleteButton.addEventListener('click', function(e) {
                e.preventDefault();
                // Trigger the delete functionality by dispatching a custom event
                const event = new CustomEvent('delete-item', { 
                    detail: { id: itemId, element: deleteButton }
                });
                document.dispatchEvent(event);
                
                // Also try to trigger Alpine.js event if it exists
                if (typeof Alpine !== 'undefined') {
                    Alpine.store('menuItem').delete(itemId);
                }
            });
        });
    }, 300); // Give a slight delay to ensure page is fully loaded
});

// Additional event listeners to handle edit and delete operations
// These attempt to simulate the original functionality
document.addEventListener('edit-item', function(e) {
    console.log('Edit item triggered for ID: ' + e.detail.id);
    // Try to find and trigger the original edit button
    const originalButton = document.querySelector('button.edit[data-id="' + e.detail.id + '"]');
    if (originalButton) {
        originalButton.click();
    }
});

document.addEventListener('delete-item', function(e) {
    console.log('Delete item triggered for ID: ' + e.detail.id);
    // Try to find and trigger the original delete button
    const originalButton = document.querySelector('button.delete[data-id="' + e.detail.id + '"]');
    if (originalButton) {
        originalButton.click();
    }
});
