from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Property, Resident, MaintenanceBill, Payment, Expense, Complaint, db, User
from datetime import datetime

api_bp = Blueprint('api', __name__)

@api_bp.route('/properties', methods=['GET'])
@jwt_required()
def get_properties():
    properties = Property.query.all()
    return jsonify([{
        "id": p.id,
        "unit_number": p.unit_number,
        "property_type": p.property_type,
        "area_sqft": p.area_sqft,
        "occupancy_status": p.occupancy_status,
        "owner_name": User.query.get(p.owner_id).full_name if p.owner_id else "Unassigned"
    } for p in properties])

@api_bp.route('/complaints', methods=['GET', 'POST'])
@jwt_required()
def handle_complaints():
    identity = get_jwt_identity()
    if request.method == 'POST':
        data = request.get_json()
        # Find resident record for current user
        resident = Resident.query.filter_by(user_id=identity['id']).first()
        if not resident:
            return jsonify({"error": "Only residents can raise complaints"}), 403
            
        complaint = Complaint(
            resident_id=resident.id,
            title=data['title'],
            description=data.get('description'),
            category=data.get('category'),
            priority=data.get('priority', 'low')
        )
        db.session.add(complaint)
        db.session.commit()
        return jsonify({"message": "Complaint raised successfully"}), 201
        
    # GET: Admins see all, residents see theirs
    if identity['role'] == 'resident':
        resident = Resident.query.filter_by(user_id=identity['id']).first()
        complaints = Complaint.query.filter_by(resident_id=resident.id).all()
    else:
        complaints = Complaint.query.all()
        
    return jsonify([{
        "id": c.id,
        "title": c.title,
        "status": c.status,
        "priority": c.priority,
        "created_at": c.created_at.isoformat()
    } for c in complaints])

@api_bp.route('/expenses', methods=['GET', 'POST'])
@jwt_required()
def handle_expenses():
    identity = get_jwt_identity()
    if request.method == 'POST':
        if identity['role'] not in ['super_admin', 'manager', 'accountant']:
            return jsonify({"error": "Unauthorized"}), 403
        data = request.get_json()
        expense = Expense(
            category=data['category'],
            amount=data['amount'],
            description=data.get('description'),
            expense_date=datetime.strptime(data['date'], '%Y-%m-%d')
        )
        db.session.add(expense)
        db.session.commit()
        return jsonify({"message": "Expense recorded"}), 201
        
    expenses = Expense.query.order_by(Expense.expense_date.desc()).all()
    return jsonify([{
        "id": e.id,
        "category": e.category,
        "amount": e.amount,
        "date": e.expense_date.isoformat(),
        "description": e.description
    } for e in expenses])
