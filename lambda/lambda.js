const AWS = require('aws-sdk')
const LIST_USERS_GROUP = 'aws-cognito-bad-practice-list-users-group'
const STORAGE_USERS_GROUP = 'storage-users-group'

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = true

    console.log(event);
    
    let cognitoIdp = new AWS.CognitoIdentityServiceProvider();


    // add user to the list users group
    cognitoIdp.adminAddUserToGroup({
        GroupName: LIST_USERS_GROUP,
        UserPoolId: event.userPoolId,
        Username: event.userName
    }, 
    function(err, _) {
        if (err) {
            console.log(err, err.stack);
        }

        // add user to the storage users group
        cognitoIdp.adminAddUserToGroup({
            GroupName: STORAGE_USERS_GROUP,
            UserPoolId: event.userPoolId,
            Username: event.userName
        }, 
        function(err, _) {
            if (err) {
                console.log(err, err.stack);
            }
            
            cognitoIdp.adminUpdateUserAttributes({
                UserAttributes: [
                    {
                        Name: 'custom:isAdmin',
                        Value: 'false'
                    }
                ],
                UserPoolId: event.userPoolId,
                Username: event.userName
            }, 
            function(err, _) {
                if (err) {
                    console.log(err, err.stack);
                }

                // implement custom logging for our beautiful app here!!!
                logger = Function('date', `console.log("Added user ${event.userName} to the group at: " + date)`);
                logger(new Date());

                context.succeed(event);
            }) 
        })
    })
}