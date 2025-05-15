<?php
require_once 'config.php';
requireLogin();

$menuItems = loadJson(MENU_FILE);
foreach ($menuItems as & $item) {
    if (!isset($item['featured'])) {
        $item['featured'] = false;
    }
}
unset($item);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Duh-Lish-Us Treatery</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Pacifico&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/admin-style.css">
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
</head>
<body>
    <header class="admin-header">
        <div class="container">
            <h1>Duh-Lish-Us <span>Treatery</span> Admin</h1>
            <div class="user-info">
                <span><i class="fas fa-user-circle"></i> Welcome, <?php echo $_SESSION['user']['username']; ?></span>
                <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        </div>
    </header>
    
    <nav class="admin-nav">
        <div class="container">
            <ul class="admin-nav-menu">
                <li class="active"><a href="index.php"><i class="fas fa-ice-cream"></i> Menu Management</a></li>
                <li><a href="truck_schedule.php"><i class="fas fa-truck"></i> Truck Schedule</a></li>
            </ul>
        </div>
    </nav>
    
    <main class="admin-content">
        <div class="container">
            <div class="admin-card">
                <div class="admin-card-header">
                    <h2><i class="fas fa-ice-cream"></i> Menu Items</h2>
                    <button id="addItemBtn" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Add New Item
                    </button>
                </div>
                <div class="filter-bar">
                    <input type="text" id="searchInput" placeholder="Search menu items..." class="form-control search-input" />
                    <select id="categoryFilter" class="form-control filter-select">
                        <option value="">All Categories</option>
                        <?php
                        $categories = array_unique(array_map(fn($i) => $i['category'], $menuItems));
                        foreach ($categories as $cat): ?>
                        <option value="<?php echo htmlspecialchars($cat); ?>"><?php echo htmlspecialchars(ucfirst($cat)); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <select id="featuredFilter" class="form-control filter-select">
                        <option value="">All Items</option>
                        <option value="1">Featured Only</option>
                        <option value="0">Not Featured</option>
                    </select>
                </div>
                <div class="admin-card-body">
                
                <table class="menu-table">
                    <thead>
                        <tr>
                            <th width="60">Image</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Featured</th>
                            <th>Actions</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($menuItems as $item): ?>
                        <tr data-id="<?php echo $item['id']; ?>">
                            <td>
                                <?php if (!empty($item['image'])): ?>
                                    <img src="<?php echo $item['image']; ?>" alt="<?php echo $item['name']; ?>" class="item-image">
                                <?php else: ?>
                                    <div class="item-image-placeholder"><i class="fas fa-ice-cream"></i></div>
                                <?php endif; ?>
                            </td>
                            <td><?php echo htmlspecialchars($item['name']); ?></td>
                            <td class="truncate"><?php echo htmlspecialchars($item['description']); ?></td>
                            <td>$<?php echo number_format($item['price'], 2); ?></td>
                            <td><?php echo htmlspecialchars($item['category']); ?></td>
                            <td><?php if($item['featured']): ?>
                                    <span class="featured-badge"><i class="fas fa-star"></i> Featured</span>
                                <?php else: ?>
                                    <span class="featured-badge featured-badge-not"><i class="fas fa-star"></i> Not Featured</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php 
                                $availStatus = isset($item['available']) ? $item['available'] : true;
                                if ($availStatus) {
                                    echo '<span class="availability-badge available" data-id="' . $item['id'] . '" data-status="true"><i class="fas fa-check-circle"></i> Available</span>';
                                } else {
                                    echo '<span class="availability-badge sold-out" data-id="' . $item['id'] . '" data-status="false"><i class="fas fa-times-circle"></i> Sold Out</span>';
                                }
                                ?>
                            </td>
                            <td>
                                <div class="menu-actions">
                                    <button class="edit" data-id="<?php echo $item['id']; ?>" title="Edit Item">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete" data-id="<?php echo $item['id']; ?>" title="Delete Item">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                </div><!-- /.admin-card-body -->
            </div><!-- /.admin-card -->
            
            <!-- Add extra spacing below the table -->
            <div style="height: 7rem;"></div>
            <div class="admin-card">
                <div class="admin-card-header">
                    <h2><i class="fas fa-question-circle"></i> Quick Help</h2>
                </div>
                <div class="admin-help">
                    <h3>Managing Menu Items</h3>
                    <p><strong><i class="fas fa-plus"></i> Add New Item:</strong> Click the 'Add New Item' button to create a new menu item.</p>
                    <p><strong><i class="fas fa-edit"></i> Edit Item:</strong> Click the edit icon next to an item to modify its details.</p>
                    <p><strong><i class="fas fa-trash"></i> Delete Item:</strong> Click the delete icon to remove an item from the menu.</p>
                    <p><strong><i class="fas fa-image"></i> Images:</strong> Upload or change images directly by clicking the image upload area or an image URL.</p>
                    <p><strong><i class="fas fa-star"></i> Featured Items:</strong> Featured items will appear prominently on the home page.</p>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Add/Edit Item Modal -->
    <div id="itemModal" x-data="{ open: false }" x-show="open" 
        x-transition:enter="transition-opacity duration-150 ease"
        x-transition:enter-start="opacity-0"
        x-transition:enter-end="opacity-100"
        x-transition:leave="transition-opacity duration-150 ease"
        x-transition:leave-start="opacity-100"
        x-transition:leave-end="opacity-0"
        class="modal-overlay" style="display: none;">
        <div class="modal-backdrop" @click="open = false"></div>
        <div class="modal-container">

        <div class="modal-content">
            <div class="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
            <h2 id="modalTitle" class="text-2xl font-semibold">Add New Item</h2>
            <button class="close-modal text-3xl leading-none text-gray-400 hover:text-red-400 transition" @click="open = false">&times;</button>
        </div>
            <form id="itemForm" enctype="multipart/form-data">
                <input type="hidden" id="itemId" name="id">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="name" class="form-label">Name</label>
                        <input type="text" id="name" name="name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="price" class="form-label">Price ($)</label>
                        <input type="number" id="price" name="price" step="0.01" min="0" class="form-control" required>
                    </div>
                    <div class="form-group full-width">
                        <label for="description" class="form-label">Description</label>
                        <textarea id="description" name="description" rows="3" class="form-control"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="category" class="form-label">Category</label>
                        <select id="category" name="category" class="form-control">
                            <option value="Classic">Classic</option>
                            <option value="Specialty">Specialty</option>
                            <option value="Seasonal">Seasonal</option>
                            <option value="Chocolate">Chocolate</option>
                            <option value="Fruit">Fruit</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Sorbet">Sorbet</option>
                            <option value="Toppings">Toppings</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="featured" class="form-label">Featured</label>
                        <select id="featured" name="featured" class="form-control">
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="availability" class="form-label">Availability Status</label>
                        <select id="availability" name="availability" class="form-control">
                            <option value="available">Available</option>
                            <option value="sold_out">Sold Out</option>
                            <option value="not_in_truck">Not In Truck</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label for="image" class="form-label">Image URL</label>
                        <input type="text" id="image" name="image" class="form-control" placeholder="https://example.com/image.jpg">
                        
                        <div class="image-upload-container mt-4">
                            <label class="form-label">Or Upload an Image</label>
                            <div id="imageDropzone" class="image-dropzone">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <span>Drag & drop an image or click to browse</span>
                                <input type="file" id="fileUpload" name="fileUpload" class="file-input" accept="image/jpeg,image/png,image/gif">
                            </div>
                            <div class="image-preview-container">
                                <img id="imagePreview" class="image-preview" style="display:none;">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-primary close-modal-btn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Item</button>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        // DOM elements
        const modal = document.getElementById('itemModal');
        const modalTitle = document.getElementById('modalTitle');
        const itemForm = document.getElementById('itemForm');
        const addItemBtn = document.getElementById('addItemBtn');
        const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
        const imageUrlInput = document.getElementById('image');
        const imagePreview = document.getElementById('imagePreview');
        const imageDropzone = document.getElementById('imageDropzone');
        const fileUpload = document.getElementById('fileUpload');
        
        // Initialize image upload and preview
        function initImageUpload() {
            // Preview from URL input
            imageUrlInput.addEventListener('input', function() {
                if (this.value) {
                    previewImage(this.value);
                }
            });
            
            // File upload preview
            fileUpload.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    // Check file type
                    if (!file.type.match('image.*')) {
                        alert('Please select an image file (jpg, png, gif).');
                        return;
                    }
                    
                    // Check file size (max 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                        alert('File size exceeds 2MB. Please choose a smaller image.');
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImage(e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Drag and drop handling
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                imageDropzone.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                imageDropzone.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                imageDropzone.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                imageDropzone.classList.add('highlight');
            }
            
            function unhighlight() {
                imageDropzone.classList.remove('highlight');
            }
            
            imageDropzone.addEventListener('drop', handleDrop, false);
            
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files && files[0]) {
                    fileUpload.files = files;
                    const event = new Event('change');
                    fileUpload.dispatchEvent(event);
                }
            }
        }
        
        // Helper function to preview image
        function previewImage(src) {
            imagePreview.src = src;
            imagePreview.style.display = 'block';
        }
        
        // Open modal for adding new item
        addItemBtn.addEventListener('click', function() {
            modalTitle.textContent = 'Add New Item';
            itemForm.reset();
            document.getElementById('itemId').value = '';
            if (imagePreview) imagePreview.style.display = 'none';
            
            // Use Alpine.js to open modal
            if (modal.__x) {
                modal.__x.$data.open = true;
            } else {
                // Fallback if Alpine not initialized
                console.warn('Alpine.js not initialized on modal');
                modal.style.display = 'flex';
                document.querySelector('.modal-content').style.display = 'block';
            }
        });
        
        // Close modal
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (modal.__x) {
                    modal.__x.$data.open = false;
                } else {
                    modal.style.display = 'none';
                }
            });
        });
        // No need for outside click handler, Alpine handles it.
        


        // Edit item
        document.querySelectorAll('.edit').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                modalTitle.textContent = 'Edit Item';
                
                // Make AJAX request to get item data
                fetch(`get_item.php?id=${id}`)
                    .then(async response => {
                        const text = await response.text();
                        console.log('Raw response:', text);
                        try {
                            return JSON.parse(text);
                        } catch (e) {
                            console.error('JSON parse error:', e);
                            throw new Error('Invalid JSON: ' + text);
                        }
                    })
                    .then(item => {
                        document.getElementById('itemId').value = item.id;
                        document.getElementById('name').value = item.name;
                        document.getElementById('description').value = item.description || '';
                        document.getElementById('price').value = item.price;
                        document.getElementById('category').value = item.category;
                        document.getElementById('featured').value = item.featured ? '1' : '0';
                        document.getElementById('image').value = item.image || '';
                        
                        // Set the availability dropdown based on item status
                        const availabilityDropdown = document.getElementById('availability');
                        if (item.hasOwnProperty('available') && item.available === false) {
                            availabilityDropdown.value = 'sold_out';
                        } else if (item.hasOwnProperty('in_truck') && item.in_truck === false) {
                            availabilityDropdown.value = 'not_in_truck';
                        } else {
                            availabilityDropdown.value = 'available';
                        }
                        
                        // Show image preview
                        if (item.image) {
                            previewImage(item.image);
                        } else if (imagePreview) {
                            imagePreview.style.display = 'none';
                        }
                        
                        // Use Alpine.js to open modal
                        if (modal.__x) {
                            modal.__x.$data.open = true;
                        } else {
                            // Fallback
                            modal.style.display = 'flex';
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching item:', error);
                        alert('Error loading item data. Please try again.');
                    });
            });
        });
        
        // Delete item with confirmation
        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const itemName = this.closest('tr').querySelector('td:nth-child(2)').textContent;
                
                if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
                    // Show loading state
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    this.disabled = true;
                    
                    // Make AJAX request to delete item
                    fetch('delete_item.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `id=${id}`
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Animate removal with improved performance
                            const row = document.querySelector(`tr[data-id="${id}"]`);
                            // Use a CSS class for animation instead of inline styles
                            row.classList.add('deleting');
                            // Remove after a shorter animation
                            setTimeout(() => row.remove(), 300);
                        } else {
                            alert('Error deleting item: ' + data.message);
                            this.innerHTML = '<i class="fas fa-trash"></i>';
                            this.disabled = false;
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Error deleting item. Please try again.');
                        this.innerHTML = '<i class="fas fa-trash"></i>';
                        this.disabled = false;
                    });
                }
            });
        });
        
        // Save item with file upload support
        itemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state in the save button
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;
            
            const formData = new FormData(this);
            
            // Check if we have a file upload
            const fileUpload = document.getElementById('fileUpload');
            if (fileUpload.files && fileUpload.files[0]) {
                formData.append('file_upload', fileUpload.files[0]);
            }
            
            // Make AJAX request to save item
            fetch('save_item.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message with optimized animation
                    const successMsg = document.createElement('div');
                    successMsg.className = 'success-message';
                    successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Item saved successfully!';
                    modal.querySelector('.modal-content').appendChild(successMsg);
                    
                    // Reload page faster to prevent lag
                    setTimeout(() => window.location.reload(), 500);
                } else {
                    alert('Error saving item: ' + data.message);
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error saving item. Please try again.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    </script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Availability toggle functionality
            document.querySelectorAll('.availability-badge').forEach(badge => {
                badge.addEventListener('click', function() {
                    const itemId = this.dataset.id;
                    const currentStatus = this.dataset.status === "true";
                    const newStatus = !currentStatus;
                    
                    // Show loading state
                    const originalHtml = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
                    
                    // Send AJAX request to update status
                    fetch('update_availability.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            id: itemId, 
                            available: newStatus 
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            if (newStatus) {
                                this.className = 'availability-badge available';
                                this.innerHTML = '<i class="fas fa-check-circle"></i> Available';
                                this.dataset.status = "true";
                            } else {
                                this.className = 'availability-badge sold-out';
                                this.innerHTML = '<i class="fas fa-times-circle"></i> Sold Out';
                                this.dataset.status = "false";
                            }
                        } else {
                            // Restore original state if error
                            this.innerHTML = originalHtml;
                            alert('Error updating availability');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        this.innerHTML = originalHtml;
                        alert('Error updating availability');
                    });
                });
            });

            const searchInput = document.getElementById('searchInput');
            const categoryFilter = document.getElementById('categoryFilter');
            const featuredFilter = document.getElementById('featuredFilter');
            const rows = document.querySelectorAll('.menu-table tbody tr');

            function filterRows() {
                const search = searchInput.value.toLowerCase();
                const category = categoryFilter.value;
                const featured = featuredFilter.value;
                rows.forEach(row => {
                    const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                    const desc = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                    const cat = row.querySelector('td:nth-child(5)').textContent;
                    // Check if the item is featured by looking at the badge text content
                    const featBadge = row.querySelector('td:nth-child(6) .featured-badge');
                    const feat = featBadge && !featBadge.textContent.includes('Not Featured') ? '1' : '0';
                    let visible = true;
                    // Only check the name for matches, not the description
                    if (search && !name.includes(search)) visible = false;
                    if (category && cat !== category) visible = false;
                    if (featured && feat !== featured) visible = false;
                    row.style.display = visible ? '' : 'none';
                });
            }
            searchInput.addEventListener('input', filterRows);
            categoryFilter.addEventListener('change', filterRows);
            featuredFilter.addEventListener('change', filterRows);
        });
    </script>
</body>
</html>
