<?php
// Prevent any output before headers
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once 'config.php';
requireLogin();

// Set proper JSON content type header
header('Content-Type: application/json');

// Ensure we have POST data
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Sanitize input
$id = isset($_POST['id']) && !empty($_POST['id']) ? intval($_POST['id']) : null;
$name = sanitizeInput($_POST['name'] ?? '');
$description = sanitizeInput($_POST['description'] ?? '');
$price = floatval($_POST['price'] ?? 0);
$category = sanitizeInput($_POST['category'] ?? '');
$image = sanitizeInput($_POST['image'] ?? '');
$featured = isset($_POST['featured']) && $_POST['featured'] === '1';

// Handle availability status properly
$availability = sanitizeInput($_POST['availability'] ?? 'available');
$available = true; // Default to available
$in_truck = true; // Default to in truck

// Set the correct availability flags based on dropdown selection
if ($availability === 'sold_out') {
    $available = false;
    $in_truck = true;
} else if ($availability === 'not_in_truck') {
    $available = true;
    $in_truck = false;
} else {
    // Default: available
    $available = true;
    $in_truck = true;
}

// Handle file uploads
if (isset($_FILES['file_upload']) && $_FILES['file_upload']['error'] == 0) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $maxSize = 2 * 1024 * 1024; // 2MB
    
    if (in_array($_FILES['file_upload']['type'], $allowedTypes) && $_FILES['file_upload']['size'] <= $maxSize) {
        $uploadDir = BASE_PATH . '/uploads/';
        
        // Create upload directory if it doesn't exist
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $fileName = time() . '_' . basename($_FILES['file_upload']['name']);
        $targetFile = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['file_upload']['tmp_name'], $targetFile)) {
            // Success - use this new image
            $image = '../uploads/' . $fileName;
        }
    }
}

// Validation - allow empty image if an upload is provided
if (empty($name) || empty($description) || $price <= 0 || empty($category)) {
    echo json_encode(['success' => false, 'message' => 'Name, description, price and category are required']);
    exit;
}

// Ensure we have an image
if (empty($image)) {
    echo json_encode(['success' => false, 'message' => 'Either provide an image URL or upload a file']);
    exit;
}

// Log received data for debugging
error_log("Processing save item request: ID=$id, Name=$name, Category=$category");

// Load existing menu items
$menuItems = loadJson(MENU_FILE);

// Make sure we have a valid array
if (!is_array($menuItems)) {
    error_log("Invalid menu data format: Expected array but got " . gettype($menuItems));
    $menuItems = [];
}

// Add or update item
if ($id) {
    // Update existing item
    $updated = false;
    foreach ($menuItems as $key => $item) {
        if ($item['id'] === $id) {
            $menuItems[$key] = [
                'id' => $id,
                'name' => $name,
                'description' => $description,
                'price' => $price,
                'category' => $category,
                'image' => $image,
                'featured' => $featured,
                'available' => $available,
                'in_truck' => $in_truck
            ];
            $updated = true;
            break;
        }
    }
    
    if (!$updated) {
        echo json_encode(['success' => false, 'message' => 'Item not found']);
        exit;
    }
} else {
    // Add new item
    $newId = getNextId($menuItems);
    $menuItems[] = [
        'id' => $newId,
        'name' => $name,
        'description' => $description,
        'price' => $price,
        'category' => $category,
        'image' => $image,
        'featured' => $featured,
        'available' => $available,
        'in_truck' => $in_truck
    ];
}

// Save to file - try direct approach first
$json = json_encode($menuItems, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if ($json === false) {
    error_log("JSON encoding error: " . json_last_error_msg());
    echo json_encode(['success' => false, 'message' => 'Error encoding data.']);
    exit;
}

// Try to save directly to a new file, then move it into place
$tempFile = DATA_PATH . '/menu_new.json';
$saveResult = file_put_contents($tempFile, $json);

if ($saveResult !== false) {
    // Try to create a backup of the existing file
    if (file_exists(MENU_FILE)) {
        @copy(MENU_FILE, MENU_FILE . '.backup');
    }
    
    // Try to move the temp file into place
    if (@rename($tempFile, MENU_FILE) || @copy($tempFile, MENU_FILE)) {
        @unlink($tempFile);  // Clean up temp file if it still exists
        error_log("Successfully saved menu item: ID=$id, Name=$name");
        $response = ['success' => true];
    } else {
        error_log("Failed to move/copy temp file to final location");
        $response = ['success' => false, 'message' => 'Could not update the menu file.'];
    }
} else {
    $errorMsg = 'Failed to save menu data. Please check file permissions.';
    error_log("Error saving menu item: ID=$id, Name=$name. Could not write to temp file.");
    $response = ['success' => false, 'message' => $errorMsg];
}

// Ensure this is the only output
echo json_encode($response);
