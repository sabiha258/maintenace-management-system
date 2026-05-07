import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Home, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  AlertTriangle, 
  Truck, 
  FileText,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardStats, User, Property, Complaint, Expense, MaintenanceBill } from './types';

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="card-base flex flex-col h-full">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
    <div className="flex items-end justify-between mt-auto">
      <h3 className={`text-2xl font-black ${color === 'text-amber-600' ? 'text-amber-600' : 'text-slate-800'}`}>{value}</h3>
      {trend && (
        <span className={`text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend > 0 ? '+' : ''}{trend}% vs LY
        </span>
      )}
    </div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-6 py-3 transition-colors duration-200 border-l-4 ${
      active 
        ? 'bg-blue-600 text-white border-blue-400' 
        : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={18} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [billing, setBilling] = useState<MaintenanceBill[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: 'admin@society.com', password: 'admin123' });

  // Fetch Data based on active tab
  useEffect(() => {
    if (token) {
      setLoading(true);
      const endpoints: Record<string, string> = {
        dashboard: '/api/stats',
        properties: '/api/properties',
        residents: '/api/residents',
        billing: '/api/billing',
        complaints: '/api/complaints',
        vendors: '/api/vendors',
        staff: '/api/staff'
      };

      const endpoint = endpoints[activeTab];
      if (endpoint) {
        fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (activeTab === 'dashboard') setStats(data);
          else if (activeTab === 'properties') setProperties(data);
          else if (activeTab === 'residents') setResidents(data);
          else if (activeTab === 'billing') setBilling(data);
          else if (activeTab === 'complaints') setComplaints(data);
          else if (activeTab === 'vendors') setVendors(data);
          else if (activeTab === 'staff') setStaff(data);
          setLoading(false);
        });
      }
    }
  }, [token, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    } else {
      alert(data.error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md border border-slate-200"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
              <Home className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">MAINTENIX PRO</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Enterprise Management</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Corporate ID / Email</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans text-sm"
                placeholder="admin@society.com"
                value={loginForm.email}
                onChange={e => setLoginForm({...loginForm, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Security Credentials</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans text-sm"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition-colors uppercase text-xs tracking-widest shadow-md">
              Secure Login
            </button>
          </form>
          <div className="mt-8 text-center text-xs text-slate-400 font-medium">
            System encrypted. Authorized access only.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col h-full z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-inner">M</div>
            <span className="text-white font-black tracking-tight uppercase text-xs">Maintenix Pro</span>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <SidebarItem icon={BarChart3} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Home} label="Properties" active={activeTab === 'properties'} onClick={() => setActiveTab('properties')} />
          <SidebarItem icon={Users} label="Residents" active={activeTab === 'residents'} onClick={() => setActiveTab('residents')} />
          <SidebarItem icon={CreditCard} label="Maintenance Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
          <SidebarItem icon={MessageSquare} label="Complaints & Staff" active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} />
          <SidebarItem icon={Truck} label="Expense Ledger" active={activeTab === 'vendors'} onClick={() => setActiveTab('vendors')} />
          <SidebarItem icon={FileText} label="Reports & Audit" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <SidebarItem icon={AlertTriangle} label="Emergency" active={activeTab === 'emergency'} onClick={() => setActiveTab('emergency')} />
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-xs text-white uppercase font-bold border border-slate-700">SU</div>
            <div className="flex flex-col">
              <span className="text-xs text-white font-bold">Admin User</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mt-1">Super Admin</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center space-x-2 text-rose-400 hover:text-rose-300 transition-colors text-[10px] font-bold uppercase tracking-widest">
            <LogOut size={14} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{activeTab.replace('_', ' ')} Dashboard</h2>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-tighter">Live Updates</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search units or logs..." 
                className="bg-slate-50 border-none rounded-md pl-10 pr-4 py-1.5 text-xs w-64 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all">
                <Bell size={16} />
              </button>
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all">
                <Settings size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 flex-1 overflow-y-auto space-y-8 pb-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && stats && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Asset Units" value={stats.totalProperties} trend={2} />
                  <StatCard title="Society Fund Balance" value={`$${stats.societyFundBalance.toLocaleString()}`} trend={stats.societyFundBalance > 0 ? 5 : -2} color={stats.societyFundBalance > 0 ? 'text-emerald-600' : 'text-rose-600'} />
                  <StatCard title="Outstanding Dues" value={`$${stats.pendingDues.toLocaleString()}`} trend={-5} color="text-amber-600" />
                  <StatCard title="Occupancy Metric" value={`${stats.occupancyRate}%`} trend={1} />
                </div>

                {/* Main Visual Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto">
                  {/* Left: Collection Analytics */}
                  <div className="lg:col-span-8 card-base flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest px-1">Financial Integrity Monitor</h4>
                      <div className="flex gap-4">
                        <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <div className="w-2 h-2 rounded bg-blue-600 mr-2"></div> Collection
                        </span>
                        <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <div className="w-2 h-2 rounded bg-slate-300 mr-2"></div> Expenses
                        </span>
                      </div>
                    </div>
                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                          <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', fontSize: '10px', fontWeight: 700 }}
                          />
                          <Bar dataKey="amount" fill="#2563eb" radius={[2, 2, 0, 0]} barSize={24} />
                          <Bar dataKey="expenses" fill="#e2e8f0" radius={[2, 2, 0, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right: Critical Alerts */}
                  <div className="lg:col-span-4 card-base flex flex-col">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 px-1">Urgent Notification Log</h4>
                    <div className="space-y-4 flex-1">
                      {stats.recentActivities.length > 0 ? (
                        stats.recentActivities.map((act, i) => (
                          <div key={i} className={`flex flex-col p-3 rounded border-l-4 ${act.type === 'emergency' ? 'bg-rose-50 border-rose-500' : 'bg-slate-50 border-slate-400'}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-[10px] font-black uppercase ${act.type === 'emergency' ? 'text-rose-700' : 'text-slate-700'}`}>{act.type === 'emergency' ? 'Security Breach' : 'System Notice'}</span>
                              <span className="text-[9px] font-bold text-slate-400">{new Date(act.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className={`text-xs font-bold ${act.type === 'emergency' ? 'text-rose-800' : 'text-slate-800'}`}>{act.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{act.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                          <Clock size={32} className="text-slate-300 mb-3" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No active logs</p>
                        </div>
                      )}
                    </div>
                    <button className="mt-6 w-full py-2.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded hover:bg-slate-200 transition-all border border-slate-200">
                      View Audit Trail
                    </button>
                  </div>
                </div>

                {/* Footer Status Bar Component */}
                <div className="flex items-center justify-between bg-slate-800 p-4 rounded text-white shadow-xl">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-700 pr-6">Core Systems</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Gate Sensors: Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Payments: Online</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right border-l border-slate-700 pl-6">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Emergency Protocol</p>
                      <p className="text-xs font-black text-rose-400">+1 (800) SOS-LIFT</p>
                    </div>
                    <button className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-[10px] font-black rounded uppercase tracking-widest shadow-lg shadow-rose-900 transition-all">
                      Broadcast Alert
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'properties' && (
              <motion.div key="properties" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-base">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Number</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Owner</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Area (sqft)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(p => (
                      <tr key={p.id} className="border-b border-slate-50 last:border-none group hover:bg-slate-50">
                        <td className="py-4 text-xs font-bold text-slate-800">{p.unit_number}</td>
                        <td className="py-4 text-xs text-slate-500 capitalize">{p.property_type}</td>
                        <td className="py-4 text-xs text-slate-500">{p.owner_name || 'Unassigned'}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                            p.occupancy_status === 'owner_occupied' ? 'bg-emerald-50 text-emerald-600' : 
                            p.occupancy_status === 'rented' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {p.occupancy_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 text-xs font-mono text-slate-500 text-right">{p.area_sqft}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'residents' && (
              <motion.div key="residents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-base">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Unit</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residents.map(r => (
                      <tr key={r.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50">
                        <td className="py-4 text-xs font-bold text-slate-800">{r.full_name}</td>
                        <td className="py-4 text-xs text-blue-600 font-bold">{r.unit_number}</td>
                        <td className="py-4 text-xs text-slate-500">{r.email}</td>
                        <td className="py-4 text-xs text-slate-500">{r.contact_number || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'vendors' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {vendors.map(v => (
                     <div key={v.id} className="card-base">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">{v.name}</h4>
                          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">{v.rating} <span className="text-[8px]">⭐</span></span>
                        </div>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{v.service_type}</p>
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <span>Contract Holder:</span>
                            <span className="text-slate-800">{v.contact_person}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <span>Duty Status:</span>
                            <span className="text-emerald-600">Active</span>
                          </div>
                        </div>
                        <button className="w-full mt-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all">
                          Manage Contract
                        </button>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-8">
                {/* Financial Summary Banner */}
                <div className="bg-blue-600 p-8 rounded-lg shadow-xl shadow-blue-100 flex justify-between items-center text-white">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Society Reserve Fund</p>
                      <h2 className="text-4xl font-black tracking-tight">${stats?.societyFundBalance.toLocaleString()}</h2>
                   </div>
                   <div className="flex gap-4">
                      <button className="px-6 py-2.5 bg-white text-blue-600 font-black uppercase text-[10px] tracking-widest rounded hover:bg-blue-50 transition-all">Generate Invoices</button>
                      <button className="px-6 py-2.5 bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded hover:bg-blue-800 transition-all border border-blue-500">Expense Ledger</button>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="card-base">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 px-1">Upcoming Maintenance Dues</h4>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Unit</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cycle</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billing.map(b => (
                          <tr key={b.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50">
                            <td className="py-4 text-xs font-black text-slate-800">{b.unit_number}</td>
                            <td className="py-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{b.billing_month}</td>
                            <td className="py-4 text-xs font-black text-rose-600 text-right">${b.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-base">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 px-1">Recent Expenses & Proofs</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded shadow-sm text-blue-600"><FileText size={16} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Lift Monthly AMC</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Rapid Repairs • May 01</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-800">$1,200</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded shadow-sm text-blue-600"><FileText size={16} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Generator Fuel</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">HP Lubricants • Apr 28</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-800">$450</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="card-base border-rose-200 bg-rose-50/30">
                  <h3 className="text-sm font-black text-rose-700 uppercase tracking-widest mb-4">Hazard Protocol Override</h3>
                  <p className="text-xs text-rose-600 font-medium leading-relaxed mb-6">
                    Broadcasting an emergency alert will immediately notify all residents via in-portal alerts and emergency channels. Use with extreme caution.
                  </p>
                  <div className="space-y-4">
                     <input type="text" placeholder="Alert Title (e.g. Fire Breakout Block A)" className="w-full p-3 rounded border border-rose-200 text-xs font-bold focus:ring-1 focus:ring-rose-500 outline-none" />
                     <textarea placeholder="Instructional Message..." className="w-full p-3 rounded border border-rose-200 text-xs focus:ring-1 focus:ring-rose-500 outline-none h-32" />
                     <button className="w-full py-3 bg-rose-600 text-white font-black uppercase text-xs tracking-widest rounded shadow-lg shadow-rose-200">Broadcast Alert</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'complaints' && (
              <motion.div key="complaints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-base">
                <div className="flex justify-between items-center mb-8 px-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">SLA & Ticket Resolution Center</h4>
                  <button className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded uppercase tracking-widest hover:bg-blue-700 transition-all">New Service Ticket</button>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Resident / Unit</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Resolution SLA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50">
                        <td className="py-4">
                           <p className="text-xs font-black text-slate-800">{c.resident_name}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase">Unit Verified</p>
                        </td>
                        <td className="py-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">{c.category}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                            c.priority === 'emergency' ? 'bg-rose-600 text-white shadow-sm' : 
                            c.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {c.priority} Priority
                          </span>
                        </td>
                        <td className="py-4">
                           <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'resolved' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                             <span className="text-xs text-slate-800 font-bold capitalize">{c.status}</span>
                           </div>
                        </td>
                        <td className="py-4 text-[10px] text-slate-400 font-bold">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {(activeTab === 'reports' || activeTab === 'emergency') && (
              <motion.div 
                key="others"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-12 rounded border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[500px]"
              >
                <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-8 text-blue-600 shadow-inner">
                  <div className="relative">
                    <Settings size={48} className="animate-spin-slow" />
                    <BarChart3 size={24} className="absolute -bottom-1 -right-1 text-emerald-500 bg-white rounded-full p-1 border border-slate-100" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-3">Enterprise Reporting Engine</h2>
                <p className="text-slate-400 max-w-sm text-center text-xs font-bold leading-relaxed uppercase tracking-wider">
                  The {activeTab} analytics suite is processing your data warehouse. Financial summaries, defaulter lists, and vendor performance audits are being synchronized.
                </p>
                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="px-8 py-3 bg-blue-600 text-white rounded font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Return to Insight Center
                  </button>
                  <button className="px-8 py-3 bg-slate-100 text-slate-600 rounded font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200">
                    Offline Export (PDF)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
