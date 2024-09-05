from flask import Flask, request, jsonify, redirect, url_for, render_template

app = Flask(__name__, static_folder='frontend',
            template_folder='frontend')

users = []  # This is a temporary in-memory database for users


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login')
def login_page():
    return render_template('login.html')

# Route to serve the login/register page

# Registration route

@app.route('/submit-register', methods=['POST'])
def submit_register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    # Simulate saving user to the "database"
    users.append({
        "username": username,
        "email": email,
        "password": password  # Note: In a real app, use hashed passwords
    })

    # After successful registration, redirect the user to the login page
    return jsonify({"message": "Registration successful, please log in."}), 200


# Login route
@app.route('/submit-login', methods=['POST'])
def submit_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if the user exists and password matches
    for user in users:
        if user['email'] == email and user['password'] == password:
            # On successful login, return JSON indicating success
            return jsonify({"message": "Login successful", "redirect": "/"}), 200

    return jsonify({"error": "Invalid email or password"}), 401


if __name__ == "__main__":
    from waitress import serve  # If using Gunicorn, it will handle this in production
    app.run(debug=True)  # Development

