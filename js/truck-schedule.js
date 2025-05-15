/*
 * London Ice Cream Truck - Schedule Features
 * Additional JavaScript for truck schedule and map integration
 */

// Build the weekly schedule UI
function buildWeeklySchedule() {
    if (!truckScheduleData || !truckScheduleData.weekly || truckScheduleData.weekly.length === 0) return;
    
    const dayTabs = document.getElementById('day-tabs');
    const dayContent = document.getElementById('day-content');
    
    // Clear previous content
    if (!dayTabs || !dayContent) return;
    
    dayTabs.innerHTML = '';
    dayContent.innerHTML = '';
    
    // Get current day name to highlight the current day tab
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    // Create tabs and content for each day
    truckScheduleData.weekly.forEach((dayData, index) => {
        // Create tab button
        const tabBtn = document.createElement('button');
        tabBtn.className = 'day-tab' + (dayData.day === today ? ' active' : '');
        tabBtn.setAttribute('data-day', dayData.day);
        tabBtn.textContent = dayData.day;
        dayTabs.appendChild(tabBtn);
        
        // Create content panel
        const contentPanel = document.createElement('div');
        contentPanel.className = 'day-panel' + (dayData.day === today ? ' active' : '');
        contentPanel.setAttribute('data-day', dayData.day);
        
        // Add locations for this day
        if (dayData.locations && dayData.locations.length > 0) {
            const locationsList = document.createElement('ul');
            locationsList.className = 'location-list';
            
            dayData.locations.forEach(loc => {
                const locationItem = document.createElement('li');
                locationItem.innerHTML = `<span class="time">${loc.time}:</span> ${loc.location} <small>(${loc.address})</small>`;
                locationsList.appendChild(locationItem);
            });
            
            contentPanel.appendChild(locationsList);
        } else {
            const noLocations = document.createElement('p');
            noLocations.className = 'no-locations';
            noLocations.textContent = 'No scheduled stops for this day.';
            contentPanel.appendChild(noLocations);
        }
        
        dayContent.appendChild(contentPanel);
    });
}

// Add weekly schedule locations to the map
function addWeeklyLocationsToMap() {
    if (!truckScheduleData || !truckScheduleData.weekly || truckScheduleData.weekly.length === 0 || !truckMap) return;
    
    // Create bounds to fit all locations
    const bounds = new google.maps.LatLngBounds();
    
    // Add current location to bounds
    if (truckScheduleData.current) {
        bounds.extend({
            lat: parseFloat(truckScheduleData.current.lat),
            lng: parseFloat(truckScheduleData.current.lng)
        });
    }
    
    // Marker colors for different days
    const colors = {
        'Monday': '#FF9999',
        'Tuesday': '#FFCC99',
        'Wednesday': '#FFFF99',
        'Thursday': '#99FF99',
        'Friday': '#99CCFF',
        'Saturday': '#CC99FF',
        'Sunday': '#FF99CC'
    };
    
    // Process each day's locations
    truckScheduleData.weekly.forEach(dayData => {
        if (!dayData.locations) return;
        
        dayData.locations.forEach(loc => {
            // Create marker for each location
            const position = {
                lat: parseFloat(loc.lat),
                lng: parseFloat(loc.lng)
            };
            
            // Skip if this is the current location (already has a marker)
            if (truckScheduleData.current && 
                truckScheduleData.current.lat === loc.lat && 
                truckScheduleData.current.lng === loc.lng) {
                return;
            }
            
            // Create marker
            const marker = new google.maps.Marker({
                position: position,
                map: truckMap,
                title: loc.location,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: colors[dayData.day] || '#FF85A2',
                    fillOpacity: 0.7,
                    strokeWeight: 1,
                    strokeColor: '#FFFFFF',
                    scale: 8
                }
            });
            
            // Create info window
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px;">
                        <h3 style="font-size: 16px; margin-bottom: 5px;">${loc.location}</h3>
                        <p style="font-size: 14px; margin-bottom: 5px;">${loc.address}</p>
                        <p style="font-size: 14px; margin-bottom: 5px;"><strong>${dayData.day}:</strong> ${loc.time}</p>
                    </div>
                `
            });
            
            // Add click event
            marker.addListener('click', function() {
                infoWindow.open(truckMap, marker);
            });
            
            // Extend bounds
            bounds.extend(position);
        });
    });
    
    // Fit map to bounds with padding
    truckMap.fitBounds(bounds, { padding: 50 });
}

// Setup day tabs click handlers
function setupDayTabs() {
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('day-tab')) {
            const day = e.target.getAttribute('data-day');
            
            // Update active tab
            document.querySelectorAll('.day-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Update active panel
            document.querySelectorAll('.day-panel').forEach(panel => {
                panel.classList.remove('active');
                if (panel.getAttribute('data-day') === day) {
                    panel.classList.add('active');
                }
            });
        }
    });
}
