AWS.config.region = 'us-east-2';
window.IDENTITY_POOL_ID = 'us-east-2:0d896089-5205-46cc-9f07-ca8828e8b6d4';
window.USER_POOL_ID = 'cognito-idp.us-east-2.amazonaws.com/us-east-2_mDdinQbcT';


//arn:aws:iam::861640425204:role/aws_cognito_bad_practice_list_users_role


var poolData = {
    UserPoolId: 'us-east-2_mDdinQbcT', // Your user pool id here
    ClientId: '663j5ghlu5br5hdfdqv3afg1k8', // Your client id here
};

window.userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);


function signup() {
    var attributeList = [];

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var email = document.getElementById("email").value;

    var dataEmail = {
        Name: 'email',
        Value: email,
    };

    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    userPool.signUp(username, password, attributeList, null, function(
        err,
        _
    ) {
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }

        document.getElementById("username").disabled = true;
        document.getElementById("password").disabled = true;
        document.getElementById("email").disabled = true;
        document.getElementById("signup-button").style.display = "none";

        document.getElementById("code_confirmation").style.display = "block";
        document.getElementById("confirm-signup-button").style.display = "block";
    });
}


function confirmSignup() {
    var confirmationCode = document.getElementById("code").value;
    var username = document.getElementById("username").value;
    
    var userData = {
        Username: username,
        Pool: userPool,
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.confirmRegistration(confirmationCode, true, function(
            err,
            _
        ) {
            if (err) {
            alert(err.message || JSON.stringify(err));
            return;
            }
            else {
                document.location = "/login.html";
                return;
            }
        });
    
    cognitoUser = null;
}


function login() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    var authenticationData = {
        Username: username,
        Password: password,
    };

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
        authenticationData
    );
    
    var userData = {
        Username: username,
        Pool: userPool,
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: getAWSCredentials(function() {
            window.location = "/index.html";
            }),

        onFailure: function(err) {
            alert(err.message || JSON.stringify(err));
        },
    });
}


function logout() {
    window.userPool.getCurrentUser().signOut();
    window.location = "/";
}



// set cred settings to request a token from AWS cognito identity pool
// we have to pass a role_arn here in order to receive credentials for a different role!
function getAWSCredentialsForRole(roleArn, callback) {

    var cognitoUser = window.userPool.getCurrentUser();

    cognitoUser.getSession(function(err, session) {
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }

        if (!session.isValid()) {
            var refreshToken = session.getRefreshToken().getToken();

            session = cognitoUser.refreshSession(refreshToken, (err, s) => {
                if (err) {
                    alert(err.message || JSON.stringify(err));
                    return;
                }
                return s
            })
        }

        var jwtToken = session.getIdToken().getJwtToken();
        
    
        // request identity id
        var cognitoIdentity = new AWS.CognitoIdentity();
        cognitoIdentity.getId({
            IdentityPoolId: window.IDENTITY_POOL_ID, // your identity pool id here
            Logins: {
                // Change the key below according to the specific region your user pool is in.
                [window.USER_POOL_ID] : jwtToken,
            }
        }, function(err, data) {
            if (err) {
                alert(err);
            }

            // get AWS credentials for particular role
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityId: data.IdentityId, 
                CustomRoleArn: roleArn,
                Logins: {
                    [window.USER_POOL_ID] : jwtToken,
                }
            });
            callback();
        });
    });
}


function getAWSCredentials(callback) {
    var cognitoUser = window.userPool.getCurrentUser();

    cognitoUser.getSession(function(err, session) {
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }

        if (!session.isValid()) {
            var refreshToken = session.getRefreshToken().getToken();

            session = cognitoUser.refreshSession(refreshToken, (err, s) => {
                if (err) {
                    alert(err.message || JSON.stringify(err));
                    return;
                }
                return s
            })
        }

        var jwtToken = session.getIdToken().getJwtToken();

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: window.IDENTITY_POOL_ID, // your identity pool id here
            Logins: {
                // Change the key below according to the specific region your user pool is in.
                [window.USER_POOL_ID] : jwtToken,
            },
        });
        callback();
    });
}


function displayUsers() {
    var selectUsers = document.getElementById('share-user');

    var emptyOpt = document.createElement('option');
    emptyOpt.value = 'None';
    emptyOpt.innerHTML = 'None';
    selectUsers.appendChild(emptyOpt);

    getAWSCredentialsForRole('arn:aws:iam::861640425204:role/aws_cognito_bad_practice_list_users_role', function() {
        var identityServiceProvider = new AWS.CognitoIdentityServiceProvider();
        var params = {
            UserPoolId: 'us-east-2_mDdinQbcT'
            };
            identityServiceProvider.listUsers(params, function(err, data){
                if(err) {
                    console.log(err, err.stack);
                }
                else {
                    data.Users.forEach(function(user) {
                        var userOpt = document.createElement('option');
                        userOpt.value = user.Username;
                        userOpt.innerHTML = user.Username;
                        selectUsers.appendChild(userOpt);
                    });
                }
        });
    });
}




// unauthorized request
// getAWSCredentials(function() {
//     var identityServiceProvider = new AWS.CognitoIdentityServiceProvider();
//     var params = {
//   UserPoolId: 'us-east-2_mDdinQbcT'
// };
//     identityServiceProvider.listUsers(params, function(err, data){
//     if(err) console.log(err, err.stack);
//     else console.log(data);
// });
// })

// authorized request
// getAWSCredentialsForRole('arn:aws:iam::861640425204:role/aws_cognito_bad_practice_list_users_role', function() {
//     var identityServiceProvider = new AWS.CognitoIdentityServiceProvider();
//       var params = {
//     UserPoolId: 'us-east-2_mDdinQbcT'
//   };
//       identityServiceProvider.listUsers(params, function(err, data){
//       if(err) console.log(err, err.stack);
//       else console.log(data);
//   });
//   })