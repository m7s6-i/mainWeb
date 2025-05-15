<?php
require_once '../config.php';

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id']) || !isset($data['available'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
    exit;
}

// Load menu items
$menuItems = loadJson(MENU_FILE);

// Find and update the item
foreach ($menuItems as &$item) {
    if ($item['id'] === $data['id']) {
        $item['available'] = $data['available'];
        break;
    }
}

// Save updated menu
saveJson(MENU_FILE, $menuItems);

// Return success response
echo json_encode(['success' => true]);
