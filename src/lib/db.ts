import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('maintenance.db');

export function initDb() {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT CHECK(role IN ('super_admin', 'manager', 'resident', 'security', 'vendor')) NOT NULL,
      is_approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Properties Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_number TEXT UNIQUE NOT NULL,
      property_type TEXT CHECK(property_type IN ('flat', 'shop', 'office')) NOT NULL,
      area_sqft FLOAT NOT NULL,
      owner_id INTEGER,
      occupancy_status TEXT CHECK(occupancy_status IN ('owner_occupied', 'rented', 'vacant')) DEFAULT 'vacant',
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  // Residents Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS residents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      property_id INTEGER,
      contact_number TEXT,
      parking_slot TEXT,
      emergency_contact TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (property_id) REFERENCES properties(id)
    )
  `);

  // Maintenance Bills Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS maintenance_bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL,
      billing_month TEXT NOT NULL, -- Format: YYYY-MM
      amount FLOAT NOT NULL,
      due_date DATE NOT NULL,
      penalty_amount FLOAT DEFAULT 0,
      status TEXT CHECK(status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
      FOREIGN KEY (property_id) REFERENCES properties(id)
    )
  `);

  // Payments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      amount_paid FLOAT NOT NULL,
      payment_method TEXT CHECK(payment_method IN ('upi', 'qr', 'online', 'cash')) NOT NULL,
      transaction_id TEXT,
      receipt_url TEXT,
      FOREIGN KEY (bill_id) REFERENCES maintenance_bills(id)
    )
  `);

  // Expenses Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT CHECK(category IN ('lift', 'garbage', 'water', 'security', 'electricity', 'repairs', 'emergency', 'others')) NOT NULL,
      amount FLOAT NOT NULL,
      expense_date DATE NOT NULL,
      description TEXT,
      proof_url TEXT,
      approved_by INTEGER,
      FOREIGN KEY (approved_by) REFERENCES users(id)
    )
  `);

  // Complaints Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resident_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'low',
      status TEXT CHECK(status IN ('pending', 'assigned', 'in_progress', 'resolved', 'closed')) DEFAULT 'pending',
      assigned_to_vendor_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resident_id) REFERENCES residents(id),
      FOREIGN KEY (assigned_to_vendor_id) REFERENCES vendors(id)
    )
  `);

  // Vendors Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      service_type TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      rating FLOAT DEFAULT 5.0
    )
  `);

  // Staff Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      salary FLOAT,
      joining_date DATE
    )
  `);

  // Attendance Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER NOT NULL,
      date DATE NOT NULL,
      status TEXT CHECK(status IN ('present', 'absent', 'late', 'on_leave')) NOT NULL,
      FOREIGN KEY (staff_id) REFERENCES staff(id)
    )
  `);

  // Notifications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK(type IN ('maintenance', 'complaint', 'emergency', 'announcement')) NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Visitor Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS visitor_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_name TEXT NOT NULL,
      contact_number TEXT,
      purpose TEXT,
      property_id INTEGER,
      entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      exit_time DATETIME,
      FOREIGN KEY (property_id) REFERENCES properties(id)
    )
  `);

  console.log('Database initialized successfully.');
}

export default db;
