window.userPool = new AmazonCognitoIdentity.CognitoUserPool(window.POOL_DATA);


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
        onSuccess: function() {
            window.cognitoUser = cognitoUser;
            getAWSCredentials(function() {
            window.location = "/index.html";
            })
        },

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
            IdentityPoolId: window.IDENTITY_POOL_ID,
            Logins: {
                [window.USER_POOL_ID] : jwtToken,
            }
        }, function(err, data) {
            if (err) {
                alert(err);
            }

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
            IdentityPoolId: window.IDENTITY_POOL_ID,
            Logins: {
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

    getAWSCredentialsForRole(window.USER_ROLE_ARN, function() {
        var identityServiceProvider = new AWS.CognitoIdentityServiceProvider();
        var params = {
            UserPoolId: window.POOL_DATA.UserPoolId
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