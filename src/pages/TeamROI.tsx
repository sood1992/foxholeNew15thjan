import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Target,
  Award,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Filter,
  Download,
  Star,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

const verdictConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  promote: { label: 'Promote', color: 'text-success-600', bgColor: 'bg-success-50', icon: TrendingUp },
  raise: { label: 'Raise', color: 'text-primary-600', bgColor: 'bg-primary-50', icon: Star },
  excellent: { label: 'Excellent', color: 'text-info-600', bgColor: 'bg-info-50', icon: Award },
  monitor: { label: 'Monitor', color: 'text-warning-600', bgColor: 'bg-warning-50', icon: AlertTriangle },
};

function ROIGauge({ value, max = 2 }: { value: number; max?: number }) {
  const percentage = Math.min((value / max) * 100, 100);
  const isPositive = value > 0;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="#E8E7EB"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke={isPositive ? '#28c76f' : '#ea5455'}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 3.14} 314`}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
          {(value * 100).toFixed(0)}%
        </span>
        <span className="text-xs text-text-muted">ROI</span>
      </div>
    </div>
  );
}

function EmployeeROICard({ roiData, user }: { roiData: any; user: any }) {
  const [expanded, setExpanded] = useState(false);
  const verdict = verdictConfig[roiData.verdict];
  const VerdictIcon = verdict.icon;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        <div className="avatar avatar-lg flex-shrink-0">
          {user.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-primary">{user.name}</h3>
            <span className={`badge ${verdict.bgColor} ${verdict.color}`}>
              <VerdictIcon size={12} className="mr-1" />
              {verdict.label}
            </span>
          </div>
          <p className="text-sm text-text-muted capitalize">{user.specialization.replace('_', ' ')}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-sm">
              <Zap size={14} className="text-primary-500" />
              <span className="text-text-secondary">Level {user.level}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-text-muted">{user.xp} XP</span>
            </div>
          </div>
        </div>
        <ROIGauge value={roiData.roi} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 border-t border-surface-100">
        <div className="p-4 text-center border-r border-surface-100">
          <p className="text-2xl font-bold text-text-primary">{roiData.hoursWorked}</p>
          <p className="text-xs text-text-muted">Hours Worked</p>
        </div>
        <div className="p-4 text-center border-r border-surface-100">
          <p className="text-2xl font-bold text-text-primary">{roiData.tasksCompleted}</p>
          <p className="text-xs text-text-muted">Tasks Done</p>
        </div>
        <div className="p-4 text-center border-r border-surface-100">
          <p className="text-2xl font-bold text-success-600">${(roiData.revenueGenerated / 1000).toFixed(1)}K</p>
          <p className="text-xs text-text-muted">Revenue</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-text-primary">{roiData.qualityScore}%</p>
          <p className="text-xs text-text-muted">Quality</p>
        </div>
      </div>

      {/* Expand for Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-center gap-2 bg-surface-50 hover:bg-surface-100 transition-colors text-sm text-text-muted"
      >
        {expanded ? (
          <>
            <ChevronUp size={16} />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            View Details
          </>
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-5 bg-surface-50 space-y-4 border-t border-surface-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Hourly Rate</p>
              <p className="font-semibold text-text-primary">${roiData.hourlyRate}/hr</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Total Cost</p>
              <p className="font-semibold text-text-primary">${roiData.totalCost.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Avg Task Time</p>
              <p className="font-semibold text-text-primary">{roiData.averageTaskTime.toFixed(1)} hrs</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">XP Earned</p>
              <p className="font-semibold text-primary-600">{roiData.xpEarned} XP</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-text-muted mb-2">Projects Contributed</p>
            <div className="flex flex-wrap gap-2">
              {roiData.projectsContributed.map((projectId: string) => (
                <span key={projectId} className="badge-primary text-xs">
                  {projectId}
                </span>
              ))}
            </div>
          </div>

          {/* ROI Breakdown */}
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-medium text-text-primary mb-3">ROI Calculation</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Revenue Generated</span>
                <span className="text-success-600 font-medium">+${roiData.revenueGenerated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total Cost</span>
                <span className="text-danger-600 font-medium">-${roiData.totalCost.toLocaleString()}</span>
              </div>
              <div className="border-t border-surface-200 pt-2 flex justify-between">
                <span className="font-medium text-text-primary">Net Value</span>
                <span className={`font-bold ${roiData.revenueGenerated - roiData.totalCost > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  ${(roiData.revenueGenerated - roiData.totalCost).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamROI() {
  const { users, employeeROI, getUserById, isAdmin } = useApp();
  const [sortBy, setSortBy] = useState<'roi' | 'revenue' | 'hours' | 'quality'>('roi');
  const [filterVerdict, setFilterVerdict] = useState<string>('all');

  // Only admins can view this page
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertTriangle size={48} className="text-warning-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Access Restricted</h2>
          <p className="text-text-muted">Only administrators can access the Team ROI dashboard.</p>
        </div>
      </div>
    );
  }

  // Sort and filter ROI data
  const sortedROI = [...employeeROI]
    .filter(roi => filterVerdict === 'all' || roi.verdict === filterVerdict)
    .sort((a, b) => {
      switch (sortBy) {
        case 'roi':
          return b.roi - a.roi;
        case 'revenue':
          return b.revenueGenerated - a.revenueGenerated;
        case 'hours':
          return b.hoursWorked - a.hoursWorked;
        case 'quality':
          return b.qualityScore - a.qualityScore;
        default:
          return 0;
      }
    });

  // Calculate team totals
  const teamTotals = employeeROI.reduce(
    (acc, roi) => ({
      totalHours: acc.totalHours + roi.hoursWorked,
      totalCost: acc.totalCost + roi.totalCost,
      totalRevenue: acc.totalRevenue + roi.revenueGenerated,
      totalTasks: acc.totalTasks + roi.tasksCompleted,
    }),
    { totalHours: 0, totalCost: 0, totalRevenue: 0, totalTasks: 0 }
  );

  const teamROI = (teamTotals.totalRevenue - teamTotals.totalCost) / teamTotals.totalCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Team Performance & ROI</h1>
          <p className="text-text-muted">Moneyball approach to creative talent management</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <TrendingUp size={24} className="text-primary-600" />
            </div>
            <span className={`badge ${teamROI > 0 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'}`}>
              {teamROI > 0 ? '+' : ''}{(teamROI * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-text-primary">{(teamROI * 100).toFixed(0)}%</p>
          <p className="text-sm text-text-muted">Team ROI</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-success-100 flex items-center justify-center">
              <DollarSign size={24} className="text-success-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text-primary">${(teamTotals.totalRevenue / 1000).toFixed(0)}K</p>
          <p className="text-sm text-text-muted">Revenue Generated</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-info-100 flex items-center justify-center">
              <Clock size={24} className="text-info-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text-primary">{teamTotals.totalHours}</p>
          <p className="text-sm text-text-muted">Total Hours</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-warning-100 flex items-center justify-center">
              <Target size={24} className="text-warning-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text-primary">{teamTotals.totalTasks}</p>
          <p className="text-sm text-text-muted">Tasks Completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <span className="text-sm font-medium text-text-primary">Filters:</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-text-muted">Sort by:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="input py-1.5 w-36"
          >
            <option value="roi">ROI</option>
            <option value="revenue">Revenue</option>
            <option value="hours">Hours Worked</option>
            <option value="quality">Quality Score</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-text-muted">Verdict:</label>
          <select
            value={filterVerdict}
            onChange={e => setFilterVerdict(e.target.value)}
            className="input py-1.5 w-36"
          >
            <option value="all">All</option>
            <option value="promote">Promote</option>
            <option value="raise">Raise</option>
            <option value="excellent">Excellent</option>
            <option value="monitor">Monitor</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-text-muted">
          Period: January 2024
        </div>
      </div>

      {/* Verdict Summary */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(verdictConfig).map(([key, config]) => {
          const count = employeeROI.filter(r => r.verdict === key).length;
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setFilterVerdict(filterVerdict === key ? 'all' : key)}
              className={`card p-4 flex items-center gap-3 transition-all ${
                filterVerdict === key ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                <Icon size={20} className={config.color} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-text-primary">{count}</p>
                <p className="text-xs text-text-muted">{config.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Employee ROI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedROI.map(roiData => {
          const user = getUserById(roiData.userId);
          if (!user) return null;
          return <EmployeeROICard key={roiData.userId} roiData={roiData} user={user} />;
        })}
      </div>
    </div>
  );
}
