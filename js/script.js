document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultContainer = document.getElementById('resultContainer');
    const employeeNameSpan = document.getElementById('employeeName');
    const attendanceTable = document.getElementById('attendanceTable').getElementsByTagName('tbody')[0];
    const shiftTable = document.getElementById('shiftTable').getElementsByTagName('tbody')[0];
    const nextMonthButton = document.getElementById('nextMonthButton');
    const previousMonthButton = document.getElementById('previousMonthButton');
    const attendanceEditButton = document.getElementById('edit-button-att');
    const shiftEditButton = document.getElementById('edit-button-shift');
    const monthYearSpan = document.getElementById('monthYear');
    employeeData = null;
    currentYear = new Date().getFullYear();
    currentMonth = new Date().getMonth();
    employeeName = '';
    
    if (localStorage.getItem('login')) {
        checkForExistingUser();
    }else{
        window.location.href = 'pages/login.html';
    }

    checkForExistingUser();
    
    async function checkForExistingUser(){
        if (localStorage.getItem('flag')) {
            localStorage.removeItem('flag');
            if (localStorage.getItem('employeName')) {
                employeeName = localStorage.getItem('employeName');
                month = localStorage.getItem('month');
                currentMonth = new Date(localStorage.getItem('month')).getMonth() +1;
                currentYear = new Date(localStorage.getItem('year')).getFullYear();
                console.log(employeeName, currentMonth, currentYear);
                employeeData = await getEmployeeData(employeeName);
                if (employeeData) {
                    employeeNameSpan.textContent = employeeName;
                    populateTables(employeeData.attendance, employeeData.shifts, currentYear, currentMonth);
                    resultContainer.style.display = 'block';
                } else {
                    window.location.href = 'pages/404.html';
                }
            }
        }
    }
    
    searchButton.addEventListener('click', async function() {
        employeeName = searchInput.value;
        if (employeeName) {
            employeeData = await getEmployeeData(employeeName);
            if (employeeData) {
                employeeNameSpan.textContent = employeeName;
                localStorage.setItem('employeName', employeeName);
                window.location.href = 'pages/loading.html';
                localStorage.setItem('flag', 'true');
                localStorage.setItem('month', currentMonth);
                localStorage.setItem('year', currentYear);
            } else {
                window.location.href = 'pages/404.html';
            }
        }
    });
    
    let attEdit = false;
    let shiftEdit = false;
    attendanceEditButton.addEventListener('click', function() {
        if (attEdit || shiftEdit) {
            return;
        }
        toggleEditMode(attendanceTable, 'attendance');
        attEdit = true;
    });
    
    
    shiftEditButton.addEventListener('click', function() {
        if (attEdit || shiftEdit) {
            return;
        }
        toggleEditMode(shiftTable, 'shift');
        shiftEdit = true;
    });
    
    nextMonthButton.addEventListener('click', async function() {
        if (employeeData) {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            employeeData = await getEmployeeData(employeeName);
            populateTables(employeeData.attendance, employeeData.shifts, currentYear, currentMonth);
        }
    });
    
    previousMonthButton.addEventListener('click', async function() {
        if (employeeData) {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            employeeData = await getEmployeeData(employeeName);
            populateTables(employeeData.attendance, employeeData.shifts, currentYear, currentMonth);
        }
    });
    
    function formatDateForMySQL(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    async function getEmployeeData(employeeName) {
        try {
            const response = await fetch(`./api/getEmployeeData.php?name=${employeeName}`);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            window.location.href = 'pages/404.html';
        }
        return null;
    }
    
    function populateTables(attendanceData, shiftData, year, month) {
        const dates = getAllDatesInMonth(year, month);
        monthYearSpan.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
        populateTable(attendanceTable, dates, attendanceData, 'status', getAttendanceColor);
        populateTable(shiftTable, dates, shiftData, 'type', getShiftColor);
    }
    
    function getAllDatesInMonth(year, month) {
        const date = new Date(year, month, 2);
        const dates = [];
        while (date.getMonth() === month) {
            dates.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return dates;
    }
    
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    function getAttendanceColor(status) {
        const colors = {
            'Present': '#00ffd7',
            'Absent': '#ff0000',
            'Vacation': '#fcba03',
            'Malade': '#00ff37'
        };
        return colors[status] || '#FFFFFF';
    }
    
    function getShiftColor(shiftType) {
        const colors = {
            'Post 1 Matin': '#f700ff',
            'Post 2 Soir': '#00ffd5',
            'Repos Off': '#ff0000',
            'Replacement': '#f6ff00',
            'Seasonal/Intern': '#00ff37'
        };
        return colors[shiftType] || '#FFFFFF';
    }
    
    function populateTable(table, allDates, data, dataKey, colorFunction) {
        table.innerHTML = '';
        
        const headerRow = table.insertRow();
        headerRow.insertCell().textContent = 'Date';
        allDates.forEach(date => {
            const cell = headerRow.insertCell();
            cell.textContent = formatDate(date);
            cell.style.fontWeight = 'bold';
        });
    
        const dataRow = table.insertRow();
        dataRow.insertCell().textContent = dataKey.charAt(0).toUpperCase() + dataKey.slice(1);
        allDates.forEach(date => {
            const formattedDate = formatDate(date);
            const cell = dataRow.insertCell();
            if (dataKey === 'status' || dataKey === 'type') {
                cell.classList.add('editable');
            }
            const record = data.find(record => record.date === formattedDate);
    
            if (record) {
                cell.textContent = record[dataKey] || ''; 
                cell.style.backgroundColor = colorFunction(record[dataKey]);
            } else {
                cell.textContent = ''; 
            }
        });
    }
    
    function toggleAttendanceEditMode() {
        toggleEditMode(attendanceTable, 'attendance');
    }
    
    function toggleShiftEditMode() {
        toggleEditMode(shiftTable, 'shift');
    }
    
    function toggleEditMode(table, type) {
        if (table.classList.contains('editable')) {
            table.classList.remove('editable');
        } else {
            table.classList.add('editable');
        }
        const rows = table.getElementsByTagName('tr');
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            for (let j = 1; j < cells.length; j++) {
                const cell = cells[j];
                if (cell.classList.contains('editable')) {
                    const originalText = cell.textContent;
                    const dropdown = document.createElement('select');
                    dropdown.innerHTML = getDropdownOptions(type).map(option => `<option value="${option}">${option}</option>`).join('');
                    dropdown.value = originalText;
                    cell.innerHTML = '';
                    cell.appendChild(dropdown);
                }
            }
        }
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Changes';
        saveButton.style.margin = '10px';
        saveButton.style.padding = '5px 10px';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '5px';
        saveButton.style.backgroundColor = '#4CAF50';
        saveButton.style.color = 'white';
        saveButton.style.cursor = 'pointer';
        saveButton.style.fontSize = '16px';
        saveButton.style.fontWeight = 'bold';
        saveButton.addEventListener('click', function() {
            saveChanges(table, type);
        });
        table.parentElement.appendChild(saveButton);
        const nextButton = document.getElementById('nextMonthButton');
        const previousButton = document.getElementById('previousMonthButton');
        nextButton.remove();
        previousButton.remove();
    }
    
    function getDropdownOptions(type) {
        const options = type === 'attendance' ? ['Present', 'Vacation', 'Absent', 'Malade'] : ['Post 1 Matin', 'Post 2 Soir', 'Repos Off', 'Replacement', 'Seasonal/Intern'];
        return options;
    }
    
    async function saveChanges(table, type) {
        const isAttendance = type === 'attendance';
        if (isAttendance) {
            attEdit = false;
        } else {
            shiftEdit = false;
        }
    
        const rows = table.getElementsByTagName('tr');
        const data = [];
        
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            for (let j = 1; j < cells.length; j++) {
                const cell = cells[j];
                if (cell.querySelector('select')) {
                    const dateCell = rows[0].cells[j];
                    const date = formatDateForMySQL(dateCell.textContent);
                    const value = cell.querySelector('select').value;
                    
                    data.push({
                        date: date,
                        [type]: value
                    });
                }
            }
        }
    
        try {
            const response = await fetch(`./api/save${type.charAt(0).toUpperCase() + type.slice(1)}Data.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeName, data })
            });
    
            if (response.ok) {
                localStorage.setItem('flag', 'true');
                localStorage.setItem('month', currentMonth);
                localStorage.setItem('year', currentYear);
                window.location.href = 'pages/loading.html';
            } else {
                window.location.href = 'pages/404.html';
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            exitEditMode(table);
        }
    }
    
    function exitAttendanceEditMode() {
        exitEditMode(attendanceTable);
    }
    
    function exitShiftEditMode() {
        exitEditMode(shiftTable);
    }
    
    function exitEditMode(table) {
        table.classList.remove('editable');
        const rows = table.getElementsByTagName('tr');
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            for (let j = 1; j < cells.length; j++) {
                const cell = cells[j];
                if (cell.classList.contains('editable')) {
                    const select = cell.querySelector('select');
                    if (select) {
                        cell.textContent = select.value;
                    }
                }
            }
        }
        const saveButton = table.parentElement.querySelector('button');
        if (saveButton) {
            saveButton.remove();
        }
        localStorage.setItem('flag', 'true');
        localStorage.setItem('month', currentMonth);
        localStorage.setItem('year', currentYear);
        window.location.reload();
    }
});
