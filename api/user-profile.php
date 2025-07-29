<?php
// User Profile API endpoint
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
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get user profile
        $userId = $_GET['user_id'] ?? 1; // Default to user ID 1, you can pass this from mobile app
        
        $query = "SELECT * FROM users WHERE id = '$userId'";
        $result = mysqli_query($connect, $query);
        
        if (!$result) {
            throw new Exception('Query failed: ' . mysqli_error($connect));
        }
        
        if (mysqli_num_rows($result) > 0) {
            $user = mysqli_fetch_assoc($result);
            
            // Remove password from response
            unset($user['password']);
            
            $response = [
                'success' => true,
                'user' => $user
            ];
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'User not found'
            ]);
            exit;
        }
        
        echo json_encode($response);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Update user profile
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            $input = $_POST;
        }
        
        $userId = $input['user_id'] ?? 1;
        $name = mysqli_real_escape_string($connect, $input['name'] ?? '');
        $email = mysqli_real_escape_string($connect, $input['email'] ?? '');
        $phone = mysqli_real_escape_string($connect, $input['phone'] ?? '');
        $address = mysqli_real_escape_string($connect, $input['address'] ?? '');
        $profilePicture = mysqli_real_escape_string($connect, $input['profile_picture'] ?? '');
        
        $query = "UPDATE users SET 
                  name = '$name',
                  email = '$email', 
                  phone = '$phone',
                  address = '$address',
                  profile_picture = '$profilePicture'
                  WHERE id = '$userId'";
        
        $result = mysqli_query($connect, $query);
        
        if (!$result) {
            throw new Exception('Update failed: ' . mysqli_error($connect));
        }
        
        $response = [
            'success' => true,
            'message' => 'Profile updated successfully'
        ];
        
        echo json_encode($response);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Profile error: ' . $e->getMessage()
    ]);
}

mysqli_close($connect);
?> 