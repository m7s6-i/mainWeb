<?php
require_once 'config.php';
requireLogin();

// Get current truck location data
$locationData = [];
$locationFile = '../data/truck_location.json';

if (file_exists($locationFile)) {
    $locationData = json_decode(file_get_contents($locationFile), true);
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Process and save the truck location
    $locationData = [
        'address' => $_POST['address'],
        'neighborhood' => $_POST['neighborhood'],
        'latitude' => $_POST['latitude'],
        'longitude' => $_POST['longitude'],
        'status' => $_POST['status'],
        'message' => $_POST['message'],
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    // Save data to JSON
    file_put_contents($locationFile, json_encode($locationData, JSON_PRETTY_PRINT));
    
    // Redirect to prevent form resubmission
    header('Location: truck_location.php?updated=1');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Truck Location - Admin Dashboard</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Pacifico&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/admin-style.css">
    <link rel="stylesheet" href="../css/truck-admin.css">
    <!-- Include Leaflet for maps -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
</head>
<body>
    <header class="admin-header">
        <div class="container">
            <h1>London <span>Ice Cream</span> Admin</h1>
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
                <li><a href="truck_schedule.php"><i class="fas fa-calendar"></i> Truck Schedule</a></li>
                <li class="active"><a href="truck_location.php"><i class="fas fa-truck"></i> Truck Location</a></li>
            </ul>
        </div>
    </nav>
    
    <main class="admin-content">
        <div class="container">
            <?php if (isset($_GET['updated']) && $_GET['updated'] == 1): ?>
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> Truck location updated successfully!
            </div>
            <?php endif; ?>
            
            <div class="admin-card">
                <div class="admin-card-header">
                    <h2><i class="fas fa-truck"></i> Current Truck Location</h2>
                </div>
                <div class="admin-card-body">
                    <div class="truck-location-container">
                        <div class="truck-form-container">
                            <form action="truck_location.php" method="post" id="truckLocationForm">
                                <div class="form-group">
                                    <label for="address" class="form-label">Current Address</label>
                                    <input type="text" id="address" name="address" class="form-control" value="<?php echo isset($locationData['address']) ? htmlspecialchars($locationData['address']) : ''; ?>" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="neighborhood" class="form-label">Neighborhood</label>
                                    <input type="text" id="neighborhood" name="neighborhood" class="form-control" value="<?php echo isset($locationData['neighborhood']) ? htmlspecialchars($locationData['neighborhood']) : ''; ?>" required>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group form-group-half">
                                        <label for="latitude" class="form-label">Latitude</label>
                                        <input type="text" id="latitude" name="latitude" class="form-control" value="<?php echo isset($locationData['latitude']) ? htmlspecialchars($locationData['latitude']) : ''; ?>" required>
                                    </div>
                                    
                                    <div class="form-group form-group-half">
                                        <label for="longitude" class="form-label">Longitude</label>
                                        <input type="text" id="longitude" name="longitude" class="form-control" value="<?php echo isset($locationData['longitude']) ? htmlspecialchars($locationData['longitude']) : ''; ?>" required>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="status" class="form-label">Truck Status</label>
                                    <select id="status" name="status" class="form-control">
                                        <option value="serving" <?php echo (isset($locationData['status']) && $locationData['status'] == 'serving') ? 'selected' : ''; ?>>Currently Serving</option>
                                        <option value="en_route" <?php echo (isset($locationData['status']) && $locationData['status'] == 'en_route') ? 'selected' : ''; ?>>En Route</option>
                                        <option value="closed" <?php echo (isset($locationData['status']) && $locationData['status'] == 'closed') ? 'selected' : ''; ?>>Closed</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="message" class="form-label">Custom Message (Optional)</label>
                                    <textarea id="message" name="message" class="form-control" rows="3"><?php echo isset($locationData['message']) ? htmlspecialchars($locationData['message']) : ''; ?></textarea>
                                    <div class="form-hint">This message will be displayed on the website along with the truck location.</div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary">Update Location</button>
                                </div>
                            </form>
                        </div>
                        
                        <div class="map-container">
                            <div id="truck-map"></div>
                            <div class="map-instructions">
                                <h3>How to Set Location</h3>
                                <ol>
                                    <li>Enter the current address and neighborhood</li>
                                    <li>Use the map to find the exact position or search for a location</li>
                                    <li>Click on the map to automatically set latitude and longitude</li>
                                    <li>Select the truck's current status</li>
                                    <li>Add an optional message for your customers</li>
                                    <li>Click "Update Location" to save changes</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <script src="../js/truck-admin.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the map
            const map = L.map('truck-map').setView([
                <?php echo isset($locationData['latitude']) ? $locationData['latitude'] : '51.509865'; ?>, 
                <?php echo isset($locationData['longitude']) ? $locationData['longitude'] : '-0.118092'; ?>
            ], 13);
            
            // Add a tile layer from OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Add marker at the current position if it exists
            let marker;
            <?php if (isset($locationData['latitude']) && isset($locationData['longitude'])): ?>
                marker = L.marker([
                    <?php echo $locationData['latitude']; ?>, 
                    <?php echo $locationData['longitude']; ?>
                ]).addTo(map);
            <?php endif; ?>
            
            // Handle map clicks to update lat/lng fields
            map.on('click', function(e) {
                const lat = e.latlng.lat.toFixed(6);
                const lng = e.latlng.lng.toFixed(6);
                
                document.getElementById('latitude').value = lat;
                document.getElementById('longitude').value = lng;
                
                // Update or create a marker
                if (marker) {
                    marker.setLatLng([lat, lng]);
                } else {
                    marker = L.marker([lat, lng]).addTo(map);
                }
            });
        });
    </script>
</body>
</html>
