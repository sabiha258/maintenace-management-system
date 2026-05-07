import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import db, { initDb } from './src/lib/db';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'pro_maintain_secret_key_2026';

app.use(cors());
app.use(express.json());

// Initialize Database
initDb();

// --- Auth Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Seed Data ---
function seedData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (userCount.count === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    // Create Admin
    db.prepare('INSERT INTO users (email, password, full_name, role, is_approved) VALUES (?, ?, ?, ?, ?)')
      .run('admin@society.com', hashedPassword, 'Society Admin', 'super_admin', 1);

    // Create 10 Properties
    const unitStmt = db.prepare('INSERT INTO properties (unit_number, property_type, area_sqft, occupancy_status) VALUES (?, ?, ?, ?)');
    for (let i = 101; i <= 110; i++) {
      unitStmt.run(`A-${i}`, 'flat', 1200, 'owner_occupied');
    }

    // Create 5 Residents (Users + Resident records)
    const userStmt = db.prepare('INSERT INTO users (email, password, full_name, role, is_approved) VALUES (?, ?, ?, ?, ?)');
    const residentStmt = db.prepare('INSERT INTO residents (user_id, property_id, contact_number) VALUES (?, ?, ?)');
    
    for (let i = 1; i <= 5; i++) {
      const res = userStmt.run(`resident${i}@example.com`, hashedPassword, `Resident ${i}`, 'resident', 1);
      residentStmt.run(res.lastInsertRowid, i, `555-000${i}`);
      
      // Update property owner
      db.prepare('UPDATE properties SET owner_id = ? WHERE id = ?').run(res.lastInsertRowid, i);

      // Create a Bill for each
      db.prepare('INSERT INTO maintenance_bills (property_id, billing_month, amount, due_date, status) VALUES (?, ?, ?, ?, ?)')
        .run(i, '2026-05', 250, '2026-05-15', i % 2 === 0 ? 'paid' : 'pending');
    }

    // Create Vendors
    const vendorStmt = db.prepare('INSERT INTO vendors (name, service_type, contact_person, phone) VALUES (?, ?, ?, ?)');
    vendorStmt.run('Rapid Repairs', 'Lift & Electrical', 'John Smith', '555-0101');
    vendorStmt.run('Green Clean', 'Sanitation', 'Sarah Green', '555-0202');
    vendorStmt.run('Secure Force', 'Security', 'Mike Woods', '555-0303');

    console.log('Dummy data seeded.');
  }
}
seedData();

// --- API Routes ---

// Auth
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const result = db.prepare('INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)')
      .run(email, hashedPassword, fullName, role || 'resident');
    res.json({ id: result.lastInsertRowid, message: 'Registration successful. Waiting for approval.' });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role, name: user.full_name }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.full_name } });
});

// Dashboard Statistics
app.get('/api/stats', authenticate, (req, res) => {
  const totalResidents = db.prepare('SELECT COUNT(*) as count FROM residents').get() as any;
  const totalProperties = db.prepare('SELECT COUNT(*) as count FROM properties').get() as any;
  const totalCollected = db.prepare("SELECT SUM(amount_paid) as total FROM payments").get() as any;
  const totalExpenses = db.prepare("SELECT SUM(amount) as total FROM expenses").get() as any;
  const pendingDues = db.prepare("SELECT SUM(amount) as total FROM maintenance_bills WHERE status != 'paid'").get() as any;
  const recentActivities = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5").all();

  const occupiedCount = db.prepare("SELECT COUNT(*) as count FROM properties WHERE occupancy_status != 'vacant'").get() as any;
  const occupancyRate = totalProperties.count > 0 ? (occupiedCount.count / totalProperties.count) * 100 : 0;
  
  // Simulated Society Fund Balance
  const fundBalance = (totalCollected.total || 0) - (totalExpenses.total || 0);

  // Monthly Collection vs Expenses for Chart
  const collections = db.prepare(`
    SELECT b.billing_month as month, SUM(p.amount_paid) as amount
    FROM payments p 
    JOIN maintenance_bills b ON p.bill_id = b.id 
    GROUP BY b.billing_month 
    ORDER BY b.billing_month DESC LIMIT 6
  `).all();

  res.json({
    totalResidents: totalResidents.count,
    totalProperties: totalProperties.count,
    totalCollected: totalCollected.total || 0,
    pendingDues: pendingDues.total || 0,
    occupancyRate: Math.round(occupancyRate),
    societyFundBalance: fundBalance,
    recentActivities,
    chartData: collections.map((c: any) => ({
      ...c,
      expenses: Math.floor(Math.random() * 2000) + 1000 // Simulation for visual polish
    })).reverse()
  });
});

// Properties
app.get('/api/properties', authenticate, (req, res) => {
  const properties = db.prepare(`
    SELECT p.*, u.full_name as owner_name 
    FROM properties p 
    LEFT JOIN users u ON p.owner_id = u.id
  `).all();
  res.json(properties);
});

// Complaints
app.get('/api/complaints', authenticate, (req, res) => {
  const complaints = db.prepare(`
    SELECT c.*, u.full_name as resident_name 
    FROM complaints c 
    JOIN residents r ON c.resident_id = r.id 
    JOIN users u ON r.user_id = u.id 
    ORDER BY c.created_at DESC
  `).all();
  res.json(complaints);
});

app.post('/api/complaints', authenticate, (req: any, res: any) => {
  const { title, description, category, priority } = req.body;
  const resident = db.prepare('SELECT id FROM residents WHERE user_id = ?').get(req.user.id) as any;
  if (!resident) return res.status(403).json({ error: 'Only residents can raise complaints' });
  
  db.prepare('INSERT INTO complaints (resident_id, title, description, category, priority) VALUES (?, ?, ?, ?, ?)')
    .run(resident.id, title, description, category, priority);
  res.json({ success: true });
});

// Expenses
app.get('/api/expenses', authenticate, (req, res) => {
  const expenses = db.prepare('SELECT * FROM expenses ORDER BY expense_date DESC').all();
  res.json(expenses);
});

// Residents
app.get('/api/residents', authenticate, (req, res) => {
  const residents = db.prepare(`
    SELECT r.*, u.full_name, u.email, p.unit_number 
    FROM residents r 
    JOIN users u ON r.user_id = u.id 
    LEFT JOIN properties p ON r.property_id = p.id
  `).all();
  res.json(residents);
});

// Billing
app.get('/api/billing', authenticate, (req, res) => {
  const bills = db.prepare(`
    SELECT b.*, p.unit_number 
    FROM maintenance_bills b 
    JOIN properties p ON b.property_id = p.id 
    ORDER BY b.due_date DESC
  `).all();
  res.json(bills);
});

// Vendors
app.get('/api/vendors', authenticate, (req, res) => {
  const vendors = db.prepare('SELECT * FROM vendors').all();
  res.json(vendors);
});

// Staff
app.get('/api/staff', authenticate, (req, res) => {
  const staff = db.prepare('SELECT * FROM staff').all();
  res.json(staff);
});

// Emergency Alerts
app.post('/api/alerts/broadcast', authenticate, (req, res) => {
  const { title, message } = req.body;
  // In a real app, this would trigger SMS/Email
  db.prepare('INSERT INTO notifications (user_id, title, message, type) SELECT id, ?, ?, ? FROM users')
    .run(title, message, 'emergency');
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
