import jwt
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta

SECRET_KEY = "my_super_secret_key_change_this"

def create_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            parts = request.headers["Authorization"].split(" ")
            if len(parts) == 2:
                token = parts[1]

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user_id = payload["user_id"]
        except:
            return jsonify({"error": "Token is invalid or expired"}), 401

        return f(*args, **kwargs)

    return decorated
