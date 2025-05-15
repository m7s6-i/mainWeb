<?php
require_once 'config.php';
requireLogin();

header('Content-Type: application/json');

// Ensure we have POST data
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_POST['id'])) {
    error_log("delete_item.php: Error - Invalid request method or missing ID");
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

$id = intval($_POST['id']);
error_log("delete_item.php: Attempting to delete item with ID: $id");
$menuItems = loadJson(MENU_FILE);

// Check if file loaded successfully
if ($menuItems === false) {
    error_log("delete_item.php: Failed to load menu data file: " . MENU_FILE);
    echo json_encode(['success' => false, 'message' => 'Could not load menu data file']);
    exit;
}

$found = false;

// Filter out the item to delete - using loose comparison
$updatedItems = [];
foreach ($menuItems as $item) {
    if ((int)$item['id'] != $id) {
        $updatedItems[] = $item;
    } else {
        $found = true;
    }
}

if (!$found) {
    error_log("delete_item.php: Item not found with ID: $id");
    echo json_encode(['success' => false, 'message' => 'Item not found']);
    exit;
}

// Check file permissions before saving
$dataDir = dirname(MENU_FILE);
if (!is_writable($dataDir) || (file_exists(MENU_FILE) && !is_writable(MENU_FILE))) {
    echo json_encode(['success' => false, 'message' => 'Permission denied: Cannot write to data file']);
    exit;
}

// Save updated list
$saveResult = saveJson(MENU_FILE, $updatedItems);
if ($saveResult) {
    error_log("delete_item.php: Successfully deleted item with ID: $id");
    echo json_encode(['success' => true]);
} else {
    error_log("delete_item.php: Failed to save updated menu after deleting item with ID: $id");
    echo json_encode(['success' => false, 'message' => 'Failed to save updated menu data']);
}
