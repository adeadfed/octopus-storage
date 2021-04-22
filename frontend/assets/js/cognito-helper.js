AWS.config.region = 'us-east-2';
window.IDENTITY_POOL_ID = 'us-east-2:0d896089-5205-46cc-9f07-ca8828e8b6d4';
window.USER_POOL_ID = 'cognito-idp.us-east-2.amazonaws.com/us-east-2_mDdinQbcT';

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
        document.getElementById("signup_button").disabled = true;

        document.getElementById("code_confirmation").style.display = "block";

    });
}


function confirmSignup() {
    var confirmationCode = document.getElementById("code").value;

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
        onSuccess: function(_) {
            document.location = '/';
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
function getAWSCredentials() {
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
    });
}


