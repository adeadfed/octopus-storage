import os
import hmac
import boto3
import base64
from flask_cognito import CognitoAuth, cognito_auth_required
from hashlib import sha256
from dotenv import load_dotenv
from flask import Flask, request, render_template, render_template_string, send_from_directory

# env
#######################################################
load_dotenv()
# aws settings
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")


# cognito settings
REGION_NAME = os.getenv("AWS_REGION")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
USER_POOL_ID = os.getenv("USER_POOL_ID")
#######################################################

user_pool_client = boto3.client(
        'cognito-idp', 
        region_name=REGION_NAME,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )


def get_secret_hash(username):
    msg = username + CLIENT_ID
    dig = hmac.new(
        CLIENT_SECRET.encode('utf-8'),
        msg=msg.encode('utf-8'),
        digestmod=sha256).digest()
    
    return base64.b64encode(dig).decode()
    

def authenticate(client, username, password):
    
    response = client.admin_initiate_auth(
        UserPoolId=USER_POOL_ID,
        ClientId=CLIENT_ID,
        AuthFlow='ADMIN_USER_PASSWORD_AUTH',
        AuthParameters = {
            'USERNAME': username,
            'PASSWORD': password,
            'SECRET_HASH': get_secret_hash(username)
        }
    )
    return response


def get_groups_for_user(client, username):
    response = client.admin_list_groups_for_user(
        Username=username,
        UserPoolId=USER_POOL_ID
    )
    
    group_names = list()
    for group in response['Groups']:
        group_names.append(group['GroupName'])
    return group_names


def list_users(client):
    response = client.list_users(
        UserPoolId=USER_POOL_ID,
        AttributesToGet=[
            'email'
        ]
    )
    
    users_info = ''
    
    for user in response['Users']:
        username    = user['Username']
        groups      = ', '.join(get_groups_for_user(client, user['Username'])) 
        email       = user['Attributes'][0]['Value']
        user_status = user['UserStatus']
        
        users_info += '''
              <tr>
                <td>{}</td>
                <td>{}</td>
                <td>{}</td>
                <td>{}</td>
                <td><button class="btn btn-danger" type="button" onclick="deleteUser({})">Delete</button></td>
              </tr>'''.format(username, email, groups, user_status, username)
    return users_info

 
def delete_user(client, username):
    response = client.admin_delete_user(
        UserPoolId=USER_POOL_ID,
        Username=username
    )
    return response
    
    
app = Flask(__name__, template_folder='./frontend/')
app.config.update({
    'COGNITO_REGION': REGION_NAME,
    'COGNITO_USERPOOL_ID': USER_POOL_ID,
    'COGNITO_APP_CLIENT_ID': CLIENT_ID,
    'COGNITO_CHECK_TOKEN_EXPIRATION': True,
    'COGNITO_JWT_HEADER_NAME': 'Authorization',
    'COGNITO_JWT_HEADER_PREFIX': 'Bearer',
})


@app.route('/', methods=['GET', 'POST'])
@app.errorhandler(500)
def index_view():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        return authenticate(user_pool_client, username, password)
    else:
        return render_template('login.html')


@app.route('/users', methods=['GET'])
@cognito_auth_required
def users_view():      
    users = list_users(user_pool_client)
    with open('frontend/users.html', 'rb') as f:
        user_file = f.read().decode('utf-8')
    
    return render_template_string(user_file.format(users))


@app.route('/users/<username>', methods=['DELETE'])
@cognito_auth_required
def delete_user_view(username):
    return delete_user(user_pool_client, username)


@app.route('/assets/<path:path>')
def assets(path):
    return send_from_directory('./frontend/assets/', path)


if __name__ == '__main__':
    cogauth = CognitoAuth(app)
    app.run(host='127.0.0.1', port=8000, debug=True)