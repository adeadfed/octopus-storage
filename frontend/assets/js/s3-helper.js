// window.userPool.storage["aws.cognito.identity-id.us-east-2:0d896089-5205-46cc-9f07-ca8828e8b6d4"]
function S3ListFolderFiles(UserFolder) {
    var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: window.Bucket}});

    if (UserFolder == "") {
        var param = {Delimiter: '/'}
    } else {
        var param = {Delimiter: '/', Prefix: `${UserFolder}/`}
    }
    
    s3.listObjects(param, function(err, data) {
        if (err) {
            return alert('There was an error listing your albums: ' + err.message);
        } else {
            var FolderFiles = data.Contents.map(function(obj) {
            var prefix = obj.Key;
            var folderFile = decodeURIComponent(prefix) //.split("/")[1];
            console.log(folderFile);
        });
      }
    });
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
    params: {Bucket: window.Bucket}});
        
    s3.putObject(params, function(err, data) {    
       if (err){
        console.log(err, err.stack); // an error occurred    
       }
       else {
        console.log(data);           // successful response    /*    
       }  
 
    });
}

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
