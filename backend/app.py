from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import bcrypt
import random
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

# OTP route
@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data.get('email')
    otp = str(random.randint(100000, 999999))

    sender_email = "ai.trials2024@gmail.com"
    sender_password = "mhrfbmtallhrizzh"

    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = email
    message["Subject"] = "Your DeepDefend OTP"
    message.attach(MIMEText(f"Your OTP is: {otp}", "plain"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, email, message.as_string())
        server.quit()

        return jsonify({"message": "OTP sent", "otp": otp}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔐 Get DB connection
def get_db_connection():
    try:
        return pymysql.connect(
            host="localhost",
            user="root",
            password="sridhara",
            database="dds",
            cursorclass=pymysql.cursors.DictCursor
        )
    except Exception as e:
        print("❌ Database connection failed:", str(e))
        return None


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    password = data.get('password')

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO users (firstname, lastname, email, password_hash) VALUES (%s, %s, %s, %s)",
                (firstname, lastname, email, hashed.decode('utf-8'))
            )
            conn.commit()
        return jsonify({"message": "Registered"}), 201
    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500
    finally:
        conn.close()


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor() as cur:
            # 👇 CHANGE 1: Select the user's name along with the password hash
            cur.execute("SELECT firstname, lastname, password_hash FROM users WHERE email = %s", (email,))
            user = cur.fetchone()

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            # 👇 CHANGE 2: Return the user's details on success
            return jsonify({
                "firstname": user['firstname'],
                "lastname": user['lastname'],
                "email": email
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500
    finally:
        conn.close()

@app.route('/delete-account', methods=['POST', 'OPTIONS'])
def delete_account():
    
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    # --- Call FastAPI server to delete history and files ---
    try:
        fastapi_url = f"http://localhost:8000/internal/delete-history/{email}"
        response = requests.delete(fastapi_url)
        if response.status_code >= 300:
             print(f"FastAPI error response: {response.text}")
             return jsonify({"error": "Failed to delete user history. Account not deleted."}), 500
    except requests.exceptions.RequestException as e:
        print(f"Could not connect to FastAPI server: {e}")
        return jsonify({"error": "A service is unavailable. Could not complete account deletion."}), 503

    # --- If history deletion was successful, proceed to delete the user ---
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM users WHERE email = %s", (email,))
            conn.commit()
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        conn.close()

# In app.py, add this new function with your other routes
@app.route('/check-email', methods=['POST', 'OPTIONS'])
def check_email():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    data = request.get_json()
    email = data.get('email')
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT email FROM users WHERE email = %s", (email,))
            existing_user = cur.fetchone()
        
        if existing_user:
            return jsonify({"exists": True}), 200
        else:
            return jsonify({"exists": False}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- This block must always be at the end of the file ---
if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)