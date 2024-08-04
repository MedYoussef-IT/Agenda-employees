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

$employeeName = $_GET['name'] ?? '';
if (empty($employeeName)) {
    echo json_encode(['error' => 'No employee name provided']);
    exit;
}

$stmt = $conn->prepare("SELECT EmployeeID FROM Employees WHERE EmployeeName = ?");
if (!$stmt) {
    echo json_encode(['error' => 'Prepare failed: ' . $conn->error]);
    exit;
}
$stmt->bind_param("s", $employeeName);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    exit;
}

$row = $result->fetch_assoc();
$employeeId = $row['EmployeeID'];

$attendanceRecords = [];
$shiftSchedule = [];

$stmt = $conn->prepare("SELECT Date, AttendanceTypeID FROM attendancerecords WHERE EmployeeID = ?");
if ($stmt) {
    $stmt->bind_param("i", $employeeId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $typeStmt = $conn->prepare("SELECT AttendanceTypeName FROM attendancetypes WHERE AttendanceTypeID = ?");
        if ($typeStmt) {
            $typeStmt->bind_param("i", $row['AttendanceTypeID']);
            $typeStmt->execute();
            $typeResult = $typeStmt->get_result();
            $typeRow = $typeResult->fetch_assoc();
            $attendanceRecords[] = [
                'date' => $row['Date'],
                'status' => $typeRow['AttendanceTypeName']
            ];
            $typeStmt->close();
        }
    }
    $stmt->close();
}

$stmt = $conn->prepare("SELECT Date, ShiftTypeID FROM shiftschedule WHERE EmployeeID = ?");
if ($stmt) {
    $stmt->bind_param("i", $employeeId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $shiftStmt = $conn->prepare("SELECT ShiftTypeName FROM shifttypes WHERE ShiftTypeID = ?");
        if ($shiftStmt) {
            $shiftStmt->bind_param("i", $row['ShiftTypeID']);
            $shiftStmt->execute();
            $shiftResult = $shiftStmt->get_result();
            $shiftRow = $shiftResult->fetch_assoc();
            $shiftSchedule[] = [
                'date' => $row['Date'],
                'type' => $shiftRow['ShiftTypeName']
            ];
            $shiftStmt->close();
        }
    }
    $stmt->close();
}

echo json_encode([
    'attendance' => $attendanceRecords,
    'shifts' => $shiftSchedule
]);

$conn->close();
?>
