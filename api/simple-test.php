<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

try {
    // Simple test query
    $stmt = $pdo->query("SELECT waterLevel_id, waterLevel_Reading_CM, waterLevel_Reading_Feet, waterLevel_Threshold, waterLevel_Timestamp FROM waterlevel_informations ORDER BY waterLevel_Timestamp DESC LIMIT 5");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $data,
        'count' => count($data)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 