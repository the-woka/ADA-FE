from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime, timedelta
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity

app = Flask(__name__, template_folder='frontend', static_folder='frontend')

users = []


@app.route('/')
def home():
    return render_template('welcome.html')


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/register')
def register():
    return render_template('register.html')


@app.route('/index')
def index():
    return render_template('index.html')


@app.route('/info')
def info():
    return render_template('card.html')


@app.route('/question')
def question():
    return render_template('question.html')


@app.route('/api/v1/users/register', methods=['POST'])
def register_user():
    data = request.json  # Get the JSON data from the request
    if not data or 'username' not in data or 'email' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    # Generate a user ID by simply incrementing the length of the users list
    user_id = len(users) + 1
    now = datetime.utcnow().isoformat() + 'Z'  # Current time in ISO format

    # Create the user data object
    user = {
        "username": data['username'],
        "email": data['email'],
        "password": data['password'],
        "current_role": "",
        "user_id": user_id,
        "created_at": now,
        "last_login": now
    }

    # Append to the in-memory storage (this could be a database in a real app)
    users.append(user)

    # Save to a JSON file (this will create a file or overwrite if it already exists)
    with open('users.json', 'w') as json_file:
        json.dump(users, json_file, indent=4)

    # Return the created user data as a JSON response
    return jsonify(user), 201

# Login endpoint


# Change this to a random and secure key
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(
    minutes=15)  # Access token expiration
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(
    days=30)    # Refresh token expiration

jwt = JWTManager(app)


@app.route('/api/v1/users/login', methods=['POST'])
def login_user():
    data = request.json

    # Check if email and password are provided
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400

    # Look for user by email
    user = next(
        (user for user in users if user['email'].lower() == data['email'].lower()), None)

    if user is None or user['password'] != data['password']:
        return jsonify({'error': 'Invalid credentials'}), 401

    # Generate tokens
    access_token = create_access_token(identity=user['email'])
    refresh_token = create_refresh_token(identity=user['email'])

    # Return tokens and user info
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user_info": {
            "user_id": user['user_id'],
            "username": user['username'],
            "email": user['email'],
            "current_role": user['current_role'],
            "last_login": user['last_login']
        }
    }), 200


# Protected route example


@app.route('/api/v1/protected', methods=['GET'])
@jwt_required()  # Protect this route with JWT access token
def protected_route():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


if __name__ == '__main__':
    app.run(debug=True)
