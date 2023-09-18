import jwt
import flask
from jwt import PyJWKClient

app = flask.Flask(__name__)

aws_region = 'us-east-1'
userpool_id = 'us-east-1_7sK8epCcM'
userpool_client_id = '260te4kq53jp0ei0h710n7qlnd'

jwks_url = f'https://cognito-idp.{aws_region}.amazonaws.com/{userpool_id}/.well-known/jwks.json'
jwks_client = PyJWKClient(jwks_url)

def admin_jwt(f):
    def decorator(*args, **kwargs):
        # Authorization: Bearer ***JWT*** -> ***JWT***
        id_token = flask.request.headers['Authorization'].split()[1]
        signing_key = jwks_client.get_signing_key_from_jwt(id_token)

        data = jwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256"],
            audience=userpool_client_id
        )

        if data['custom:isAdmin'] == 'true':
            return f(*args, **kwargs)
        
        return flask.Response(status=401)
    return decorator


@app.route('/', methods=['GET'])
@admin_jwt
def index():
    return 'hi admin!'


app.run()