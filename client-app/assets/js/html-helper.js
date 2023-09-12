unauth_hrefs = '<li class="nav-item"><a class="nav-link" href="login.html">LOGIN</a></li><li class="nav-item"><a class="nav-link" href="register.html">SIGN UP</a></li>'
auth_hrefs = '<li class="nav-item"><a class="nav-link" href="upload.html">UPLOAD</a></li><li class="nav-item"><a class="nav-link" href="files.html">FILES</a></li><li class="nav-item"><a class="nav-link" href="#" onclick="logout()">LOGOUT</a></li>'

function setHeader() {
    if (window.userPool.getCurrentUser() != null) {
        document.getElementById('header').innerHTML = auth_hrefs;
    } else {
        document.getElementById('header').innerHTML = unauth_hrefs;
    }
}


function setForm() {
    var section = document.getElementById('form-section');
    var url = new URL(window.location.href);

    var mode = url.searchParams.get('mode') ? url.searchParams.get('mode') : 'upload';

    if (mode == 'share') {
        var filename = url.searchParams.get('filename') ? url.searchParams.get('filename') : '';
        var shareHtml = `<div class="container">
            <div class="block-heading">
                <h2 class="text-info">Share file</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc quam urna, dignissim nec auctor in, mattis vitae leo.</p>
            </div>
            <form>
                <div class="mb-3"><label class="form-label" for="name">File Name</label><input class="form-control" type="text" id="name" name="name" disabled="true" value="${filename}"></div>
                <div class="mb-3"></div>
                <div class="mb-3"><label class="form-label" for="share-user">Share</label><select class="form-control" id="share-user" name="share-user"></select></div>
                <div class="mb-3"><label class="form-label" for="upload-file">File</label><input class="form-control" type="file" required="" id="upload-file" name="file" disabled="true"></div>
                <div class="mb-3"><button class="btn btn-primary" type="button" onclick="share()">Share</button></div>
            </form>
            </div>`

        section.innerHTML = shareHtml;
        displayUsers();
    } else {
        var uploadHtml = `<div class="container">
            <div class="block-heading">
                <h2 class="text-info">Upload new file</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc quam urna, dignissim nec auctor in, mattis vitae leo.</p>
            </div>
            <form>
                <div class="mb-3"><label class="form-label" for="name">File Name</label><input class="form-control" type="text" id="name" name="name"></div>
                <div class="mb-3"></div>
                <div class="mb-3"><label class="form-label" for="share-user">Share</label><select class="form-control" id="share-user" name="share-user"></select></div>
                <div class="mb-3"><label class="form-label" for="upload-file">File</label><input class="form-control" type="file" required="" id="upload-file" name="file"></div>
                <div class="mb-3"><button class="btn btn-primary" type="button" onclick="upload()">Upload</button></div>
            </form>
            </div>`

        section.innerHTML = uploadHtml;
        displayUsers();
    }
}