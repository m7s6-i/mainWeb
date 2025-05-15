<?php
require_once 'config.php';
requireLogin();

header('Content-Type: application/json');

if (empty($_GET['id'])) {
    error_log("get_item.php: Error - No item ID provided");
    echo json_encode(['success' => false, 'message' => 'No item ID provided']);
    exit;
}

$id = intval($_GET['id']);
error_log("get_item.php: Loading item with ID: $id");
$menuItems = loadJson(MENU_FILE);

if ($menuItems === false) {
    error_log("get_item.php: Failed to load menu data file: " . MENU_FILE);
    echo json_encode(['success' => false, 'message' => 'Could not load menu data file']);
    exit;
}

$item = null;

// Find the item by ID - using loose comparison for type safety
foreach ($menuItems as $menuItem) {
    if ((int)$menuItem['id'] == $id) {
        $item = $menuItem;
        break;
    }
}

if ($item) {
    error_log("get_item.php: Successfully loaded item: ID=$id, Name={$item['name']}");
    // Add success flag to the response for consistency
    $item['success'] = true;
    echo json_encode($item, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
} else {
    error_log("get_item.php: Item not found with ID: $id");
    echo json_encode(['success' => false, 'message' => 'Item not found']);
}
