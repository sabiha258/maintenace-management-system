from ..app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(20), default='resident')
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    resident_profile = db.relationship('Resident', backref='user', uselist=False)
    audit_logs = db.relationship('AuditLog', backref='user')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Property(db.Model):
    __tablename__ = 'properties'
    id = db.Column(db.Integer, primary_key=True)
    unit_number = db.Column(db.String(20), unique=True, nullable=False)
    property_type = db.Column(db.String(20), nullable=False) # flat, shop, office
    area_sqft = db.Column(db.Float, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    occupancy_status = db.Column(db.String(20), default='vacant') # owner_occupied, rented, vacant
    
    bills = db.relationship('MaintenanceBill', backref='property')
    residents = db.relationship('Resident', backref='property')

class Resident(db.Model):
    __tablename__ = 'residents'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'))
    parking_slot = db.Column(db.String(50))
    emergency_contact = db.Column(db.String(100))
    
    complaints = db.relationship('Complaint', backref='resident')

class MaintenanceBill(db.Model):
    __tablename__ = 'maintenance_bills'
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'))
    billing_month = db.Column(db.String(7), nullable=False) # YYYY-MM
    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    penalty_amount = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='pending') # pending, paid, overdue
    
    payments = db.relationship('Payment', backref='bill')

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    bill_id = db.Column(db.Integer, db.ForeignKey('maintenance_bills.id'))
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    method = db.Column(db.String(20)) # upi, card, cash
    transaction_id = db.Column(db.String(100), unique=True)
    receipt_url = db.Column(db.String(255))

class Complaint(db.Model):
    __tablename__ = 'complaints'
    id = db.Column(db.Integer, primary_key=True)
    resident_id = db.Column(db.Integer, db.ForeignKey('residents.id'))
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    priority = db.Column(db.String(20), default='low')
    status = db.Column(db.String(20), default='pending')
    assigned_to_vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Vendor(db.Model):
    __tablename__ = 'vendors'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    service_type = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    rating = db.Column(db.Float, default=5.0)

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(100))
    entity = db.Column(db.String(50))
    entity_id = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
