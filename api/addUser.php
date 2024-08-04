<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'employee';
$user = 'root';
$password = '';
$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    exit;
}   

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['name'])) {
        $employeeName = $data['name'];
        if (empty($employeeName) || strlen($employeeName) > 50 || !preg_match('/^[a-zA-Z\s]+$/', $employeeName)) {
            echo json_encode(['error' => 'Invalid input']);
            exit;
        }
        //check if already exists
        $stmt = $conn->prepare("SELECT * FROM employees WHERE EmployeeName = ?");
        $stmt->bind_param("s", $employeeName);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            echo json_encode(['error' => 'Error executing statement']);
            exit;
        }
        $stmt = $conn->prepare("INSERT INTO employees (EmployeeName) VALUES (?)");
        $stmt->bind_param("s", $employeeName);
        if ($stmt->execute()) {
            echo json_encode(['success' => 'Employee added successfully']);
        } else {
            echo json_encode(['error' => 'Error executing statement']);
        }
        $stmt->close();
    } else {
        echo json_encode(['error' => 'Name not provided']);
    }
}

$conn->close();
?>
