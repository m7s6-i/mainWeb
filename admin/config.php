<?php
// Start session
session_start();

// Set paths
define('BASE_PATH', dirname(__DIR__));
define('DATA_PATH', BASE_PATH . '/data');
define('MENU_FILE', DATA_PATH . '/menu.json');
define('USERS_FILE', DATA_PATH . '/users.json');
define('TRUCK_SCHEDULE_FILE', DATA_PATH . '/truck_schedule.json');


// Helper functions
function loadJson($file) {
    if (!file_exists($file)) {
        return [];
    }
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

function saveJson($file, $data) {
    $dir = dirname($file);
    
    // Debug info
    error_log("Attempting to save JSON to: $file");
    
    // Create directory if it doesn't exist
    if (!file_exists($dir)) {
        error_log("Directory does not exist, creating: $dir");
        if (!mkdir($dir, 0777, true)) {
            error_log("Failed to create directory: $dir");
            return false;
        }
    }
    
    // Check directory permissions and try to fix if needed
    if (!is_writable($dir)) {
        error_log("Directory not writable, attempting to fix permissions: $dir");
        chmod($dir, 0777);
        if (!is_writable($dir)) {
            error_log("Still cannot write to directory: $dir");
            return false;
        }
    }
    
    // Check file permissions and try to fix if needed
    if (file_exists($file) && !is_writable($file)) {
        error_log("File exists but is not writable, attempting to fix permissions: $file");
        chmod($file, 0666);
        if (!is_writable($file)) {
            error_log("Still cannot write to file: $file");
            return false;
        }
    }
    
    // Create a backup of the existing file
    if (file_exists($file)) {
        $backupFile = $file . '.bak';
        if (!copy($file, $backupFile)) {
            error_log("Warning: Failed to create backup file: $backupFile");
            // Continue anyway
        }
    }
    
    // Make sure data is properly formatted for JSON encoding
    if (!is_array($data) && !is_object($data)) {
        error_log("Invalid data type for JSON encoding: " . gettype($data));
        return false;
    }
    
    // Use JSON_UNESCAPED_SLASHES for cleaner URLs
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
    if ($json === false) {
        error_log("JSON encoding error: " . json_last_error_msg());
        return false;
    }
    
    // Direct write approach first
    $result = file_put_contents($file, $json);
    if ($result !== false) {
        error_log("Successfully saved JSON data to: $file");
        return true;
    }
    
    // If direct write fails, try atomic write pattern
    error_log("Direct write failed, trying atomic write pattern");
    $tempFile = $file . '.tmp';
    $result = file_put_contents($tempFile, $json);
    
    if ($result === false) {
        error_log("Failed to write to temporary file: $tempFile");
        return false;
    }
    
    if (!rename($tempFile, $file)) {
        error_log("Failed to rename temporary file to: $file");
        // Try direct copy as last resort
        if (copy($tempFile, $file)) {
            unlink($tempFile); // Clean up temp file
            error_log("Successfully saved JSON data using copy method");
            return true;
        }
        unlink($tempFile); // Clean up temp file
        return false;
    }
    
    error_log("Successfully saved JSON data using atomic write pattern");
    return true;
}

function isLoggedIn() {
    return isset($_SESSION['user']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

function getNextId($items) {
    $maxId = 0;
    foreach ($items as $item) {
        if (isset($item['id']) && $item['id'] > $maxId) {
            $maxId = $item['id'];
        }
    }
    return $maxId + 1;
}

function sanitizeInput($data) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $data[$key] = sanitizeInput($value);
        }
    } else {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
    return $data;
}
