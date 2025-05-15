<?php
// This is a test script to check file write permissions

// Define paths
define('DATA_PATH', dirname(__DIR__) . '/data');
define('TEST_FILE', DATA_PATH . '/test_write.txt');

// Attempt to write to the data directory
$result = file_put_contents(TEST_FILE, "Test write at " . date('Y-m-d H:i:s'));

echo "<h1>File Write Test</h1>";

if ($result !== false) {
    echo "<p style='color:green'>Success! Web server can write to the data directory.</p>";
    echo "<p>Wrote " . $result . " bytes to " . TEST_FILE . "</p>";
    
    // Try to write to menu.json directly
    $menuFile = DATA_PATH . '/menu.json';
    $menuData = file_get_contents($menuFile);
    if ($menuData) {
        echo "<p>Successfully read menu.json</p>";
        
        // Try to write it back
        $writeResult = file_put_contents($menuFile, $menuData);
        if ($writeResult !== false) {
            echo "<p style='color:green'>Successfully wrote to menu.json!</p>";
        } else {
            echo "<p style='color:red'>Failed to write to menu.json</p>";
            echo "<p>Error: " . error_get_last()['message'] . "</p>";
        }
    } else {
        echo "<p style='color:red'>Failed to read menu.json</p>";
    }
} else {
    echo "<p style='color:red'>Failed to write test file</p>";
    echo "<p>Error: " . error_get_last()['message'] . "</p>";
    
    // Check permissions
    echo "<h2>Directory Information:</h2>";
    echo "<pre>";
    system("ls -la " . DATA_PATH);
    echo "</pre>";
}
?>
