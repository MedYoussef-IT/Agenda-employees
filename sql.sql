CREATE TABLE Employees (
    EmployeeID INT PRIMARY KEY,
    EmployeeName VARCHAR(100)
);

CREATE TABLE AttendanceTypes (
    AttendanceTypeID INT PRIMARY KEY,
    AttendanceTypeName VARCHAR(50),
    AttendanceCode VARCHAR(10)
);

CREATE TABLE AttendanceRecords (
    RecordID INT PRIMARY KEY,
    EmployeeID INT,
    Date DATE,
    AttendanceTypeID INT,
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID),
    FOREIGN KEY (AttendanceTypeID) REFERENCES AttendanceTypes(AttendanceTypeID)
);

CREATE TABLE ShiftTypes (
    ShiftTypeID INT PRIMARY KEY,
    ShiftTypeName VARCHAR(50),
    ShiftCode VARCHAR(10)
);

CREATE TABLE ShiftSchedule (
    ScheduleID INT PRIMARY KEY,
    EmployeeID INT,
    Date DATE,
    ShiftTypeID INT,
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID),
    FOREIGN KEY (ShiftTypeID) REFERENCES ShiftTypes(ShiftTypeID)
);

INSERT INTO Employees (EmployeeID, EmployeeName) VALUES
(1, 'Rama'),
(2, 'Asma'),
(3, 'Avctel'),
(4, 'Tayssir'),
(5, 'Ryhem'),
(6, 'Amel'),
(7, 'Sonia'),
(8, 'Islam');

INSERT INTO AttendanceTypes (AttendanceTypeID, AttendanceTypeName, AttendanceCode) VALUES
(1, 'Present', 'W'),
(2, 'Vacation', 'V'),
(3, 'Absent', 'P'),
(4, 'Malade', 'M');

INSERT INTO ShiftTypes (ShiftTypeID, ShiftTypeName, ShiftCode) VALUES
(1, 'Post 1 Matin', 'Post 1'),
(2, 'Post 2 Soir', 'Post 2'),
(3, 'Repos Off', 'Repos Off'),
(4, 'Replacement', 'Remplacar'),
(5, 'Seasonal/Intern', 'Saisonier');

INSERT INTO ShiftSchedule (ScheduleID, EmployeeID, Date, ShiftTypeID) VALUES
(1, 4, '2024-08-01', 2),
(2, 4, '2024-08-02', 1),
(3, 4, '2024-08-03', 3),
(4, 4, '2024-08-04', 3),
(5, 5, '2024-08-01', 2),
(6, 5, '2024-08-02', 2),
(7, 5, '2024-08-03', 2),
(8, 5, '2024-08-04', 3);

INSERT INTO AttendanceRecords (RecordID, EmployeeID, Date, AttendanceTypeID) VALUES
(1, 1, '2024-08-01', 1), 
(2, 1, '2024-08-02', 2), 
(3, 2, '2024-08-03', 3),
(4, 2, '2024-08-04', 4), 
(5, 3, '2024-08-01', 1), 
(6, 3, '2024-08-02', 3),
(7, 4, '2024-08-03', 1),
(8, 4, '2024-08-04', 2); 

ALTER TABLE AttendanceRecords MODIFY COLUMN RecordID INT AUTO_INCREMENT;
ALTER TABLE ShiftSchedule MODIFY COLUMN ScheduleID INT AUTO_INCREMENT;
ALTER TABLE Employees MODIFY COLUMN EmployeeID INT AUTO_INCREMENT;