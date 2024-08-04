document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('add');
    const calendarButton = document.getElementById('calendar');


    addButton.addEventListener('click', function() {
        localStorage.setItem('login', 'true');
        window.location.href = '../pages/add.html';
    });

    calendarButton.addEventListener('click', function() {
        localStorage.setItem('login', 'true');
        window.location.href = '../index.html';
    });
    
});