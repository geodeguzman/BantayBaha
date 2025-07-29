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
            SELECT 
                waterLevel_id,
                waterLevel_Reading_CM,
                waterLevel_Reading_Feet,
                waterLevel_Threshold,
                waterLevel_Timestamp
            FROM waterlevel_informations 
            WHERE waterLevel_Timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ORDER BY waterLevel_Timestamp ASC
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Transform data to match React Native expectations
        $result = [];
        foreach ($rows as $row) {
            // Convert timestamp to Philippine time
            $timestamp = new DateTime($row['waterLevel_Timestamp']);
            $timestamp->setTimezone(new DateTimeZone('Asia/Manila'));
            
            $result[] = [
                'id' => $row['waterLevel_id'],
                'water_level_meters' => (floatval($row['waterLevel_Reading_CM']) / 100.0), // Convert cm to meters
                'water_level_feet' => floatval($row['waterLevel_Reading_Feet']),
                'threshold' => $row['waterLevel_Threshold'],
                'timestamp' => $timestamp->format('Y-m-d H:i:s'),
                'sensor_id' => 'real'
            ];
        }
        
        return $result;
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        throw new Exception("Database error: " . $e->getMessage());
    }
}

// Function to get current water level
function getCurrentWaterLevel($pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                waterLevel_id,
                waterLevel_Reading_CM,
                waterLevel_Reading_Feet,
                waterLevel_Threshold,
                waterLevel_Timestamp
            FROM waterlevel_informations 
            ORDER BY waterLevel_Timestamp DESC 
            LIMIT 1
        ");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            // Convert timestamp to Philippine time
            $timestamp = new DateTime($result['waterLevel_Timestamp']);
            $timestamp->setTimezone(new DateTimeZone('Asia/Manila'));
            
            return [
                'id' => $result['waterLevel_id'],
                'water_level_meters' => (floatval($result['waterLevel_Reading_CM']) / 100.0),
                'water_level_feet' => floatval($result['waterLevel_Reading_Feet']),
                'threshold' => $result['waterLevel_Threshold'],
                'timestamp' => $timestamp->format('Y-m-d H:i:s')
            ];
        }
        
        return null;
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return null;
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Test database connection first
        try {
            $testStmt = $pdo->query("SELECT COUNT(*) as count FROM waterlevel_informations");
            $testResult = $testStmt->fetch(PDO::FETCH_ASSOC);
            error_log("Database connection test: " . $testResult['count'] . " records found");
        } catch (PDOException $e) {
            error_log("Database connection test failed: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
        
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