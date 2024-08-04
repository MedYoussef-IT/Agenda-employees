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

foreach ($data as $record) {
    $date = date('Y-m-d', strtotime($record['date']));
    $status = $record['attendance'];
    $stmt = $conn->prepare("SELECT AttendanceTypeID FROM AttendanceTypes WHERE AttendanceTypeName = ?");
    $stmt->bind_param("s", $status);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode(['error' => "AttendanceType not found for status: $status"]);
        continue;
    }
    $row = $result->fetch_assoc();
    $attendanceTypeId = $row['AttendanceTypeID'];
    if (!$attendanceTypeId) {
        echo json_encode(['error' => "Invalid AttendanceTypeID for status: $status"]);
        continue;
    }

    $stmt = $conn->prepare("SELECT * FROM attendancerecords WHERE EmployeeID = ? AND Date = ?");
    $stmt->bind_param("is", $employeeId, $date);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $stmt = $conn->prepare("UPDATE attendancerecords SET AttendanceTypeID = ? WHERE EmployeeID = ? AND Date = ?");
        $stmt->bind_param("iis", $attendanceTypeId, $employeeId, $date);
    } else {
        $stmt = $conn->prepare("INSERT INTO attendancerecords (EmployeeID, Date, AttendanceTypeID) VALUES (?, ?, ?)");
        $stmt->bind_param("isi", $employeeId, $date, $attendanceTypeId);
    }

    $stmt->execute();

    $stmt->close();

}

echo json_encode(['success' => 'Attendance data saved successfully.']);
$conn->close();
?>
