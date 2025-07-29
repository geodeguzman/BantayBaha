<?php

$dbname = 'sample_iot';
$dbuser = 'root';
$dbpass = '';  // Change this if you set a MySQL password
$dbhost = '192.168.18.198';  // IP of the PC running XAMPP

$connect = @mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);

if (!$connect) {
    echo "Error: " . mysqli_connect_error();
    exit();
}

// Check if all parameters are set
if (!isset($_GET["cm"]) || !isset($_GET["ft"]) || !isset($_GET["threshold"])) {
    echo "Missing parameters";
    exit();
}

$cm = mysqli_real_escape_string($connect, $_GET["cm"]);
$ft = mysqli_real_escape_string($connect, $_GET["ft"]);
$threshold = mysqli_real_escape_string($connect, $_GET["threshold"]);

$query = "INSERT INTO waterlevel_informations 
            (waterLevel_Reading_CM, waterLevel_Reading_Feet, waterLevel_Threshold) 
          VALUES 
            ('$cm', '$ft', '$threshold')";

$result = mysqli_query($connect, $query);

if ($result) {
    echo "Inserted: $cm cm / $ft ft [$threshold]<br>";
} else {
    echo "Insert Failed: " . mysqli_error($connect);
}

?>
