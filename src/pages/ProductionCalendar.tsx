import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Clock,
  Users,
  Camera,
  Video,
  Calendar as CalendarIcon,
  X,
  Package,
  Edit2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ShootEvent } from '../types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  parseISO,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

const shootTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  video_shoot: { icon: Video, color: 'text-primary-600', bgColor: 'bg-primary-100' },
  photo_shoot: { icon: Camera, color: 'text-success-600', bgColor: 'bg-success-100' },
  interview: { icon: Users, color: 'text-info-600', bgColor: 'bg-info-100' },
  event_coverage: { icon: CalendarIcon, color: 'text-warning-600', bgColor: 'bg-warning-100' },
  other: { icon: Package, color: 'text-text-secondary', bgColor: 'bg-surface-200' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'bg-info-100 text-info-600' },
  confirmed: { label: 'Confirmed', color: 'bg-success-100 text-success-600' },
  in_progress: { label: 'In Progress', color: 'bg-warning-100 text-warning-600' },
  completed: { label: 'Completed', color: 'bg-surface-200 text-text-secondary' },
  cancelled: { label: 'Cancelled', color: 'bg-danger-100 text-danger-600' },
};

function ShootEventCard({
  event,
  compact = false,
  onClick,
}: {
  event: ShootEvent;
  compact?: boolean;
  onClick: () => void;
}) {
  const { getUserById, getProjectById } = useApp();
  const typeConfig = shootTypeConfig[event.type];
  const Icon = typeConfig.icon;
  const project = getProjectById(event.projectId);

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left p-1.5 rounded text-xs ${typeConfig.bgColor} ${typeConfig.color} hover:opacity-80 transition-opacity truncate`}
      >
        <div className="flex items-center gap-1">
          <Icon size={10} />
          <span className="truncate">{event.title}</span>
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className="card p-4 cursor-pointer hover:shadow-card-hover transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${typeConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={typeConfig.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-text-primary truncate group-hover:text-primary-500 transition-colors">
              {event.title}
            </h4>
            <span className={`badge ${statusConfig[event.status].color}`}>
              {statusConfig[event.status].label}
            </span>
          </div>
          <p className="text-sm text-text-muted mb-2">{project?.name}</p>
          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span className="truncate max-w-[150px]">{event.location.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>{event.crewIds.length} crew</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShootDetailModal({
  event,
  onClose,
}: {
  event: ShootEvent;
  onClose: () => void;
}) {
  const { getUserById, getProjectById } = useApp();
  const typeConfig = shootTypeConfig[event.type];
  const Icon = typeConfig.icon;
  const project = getProjectById(event.projectId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${typeConfig.bgColor} flex items-center justify-center`}>
              <Icon size={28} className={typeConfig.color} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">{event.title}</h2>
              <p className="text-text-muted">{project?.name} - {project?.jobCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-lg">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`badge ${statusConfig[event.status].color}`}>
            {statusConfig[event.status].label}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-surface-50 rounded-lg">
            <div className="flex items-center gap-2 text-text-muted mb-2">
              <CalendarIcon size={14} />
              <span className="text-xs font-medium uppercase">Date</span>
            </div>
            <p className="font-medium text-text-primary">
              {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          <div className="p-4 bg-surface-50 rounded-lg">
            <div className="flex items-center gap-2 text-text-muted mb-2">
              <Clock size={14} />
              <span className="text-xs font-medium uppercase">Time</span>
            </div>
            <p className="font-medium text-text-primary">
              {event.startTime} - {event.endTime}
            </p>
            <p className="text-sm text-warning-600 mt-1">
              Call Time: {event.callTime}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="p-4 bg-surface-50 rounded-lg mb-6">
          <div className="flex items-center gap-2 text-text-muted mb-2">
            <MapPin size={14} />
            <span className="text-xs font-medium uppercase">Location</span>
          </div>
          <p className="font-medium text-text-primary">{event.location.name}</p>
          <p className="text-sm text-text-muted">{event.location.address}</p>
        </div>

        {/* Crew */}
        <div className="mb-6">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Users size={16} />
            Crew ({event.crewIds.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {event.crewIds.map(crewId => {
              const member = getUserById(crewId);
              return member ? (
                <div key={crewId} className="flex items-center gap-2 px-3 py-2 bg-surface-50 rounded-lg">
                  <div className="avatar avatar-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{member.name}</p>
                    <p className="text-xs text-text-muted capitalize">{member.specialization.replace('_', ' ')}</p>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Equipment */}
        <div className="mb-6">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Package size={16} />
            Equipment
          </h3>
          <div className="flex flex-wrap gap-2">
            {event.equipment.map((item, index) => (
              <span key={index} className="badge-primary">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        {event.notes && (
          <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <h4 className="font-medium text-warning-700 mb-1">Notes</h4>
            <p className="text-sm text-warning-600">{event.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-surface-200">
          <button className="btn-secondary">
            <Edit2 size={16} />
            Edit Shoot
          </button>
          <button className="btn-primary">
            View Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductionCalendar() {
  const { shootEvents, getUpcomingShoots } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ShootEvent | null>(null);
  const [view, setView] = useState<'month' | 'list'>('month');

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return shootEvents.filter(event =>
      isSameDay(parseISO(event.date), date)
    );
  };

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Upcoming shoots list
  const upcomingShoots = getUpcomingShoots();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Production Calendar</h1>
          <p className="text-text-muted">Schedule and manage shoots</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-100 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                view === 'month' ? 'bg-white shadow text-text-primary' : 'text-text-muted'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-white shadow text-text-primary' : 'text-text-muted'
              }`}
            >
              List
            </button>
          </div>
          <button className="btn-primary">
            <Plus size={16} />
            Add Shoot
          </button>
        </div>
      </div>

      {view === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3 card p-5">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-text-muted" />
              </button>
              <h2 className="text-xl font-semibold text-text-primary">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-text-muted" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-text-muted">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map(day => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[100px] p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-surface-200 hover:border-primary-300'
                    } ${!isCurrentMonth ? 'opacity-40' : ''} ${
                      isWeekend ? 'bg-surface-50' : 'bg-white'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday(day)
                        ? 'w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center'
                        : 'text-text-primary'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <ShootEventCard
                          key={event.id}
                          event={event}
                          compact
                          onClick={() => {
                            setSelectedEvent(event);
                          }}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-xs text-text-muted text-center">
                          +{dayEvents.length - 2} more
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected Date Events */}
            <div className="card p-5">
              <h3 className="font-semibold text-text-primary mb-4">
                {selectedDate
                  ? format(selectedDate, 'EEEE, MMM d')
                  : 'Select a Date'}
              </h3>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <ShootEventCard
                      key={event.id}
                      event={event}
                      onClick={() => setSelectedEvent(event)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm text-center py-4">
                  {selectedDate ? 'No shoots scheduled' : 'Click on a date to view shoots'}
                </p>
              )}
            </div>

            {/* Upcoming Shoots */}
            <div className="card p-5">
              <h3 className="font-semibold text-text-primary mb-4">Upcoming Shoots</h3>
              <div className="space-y-3">
                {upcomingShoots.slice(0, 5).map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="flex items-center gap-3 p-2 hover:bg-surface-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-[10px] text-primary-500 font-medium">
                        {format(parseISO(event.date), 'MMM')}
                      </span>
                      <span className="text-sm font-bold text-primary-600">
                        {format(parseISO(event.date), 'd')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-text-muted">{event.startTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="card">
          <div className="divide-y divide-surface-100">
            {upcomingShoots.map(event => (
              <div key={event.id} className="p-4 hover:bg-surface-50 transition-colors">
                <ShootEventCard
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                />
              </div>
            ))}
            {upcomingShoots.length === 0 && (
              <div className="p-8 text-center text-text-muted">
                No upcoming shoots scheduled
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shoot Detail Modal */}
      {selectedEvent && (
        <ShootDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
