<?php
// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Define the path to the truck schedule data
$scheduleFile = '../data/truck_schedule.json';

// Check if the file exists
if (!file_exists($scheduleFile)) {
    echo json_encode(['error' => 'Schedule data not found']);
    exit;
}

// Read the file
$scheduleData = file_get_contents($scheduleFile);

// Parse JSON
$schedule = json_decode($scheduleData, true);

// Filter for current location (item with id 8)
$currentLocation = null;
foreach ($schedule as $item) {
    if (isset($item['id']) && $item['id'] === 8 && isset($item['current'])) {
        $currentLocation = $item['current'];
        break;
    }
}

// Extract weekly schedule (items with id 1-7)
$weeklySchedule = array_filter($schedule, function($item) {
    return isset($item['id']) && $item['id'] >= 1 && $item['id'] <= 7;
});

// Sort schedule by day ID
usort($weeklySchedule, function($a, $b) {
    return $a['id'] - $b['id'];
});

// Format response
$response = [
    'current' => $currentLocation,
    'weekly' => $weeklySchedule
];

// Output JSON
echo json_encode($response);
?>
