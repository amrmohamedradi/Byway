import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/useApp';
import { Users, FileText, FolderOpen, Wallet } from 'lucide-react';
import { getDashboardStats } from '../../services/api';
import type { DashboardStats } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const { courses, instructors, categories } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => undefined);
  }, []);

  const statCards = [
    { label: 'Instructors', value: stats?.instructorsCount ?? instructors.length, icon: Users, bg: 'bg-blue-50 text-blue-600' },
    { label: 'Categories', value: stats?.categoriesCount ?? categories.length, icon: FileText, bg: 'bg-violet-50 text-violet-600' },
    { label: 'Courses', value: stats?.coursesCount ?? courses.length, icon: FolderOpen, bg: 'bg-emerald-50 text-emerald-600' },
  ];
  const totalManagedItems = statCards.reduce((sum, card) => sum + card.value, 0);
  const distribution = statCards.map((card) => ({
    ...card,
    percent: totalManagedItems > 0 ? Math.round((card.value / totalManagedItems) * 100) : 0,
  }));
  const monthlySales = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(stats?.monthlySales ?? 0);

  return (
    <div className="space-y-8 text-left font-sans">
      
      {/* Stat Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div 
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-1">
                <span className="text-4xl font-extrabold text-slate-800 tracking-tight">{card.value}</span>
                <p className="text-sm font-semibold text-slate-400">{card.label}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
                <IconComp className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Monthly Sales</h2>
              <p className="mt-1 text-xs font-semibold text-slate-400">From `/api/DashBoard`</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
            <span className="text-4xl font-extrabold text-slate-900">{monthlySales}</span>
            <p className="mt-2 text-sm font-semibold text-emerald-700">Revenue for the current calendar month</p>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="w-full text-left">
            <h2 className="text-lg font-bold text-slate-800">Content Distribution</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400">Calculated from API counts</p>
          </div>

          <div className="mt-6 space-y-5">
            {distribution.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                  <span>{item.label}</span>
                  <span>{item.percent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
