<?php
require_once 'config.php';

try {
    // Get all resident locations
    $stmt = $pdo->prepare("SELECT * FROM resident_locations ORDER BY created_at DESC");
    $stmt->execute();
    $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response = [
        'success' => true,
        'data' => [
            'locations' => $locations,
            'count' => count($locations)
        ]
    ];
    
    echo json_encode($response);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?> 