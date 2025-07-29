<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database connection
require_once 'config.php';

// Set timezone to Philippine time
date_default_timezone_set('Asia/Manila');

try {
    // Get the latest water level reading (highest waterLevel_id)
    $stmt = $pdo->prepare("
        SELECT 
            waterLevel_id,
            waterLevel_Reading_CM,
            waterLevel_Reading_Feet,
            waterLevel_Threshold,
            waterLevel_Timestamp
        FROM waterlevel_informations 
        ORDER BY waterLevel_id DESC 
        LIMIT 1
    ");
    $stmt->execute();
    $latestReading = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Debug: Log what we're getting
    error_log("Latest water level reading: " . json_encode($latestReading));
    
    // Also log the query to ensure we're getting the highest ID
    error_log("Query executed: SELECT waterLevel_id, waterLevel_Reading_CM, waterLevel_Reading_Feet, waterLevel_Threshold, waterLevel_Timestamp FROM waterlevel_informations ORDER BY waterLevel_id DESC LIMIT 1");
    
    if ($latestReading) {
        // Convert timestamp to Philippine time
        $timestamp = new DateTime($latestReading['waterLevel_Timestamp']);
        $timestamp->setTimezone(new DateTimeZone('Asia/Manila'));
        
        $response = [
            'success' => true,
            'data' => [
                'id' => $latestReading['waterLevel_id'],
                'water_level_cm' => floatval($latestReading['waterLevel_Reading_CM']),
                'water_level_meters' => floatval($latestReading['waterLevel_Reading_CM']) / 100.0,
                'water_level_feet' => floatval($latestReading['waterLevel_Reading_Feet']),
                'threshold' => $latestReading['waterLevel_Threshold'],
                'timestamp' => $timestamp->format('Y-m-d H:i:s')
            ],
            'fetched_at' => date('Y-m-d H:i:s'),
            'query_info' => 'Highest waterLevel_id fetched every 30 seconds'
        ];
    } else {
        $response = [
            'success' => false,
            'error' => 'No water level data found'
        ];
    }
    
    echo json_encode($response);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?> 