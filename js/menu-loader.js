/**
 * London Ice Cream - Menu Loader
 * Dynamically loads and displays menu items from menu.json
 */

document.addEventListener('DOMContentLoaded', function() {
    loadMenuItems();
});

async function loadMenuItems() {
    const menuContainer = document.getElementById('menu-container');
    
    try {
        // Fetch menu data from JSON file with aggressive cache-busting
        const timestamp = new Date().getTime();
        const random = Math.random();
        const response = await fetch(`data/menu.json?_=${timestamp}&r=${random}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load menu data');
        }
        
        const menuItems = await response.json();
        
        // Clear loading message
        menuContainer.innerHTML = '';
        
        // Group items by category - show all items
        const categories = {};
        
        menuItems.forEach(item => {
            // Include all items, regardless of availability
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });
        
        // Display items by category
        for (const [category, items] of Object.entries(categories)) {
            // Format category name
            const formattedCategory = formatCategoryName(category);
            
            // Create category section
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = formattedCategory;
            categorySection.appendChild(categoryTitle);
            
            // Create grid for items
            const menuGrid = document.createElement('div');
            menuGrid.className = 'menu-grid';
            
            // Add items to grid
            items.forEach(item => {
                const menuItem = createMenuItem(item);
                menuGrid.appendChild(menuItem);
            });
            
            categorySection.appendChild(menuGrid);
            menuContainer.appendChild(categorySection);
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        menuContainer.innerHTML = `
            <div class="error-message">
                <p>Sorry, we couldn't load the menu items. Please try again later.</p>
            </div>
        `;
    }
}

// Reload menu data every 30 seconds while page is active to keep it fresh
setInterval(function() {
    if (document.visibilityState === 'visible') {
        loadMenuItems();
        console.log('Menu refreshed automatically');
    }
}, 30000);

// Also refresh the menu when the user comes back to the page
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        loadMenuItems();
        console.log('Menu refreshed on page revisit');
    }
});

function formatCategoryName(category) {
    // Format category names with thorough mapping of all possible categories
    const categoryMap = {
        'ice-cream': 'Ice Cream Flavors',
        'Classic': 'Classic Flavors',
        'Specialty': 'Specialty Flavors',
        'Sorbet': 'Sorbet Selection',
        'Vegan': 'Vegan Options',
        'Seasonal': 'Seasonal Specials',
        'Toppings': 'Toppings & Extras',
        'Fruit': 'Fruit Flavors',
        'Chocolate': 'Chocolate Flavors'
    };
    
    return categoryMap[category] || capitalizeFirstLetter(category);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createMenuItem(item) {
    const menuCard = document.createElement('div');
    menuCard.className = 'menu-card';
    
    // Create image element if image is available
    if (item.image) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'menu-img';
        imgContainer.style.position = 'relative'; // Ensure relative positioning
        
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.onerror = function() {
            this.onerror = null;
            this.src = 'images/placeholder.jpg';
        };
        
        // Create availability badge
        const availabilityBadge = document.createElement('div');
        availabilityBadge.className = 'status-label';
        
        // Set availability status based on both 'available' and 'in_truck' properties
        if (item.hasOwnProperty('available') && item.available === false) {
            // Sold Out
            availabilityBadge.textContent = 'SOLD OUT';
            availabilityBadge.classList.add('status-sold-out');
        } else if (item.hasOwnProperty('in_truck') && item.in_truck === false) {
            // Not in Truck
            availabilityBadge.textContent = 'NOT IN TRUCK';
            availabilityBadge.classList.add('status-not-in-truck');
        } else {
            // Available
            availabilityBadge.textContent = 'AVAILABLE';
            availabilityBadge.classList.add('status-available');
        }
        
        imgContainer.appendChild(img);
        imgContainer.appendChild(availabilityBadge);
        menuCard.appendChild(imgContainer);
    }
    
    // Create info container
    const infoContainer = document.createElement('div');
    infoContainer.className = 'menu-info';
    
    // Item name
    const itemName = document.createElement('h4');
    itemName.textContent = item.name;
    infoContainer.appendChild(itemName);
    
    // Item category badge
    const categoryBadge = document.createElement('div');
    categoryBadge.className = 'menu-category';
    categoryBadge.textContent = item.category;
    infoContainer.appendChild(categoryBadge);
    
    // Item description
    if (item.description) {
        const description = document.createElement('p');
        description.className = 'description';
        description.textContent = item.description;
        infoContainer.appendChild(description);
    }
    
    // Item price
    const price = document.createElement('p');
    price.className = 'price';
    // Ensure price is displayed correctly with $ symbol
    price.textContent = `$${Number(item.price).toFixed(2)}`;
    
    // Create badge container for organized badge display
    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'badge-container';
    infoContainer.appendChild(badgeContainer);
    
    // Add "featured" badge if the item is featured
    if (item.featured) {
        const featuredBadge = document.createElement('span');
        featuredBadge.className = 'featured-badge';
        featuredBadge.innerHTML = '<i class="fas fa-star"></i> Featured';
        badgeContainer.appendChild(featuredBadge);
    }
    
    // We no longer need to add the availability badge here, since it's now on the image
    
    infoContainer.appendChild(price);
    menuCard.appendChild(infoContainer);
    
    return menuCard;
}
