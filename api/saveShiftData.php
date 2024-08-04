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

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['employeeName']) || !isset($input['data'])) {
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$employeeName = $input['employeeName'];
$data = $input['data'];

$stmt = $conn->prepare("SELECT EmployeeID FROM employees WHERE EmployeeName = ?");
$stmt->bind_param("s", $employeeName);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['error' => 'Employee not found']);
    exit;
}

$row = $result->fetch_assoc();
$employeeId = $row['EmployeeID'];

$successCount = 0;
$errorCount = 0;

foreach ($data as $record) {
    $date = $record['date'];
    $shiftType = $record['shift'];
    
    $stmt = $conn->prepare("SELECT ShiftTypeID FROM ShiftTypes WHERE ShiftTypeName = ?");
    $stmt->bind_param("s", $shiftType);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $errorCount++;
        continue;
    }
    
    $row = $result->fetch_assoc();
    $shiftTypeId = $row['ShiftTypeID'];

    $stmt = $conn->prepare("SELECT * FROM ShiftSchedule WHERE EmployeeID = ? AND Date = ?");
    $stmt->bind_param("is", $employeeId, $date);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $stmt = $conn->prepare("UPDATE ShiftSchedule SET ShiftTypeID = ? WHERE EmployeeID = ? AND Date = ?");
        $stmt->bind_param("iis", $shiftTypeId, $employeeId, $date);
    } else {
        $stmt = $conn->prepare("INSERT INTO ShiftSchedule (EmployeeID, Date, ShiftTypeID) VALUES (?, ?, ?)");
        $stmt->bind_param("isi", $employeeId, $date, $shiftTypeId);
    }

    if ($stmt->execute()) {
        $successCount++;
    } else {
        $errorCount++;
    }

    $stmt->close();
}

echo json_encode([
    'success' => 'Shift data processed',
    'successCount' => $successCount,
    'errorCount' => $errorCount
]);

$conn->close();
?>