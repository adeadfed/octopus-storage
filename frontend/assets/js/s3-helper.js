// window.userPool.storage["aws.cognito.identity-id.us-east-2:0d896089-5205-46cc-9f07-ca8828e8b6d4"]

window.BUCKET_NAME = "octupus-storage-files-bad-practice"


function S3ListFolderFiles(UserFolder, callback) {
    var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: window.BUCKET_NAME}});

    if (UserFolder == "") {
        var param = {Delimiter: '/'}
    } else {
        var param = {Delimiter: '/', Prefix: `${UserFolder}/`}
    }

    s3.listObjects(param, callback);
}


function S3ReadFile(keyFile){
    var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: window.Bucket}});
        
    s3.getObject({Key:keyFile}, function(err, data) {
        // Handle any error and exit
        if (err) {
            console.log(err);
        }
        var objectData = data.Body; //.toString('utf-8');
        console.log(objectData)
    });
}


function S3UploadFile(Body,FileName,ContentType){
    var params = {   
        Body: Body,
        Bucket: window.Bucket,
        Key: FileName,
        ServerSideEncryption: "AES256",
        ContentType: ContentType
       };
    var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: window.BUCKET_NAME}});
        
    s3.putObject(params, function(err, data) {    
       if (err){
        console.log(err, err.stack); // an error occurred   
        return; 
       }
        document.location = "/files.html";
    });
}

// TODO: rewrite this to use copyObject
function S3ShareFile(fileName,userIdSrc,userIdDst){
    var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: window.Bucket}});
            
        s3.getObject({Key:`${userIdSrc}/${fileName}`}, function(err, data) {

            if (err) {
                console.log(err);
            }
            S3UploadFile(data.Body,`${userIdDst}/${fileName}`,data.ContentType)
        });
}


function upload() {
    getAWSCredentials(function() {
        var name = document.getElementById('name').value;
        var file = document.getElementById('upload-file').files[0];

        var uploadPath = `${userPool.getCurrentUser().username}/${name ? name : file.name}`;

        var r = new FileReader();
        r.onload = res => {
            S3UploadFile(r.result, uploadPath, "binary/octet-stream");
        }

        r.onerror = err => {
            alert(err);
        }

        r.readAsArrayBuffer(file);
    });
}


function displayFiles() {
    getAWSCredentials(function() {
        var hmtlContainer = document.getElementById('file_list');

        var userFolder = userPool.getCurrentUser().username;
        S3ListFolderFiles(userFolder, function(err, data) {
            if(err) {
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
                                        <p class="card-text">${date}</p>
                                        <p class="card-text">${size}</p>
                                    </div>
                                    <div>
                                        <button class="btn btn-outline-primary btn-sm" type="button">Download</button>
                                        <button class="btn btn-outline-primary btn-sm" type="button">Share</button>
                                        <button class="btn btn-outline-primary-red btn-sm" type="button">Delete</button>
                                    </div>
                                </div>`;
    
                console.log(cardText);
                
                fileCard.innerHTML = cardText;
                console.log(fileCard);
    
                hmtlContainer.appendChild(fileCard);
            });
        });
    });
}