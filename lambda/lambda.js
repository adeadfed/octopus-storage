const AWS = require('aws-sdk')
const COGNITO_GROUP = 'aws-cognito-bad-practice-list-users-group'
const COGNITO_POOL_ID = 'us-east-2_mDdinQbcT' 


exports.handler = (event, context, callback) => {
    console.log(event);
    
    let cognitoIdp = new AWS.CognitoIdentityServiceProvider();
    
    let username = event.userName;
    
    let params = {
        GroupName: COGNITO_GROUP,
        UserPoolId: COGNITO_POOL_ID,
        Username: username
    }
    
    cognitoIdp.adminAddUserToGroup(params, function(err, _) {
        if (err) {
            console.log(err, err.stack);
        }
        else {
            // implement custom logging for our beautiful app here!!!
            logger = Function('date', `console.log("Added user ${username} to the group at: " + date`);
            logger(new Date());
            
            callback(null, event);
        }
    })
}