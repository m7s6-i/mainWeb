/*
 * London Ice Cream Truck - Interactive Features
 * JavaScript for truck locator, weather integration, and other interactive elements
 */

// Store truck schedule data globally
let truckScheduleData = {
    current: null,
    weekly: []
};

let truckMap = null;
let truckMarker = null;

document.addEventListener('DOMContentLoaded', function() {
    // Load truck schedule data
    loadTruckSchedule();
    
    // Initialize forms
    initForms();
    
    // Initialize loyalty card effects
    initLoyaltyCard();
    
    // Set up day tabs click handlers
    setupDayTabs();
});

// Load truck schedule data from API
function loadTruckSchedule() {
    fetch('api/truck_schedule.php')
        .then(response => response.json())
        .then(data => {
            // Store data globally
            truckScheduleData = data;
            
            // Initialize Google Maps with the data
            initTruckMap();
            
            // Update the current location information
            updateCurrentLocationInfo();
            
            // Build the weekly schedule UI
            buildWeeklySchedule();
        })
        .catch(error => {
            console.error('Error loading truck schedule:', error);
            // Show fallback UI if data can't be loaded
            showFallbackUI();
        });
}

// Initialize Google Maps for truck locator
function initTruckMap() {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
        showMapPlaceholder();
        return;
    }
    
    // Check if we have current location data
    if (!truckScheduleData.current) {
        showMapPlaceholder();
        return;
    }
    
    // Get current truck location coordinates
    const currentLocation = truckScheduleData.current;
    const truckLocation = { 
        lat: parseFloat(currentLocation.lat), 
        lng: parseFloat(currentLocation.lng) 
    };

    // Create map centered on truck location
    truckMap = new google.maps.Map(document.getElementById('truck-map'), {
        center: truckLocation,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
            { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
            { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
            { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
            { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
        ]
    });

    // Custom marker for the ice cream truck
    truckMarker = new google.maps.Marker({
        position: truckLocation,
        map: truckMap,
        animation: google.maps.Animation.DROP,
        title: 'London Ice Cream Truck'
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px;">
                <h3 style="font-size: 16px; margin-bottom: 5px;">${currentLocation.location}</h3>
                <p style="font-size: 14px; margin-bottom: 5px;">${currentLocation.address}</p>
                <p style="font-size: 14px;">Until: ${currentLocation.until}</p>
            </div>
        `
    });

    // Open info window when marker is clicked
    truckMarker.addListener('click', function() {
        infoWindow.open(truckMap, truckMarker);
    });
    
    // Also add weekly schedule locations to map
    addWeeklyLocationsToMap();
}

// Show fallback UI if data can't be loaded or Google Maps is unavailable
function showFallbackUI() {
    showMapPlaceholder();
    
    // Show placeholder text for current location
    document.getElementById('current-truck-location').textContent = 'Schedule data unavailable';
    document.getElementById('current-truck-address').textContent = 'Please check back later';
    document.getElementById('location-time').textContent = 'N/A';
    
    // Disable get directions button
    const directionsBtn = document.getElementById('get-directions-btn');
    directionsBtn.classList.add('disabled');
    directionsBtn.href = '#';
    
    // Show placeholder for weekly schedule
    const dayTabs = document.getElementById('day-tabs');
    const dayContent = document.getElementById('day-content');
    
    dayTabs.innerHTML = '<p class="no-data">Weekly schedule unavailable</p>';
    dayContent.innerHTML = '<p class="no-data">Please check back later or contact us for the latest schedule.</p>';
}

// Show a placeholder when the map can't be loaded
function showMapPlaceholder() {
    document.getElementById('truck-map').innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column; background-color: #f8f9fa; text-align: center; padding: 2rem;">
            <i class="fas fa-map-marked-alt" style="font-size: 5rem; color: #FF85A2; margin-bottom: 2rem;"></i>
            <h3>Interactive Truck Map</h3>
            <p>Map currently unavailable</p>
            <small>(Please enable JavaScript or check your connection)</small>
        </div>
    `;
}

// Initialize form submissions
function initForms() {
    // Event booking form
    const eventForm = document.getElementById('eventBookingForm');
    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your booking request! We will contact you shortly to confirm details.');
            eventForm.reset();
        });
    }
    
    // Loyalty signup form
    const loyaltyForm = document.getElementById('loyaltySignupForm');
    if (loyaltyForm) {
        loyaltyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Welcome to our rewards program! Your digital loyalty card has been activated.');
            loyaltyForm.reset();
        });
    }
    
    // Request visit button
    const requestVisitBtn = document.querySelector('.request-visit-btn');
    if (requestVisitBtn) {
        requestVisitBtn.addEventListener('click', function() {
            alert('To request a visit, please contact us at info@londonicecream.com with your neighborhood details.');
        });
    }
}

// Initialize loyalty card flip effect
function initLoyaltyCard() {
    const loyaltyCard = document.querySelector('.loyalty-card-inner');
    if (loyaltyCard) {
        loyaltyCard.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
    }
}

// Update current location information on the page
function updateCurrentLocationInfo() {
    if (!truckScheduleData.current) return;
    
    const current = truckScheduleData.current;
    
    // Update text information
    document.getElementById('current-truck-location').textContent = current.location;
    document.getElementById('current-truck-address').textContent = current.address;
    document.getElementById('location-time').textContent = current.until;
    
    // Update directions link
    const directionsBtn = document.getElementById('get-directions-btn');
    if (directionsBtn) {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${current.lat},${current.lng}&destination_place_id=${encodeURIComponent(current.location)}`;
        directionsBtn.href = mapsUrl;
    }
}
