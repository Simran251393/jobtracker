import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from database import db
from models import User, JobApplication
from auth import create_token, token_required

app = Flask(__name__)
CORS(app)

# ✅ Upload folder for resume PDFs
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///jobtracker.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return "Job Tracker Backend Running ✅"

# ✅ SIGNUP
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    hashed = generate_password_hash(password)
    user = User(name=name, email=email, password_hash=hashed)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Signup successful ✅"}), 201

# ✅ LOGIN
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_token(user.id)
    return jsonify({"message": "Login successful ✅", "token": token}), 200

# ✅ ADD JOB
@app.route("/api/jobs/add", methods=["POST"])
@token_required
def add_job():
    data = request.get_json()

    company = data.get("company")
    role = data.get("role")
    status = data.get("status", "Applied")
    applied_date = data.get("applied_date")
    notes = data.get("notes")

    if not company or not role:
        return jsonify({"error": "Company and role required"}), 400

    job = JobApplication(
        user_id=request.user_id,
        company=company,
        role=role,
        status=status,
        applied_date=applied_date,
        notes=notes
    )

    db.session.add(job)
    db.session.commit()

    return jsonify({"message": "Job added ✅"}), 201

# ✅ GET MY JOBS
@app.route("/api/jobs/my", methods=["GET"])
@token_required
def get_my_jobs():
    jobs = JobApplication.query.filter_by(user_id=request.user_id).all()

    result = []
    for job in jobs:
        result.append({
            "id": job.id,
            "company": job.company,
            "role": job.role,
            "status": job.status,
            "applied_date": job.applied_date,
            "notes": job.notes
        })

    return jsonify(result), 200

# ✅ UPDATE JOB
@app.route("/api/jobs/update/<int:job_id>", methods=["PUT"])
@token_required
def update_job(job_id):
    job = JobApplication.query.filter_by(id=job_id, user_id=request.user_id).first()

    if not job:
        return jsonify({"error": "Job not found"}), 404

    data = request.get_json()
    job.status = data.get("status", job.status)
    job.notes = data.get("notes", job.notes)

    db.session.commit()

    return jsonify({"message": "Job updated ✅"}), 200

# ✅ DELETE JOB
@app.route("/api/jobs/delete/<int:job_id>", methods=["DELETE"])
@token_required
def delete_job(job_id):
    job = JobApplication.query.filter_by(id=job_id, user_id=request.user_id).first()

    if not job:
        return jsonify({"error": "Job not found"}), 404

    db.session.delete(job)
    db.session.commit()

    return jsonify({"message": "Job deleted ✅"}), 200


# ✅ RESUME UPLOAD (PDF)
@app.route("/api/resume/upload", methods=["POST"])
@token_required
def upload_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["resume"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Save same name per user (overwrite old one)
    filename = f"user_{request.user_id}_resume.pdf"
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(save_path)

    return jsonify({"message": "Resume uploaded ✅"}), 200


# ✅ VIEW RESUME
@app.route("/api/resume/view", methods=["GET"])
@token_required
def view_resume():
    filename = f"user_{request.user_id}_resume.pdf"
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

    if not os.path.exists(file_path):
        return jsonify({"error": "No resume uploaded yet"}), 404

    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


if __name__ == "__main__":
    app.run(debug=True)
