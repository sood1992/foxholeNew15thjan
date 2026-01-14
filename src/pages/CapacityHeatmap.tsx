import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Flame,
  Calendar,
  Clock,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, addDays, startOfWeek, parseISO, isSameDay } from 'date-fns';
import { generateCapacityData } from '../data/sampleData';

function getHeatColor(utilization: number): string {
  if (utilization === 0) return 'bg-surface-100 text-text-muted';
  if (utilization < 50) return 'bg-success-100 text-success-700';
  if (utilization < 75) return 'bg-success-200 text-success-800';
  if (utilization < 100) return 'bg-warning-100 text-warning-700';
  if (utilization < 125) return 'bg-warning-300 text-warning-800';
  return 'bg-danger-400 text-white';
}

function getUtilizationStatus(utilization: number): { label: string; color: string } {
  if (utilization === 0) return { label: 'Off', color: 'text-text-muted' };
  if (utilization < 50) return { label: 'Light', color: 'text-success-600' };
  if (utilization < 75) return { label: 'Normal', color: 'text-success-600' };
  if (utilization < 100) return { label: 'Busy', color: 'text-warning-600' };
  if (utilization < 125) return { label: 'Heavy', color: 'text-warning-600' };
  return { label: 'Overloaded', color: 'text-danger-600' };
}

