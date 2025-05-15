<?php
require_once 'config.php';
requireLogin();

$scheduleData = loadJson(TRUCK_SCHEDULE_FILE);
$currentLocation = null;

// Find the current location entry (item with id 8)
foreach ($scheduleData as $item) {
    if (isset($item['id']) && $item['id'] === 8 && isset($item['current'])) {
        $currentLocation = $item['current'];
        break;
    }
}

// Extract just the weekly schedule (items with id 1-7)
$weeklySchedule = array_filter($scheduleData, function($item) {
    return isset($item['id']) && $item['id'] >= 1 && $item['id'] <= 7;
});
usort($weeklySchedule, function($a, $b) {
    return $a['id'] - $b['id']; // Sort by ID to ensure days are in order
});
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <title>Truck Schedule Admin - Duh-Lish-Us Treatery</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Pacifico&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Leaflet Map CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="anonymous">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/admin-style.css">
    <link rel="stylesheet" href="../css/truck-admin.css">
    <!-- Leaflet Map JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin="anonymous"></script>
    <script src="../js/truck-admin.js"></script>
</head>
<body>
    <header class="admin-header">
        <div class="container">
            <h1>Duh-Lish-Us <span>Treatery </span> Admin</h1>
            <div class="user-info">
                <span><i class="fas fa-user-circle"></i> Welcome, <?php echo $_SESSION['user']['username']; ?></span>
                <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        </div>
    </header>
    
    <nav class="admin-nav">
        <div class="container">
            <ul class="admin-nav-menu">
                <li><a href="index.php"><i class="fas fa-ice-cream"></i> Menu Management</a></li>
                <li class="active"><a href="truck_schedule.php"><i class="fas fa-truck"></i> Truck Schedule</a></li>
            </ul>
        </div>
    </nav>
    
    <main class="admin-content">
        <div class="container">
            <!-- Current Location Section -->
            <div class="admin-card" id="currentLocationCard">
                <div class="admin-card-header">
                    <h2><i class="fas fa-map-marker-alt"></i> Current Truck Location</h2>
                    <button id="updateCurrentBtn" class="btn btn-primary">
                        <i class="fas fa-edit"></i> Update Current Location
                    </button>
                </div>
                <div class="admin-card-body">
                    <div class="current-location-display">
                        <div class="location-info">
                            <p><strong>Day:</strong> <span id="currentDay"><?php echo $currentLocation['day'] ?? 'Not set'; ?></span></p>
                            <p><strong>Time:</strong> <span id="currentTime"><?php echo $currentLocation['time'] ?? 'Not set'; ?></span></p>
                            <p><strong>Location:</strong> <span id="currentLocation"><?php echo $currentLocation['location'] ?? 'Not set'; ?></span></p>
                            <p><strong>Address:</strong> <span id="currentAddress"><?php echo $currentLocation['address'] ?? 'Not set'; ?></span></p>
                            <p><strong>Until:</strong> <span id="currentUntil"><?php echo $currentLocation['until'] ?? 'Not set'; ?></span></p>
                            <p><strong>Status:</strong> <span id="currentStatus" class="truck-status <?php echo strtolower($currentLocation['status'] ?? 'serving'); ?>">
                                <?php 
                                    $status = $currentLocation['status'] ?? 'serving';
                                    $statusIcon = '';
                                    $statusText = 'Serving';
                                    
                                    switch($status) {
                                        case 'en_route':
                                            $statusIcon = '<i class="fas fa-truck"></i>';
                                            $statusText = 'En Route';
                                            break;
                                        case 'closed':
                                            $statusIcon = '<i class="fas fa-times-circle"></i>';
                                            $statusText = 'Closed';
                                            break;
                                        default: // 'serving'
                                            $statusIcon = '<i class="fas fa-ice-cream"></i>';
                                            $statusText = 'Serving';
                                    }
                                    echo $statusIcon . ' ' . $statusText;
                                ?>
                            </span></p>
                            <?php if (!empty($currentLocation['message'])): ?>
                            <p><strong>Message:</strong> <span id="currentMessage"><?php echo $currentLocation['message'] ?? ''; ?></span></p>
                            <?php endif; ?>
                        </div>
                        <div class="map-preview">
                            <div id="currentLocationMap" 
                                 data-lat="<?php echo htmlspecialchars($currentLocation['lat'] ?? '51.505'); ?>" 
                                 data-lng="<?php echo htmlspecialchars($currentLocation['lng'] ?? '-0.09'); ?>" 
                                 style="width: 100%; height: 300px; border-radius: 8px;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Weekly Schedule Section -->
            <div class="admin-card">
                <div class="admin-card-header">
                    <h2><i class="fas fa-calendar-alt"></i> Weekly Schedule</h2>
                </div>
                <div class="admin-card-body">
                    <div class="schedule-tabs" x-data="{ activeDay: 'Monday' }">
                        <div class="tab-headers">
                            <?php foreach ($weeklySchedule as $day): ?>
                            <button 
                                class="tab-btn" 
                                :class="activeDay === '<?php echo $day['day']; ?>' ? 'active' : ''"
                                @click="activeDay = '<?php echo $day['day']; ?>'"
                            >
                                <?php echo $day['day']; ?>
                            </button>
                            <?php endforeach; ?>
                        </div>
                        
                        <div class="tab-content">
                            <?php foreach ($weeklySchedule as $day): ?>
                            <div class="day-schedule" x-show="activeDay === '<?php echo $day['day']; ?>'">
                                <h3><?php echo $day['day']; ?> Schedule</h3>
                                <div class="location-list">
                                    <?php if (!empty($day['locations'])): ?>
                                        <?php foreach ($day['locations'] as $index => $loc): ?>
                                        <div class="location-item" data-day="<?php echo $day['day']; ?>" data-index="<?php echo $index; ?>">
                                            <div class="location-details">
                                                <h4><?php echo $loc['location']; ?></h4>
                                                <p><strong>Time:</strong> <?php echo $loc['time']; ?></p>
                                                <p><strong>Address:</strong> <?php echo $loc['address']; ?></p>
                                                <p><strong>Coordinates:</strong> <?php echo $loc['lat']; ?>, <?php echo $loc['lng']; ?></p>
                                            </div>
                                            <div class="location-actions">
                                                <button class="btn btn-outline edit-location-btn" data-day="<?php echo $day['day']; ?>" data-index="<?php echo $index; ?>">
                                                    <i class="fas fa-edit"></i> Edit
                                                </button>
                                                <button class="btn btn-danger delete-location-btn" data-day="<?php echo $day['day']; ?>" data-index="<?php echo $index; ?>">
                                                    <i class="fas fa-trash"></i> Delete
                                                </button>
                                                <button class="btn btn-primary set-current-btn" data-day="<?php echo $day['day']; ?>" data-index="<?php echo $index; ?>">
                                                    <i class="fas fa-map-marker-alt"></i> Set as Current
                                                </button>
                                            </div>
                                        </div>
                                        <?php endforeach; ?>
                                    <?php else: ?>
                                        <p class="no-locations">No locations scheduled for this day.</p>
                                    <?php endif; ?>
                                </div>
                                <button class="btn btn-primary add-location-btn" data-day="<?php echo $day['day']; ?>">
                                    <i class="fas fa-plus"></i> Add Location
                                </button>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Location Edit Modal -->
    <div id="locationModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Add/Edit Location</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="locationForm">
                    <input type="hidden" id="dayInput" name="day">
                    <input type="hidden" id="indexInput" name="index" value="-1">
                    
                    <div class="form-group">
                        <label for="locationInput">Location Name</label>
                        <input type="text" id="locationInput" name="location" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="timeInput">Time</label>
                        <input type="text" id="timeInput" name="time" placeholder="10:00 AM - 12:00 PM" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="addressInput">Address</label>
                        <input type="text" id="addressInput" name="address" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group form-group-half">
                            <label for="latInput">Latitude</label>
                            <input type="number" id="latInput" name="lat" step="0.0001" required>
                        </div>
                        
                        <div class="form-group form-group-half">
                            <label for="lngInput">Longitude</label>
                            <input type="number" id="lngInput" name="lng" step="0.0001" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="statusInput">Truck Status</label>
                        <select id="statusInput" name="status" class="form-control">
                            <option value="serving">Currently Serving</option>
                            <option value="en_route">En Route</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="messageInput">Custom Message (Optional)</label>
                        <textarea id="messageInput" name="message" class="form-control" rows="2" placeholder="Special announcement or additional information"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="lngInput">Longitude</label>
                        <input type="number" id="lngInput" name="lng" step="0.0001" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" id="findOnMapBtn" class="btn btn-outline">
                            <i class="fas fa-map"></i> Find on Map
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Save Location
                        </button>
                    </div>
                </form>
                
                <div id="locationMapContainer">
                    <div id="locationMap" style="width: 100%; height: 300px; border-radius: 8px; margin-top: 20px;"></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Current Location Update Modal -->
    <div id="currentLocationModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Update Current Location</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="currentLocationForm">
                    <div class="form-group">
                        <label for="currentDaySelect">Day</label>
                        <select id="currentDaySelect" name="day" required>
                            <?php foreach ($weeklySchedule as $day): ?>
                            <option value="<?php echo $day['day']; ?>"><?php echo $day['day']; ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="currentLocationSelect">Location</label>
                        <select id="currentLocationSelect" name="location" required>
                            <option value="">-- Select Location --</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="untilInput">Until (time)</label>
                        <input type="text" id="untilInput" name="until" placeholder="3:00 PM" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Update Current Location
                    </button>
                </form>
            </div>
        </div>
    </div>
    
    <script>
        // Store schedule data for client-side access
        const scheduleData = <?php echo json_encode($weeklySchedule); ?>;
        const currentLocation = <?php echo json_encode($currentLocation); ?>;
        
        // Global variables for map instances
        let currentLocationMap = null;
        let currentLocationMarker = null;
        let editLocationMap = null;
        let editLocationMarker = null;
        
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the current location map
            initializeMap();
            
            // Add event listeners for all buttons
            setupEventListeners();
            
            // Initialize Leaflet maps
            initializeMap();
            
            // Initialize modals
            const locationModal = document.getElementById('locationModal');
            const currentLocationModal = document.getElementById('currentLocationModal');
            const closeButtons = document.querySelectorAll('.close-modal');
            
            // Close modal buttons
            closeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    locationModal.style.display = 'none';
                    currentLocationModal.style.display = 'none';
                });
            });
            
            // Add location buttons
            const addLocationBtns = document.querySelectorAll('.add-location-btn');
            addLocationBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const day = this.getAttribute('data-day');
                    showAddLocationModal(day);
                });
            });
            
            // Edit location buttons
            const editLocationBtns = document.querySelectorAll('.edit-location-btn');
            editLocationBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const day = this.getAttribute('data-day');
                    const index = parseInt(this.getAttribute('data-index'));
                    showEditLocationModal(day, index);
                });
            });
            
            // Delete location buttons
            const deleteLocationBtns = document.querySelectorAll('.delete-location-btn');
            deleteLocationBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const day = this.getAttribute('data-day');
                    const index = parseInt(this.getAttribute('data-index'));
                    confirmDeleteLocation(day, index);
                });
            });
            
            // Set as current location buttons
            const setCurrentBtns = document.querySelectorAll('.set-current-btn');
            setCurrentBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const day = this.getAttribute('data-day');
                    const index = parseInt(this.getAttribute('data-index'));
                    setCurrentLocation(day, index);
                });
            });
            
            // Update current location button
            document.getElementById('updateCurrentBtn').addEventListener('click', function() {
                showCurrentLocationModal();
            });
            
            // Location form submission
            document.getElementById('locationForm').addEventListener('submit', function(e) {
                e.preventDefault();
                saveLocationData();
            });
            
            // Current location form submission
            document.getElementById('currentLocationForm').addEventListener('submit', function(e) {
                e.preventDefault();
                saveCurrentLocation();
            });
            
            // Current day select change event
            document.getElementById('currentDaySelect').addEventListener('change', function() {
                updateLocationOptions();
            });
            
            // Initialize map if Google Maps API is loaded
            if (typeof google !== 'undefined' && google.maps) {
                initializeMap();
            }
            
            // Initialize the location options for current location modal
            updateLocationOptions();
        });
        
        function showAddLocationModal(day) {
            // Reset form
            const form = document.getElementById('locationForm');
            form.reset();
            
            // Set day and index
            document.getElementById('dayInput').value = day;
            document.getElementById('indexInput').value = -1;
            
            // Update modal title
            document.getElementById('modalTitle').textContent = `Add Location for ${day}`;
            
            // Show modal
            document.getElementById('locationModal').style.display = 'block';
        }
        
        function showEditLocationModal(day, index) {
            // Find the day in schedule data
            const dayData = scheduleData.find(d => d.day === day);
            if (!dayData || !dayData.locations || !dayData.locations[index]) return;
            
            const location = dayData.locations[index];
            
            // Fill form
            document.getElementById('dayInput').value = day;
            document.getElementById('indexInput').value = index;
            document.getElementById('locationInput').value = location.location;
            document.getElementById('timeInput').value = location.time;
            document.getElementById('addressInput').value = location.address;
            document.getElementById('latInput').value = location.lat;
            document.getElementById('lngInput').value = location.lng;
            
            // Update modal title
            document.getElementById('modalTitle').textContent = `Edit Location for ${day}`;
            
            // Show modal
            document.getElementById('locationModal').style.display = 'block';
            
            // Update map if available
            if (typeof google !== 'undefined' && google.maps && window.locationMap) {
                const position = { lat: parseFloat(location.lat), lng: parseFloat(location.lng) };
                window.locationMarker.setPosition(position);
                window.locationMap.setCenter(position);
            }
        }
        
        function confirmDeleteLocation(day, index) {
            if (confirm('Are you sure you want to delete this location?')) {
                // Create form data for the AJAX request
                const formData = new FormData();
                formData.append('action', 'delete_location');
                formData.append('day', day);
                formData.append('index', index);
                
                // Send AJAX request
                fetch('save_truck_location.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Location deleted successfully!');
                        window.location.reload();
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while trying to delete the location.');
                });
            }
        }
        
        function setCurrentLocation(day, index) {
            // Find the day in schedule data
            const dayData = scheduleData.find(d => d.day === day);
            if (!dayData || !dayData.locations || !dayData.locations[index]) return;
            
            const location = dayData.locations[index];
            
            // Show current location modal with pre-filled data
            document.getElementById('currentDaySelect').value = day;
            updateLocationOptions();
            document.getElementById('currentLocationSelect').value = index;
            document.getElementById('untilInput').value = location.time.split(' - ')[1];
            
            // Show modal
            document.getElementById('currentLocationModal').style.display = 'block';
        }
        
        function showCurrentLocationModal() {
            // Show modal with current values if available
            if (currentLocation) {
                document.getElementById('currentDaySelect').value = currentLocation.day;
                updateLocationOptions();
                
                // Find the index of the current location
                const dayData = scheduleData.find(d => d.day === currentLocation.day);
                if (dayData && dayData.locations) {
                    const index = dayData.locations.findIndex(loc => 
                        loc.location === currentLocation.location && 
                        loc.address === currentLocation.address
                    );
                    
                    if (index !== -1) {
                        document.getElementById('currentLocationSelect').value = index;
                    }
                }
                
                document.getElementById('untilInput').value = currentLocation.until;
            }
            
            // Show modal
            document.getElementById('currentLocationModal').style.display = 'block';
        }
        
        function updateLocationOptions() {
            const daySelect = document.getElementById('currentDaySelect');
            const locationSelect = document.getElementById('currentLocationSelect');
            const selectedDay = daySelect.value;
            
            // Clear current options
            locationSelect.innerHTML = '<option value="">-- Select Location --</option>';
            
            // Find the day in schedule data
            const dayData = scheduleData.find(d => d.day === selectedDay);
            if (!dayData || !dayData.locations) return;
            
            // Add location options
            dayData.locations.forEach((loc, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${loc.location} (${loc.time})`;
                locationSelect.appendChild(option);
            });
        }
        
        function saveLocationData() {
            const form = document.getElementById('locationForm');
            const formData = new FormData(form);
            formData.append('action', 'save_location');
            
            // Send AJAX request
            fetch('save_truck_location.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Location saved successfully!');
                    window.location.reload();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while trying to save the location.');
            });
        }
        
        function saveCurrentLocation() {
            const form = document.getElementById('currentLocationForm');
            const formData = new FormData(form);
            formData.append('action', 'update_current');
            
            // Add the selected location data
            const daySelect = document.getElementById('currentDaySelect');
            const locationSelect = document.getElementById('currentLocationSelect');
            const selectedDay = daySelect.value;
            const selectedIndex = locationSelect.value;
            
            // Find the location data
            const dayData = scheduleData.find(d => d.day === selectedDay);
            if (!dayData || !dayData.locations || !dayData.locations[selectedIndex]) {
                alert('Please select a valid location.');
                return;
            }
            
            const location = dayData.locations[selectedIndex];
            formData.append('location_data', JSON.stringify(location));
            
            // Send AJAX request
            fetch('save_truck_location.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Current location updated successfully!');
                    window.location.reload();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while trying to update the current location.');
            });
        }
        
        function setupEventListeners() {
            console.log('Setting up event listeners');
            
            // Update Current Location button
            const updateCurrentBtn = document.getElementById('updateCurrentBtn');
            if (updateCurrentBtn) {
                updateCurrentBtn.addEventListener('click', function() {
                    document.getElementById('currentLocationModal').style.display = 'block';
                    updateLocationOptions();
                });
            }
            
            // Add Location buttons
            const addLocationBtns = document.querySelectorAll('.add-location-btn');
            addLocationBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const day = this.getAttribute('data-day');
                    showEditLocationModal(day, -1); // -1 indicates new location
                });
            });
            
            // Edit Location buttons
            const editLocationBtns = document.querySelectorAll('.edit-location-btn');
            editLocationBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const day = this.getAttribute('data-day');
                    const index = parseInt(this.getAttribute('data-index'));
                    showEditLocationModal(day, index);
                });
            });
            
            // Delete Location buttons
            const deleteLocationBtns = document.querySelectorAll('.delete-location-btn');
            deleteLocationBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    if (confirm('Are you sure you want to delete this location?')) {
                        const day = this.getAttribute('data-day');
                        const index = parseInt(this.getAttribute('data-index'));
                        deleteLocation(day, index);
                    }
                });
            });
            
            // Set as Current buttons
            const setCurrentBtns = document.querySelectorAll('.set-current-btn');
            setCurrentBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const day = this.getAttribute('data-day');
                    const index = parseInt(this.getAttribute('data-index'));
                    setAsCurrent(day, index);
                });
            });
            
            // Modal close buttons
            const closeButtons = document.querySelectorAll('.close-modal');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const modal = this.closest('.modal');
                    modal.style.display = 'none';
                });
            });
            
            // Form submission handlers
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
            
            // Clicking outside modal to close
            window.addEventListener('click', function(e) {
                if (e.target.classList.contains('modal')) {
                    e.target.style.display = 'none';
                }
            });
        }

        function initializeMap() {
            console.log('Initializing maps');
            // Initialize map for current location using Leaflet and OpenStreetMap
            const currentMapEl = document.getElementById('currentLocationMap');
            if (currentMapEl && currentLocation) {
                const lat = parseFloat(currentLocation.lat || 51.505);
                const lng = parseFloat(currentLocation.lng || -0.09);
                
                // Check if map already initialized
                if (currentLocationMap) {
                    currentLocationMap.remove();
                }
                
                // Initialize the map
                currentLocationMap = L.map('currentLocationMap').setView([lat, lng], 14);
                
                // Add OpenStreetMap tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(currentLocationMap);
                
                // Add marker for the current location
                currentLocationMarker = L.marker([lat, lng]).addTo(currentLocationMap)
                    .bindPopup(currentLocation.location + '<br>' + currentLocation.address)
                    .openPopup();
            }
                
                marker.addListener('click', function() {
                    infoWindow.open(map, marker);
                });
            }
            
            // Initialize map for location editing
            const locationMapEl = document.getElementById('locationMap');
            if (locationMapEl) {
                // Default to London
                const defaultPosition = { lat: 51.5074, lng: -0.1278 };
                
                const map = new google.maps.Map(locationMapEl, {
                    center: defaultPosition,
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                
                const marker = new google.maps.Marker({
                    position: defaultPosition,
                    map: map,
                    draggable: true
                });
                
                // Update lat/lng inputs when marker is dragged
                marker.addListener('dragend', function() {
                    const position = marker.getPosition();
                    document.getElementById('latInput').value = position.lat();
                    document.getElementById('lngInput').value = position.lng();
                });
                
                // Add click event to map
                map.addListener('click', function(event) {
                    marker.setPosition(event.latLng);
                    document.getElementById('latInput').value = event.latLng.lat();
                    document.getElementById('lngInput').value = event.latLng.lng();
                });
                
                // Find on map button functionality
                document.getElementById('findOnMapBtn').addEventListener('click', function() {
                    const address = document.getElementById('addressInput').value;
                    if (!address) return;
                    
                    // Use Geocoder to find location
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ address: address }, function(results, status) {
                        if (status === 'OK' && results[0]) {
                            const location = results[0].geometry.location;
                            map.setCenter(location);
                            marker.setPosition(location);
                            
                            document.getElementById('latInput').value = location.lat();
                
                const location = dayData.locations[index];
                
                // Fill form fields
                document.getElementById('locationInput').value = location.location || '';
                document.getElementById('timeInput').value = location.time || '';
                document.getElementById('addressInput').value = location.address || '';
                document.getElementById('untilInput').value = location.until || '';
                document.getElementById('latInput').value = location.lat || '';
                document.getElementById('lngInput').value = location.lng || '';
                document.getElementById('statusInput').value = location.status || 'serving';
                document.getElementById('messageInput').value = location.message || '';
                
                // Initialize map with location
                if (editLocationMap) {
                    editLocationMap.remove();
                }
                
                const lat = parseFloat(location.lat) || 51.505;
                const lng = parseFloat(location.lng) || -0.09;
                
                editLocationMap = L.map('mapContainer').setView([lat, lng], 15);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(editLocationMap);
                
                if (editLocationMarker) {
                    editLocationMap.removeLayer(editLocationMarker);
                }
                
                editLocationMarker = L.marker([lat, lng]).addTo(editLocationMap);
            }
            
            // Enable map click to set marker
            editLocationMap.on('click', function(e) {
                const lat = e.latlng.lat.toFixed(6);
                const lng = e.latlng.lng.toFixed(6);
                
                document.getElementById('latInput').value = lat;
                document.getElementById('lngInput').value = lng;
                
                if (editLocationMarker) {
                    editLocationMarker.setLatLng([lat, lng]);
                } else {
                    editLocationMarker = L.marker([lat, lng]).addTo(editLocationMap);
                }
            });
            
            // Show the modal
            document.querySelector('#locationModal').style.display = 'block';
        }
    </script>
</body>
</html>
