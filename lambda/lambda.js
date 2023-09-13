const AWS = require('aws-sdk')
const COGNITO_GROUP = 'aws-cognito-bad-practice-list-users-group'

exports.handler = (event, context, callback) => {
    console.log(event);
    
    let cognitoIdp = new AWS.CognitoIdentityServiceProvider();

    // dynamically resolve user pool id just because
    // we don't want to run terraform apply 2 times
    cognitoIdp.listUserPools({
        MaxResults: 20
    },
    function(err, data) {
        if (err) {
            console.log(err, err.stack);
        }
        
        const COGNITO_POOL_ID = data.UserPools[0].Id 

        // auto verify users on signup
        event.response.autoConfirmUser = true

        if ('email' in event.request.userAttributes){
            event.response.autoVerifyEmail = true
        }

        if ('phone_number' in event.request.userAttributes){
            event.response.autoVerifyPhone = true
        }

        // add user to the list users group
        cognitoIdp.adminAddUserToGroup({
            GroupName: COGNITO_GROUP,
            UserPoolId: COGNITO_POOL_ID,
            Username: event.userName
        }, 
        function(err, _) {
            if (err) {
                console.log(err, err.stack);
            }
            else {
                // implement custom logging for our beautiful app here!!!
                logger = Function('date', `console.log("Added user ${event.userName} to the group at: " + date)`);
                logger(new Date());
                
                context.succeed(event);
            }
        })
    })
}