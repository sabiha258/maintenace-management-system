export type UserRole = 'super_admin' | 'manager' | 'resident' | 'security' | 'vendor';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_approved: boolean;
}

export interface Property {
  id: number;
  unit_number: string;
  property_type: 'flat' | 'shop' | 'office';
  area_sqft: number;
  owner_id?: number;
  owner_name?: string;
  occupancy_status: 'owner_occupied' | 'rented' | 'vacant';
}

export interface MaintenanceBill {
  id: number;
  property_id: number;
  billing_month: string;
  amount: number;
  due_date: string;
  penalty_amount: number;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Complaint {
  id: number;
  resident_id: number;
  resident_name?: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  expense_date: string;
  description: string;
  proof_url?: string;
}

export interface DashboardStats {
  totalResidents: number;
  totalProperties: number;
  totalCollected: number;
  pendingDues: number;
  recentActivities: any[];
  chartData: { month: string; amount: number }[];
}
