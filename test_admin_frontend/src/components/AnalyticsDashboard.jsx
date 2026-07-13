import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, LabelList } from 'recharts';
import { Users, Shield, HelpCircle, FileText } from 'lucide-react';
import './AnalyticsDashboard.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

const StatCard = ({ title, value, icon, accentColor, linkText }) => (
  <div className="stat-card" style={{ '--accent': accentColor }}>
    <div className="stat-header">
      <h3 className="stat-title">{title}</h3>
      <div className="stat-icon" style={{ color: accentColor }}>
        {icon}
      </div>
    </div>
    <div className="stat-value">{value}</div>
    {linkText && (
      <div className="stat-link" style={{ color: accentColor }}>
        <span>{linkText}</span>
        <span className="arrow">→</span>
      </div>
    )}
  </div>
);

const AnalyticsDashboard = () => {
  const { adminData } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    stats: { totalStudents: 0, totalAdmins: 0, unansweredDoubts: 0, totalPosts: 0 },
    studentGrowthData: [{ month: 'Active', students: 0 }],
    doubtData: [{ name: 'Doubts', answered: 0, unanswered: 0 }],
    assignmentData: [{ name: 'No Assignments', value: 0 }]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardStats(res.data);
      } catch (err) {
        console.error("Failed to load live dashboard stats, keeping default empty views.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Custom label for Pie Chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.5; // push labels outside
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="500">
        {dashboardStats.assignmentData[index]?.value || 0}
      </text>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>
        Loading live stats...
      </div>
    );
  }

  const { stats, studentGrowthData, doubtData, assignmentData } = dashboardStats;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Welcome back, {(adminData?.name || 'Admin').split(' ')[0]}</h1>
        <p>Here is what's happening in your bootcamp today.</p>
      </div>

      {/* Top Stats Row - Dynamic data */}
      <div className="stats-grid">
        <StatCard title="Total Students" value={stats.totalStudents} icon={<Users size={24} />} accentColor="#3b82f6" linkText="See List" />
        <StatCard title="Total Admins" value={stats.totalAdmins} icon={<Shield size={24} />} accentColor="#8b5cf6" linkText="See List" />
        <StatCard title="Unanswered Doubts" value={stats.unansweredDoubts} icon={<HelpCircle size={24} />} accentColor="#ec4899" />
        <StatCard title="Total Posts" value={stats.totalPosts} icon={<FileText size={24} />} accentColor="#10b981" />
      </div>

      <div className="charts-grid">
        {/* Main Growth Chart */}
        <div className="chart-card span-2">
          <h2>Student Growth Timeline</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doubts Bar Chart */}
        <div className="chart-card">
          <h2>Doubt Resolution Status</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doubtData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                />
                <Legend />
                <Bar dataKey="answered" name="Answered" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40}>
                  <LabelList dataKey="answered" position="top" fill="#10b981" fontSize={14} fontWeight={600} />
                </Bar>
                <Bar dataKey="unanswered" name="Unanswered" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40}>
                  <LabelList dataKey="unanswered" position="top" fill="#ef4444" fontSize={14} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assignments Pie Chart */}
        <div className="chart-card">
          <h2>Assignment Progress</h2>
          <p className="chart-subtitle">Students on current assignments</p>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assignmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {assignmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
