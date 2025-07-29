<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database connection
require_once 'config.php';

// Set timezone to Philippine time
date_default_timezone_set('Asia/Manila');

// Function to get water level data for the last 24 hours
function getWaterLevelData($pdo) {
    try {
        // Fetch all readings from the last 24 hours from the real table
        $stmt = $pdo->prepare("
            SELECT waterLevel_Reading_CM, waterLevel_Reading_Feet, waterLevel_Threshold, waterLevel_Timestamp 
            FROM waterlevel_informations 
            WHERE waterLevel_Timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ORDER BY waterLevel_Timestamp DESC
            LIMIT 100
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert to meters and format for mobile app
        $result = [];
        foreach ($rows as $row) {
            $dt = new DateTime($row['waterLevel_Timestamp']);
            $dt->setTimezone(new DateTimeZone('Asia/Manila')); // Convert to Philippine time
            
            $result[] = [
                'water_level_meters' => floatval($row['waterLevel_Reading_CM']) / 100.0,
                'timestamp' => $dt->format('Y-m-d H:i:s'),
                'sensor_id' => 'real'
            ];
        }
        
        // Reverse to get chronological order for chart
        $result = array_reverse($result);
        
        return $result;
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return [];
    }
}

// Function to get current water level
function getCurrentWaterLevel($pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT waterLevel_Reading_CM, waterLevel_Reading_Feet, waterLevel_Threshold, waterLevel_Timestamp 
            FROM waterlevel_informations 
            ORDER BY waterLevel_Timestamp DESC 
            LIMIT 1
        ");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($result) {
            $meters = floatval($result['waterLevel_Reading_CM']) / 100.0;
            $feet = floatval($result['waterLevel_Reading_Feet']);
            $threshold = $result['waterLevel_Threshold'];
            
            // Convert timestamp to Philippine time
            $dt = new DateTime($result['waterLevel_Timestamp']);
            $dt->setTimezone(new DateTimeZone('Asia/Manila'));
            
            return [
                'level' => $meters,
                'feet' => $feet,
                'threshold' => $threshold,
                'timestamp' => $dt->format('Y-m-d H:i:s')
            ];
        }
        return ['level' => 0.899, 'feet' => 2.95, 'threshold' => 'normal', 'timestamp' => date('Y-m-d H:i:s')]; // Default fallback
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return ['level' => 0.899, 'feet' => 2.95, 'threshold' => 'normal', 'timestamp' => date('Y-m-d H:i:s')];
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $waterLevelData = getWaterLevelData($pdo);
        $currentWaterLevel = getCurrentWaterLevel($pdo);
        
        echo json_encode([
            'success' => true,
            'data' => $waterLevelData,
            'current' => $currentWaterLevel,
            'count' => count($waterLevelData),
            'timestamp' => date('Y-m-d H:i:s') // Current Philippine time
        ]);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 