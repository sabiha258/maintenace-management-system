from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import User, db
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing credentials"}), 400
    
    user = User(
        email=data['email'],
        full_name=data.get('full_name', ''),
        role=data.get('role', 'resident'),
        is_approved=False # Requires manual approval
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        return jsonify({"error": "Email already registered"}), 400
        
    return jsonify({"message": "User registered successfully. Status: Pending Approval"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and user.check_password(data.get('password')):
        if not user.is_approved:
            return jsonify({"error": "Access denied. Account pending approval."}), 403
            
        access_token = create_access_token(identity={
            "id": user.id,
            "role": user.role,
            "name": user.full_name
        })
        return jsonify(access_token=access_token, user={
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.full_name
        }), 200
        
    return jsonify({"error": "Invalid email or password"}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    identity = get_jwt_identity()
    user = User.query.get(identity['id'])
    return jsonify(user={
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.full_name
    }), 200
