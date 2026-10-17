import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Sliders,
  BarChart3,
  Cpu,
  DollarSign,
  CheckCircle2,
  FileText,
  BookOpen
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Executive Overview', path: '/', icon: LayoutDashboard },
  { name: 'SME Portfolio', path: '/customers', icon: Users },
  { name: 'Risk Prioritization', path: '/prioritization', icon: AlertTriangle, badge: '3-Tier' },
  { name: 'Feature Explorer', path: '/features', icon: Sliders, badge: '44' },
  { name: 'Statistical Findings', path: '/statistics', icon: BarChart3, badge: '2.73x' },
  { name: 'Model Performance', path: '/models', icon: Cpu, badge: '0.866 AUC' },
  { name: 'Volume at Risk', path: '/exposure', icon: DollarSign },
  { name: 'Data Quality & Audit', path: '/quality', icon: CheckCircle2 },
  { name: 'Reports & Exports', path: '/reports', icon: FileText },
  { name: 'Methodology & Specs', path: '/methodology', icon: BookOpen },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-800/80">
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Analytical Intelligence
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium tracking-tight ${
                      isActive
                        ? 'bg-brand-700/80 text-brand-100 border border-brand-400/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500">Prediction Cutoff:</span>
          <span className="font-mono text-slate-300">2023-09-30 (M9)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Outcome Horizon:</span>
          <span className="font-mono text-slate-300">Months 10–12</span>
        </div>
      </div>
    </aside>
  );
};
