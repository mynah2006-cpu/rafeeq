import { useState, useEffect } from 'react';
import { 
  Search, Bell, UserRound, LayoutDashboard, 
  Settings, LogOut, ChevronDown, Activity, 
  Users, MessageSquare, HeartPulse, BellRing
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Area, AreaChart, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

// --- MOCK DATA ---
const VOLUME_DATA = [
  { name: 'Mon', admitted: 45, discharged: 30 },
  { name: 'Tue', admitted: 52, discharged: 40 },
  { name: 'Wed', admitted: 38, discharged: 45 },
  { name: 'Thu', admitted: 65, discharged: 50 },
  { name: 'Fri', admitted: 48, discharged: 55 },
  { name: 'Sat', admitted: 30, discharged: 40 },
  { name: 'Sun', admitted: 25, discharged: 35 },
];

const PAIN_TREND_DATA = [
  { time: '08:00', yesterday: 4.5, today: 3.2 },
  { time: '12:00', yesterday: 5.0, today: 3.8 },
  { time: '16:00', yesterday: 5.5, today: 4.1 },
  { time: '20:00', yesterday: 4.8, today: 3.5 },
  { time: '00:00', yesterday: 3.5, today: 2.8 },
  { time: '04:00', yesterday: 4.0, today: 3.0 },
];

const INTERACTION_DATA = [
  { day: '1', count: 120 }, { day: '2', count: 135 }, { day: '3', count: 110 },
  { day: '4', count: 180 }, { day: '5', count: 210 }, { day: '6', count: 200 },
  { day: '7', count: 250 }, { day: '8', count: 290 }, { day: '9', count: 270 },
  { day: '10', count: 320 }, { day: '11', count: 350 }, { day: '12', count: 340 },
];

const TOP_PATIENTS = [
  { id: '01', name: 'Eleanor Vance', status: 'Post-op Knee', pain: 80, color: '#f43f5e' },
  { id: '02', name: 'Arthur Pendelton', status: 'Pneumonia', pain: 20, color: '#00e5f5' },
  { id: '03', name: 'James Holden', status: 'Lower Back', pain: 50, color: '#00e5f5' },
  { id: '04', name: 'Amos Burton', status: 'Appendectomy', pain: 30, color: '#f472b6' },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-screen bg-[#101217] text-slate-300 font-sans overflow-hidden">
      
      {/* ═══════════════════════════════════════════
          DOUBLE SIDEBAR
      ═══════════════════════════════════════════ */}
      
      {/* Primary Sidebar (Icons only) */}
      <aside className="w-16 bg-[#16181D] border-r border-white/5 flex flex-col items-center py-6 z-20">
        <div className="flex items-center gap-1.5 mb-10">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>
        
        <nav className="flex-1 flex flex-col items-center gap-6 w-full">
          {[
            { id: 'home', icon: LayoutDashboard },
            { id: 'users', icon: UserRound },
            { id: 'activity', icon: Activity },
            { id: 'messages', icon: MessageSquare },
            { id: 'settings', icon: Settings }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative w-full flex justify-center py-2 group"
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00e5f5] rounded-r-md shadow-[0_0_10px_rgba(0,229,245,0.5)]" />
              )}
              <item.icon 
                size={22} 
                className={`transition-colors duration-200 ${activeTab === item.id ? 'text-[#00e5f5]' : 'text-slate-500 group-hover:text-slate-300'}`} 
              />
            </button>
          ))}
        </nav>
        
        <button className="text-slate-500 hover:text-slate-300 transition-colors">
          <LogOut size={22} />
        </button>
      </aside>

      {/* Secondary Sidebar (Text menus) */}
      <aside className="w-56 bg-[#13151A] flex flex-col py-6 px-4 z-10 border-r border-white/5">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#00e5f5]/10 border border-[#00e5f5]/30 flex items-center justify-center text-[#00e5f5] font-bold text-xl shadow-[0_0_15px_rgba(0,229,245,0.2)]">ر</div>
          <span className="text-lg font-bold tracking-wide text-white">Rafeeq</span>
        </div>
        
        <nav className="space-y-1 flex-1">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 px-2">Main Menu</div>
          <MenuButton icon={LayoutDashboard} label="Dashboard" active={activeTab === 'home'} />
          <MenuButton icon={UserRound} label="Patients" active={activeTab === 'users'} />
          <MenuButton icon={Activity} label="Vitals" active={activeTab === 'activity'} />
          <MenuButton icon={MessageSquare} label="AI Transcripts" active={activeTab === 'messages'} />
          <MenuButton icon={Settings} label="Settings" active={activeTab === 'settings'} />
        </nav>
      </aside>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto bg-[#101217] p-8">
        
        {/* Top Navigation */}
        <header className="flex justify-between items-center mb-8">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search here..." 
              className="w-full bg-[#181A20] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5f5]/30 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-[#101217]" />
            </button>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00e5f5] to-blue-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#101217] flex items-center justify-center text-xs font-bold text-white">SJ</div>
              </div>
              <ChevronDown size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* ─── LEFT COLUMN (8 cols) ─── */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            {/* Today's Overview (4 Cards) */}
            <div className="bg-[#181A20] rounded-3xl p-6 border border-white/5">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white">Today's Overview</h2>
                <p className="text-xs text-slate-500">Hospital summary</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MiniCard 
                  icon={<Users size={20} className="text-rose-400" />} 
                  iconBg="bg-rose-500/10"
                  value="24" label="Active Patients" trend="+2% from yesterday" trendColor="text-amber-500" 
                />
                <MiniCard 
                  icon={<HeartPulse size={20} className="text-[#00e5f5]" />} 
                  iconBg="bg-[#00e5f5]/10"
                  value="4.2" label="Avg Pain Level" trend="-5% from yesterday" trendColor="text-emerald-500" 
                />
                <MiniCard 
                  icon={<BellRing size={20} className="text-rose-300" />} 
                  iconBg="bg-rose-300/10"
                  value="2" label="Critical Alerts" trend="+1% from yesterday" trendColor="text-rose-500" 
                />
                <MiniCard 
                  icon={<MessageSquare size={20} className="text-indigo-400" />} 
                  iconBg="bg-indigo-500/10"
                  value="142" label="AI Interactions" trend="+12% from yesterday" trendColor="text-[#00e5f5]" 
                />
              </div>
            </div>

            {/* Top Patients List */}
            <div className="bg-[#181A20] rounded-3xl p-6 border border-white/5 flex-1">
              <h2 className="text-lg font-bold text-white mb-6">Priority Patients</h2>
              <div className="space-y-6">
                <div className="flex text-xs font-semibold text-slate-500 mb-2">
                  <div className="w-12">#</div>
                  <div className="flex-1">Name</div>
                  <div className="flex-1 hidden sm:block">Condition</div>
                  <div className="w-32">Pain Level</div>
                  <div className="w-16 text-right">Score</div>
                </div>
                {TOP_PATIENTS.map((p) => (
                  <div key={p.id} className="flex items-center text-sm">
                    <div className="w-12 text-slate-500 font-medium">{p.id}</div>
                    <div className="flex-1 font-semibold text-white">{p.name}</div>
                    <div className="flex-1 hidden sm:block text-slate-400">{p.status}</div>
                    <div className="w-32">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ width: mounted ? `${p.pain}%` : '0%', backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}80` }} 
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <span 
                        className="px-2 py-1 rounded text-xs font-semibold border"
                        style={{ color: p.color, borderColor: `${p.color}40`, backgroundColor: `${p.color}15` }}
                      >
                        {p.pain}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row inside left column: Resolution Gauge & Interactions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Resolution Gauge */}
              <div className="bg-[#181A20] rounded-3xl p-6 border border-white/5">
                <h2 className="text-lg font-bold text-white mb-1">AI Resolution</h2>
                <p className="text-xs text-slate-500 mb-6">Handled automatically</p>
                <div className="h-40 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: 80 }, { value: 20 }]}
                        cx="50%" cy="100%"
                        startAngle={180} endAngle={0}
                        innerRadius="70%" outerRadius="90%"
                        dataKey="value"
                        stroke="none"
                        cornerRadius={10}
                      >
                        <Cell fill="#00e5f5" style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,245,0.4))' }} />
                        <Cell fill="rgba(255,255,255,0.05)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-4 text-center">
                    <span className="text-3xl font-black text-white">80%</span>
                  </div>
                </div>
              </div>

              {/* Interaction Insights */}
              <div className="bg-[#181A20] rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h2 className="text-lg font-bold text-white">Interaction Insights</h2>
                  <span className="px-2 py-1 text-[10px] font-bold bg-[#00e5f5]/10 text-[#00e5f5] rounded-lg flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5f5]"></span>
                    Live Data
                  </span>
                </div>
                <div className="h-40 -mx-6 -mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={INTERACTION_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="interactionGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00e5f5" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#00e5f5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="count" stroke="#00e5f5" strokeWidth={2} fill="url(#interactionGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>

          {/* ─── RIGHT COLUMN (4 cols) ─── */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* Volume Bar Chart */}
            <div className="bg-[#181A20] rounded-3xl p-6 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-6">Patient Volume</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={VOLUME_DATA} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#101217', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Bar dataKey="admitted" fill="#00e5f5" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="discharged" fill="rgba(255,255,255,0.2)" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-slate-400">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00e5f5]" /> Admitted</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/20" /> Discharged</div>
              </div>
            </div>

            {/* Pain Trend Area Chart */}
            <div className="bg-[#181A20] rounded-3xl p-6 border border-white/5 flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-white mb-6">Average Pain Trend</h2>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PAIN_TREND_DATA} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendToday" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e5f5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00e5f5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="trendYest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#101217', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="today" stroke="#00e5f5" strokeWidth={3} fill="url(#trendToday)" />
                    <Area type="monotone" dataKey="yesterday" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="url(#trendYest)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-end mt-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#f43f5e]" /> Yesterday
                  </div>
                  <div className="text-lg font-bold text-white">4.3 <span className="text-xs text-slate-500 font-normal">avg</span></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#00e5f5]" /> Today
                  </div>
                  <div className="text-lg font-bold text-white">3.4 <span className="text-xs text-slate-500 font-normal">avg</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function MenuButton({ icon: Icon, label, active }: { icon: any; label: string; active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-[#00e5f5]/10 text-[#00e5f5] font-semibold' 
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
    }`}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function MiniCard({ icon, iconBg, value, label, trend, trendColor }: any) {
  return (
    <div className="bg-[#13151A] rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-36 hover:border-white/10 transition-colors">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
        <div className="text-xs font-semibold text-slate-400 mb-1">{label}</div>
        <div className={`text-[10px] font-medium ${trendColor}`}>{trend}</div>
      </div>
    </div>
  );
}
