/**
 * Truck Schedule Admin JavaScript
 * Handles all truck schedule management functionality
 */

// Global variables
let currentLocationMap = null;
let currentLocationMarker = null;
let editLocationMap = null;
let editLocationMarker = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Truck admin JS loaded');
    
    // Initialize maps
    initializeCurrentLocationMap();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Initialize the current location map
 */
function initializeCurrentLocationMap() {
    const mapContainer = document.getElementById('currentLocationMap');
    if (!mapContainer) return;
    
    // Get default coordinates or use London
    const lat = parseFloat(mapContainer.dataset.lat || 51.505);
    const lng = parseFloat(mapContainer.dataset.lng || -0.09);
    
    // Initialize the map
    currentLocationMap = L.map('currentLocationMap').setView([lat, lng], 14);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(currentLocationMap);
    
    // Add marker
    currentLocationMarker = L.marker([lat, lng]).addTo(currentLocationMap);
}

/**
 * Initialize the edit location map
 */
function initializeEditLocationMap(lat = 51.505, lng = -0.09) {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) return;
    
    // Clean up previous map instances
    if (editLocationMap) {
        editLocationMap.remove();
    }
    
    // Initialize the map
    editLocationMap = L.map('mapContainer').setView([lat, lng], 14);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(editLocationMap);
    
    // Add marker
    editLocationMarker = L.marker([lat, lng]).addTo(editLocationMap);
    
    // Handle map clicks to update coordinates
    editLocationMap.on('click', function(e) {
        const clickLat = e.latlng.lat.toFixed(6);
        const clickLng = e.latlng.lng.toFixed(6);
        
        // Update marker position
        editLocationMarker.setLatLng([clickLat, clickLng]);
        
        // Update form fields
        document.getElementById('latInput').value = clickLat;
        document.getElementById('lngInput').value = clickLng;
    });
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Update current location button
    const updateCurrentBtn = document.getElementById('updateCurrentBtn');
    if (updateCurrentBtn) {
        updateCurrentBtn.addEventListener('click', function() {
            const modal = document.getElementById('currentLocationModal');
            if (modal) {
                modal.style.display = 'block';
                updateLocationOptions();
            }
        });
    }
    
    // Add location buttons
    document.querySelectorAll('.add-location-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            showEditLocationModal(day, -1);
        });
    });
    
    // Edit location buttons
    document.querySelectorAll('.edit-location-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            const index = parseInt(this.getAttribute('data-index'));
            showEditLocationModal(day, index);
        });
    });
    
    // Delete location buttons
    document.querySelectorAll('.delete-location-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this location?')) {
                const day = this.getAttribute('data-day');
                const index = parseInt(this.getAttribute('data-index'));
                deleteLocation(day, index);
            }
        });
    });
    
    // Set as current buttons
    document.querySelectorAll('.set-current-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            const index = parseInt(this.getAttribute('data-index'));
            setAsCurrent(day, index);
        });
    });
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Form submissions
    const locationForm = document.getElementById('locationForm');
    if (locationForm) {
        locationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveLocation();
        });
    }
    
    const currentLocationForm = document.getElementById('currentLocationForm');
    if (currentLocationForm) {
        currentLocationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCurrentLocation();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

/**
 * Show edit location modal
 */
function showEditLocationModal(day, index) {
    // Get form elements
    const form = document.getElementById('locationForm');
    const modalTitle = document.getElementById('modalTitle');
    const modal = document.getElementById('locationModal');
    
    if (!form || !modalTitle || !modal) return;
    
    // Set form fields
    document.getElementById('dayInput').value = day;
    document.getElementById('indexInput').value = index;
    
    // Default coordinates for London
    let lat = 51.505;
    let lng = -0.09;
    
    if (index === -1) {
        // Adding new location
        modalTitle.textContent = 'Add New Location';
        form.reset();
        document.getElementById('dayInput').value = day;
        
        // Set default status
        const statusInput = document.getElementById('statusInput');
        if (statusInput) {
            statusInput.value = 'serving';
        }
    } else {
        // Get location data from page data attribute
        const locationsList = document.querySelector(`.day-schedule[data-day="${day}"] .location-list`);
        if (locationsList) {
            const locationItem = locationsList.querySelector(`.location-item:nth-child(${index + 1})`);
            if (locationItem) {
                modalTitle.textContent = 'Edit Location';
                
                // Fill form with location data
                const locationData = JSON.parse(locationItem.dataset.location || '{}');
                document.getElementById('locationInput').value = locationData.location || '';
                document.getElementById('timeInput').value = locationData.time || '';
                document.getElementById('addressInput').value = locationData.address || '';
                document.getElementById('untilInput').value = locationData.until || '';
                
                // Set coordinates if available
                if (locationData.lat && locationData.lng) {
                    lat = parseFloat(locationData.lat);
                    lng = parseFloat(locationData.lng);
                    document.getElementById('latInput').value = lat;
                    document.getElementById('lngInput').value = lng;
                }
                
                // Set status if available
                const statusInput = document.getElementById('statusInput');
                if (statusInput && locationData.status) {
                    statusInput.value = locationData.status;
                }
                
                // Set message if available
                const messageInput = document.getElementById('messageInput');
                if (messageInput) {
                    messageInput.value = locationData.message || '';
                }
            }
        }
    }
    
    // Initialize map
    initializeEditLocationMap(lat, lng);
    
    // Show modal
    modal.style.display = 'block';
}

// Helper functions for AJAX calls
function saveLocation() {
    // Implementation for saving location
    alert('Save function would be called here');
    
    // Close modal
    document.getElementById('locationModal').style.display = 'none';
    
    // In a real implementation, you would collect form data and submit via AJAX
    // Then refresh the page or update the UI on success
}

function deleteLocation(day, index) {
    // Implementation for deleting location
    alert(`Delete location for ${day} at index ${index}`);
    
    // In a real implementation, you would submit via AJAX
    // Then refresh the page or update the UI on success
}

function setAsCurrent(day, index) {
    // Implementation for setting as current
    alert(`Set as current: ${day} at index ${index}`);
    
    // In a real implementation, you would submit via AJAX
    // Then refresh the page or update the UI on success
}

function updateLocationOptions() {
    // Implementation for updating location options
    console.log('Updating location options');
    
    // In a real implementation, you would populate dropdown based on available locations
}

function saveCurrentLocation() {
    // Implementation for saving current location
    alert('Current location would be saved here');
    
    // Close modal
    document.getElementById('currentLocationModal').style.display = 'none';
    
    // In a real implementation, you would collect form data and submit via AJAX
    // Then refresh the page or update the UI on success
}
