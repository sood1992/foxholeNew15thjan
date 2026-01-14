import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Palette,
  Globe,
  Shield,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Zap,
  Trophy,
  Save,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';

type TabType = 'profile' | 'password' | 'notifications' | 'preferences';

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
        active
          ? 'bg-primary-500 text-white shadow-md'
          : 'text-text-secondary hover:bg-surface-100'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default function Settings() {
  const { currentUser, updateUser, getUserLevel, levelConfigs } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [saved, setSaved] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    location: 'Los Angeles, CA',
    bio: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    taskCompleted: true,
    deadlineReminder: true,
    clientFeedback: true,
    badgeEarned: true,
    shootReminder: true,
    weeklyDigest: true,
    emailNotifications: true,
    pushNotifications: true,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/dd/yyyy',
    startOfWeek: 'monday',
  });

  const currentLevel = currentUser ? getUserLevel(currentUser.xp) : null;
  const xpProgress = currentUser && currentLevel
    ? (currentLevel.maxXP === Infinity
        ? 100
        : ((currentUser.xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100)
    : 0;

  const handleSaveProfile = () => {
    if (currentUser) {
      updateUser({
        ...currentUser,
        name: profileForm.name,
        email: profileForm.email,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleSavePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    // In a real app, this would call an API
    setSaved(true);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveNotifications = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSavePreferences = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!currentUser) {
    return <div>Please log in to view settings</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted">Manage your account settings and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-3xl font-bold text-white">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-surface-100 transition-colors">
              <Camera size={16} className="text-text-muted" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-text-primary">{currentUser.name}</h2>
              <span className="badge-primary capitalize">{currentUser.role}</span>
            </div>
            <p className="text-text-muted capitalize">{(currentUser.specialization || 'employee').replace('_', ' ')}</p>
            <p className="text-sm text-text-muted">{currentUser.department}</p>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-primary-500" />
                <span className="font-medium text-text-primary">{currentUser.xp} XP</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-warning-500" />
                <span className="font-medium text-text-primary">Level {currentLevel?.level} - {currentLevel?.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-info-500" />
                <span className="text-text-muted text-sm">
                  Joined {format(parseISO(currentUser.joinedAt), 'MMMM yyyy')}
                </span>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-muted">Progress to Level {(currentLevel?.level || 0) + 1}</span>
                <span className="text-primary-600">{Math.round(xpProgress)}%</span>
              </div>
              <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          <TabButton
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            icon={User}
            label="Profile"
          />
          <TabButton
            active={activeTab === 'password'}
            onClick={() => setActiveTab('password')}
            icon={Lock}
            label="Password"
          />
          <TabButton
            active={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
            icon={Bell}
            label="Notifications"
          />
          <TabButton
            active={activeTab === 'preferences'}
            onClick={() => setActiveTab('preferences')}
            icon={Palette}
            label="Preferences"
          />
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Success Message */}
          {saved && (
            <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg flex items-center gap-2">
              <Check size={16} className="text-success-500" />
              <span className="text-success-700 font-medium">Changes saved successfully!</span>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Profile Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="input"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="input min-h-[100px]"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200">
                <button className="btn-secondary">Cancel</button>
                <button onClick={handleSaveProfile} className="btn-primary">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Change Password</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Must be at least 8 characters with a mix of letters, numbers, and symbols
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200">
                <button className="btn-secondary">Cancel</button>
                <button onClick={handleSavePassword} className="btn-primary">
                  <Lock size={16} />
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Notification Preferences</h3>

              <div className="space-y-4">
                <h4 className="font-medium text-text-primary">Activity Notifications</h4>
                {[
                  { key: 'taskAssigned', label: 'Task Assigned', desc: 'When a new task is assigned to you' },
                  { key: 'taskCompleted', label: 'Task Completed', desc: 'When a task you created is completed' },
                  { key: 'deadlineReminder', label: 'Deadline Reminders', desc: '24 hours before task deadlines' },
                  { key: 'clientFeedback', label: 'Client Feedback', desc: 'When clients leave feedback on your work' },
                  { key: 'badgeEarned', label: 'Badge Earned', desc: 'When you unlock a new badge' },
                  { key: 'shootReminder', label: 'Shoot Reminders', desc: 'Day before scheduled shoots' },
                ].map(item => (
                  <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={e => setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })}
                      className="w-5 h-5 rounded border-surface-300 text-primary-500 focus:ring-primary-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-text-primary">{item.label}</p>
                      <p className="text-sm text-text-muted">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="border-t border-surface-200 pt-4 space-y-4">
                <h4 className="font-medium text-text-primary">Delivery Methods</h4>
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary email every Monday' },
                ].map(item => (
                  <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={e => setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })}
                      className="w-5 h-5 rounded border-surface-300 text-primary-500 focus:ring-primary-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-text-primary">{item.label}</p>
                      <p className="text-sm text-text-muted">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200">
                <button className="btn-secondary">Cancel</button>
                <button onClick={handleSaveNotifications} className="btn-primary">
                  <Save size={16} />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">App Preferences</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Theme
                  </label>
                  <select
                    value={preferences.theme}
                    onChange={e => setPreferences({ ...preferences, theme: e.target.value })}
                    className="input"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={e => setPreferences({ ...preferences, language: e.target.value })}
                    className="input"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Timezone
                  </label>
                  <select
                    value={preferences.timezone}
                    onChange={e => setPreferences({ ...preferences, timezone: e.target.value })}
                    className="input"
                  >
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Date Format
                  </label>
                  <select
                    value={preferences.dateFormat}
                    onChange={e => setPreferences({ ...preferences, dateFormat: e.target.value })}
                    className="input"
                  >
                    <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                    <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Start of Week
                  </label>
                  <select
                    value={preferences.startOfWeek}
                    onChange={e => setPreferences({ ...preferences, startOfWeek: e.target.value })}
                    className="input"
                  >
                    <option value="monday">Monday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200">
                <button className="btn-secondary">Reset to Defaults</button>
                <button onClick={handleSavePreferences} className="btn-primary">
                  <Save size={16} />
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
