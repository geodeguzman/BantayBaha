<?php
// Show PHP errors for debugging (remove these lines in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database credentials
$dbname = 'u285955690_thesis_db';
$dbuser = 'u285955690_BantayBaha'; // or whatever your DB username is
$dbpass = 'BantayBaha123';         // or your actual DB password
$dbhost = 'localhost';             // use 'localhost' for Hostinger

// Connect to MySQL
$connect = @mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);

if (!$connect) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit();
}

// Set headers for CORS and JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only handle POST requests for login
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        $input = $_POST; // Fallback to POST data
    }

    $username = mysqli_real_escape_string($connect, $input['username'] ?? '');
    $password = mysqli_real_escape_string($connect, $input['password'] ?? '');

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Username and password are required'
        ]);
        exit();
    }

    // Query to check user credentials
    // Try different possible column names for username/email
    $query = "SELECT * FROM users WHERE 
              (username = '$username' OR email = '$username' OR phone = '$username' OR contact_number = '$username')
              AND password = '$password'";

    $result = mysqli_query($connect, $query);

    if (!$result) {
        throw new Exception('Query failed: ' . mysqli_error($connect));
    }

    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);

        // Remove password from response for security
        unset($user['password']);

        $response = [
            'success' => true,
            'message' => 'Login successful',
            'user' => $user
        ];

        echo json_encode($response);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid username or password'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Login error: ' . $e->getMessage()
    ]);
}

mysqli_close($connect);
?>