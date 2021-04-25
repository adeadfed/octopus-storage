unauth_hrefs = '<li class="nav-item"><a class="nav-link" href="login.html">LOGIN</a></li><li class="nav-item"><a class="nav-link" href="register.html">SIGN UP</a></li>'
auth_hrefs = '<li class="nav-item"><a class="nav-link" href="upload.html">UPLOAD</a></li><li class="nav-item"><a class="nav-link" href="files.html">FILES</a></li><li class="nav-item"><a class="nav-link" href="#" onclick="logout()">LOGOUT</a></li>'

function set_header() {
    if (window.userPool.getCurrentUser() != null) {
        document.getElementById('header').innerHTML = auth_hrefs;
    }
    else {
        document.getElementById('header').innerHTML = unauth_hrefs;
    }
}
