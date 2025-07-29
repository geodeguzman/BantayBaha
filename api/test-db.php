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

try {
    // Test database connection and get table structure
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get table structure
    $stmt = $pdo->query("DESCRIBE waterlevel_informations");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get sample data
    $stmt2 = $pdo->query("SELECT * FROM waterlevel_informations ORDER BY waterLevel_Timestamp DESC LIMIT 3");
    $sampleData = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count
    $stmt3 = $pdo->query("SELECT COUNT(*) as total FROM waterlevel_informations");
    $count = $stmt3->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'table_structure' => $columns,
        'sample_data' => $sampleData,
        'total_records' => $count['total'],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 