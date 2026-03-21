import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon, CheckCircleIcon, XCircleIcon, ClockIcon,
  PlusIcon, ArrowTrendingUpIcon, FireIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { getStatusConfig } from '../utils/helpers';
import { format } from 'date-fns';

const CHART_COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#f97316','#6b7280'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const GRADIENT_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
];

function getGradient(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
}

const STATUS_EMOJI = {
  applied: '📋', screening: '🔍', interview: '🎙️',
  offer: '🤝', approved: '✅', rejected: '❌', withdrawn: '↩️'
};

const PRIORITY_STYLES = {
  high:   { dot: '🔴', bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', label: 'High' },
  medium: { dot: '🟡', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', label: 'Medium' },
  low:    { dot: '🟢', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', label: 'Low' },
};

function StatCard({ label, value, icon: Icon, gradient, sub }) {
  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{payload[0].value} applications</p>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data.stats)).finally(() => setLoading(false));
  }, []);

  const statusData = stats
    ? Object.entries(stats.statusCounts).map(([name, value]) => ({ name, value }))
    : [];

  const monthlyData = stats?.monthlyApps?.map(item => ({
    name: MONTH_NAMES[item._id.month - 1],
    Applications: item.count
  })) || [];

  const now = new Date();
const hour = now.getHours();

const greeting =
  hour >= 5  && hour < 12 ? 'Good morning' :
  hour >= 12 && hour < 17 ? 'Good afternoon' :
  hour >= 17 && hour < 21 ? 'Good evening' :
  'Good night';

const greetEmoji =
  hour >= 5  && hour < 12 ? '☀️' :
  hour >= 12 && hour < 17 ? '🌤️' :
  hour >= 17 && hour < 21 ? '🌆' :
  '🌙';

  const axisColor = dark ? '#6b7280' : '#9ca3af';

  const successRate = stats?.total
    ? Math.round(((stats.statusCounts?.approved || 0) / stats.total) * 100)
    : 0;

  const statCards = [
    { label: 'Total Applied',  value: stats?.total || 0,                    icon: BriefcaseIcon,   gradient: 'from-indigo-500 to-violet-600', sub: 'All time' },
    { label: 'Approved',       value: stats?.statusCounts?.approved || 0,   icon: CheckCircleIcon, gradient: 'from-emerald-500 to-teal-600',  sub: `${successRate}% success rate` },
    { label: 'Rejected',       value: stats?.statusCounts?.rejected || 0,   icon: XCircleIcon,     gradient: 'from-rose-500 to-pink-600',     sub: 'Keep going!' },
    { label: 'In Progress',    value: (stats?.statusCounts?.interview || 0) + (stats?.statusCounts?.screening || 0), icon: ClockIcon, gradient: 'from-amber-500 to-orange-500', sub: 'Active pipeline' },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400 dark:text-gray-500">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{greetEmoji}</span>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {greeting}, {user?.name?.split(' ')[0]}!
            </h1>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-sm ml-9">
            Here's your job search overview for today
          </p>
        </div>
        <Link
          to="/jobs/add"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
            bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
            text-white text-sm font-semibold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30
            transition-all duration-200 active:scale-95"
        >
          <PlusIcon className="w-4 h-4" /> Add Application
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white text-sm">Applications Over Time</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Last 6 months</p>
            </div>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#374151' : '#f3f4f6'} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip dark={dark} />} cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)', radius: 8 }} />
                <Bar dataKey="Applications" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-gray-600">
              <ArrowTrendingUpIcon className="w-10 h-10" />
              <p className="text-sm">No data yet — start applying!</p>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white text-sm">By Status</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Breakdown</p>
            </div>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: dark ? '#1f2937' : '#fff',
                    border: 'none', borderRadius: 12,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                    fontSize: 12
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-gray-600">
              <BriefcaseIcon className="w-10 h-10" />
              <p className="text-sm">No applications yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Applications ── */}
      <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <FireIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white text-sm">Recent Applications</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Your latest activity</p>
            </div>
          </div>
          <Link to="/jobs"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
            View all →
          </Link>
        </div>

        {stats?.recentApplications?.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/40">
            {stats.recentApplications.map((job) => {
              const sc = getStatusConfig(job.status);
              const pr = PRIORITY_STYLES[job.priority] || PRIORITY_STYLES.medium;
              const gradient = getGradient(job.company);
              return (
                <div key={job._id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient}
                    flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm`}>
                    {job.company[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{job.position}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {job.company}
                      <span className="mx-1 text-gray-300 dark:text-gray-600">·</span>
                      {job.location}
                    </p>
                  </div>

                  {/* Priority */}
                  <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${pr.bg} ${pr.text}`}>
                    {pr.dot} {pr.label}
                  </span>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${sc.color}`}>
                    <span>{STATUS_EMOJI[job.status]}</span>
                    {sc.label}
                  </span>

                  {/* Date */}
                  <span className="hidden md:block text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {format(new Date(job.appliedDate), 'MMM d')}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
              <BriefcaseIcon className="w-7 h-7 text-gray-300 dark:text-gray-500" />
            </div>
            <p className="font-semibold text-gray-500 dark:text-gray-400 text-sm">No applications yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Add your first application to get started</p>
            <Link to="/jobs/add"
              className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold
                shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all active:scale-95">
              <PlusIcon className="w-4 h-4" /> Add Application
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}