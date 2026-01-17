document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let name = document.getElementById('name').value;
    
    fetch('../api/addUser.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    })
    .then(response => {
        try{
            return response.json();
        } catch (error) {
            window.location.href = '404.html';
        }
    })
    .then(data => {
        if (data.success) {
            window.location.href = './loading.html';
        } else {
            window.location.href = '404.html';
        }
    })
    .catch(error => console.error('Error:', error));
});
