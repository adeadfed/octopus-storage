var AWS = require ('aws-sdk')

exports.handler = (event, context, callback) => {
    console.log(event);
    
    var cognitoIdp = new AWS.CognitoIdentityServiceProvider();
    
    var username = event.userName;
    
    var params = {
        GroupName: 'aws-cognito-bad-practice-list-users-group',
        UserPoolId: 'us-east-2_mDdinQbcT',
        Username: username
    }
    
    cognitoIdp.adminAddUserToGroup(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        }
        else {
            // implement custom logging for our beautiful app here!!!
            logger = Function('date', `console.log("Added user ${username} to the group at: " + date`);
            
            var date = Date();
            logger(date);
            
            callback(null, event);
        }
    })
}