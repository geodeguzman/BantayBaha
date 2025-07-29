<?php
// Simple water levels API - upload this to fix the 404 error
$dbname = 'u285955690_thesis_db';
$dbuser = 'u285955690_BantayBaha';
$dbpass = 'BantayBaha123';
$dbhost = 'bantaybaha.site';

$connect = @mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);

if (!$connect) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit;
}

// Set headers for CORS and JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Get water level data
    $query = "SELECT * FROM waterlevel_informations ORDER BY created_at DESC LIMIT 100";
    $result = mysqli_query($connect, $query);
    
    if (!$result) {
        throw new Exception('Query failed: ' . mysqli_error($connect));
    }
    
    $waterLevels = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $waterLevels[] = [
            'id' => $row['id'] ?? null,
            'water_level' => $row['waterLevel_Reading_CM'] ?? null,
            'water_level_feet' => $row['waterLevel_Reading_Feet'] ?? null,
            'threshold' => $row['waterLevel_Threshold'] ?? null,
            'created_at' => $row['created_at'] ?? null,
            'updated_at' => $row['updated_at'] ?? null
        ];
    }
    
    // Get latest water level
    $latestQuery = "SELECT * FROM waterlevel_informations ORDER BY created_at DESC LIMIT 1";
    $latestResult = mysqli_query($connect, $latestQuery);
    $latestWaterLevel = null;
    
    if ($latestResult && $row = mysqli_fetch_assoc($latestResult)) {
        $latestWaterLevel = [
            'id' => $row['id'] ?? null,
            'water_level' => $row['waterLevel_Reading_CM'] ?? null,
            'water_level_feet' => $row['waterLevel_Reading_Feet'] ?? null,
            'threshold' => $row['waterLevel_Threshold'] ?? null,
            'created_at' => $row['created_at'] ?? null,
            'updated_at' => $row['updated_at'] ?? null
        ];
    }
    
    $response = [
        'success' => true,
        'data' => [
            'water_levels' => $waterLevels,
            'latest' => $latestWaterLevel
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

mysqli_close($connect);
?> 