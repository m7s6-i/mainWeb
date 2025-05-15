<?php
// Allow cross-origin requests (if needed)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Get menu data from JSON file
$menuFile = '../data/menu.json';
if (file_exists($menuFile)) {
    $menuData = file_get_contents($menuFile);
    echo $menuData;
} else {
    echo json_encode([
        "error" => "Menu data not found"
    ]);
}
