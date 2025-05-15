<?php
require_once 'config.php';
requireLogin();

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get action type
$action = $_POST['action'] ?? '';

// Load current schedule data
$scheduleData = loadJson(TRUCK_SCHEDULE_FILE);

switch ($action) {
    case 'save_location':
        saveLocation($scheduleData);
        break;
        
    case 'delete_location':
        deleteLocation($scheduleData);
        break;
        
    case 'update_current':
        updateCurrentLocation($scheduleData);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        exit;
}

/**
 * Save or update a location
 */
function saveLocation(&$scheduleData) {
    // Get form data
    $day = $_POST['day'] ?? '';
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    $location = $_POST['location'] ?? '';
    $time = $_POST['time'] ?? '';
    $address = $_POST['address'] ?? '';
    $lat = isset($_POST['lat']) ? (float)$_POST['lat'] : 0;
    $lng = isset($_POST['lng']) ? (float)$_POST['lng'] : 0;
    
    // Validate required fields
    if (empty($day) || empty($location) || empty($time) || empty($address) || empty($lat) || empty($lng)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    
    // Find the day in schedule data
    $dayFound = false;
    $locationData = [
        'time' => $time,
        'location' => $location,
        'address' => $address,
        'lat' => $lat,
        'lng' => $lng
    ];
    
    foreach ($scheduleData as &$item) {
        if (isset($item['day']) && $item['day'] === $day) {
            $dayFound = true;
            
            if (!isset($item['locations'])) {
                $item['locations'] = [];
            }
            
            if ($index >= 0 && isset($item['locations'][$index])) {
                // Update existing location
                $item['locations'][$index] = $locationData;
            } else {
                // Add new location
                $item['locations'][] = $locationData;
            }
            
            break;
        }
    }
    
    // If day wasn't found, handle error
    if (!$dayFound) {
        echo json_encode(['success' => false, 'message' => 'Day not found in schedule']);
        exit;
    }
    
    // Save updated schedule
    if (saveJson(TRUCK_SCHEDULE_FILE, $scheduleData)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save schedule data']);
    }
}

/**
 * Delete a location
 */
function deleteLocation(&$scheduleData) {
    // Get location identifiers
    $day = $_POST['day'] ?? '';
    $index = isset($_POST['index']) ? intval($_POST['index']) : -1;
    
    // Validate input
    if (empty($day) || $index < 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid location identifier']);
        exit;
    }
    
    // Find the day and delete the location
    $locationDeleted = false;
    
    foreach ($scheduleData as &$item) {
        if (isset($item['day']) && $item['day'] === $day) {
            if (isset($item['locations']) && isset($item['locations'][$index])) {
                // Remove the location at the specified index
                array_splice($item['locations'], $index, 1);
                $locationDeleted = true;
                break;
            }
        }
    }
    
    if (!$locationDeleted) {
        echo json_encode(['success' => false, 'message' => 'Location not found']);
        exit;
    }
    
    // Save updated schedule
    if (saveJson(TRUCK_SCHEDULE_FILE, $scheduleData)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save schedule data']);
    }
}

/**
 * Update current truck location
 */
function updateCurrentLocation(&$scheduleData) {
    // Get form data
    $day = $_POST['day'] ?? '';
    $until = $_POST['until'] ?? '';
    $locationData = json_decode($_POST['location_data'] ?? '{}', true);
    
    // Validate required data
    if (empty($day) || empty($until) || empty($locationData)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    
    // Create current location entry
    $currentData = [
        'day' => $day,
        'time' => $locationData['time'] ?? '',
        'location' => $locationData['location'] ?? '',
        'address' => $locationData['address'] ?? '',
        'lat' => $locationData['lat'] ?? 0,
        'lng' => $locationData['lng'] ?? 0,
        'until' => $until
    ];
    
    // Update current location (item with id 8)
    $currentUpdated = false;
    
    foreach ($scheduleData as &$item) {
        if (isset($item['id']) && $item['id'] === 8) {
            $item['current'] = $currentData;
            $currentUpdated = true;
            break;
        }
    }
    
    // If the current location entry doesn't exist yet, add it
    if (!$currentUpdated) {
        $scheduleData[] = [
            'id' => 8,
            'current' => $currentData
        ];
    }
    
    // Save updated schedule
    if (saveJson(TRUCK_SCHEDULE_FILE, $scheduleData)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save current location data']);
    }
}
