function loggedIn() {
    if (localStorage.getItem('cognito-access-token') != null) {
        return true;
    }
}


function loadUsers() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/users', true);

    var authHeader = 'Bearer ' + localStorage.getItem('cognito-access-token');
    xhr.setRequestHeader('Authorization', authHeader);

    xhr.onreadystatechange = function() {
        if (xhr.status == 200) {
            document.body.innerHTML = xhr.responseText;
            setHeader();
        }
        else {
            alert('An error occured');
        }
    }
    xhr.send();
}


function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var body = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                console.log(response);
                localStorage.setItem('cognito-access-token', response.AuthenticationResult.AccessToken);

                loadUsers();
            }
            else {
                alert('An error occured');
            }
        }
    }

    xhr.send(body);
}


function logout() {
    localStorage.removeItem('cognito-access-token');
    window.location = '/';
}


function setHeader() {
    var authHeader = '<li class="nav-item"><a class="nav-link" href="#" onclick="logout()">Logout</a></li>';
    var unauthHeader = '<li class="nav-item"><a class="nav-link" href="/">Login</a></li>';

    if(loggedIn()) {
        document.getElementById('header').innerHTML = authHeader;
    }
    else {
        document.getElementById('header').innerHTML = unauthHeader;
    }
}
