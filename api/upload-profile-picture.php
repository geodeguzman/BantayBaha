<?php
// Profile Picture Upload API
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

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST;
    }
    
    $userId = $input['user_id'] ?? 1;
    $imageData = $input['image'] ?? '';
    $imageName = $input['image_name'] ?? 'profile_' . $userId . '_' . time() . '.jpg';
    
    if (empty($imageData)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No image data provided'
        ]);
        exit;
    }
    
    // Create uploads directory if it doesn't exist
    $uploadDir = '../uploads/profile_pictures/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $fileName = 'profile_' . $userId . '_' . time() . '.jpg';
    $filePath = $uploadDir . $fileName;
    
    // Handle base64 image data
    if (strpos($imageData, 'data:image') === 0) {
        // Remove data URL prefix
        $imageData = preg_replace('/^data:image\/\w+;base64,/', '', $imageData);
    }
    
    // Decode and save image
    $imageBinary = base64_decode($imageData);
    
    if ($imageBinary === false) {
        throw new Exception('Invalid image data');
    }
    
    if (file_put_contents($filePath, $imageBinary) === false) {
        throw new Exception('Failed to save image');
    }
    
    // Generate URL for the uploaded image
    $imageUrl = 'https://bantaybaha.site/uploads/profile_pictures/' . $fileName;
    
    // Update user profile in database
    $query = "UPDATE users SET profile_picture = '$imageUrl' WHERE id = '$userId'";
    $result = mysqli_query($connect, $query);
    
    if (!$result) {
        throw new Exception('Failed to update database: ' . mysqli_error($connect));
    }
    
    $response = [
        'success' => true,
        'message' => 'Profile picture uploaded successfully',
        'image_url' => $imageUrl,
        'file_name' => $fileName
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Upload error: ' . $e->getMessage()
    ]);
}

mysqli_close($connect);
?> 