export default function CapacityHeatmap() {
  const { users, isPM, isAdmin, getUserById } = useApp();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedCell, setSelectedCell] = useState<{ userId: string; date: string } | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  // Generate capacity data
  const capacityData = useMemo(() => generateCapacityData(), []);

  // Only PMs and admins can view this page
  if (!isPM && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertTriangle size={48} className="text-warning-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Access Restricted</h2>
          <p className="text-text-muted">Only Project Managers and Admins can view the Capacity Heatmap.</p>
        </div>
      </div>
    );
  }

  // Get week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Filter users by department
  const filteredUsers = users.filter(u => {
    if (u.role === 'admin') return false;
    if (filterDepartment === 'all') return true;
    return u.department === filterDepartment;
  });

  // Get unique departments
  const departments = [...new Set(users.filter(u => u.role !== 'admin').map(u => u.department))];

  // Get capacity for a user on a specific date
  const getCapacity = (userId: string, date: string) => {
    return capacityData.find(c => c.userId === userId && c.date === date);
  };

  // Calculate daily totals
  const dailyTotals = weekDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayCapacity = capacityData.filter(c => c.date === dateStr);
    const totalScheduled = dayCapacity.reduce((acc, c) => acc + c.scheduledHours, 0);
    const totalAvailable = dayCapacity.reduce((acc, c) => acc + c.availableHours, 0);
    return {
      date: dateStr,
      scheduled: totalScheduled,
      available: totalAvailable,
      utilization: totalAvailable > 0 ? (totalScheduled / totalAvailable) * 100 : 0,
    };
  });

  // Team stats
  const teamStats = {
    totalCapacity: dailyTotals.reduce((acc, d) => acc + d.available, 0),
    totalScheduled: dailyTotals.reduce((acc, d) => acc + d.scheduled, 0),
    overloaded: capacityData.filter(c => c.utilizationPercent > 100).length,
    underutilized: capacityData.filter(c => c.utilizationPercent > 0 && c.utilizationPercent < 50).length,
  };

  const avgUtilization = teamStats.totalCapacity > 0
    ? (teamStats.totalScheduled / teamStats.totalCapacity) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Capacity Heatmap</h1>
          <p className="text-text-muted">Monitor team workload and prevent burnout</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Clock size={20} className="text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{avgUtilization.toFixed(0)}%</p>
          <p className="text-sm text-text-muted">Avg. Utilization</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <Calendar size={20} className="text-success-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{teamStats.totalCapacity}h</p>
          <p className="text-sm text-text-muted">Total Capacity</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center">
              <Flame size={20} className="text-danger-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-danger-600">{teamStats.overloaded}</p>
          <p className="text-sm text-text-muted">Overloaded Slots</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center">
              <Users size={20} className="text-info-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{filteredUsers.length}</p>
          <p className="text-sm text-text-muted">Team Members</p>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4 flex items-center gap-6 flex-wrap">
        <span className="text-sm font-medium text-text-primary">Utilization Legend:</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-surface-100" />
            <span className="text-xs text-text-muted">Off</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-success-100" />
            <span className="text-xs text-text-muted">&lt;50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-success-200" />
            <span className="text-xs text-text-muted">50-75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-warning-100" />
            <span className="text-xs text-text-muted">75-100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-warning-300" />
            <span className="text-xs text-text-muted">100-125%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-danger-400" />
            <span className="text-xs text-text-muted">&gt;125%</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-text-muted">Department:</label>
          <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            className="input py-1.5 w-40"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="card p-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
          className="btn-secondary btn-sm"
        >
          <ChevronLeft size={16} />
          Previous Week
        </button>

        <h2 className="text-lg font-semibold text-text-primary">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </h2>

        <button
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
          className="btn-secondary btn-sm"
        >
          Next Week
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Heatmap Grid */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="p-4 text-left text-sm font-semibold text-text-primary w-48">
                Team Member
              </th>
              {weekDays.map(day => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <th
                    key={day.toISOString()}
                    className={`p-4 text-center text-sm font-semibold ${
                      isWeekend ? 'text-text-muted bg-surface-50' : 'text-text-primary'
                    }`}
                  >
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-xs font-normal">{format(day, 'MMM d')}</div>
                  </th>
                );
              })}
              <th className="p-4 text-center text-sm font-semibold text-text-primary w-24">
                Weekly
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const weeklyData = weekDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                return getCapacity(user.id, dateStr);
              });

              const weeklyTotal = weeklyData.reduce((acc, c) => acc + (c?.scheduledHours || 0), 0);
              const weeklyAvailable = weeklyData.reduce((acc, c) => acc + (c?.availableHours || 0), 0);
              const weeklyUtilization = weeklyAvailable > 0 ? (weeklyTotal / weeklyAvailable) * 100 : 0;

              return (
                <tr key={user.id} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar avatar-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">{user.name}</p>
                        <p className="text-xs text-text-muted">{user.department}</p>
                      </div>
                    </div>
                  </td>
                  {weekDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const capacity = getCapacity(user.id, dateStr);
                    const utilization = capacity?.utilizationPercent || 0;
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isSelected = selectedCell?.userId === user.id && selectedCell?.date === dateStr;

                    return (
                      <td key={dateStr} className={`p-2 ${isWeekend ? 'bg-surface-50' : ''}`}>
                        <button
                          onClick={() => setSelectedCell({ userId: user.id, date: dateStr })}
                          className={`heatmap-cell ${getHeatColor(utilization)} hover:ring-2 hover:ring-primary-500 ${
                            isSelected ? 'ring-2 ring-primary-500' : ''
                          }`}
                        >
                          {capacity?.scheduledHours || '-'}
                        </button>
                      </td>
                    );
                  })}
                  <td className="p-4 text-center">
                    <div className={`font-semibold ${getUtilizationStatus(weeklyUtilization).color}`}>
                      {weeklyUtilization.toFixed(0)}%
                    </div>
                    <div className="text-xs text-text-muted">{weeklyTotal}h</div>
                  </td>
                </tr>
              );
            })}

            {/* Daily Totals Row */}
            <tr className="bg-surface-50 font-medium">
              <td className="p-4 text-text-primary">Daily Total</td>
              {dailyTotals.map(total => {
                const isWeekend = parseISO(total.date).getDay() === 0 || parseISO(total.date).getDay() === 6;
                return (
                  <td key={total.date} className={`p-4 text-center ${isWeekend ? 'bg-surface-100' : ''}`}>
                    <div className="text-sm text-text-primary">{total.scheduled}h</div>
                    <div className={`text-xs ${getUtilizationStatus(total.utilization).color}`}>
                      {total.utilization.toFixed(0)}%
                    </div>
                  </td>
                );
              })}
              <td className="p-4 text-center">
                <div className="text-sm text-text-primary">{teamStats.totalScheduled}h</div>
                <div className={`text-xs ${getUtilizationStatus(avgUtilization).color}`}>
                  {avgUtilization.toFixed(0)}%
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Selected Cell Details */}
      {selectedCell && (
        <div className="card p-5">
          <h3 className="font-semibold text-text-primary mb-4">
            {getUserById(selectedCell.userId)?.name} - {format(parseISO(selectedCell.date), 'EEEE, MMMM d, yyyy')}
          </h3>
          {(() => {
            const capacity = getCapacity(selectedCell.userId, selectedCell.date);
            if (!capacity || capacity.availableHours === 0) {
              return <p className="text-text-muted">No work scheduled (Weekend or Day Off)</p>;
            }
            const status = getUtilizationStatus(capacity.utilizationPercent);
            return (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-surface-50 rounded-lg">
                  <p className="text-sm text-text-muted">Scheduled</p>
                  <p className="text-2xl font-bold text-text-primary">{capacity.scheduledHours}h</p>
                </div>
                <div className="p-4 bg-surface-50 rounded-lg">
                  <p className="text-sm text-text-muted">Available</p>
                  <p className="text-2xl font-bold text-text-primary">{capacity.availableHours}h</p>
                </div>
                <div className="p-4 bg-surface-50 rounded-lg">
                  <p className="text-sm text-text-muted">Status</p>
                  <p className={`text-2xl font-bold ${status.color}`}>{status.label}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
