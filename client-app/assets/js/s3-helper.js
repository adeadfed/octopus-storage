function S3ListFolderFiles(folder, callback) {
    var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {
            Bucket: window.BUCKET_NAME
        }
    });

    if (folder) {
        var params = {
            Delimiter: '/',
            Prefix: `${folder}/`
        };
    } else {
        var params = {
            Delimiter: '/'
        };
    }

    s3.listObjects(params, callback);
}


function S3DownloadFile(fileKey) {
    var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {
            Bucket: window.BUCKET_NAME
        }
    });

    var params = {
        Bucket: window.BUCKET_NAME,
        Key: fileKey,
        Expires: 60 * 5
    };

    s3.getSignedUrl('getObject', params, function(err, url) {
        if (err) {
            console.log(err, err.stack);
        } else {
            window.open(url, '_blank');
        }
    });
}


function S3UploadFile(Body, dstPath, ContentType, callback) {
    var params = {
        Body: Body,
        Bucket: window.BUCKET_NAME,
        Key: dstPath,
        ContentType: ContentType
    };

    var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: params
    });

    s3.putObject(params, callback);
}


function S3DeleteFile(fileKey, callback) {
    var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {
            Bucket: window.BUCKET_NAME
        }
    });

    var params = {
        Bucket: window.BUCKET_NAME,
        Key: fileKey,
    };

    s3.deleteObject(params, callback);
}


function S3ShareFile(srcPath, dstPath, callback) {


    var params = {
        Bucket: window.BUCKET_NAME,
        CopySource: srcPath,
        Key: dstPath
    };

    var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: params
    });

    s3.copyObject(params, callback);
}


function upload() {
    getAWSCredentials(function() {
        var name = document.getElementById('name').value;
        var file = document.getElementById('upload-file').files[0];
        var shareUser = document.getElementById('share-user').value;

        var uploadPath = `${userPool.getCurrentUser().username}/${name ? name : file.name}`;

        var r = new FileReader();
        r.onload = res => {
            S3UploadFile(r.result, uploadPath, "binary/octet-stream", function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                }
                console.log(data);

                if (shareUser != "None") {
                    var srcPath = `${window.BUCKET_NAME}/${uploadPath}`;
                    var dstPath = `${shareUser}/${name ? name : file.name}`;
                    S3ShareFile(srcPath, dstPath, function() {
                        if (err) {
                            console.log(err, err.stack);
                        }
                        window.location = "/files.html";
                    });
                } else {
                    window.location = "/files.html";
                }
            });
        }

        r.onerror = err => {
            alert(err);
        }

        r.readAsArrayBuffer(file);
    });
}


function download(fileName) {
    getAWSCredentials(function() {
        S3DownloadFile(fileName);
    });
}


function share() {
    getAWSCredentials(function() {

        var srcUser = userPool.getCurrentUser().username;
        var shareUser = document.getElementById('share-user').value;

        var fileName = document.getElementById('name').value;

        var srcPath = `${window.BUCKET_NAME}/${srcUser}/${fileName}`;
        var dstPath = `${shareUser}/${fileName}`;

        S3ShareFile(srcPath, dstPath, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log(data);
                window.location = "/files.html";
            }
        });
    });
}


function deleteFile(filePath) {
    getAWSCredentials(function() {
        S3DeleteFile(filePath, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log(data);
                window.location.reload();
            }
        });
    });
}


function displayFiles() {
    getAWSCredentials(function() {
        var hmtlContainer = document.getElementById('file_list');

        var userFolder = userPool.getCurrentUser().username;
        S3ListFolderFiles(userFolder, function(err, data) {
            if (err) {
                alert(err);
                return;
            }

            data.Contents.forEach(function(element) {
                var fullPath = element.Key;
                var date = element.LastModified;
                var size = element.Size;

                var fileName = fullPath.split("/")[1];

                var fileCard = document.createElement('div');
                fileCard.className = "col-md-6 col-lg-4";

                var cardText = `
                                <div class="card"><img class="card-img-top w-100 d-block" style="max-width: 45%; margin-top:20px; margin-bottom:10px; margin-left:auto; margin-right:auto" src="assets/img/document.svg">
                                    <div class="card-body">
                                        <h4 class="card-title">${fileName}</h4>
                                        <p class="card-text">Last modified: ${ new Intl.DateTimeFormat('en-GB', {dateStyle:'full', timeStyle:'medium'}).format(date) }</p>
                                        <p class="card-text">Size: ${ Math.floor(size/1024) } KB</p>
                                    </div>
                                    <div>
                                        <button class="btn btn-outline-primary btn-sm" type="button" onclick="download('${fullPath}')">Download</button>
                                        <button class="btn btn-outline-primary btn-sm" type="button" onclick="document.location.href='/upload.html?mode=share&filename=${fileName}'">Share</button>
                                        <button class="btn btn-outline-primary-red btn-sm" type="button" onclick="deleteFile('${fullPath}')">Delete</button>
                                    </div>
                                </div>`;
                fileCard.innerHTML = cardText;
                hmtlContainer.appendChild(fileCard);
            });
        });
    });
}