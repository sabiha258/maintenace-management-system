export type UserRole = 'super_admin' | 'manager' | 'accountant' | 'resident' | 'security' | 'vendor';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_approved: boolean;
  phone?: string;
  avatar_url?: string;
}

export interface Property {
  id: number;
  unit_number: string;
  property_type: 'flat' | 'shop' | 'office';
  area_sqft: number;
  owner_id?: number;
  owner_name?: string;
  occupancy_status: 'owner_occupied' | 'rented' | 'vacant';
  last_maintenance_date?: string;
}

export interface MaintenanceBill {
  id: number;
  property_id: number;
  unit_number?: string;
  billing_month: string;
  amount: number;
  due_date: string;
  penalty_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  description?: string;
}

export interface Payment {
  id: number;
  bill_id: number;
  unit_number?: string;
  payment_date: string;
  amount: number;
  method: 'upi' | 'card' | 'cash' | 'bank_transfer';
  status: 'success' | 'failed' | 'pending';
  transaction_id: string;
  receipt_url?: string;
}

export interface Complaint {
  id: number;
  resident_id: number;
  resident_name?: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'security' | 'cleaning' | 'lift' | 'others';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'assigned' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
  assigned_to_id?: number;
  assigned_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  feedback?: string;
}

export interface Expense {
  id: number;
  category: 'lift' | 'garbage' | 'water' | 'security' | 'electricity' | 'repairs' | 'emergency' | 'landscaping' | 'others';
  amount: number;
  expense_date: string;
  description: string;
  proof_url?: string;
  approved_by_id?: number;
}

export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  entity: string;
  entity_id: number;
  timestamp: string;
  ip_address?: string;
}

export interface DashboardStats {
  totalResidents: number;
  totalProperties: number;
  totalCollected: number;
  pendingDues: number;
  occupancyRate: number;
  societyFundBalance: number;
  recentActivities: any[];
  chartData: { month: string; amount: number; expenses: number }[];
}
