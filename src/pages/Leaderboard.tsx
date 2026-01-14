import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Zap,
  Flame,
  Target,
  TrendingUp,
  Star,
  Crown,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { levelConfigs } from '../data/sampleData';

function getLevelBadgeColor(level: number): string {
  if (level >= 8) return 'from-yellow-400 to-amber-600';
  if (level >= 6) return 'from-purple-400 to-purple-600';
  if (level >= 4) return 'from-blue-400 to-blue-600';
  return 'from-gray-400 to-gray-600';
}

function LeaderboardRow({
  user,
  rank,
  currentUserId,
}: {
  user: any;
  rank: number;
  currentUserId: string;
}) {
  const { getUserLevel } = useApp();
  const level = getUserLevel(user.xp);
  const xpProgress = ((user.xp - level.minXP) / (level.maxXP - level.minXP)) * 100;
  const isCurrentUser = user.id === currentUserId;

  const rankIcons: Record<number, React.ReactNode> = {
    1: <Crown size={24} className="text-yellow-500" />,
    2: <Medal size={24} className="text-gray-400" />,
    3: <Medal size={24} className="text-amber-600" />,
  };

  return (
    <div
      className={`p-4 rounded-lg transition-all ${
        isCurrentUser
          ? 'bg-primary-50 border-2 border-primary-200'
          : 'bg-white hover:bg-surface-50'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-12 flex items-center justify-center">
          {rankIcons[rank] || (
            <span className="text-xl font-bold text-text-muted">#{rank}</span>
          )}
        </div>

        {/* Avatar & Info */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getLevelBadgeColor(user.level)} flex items-center justify-center text-white font-bold text-lg`}>
              {user.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-xs font-bold text-primary-600">{user.level}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary">{user.name}</h3>
              {isCurrentUser && (
                <span className="badge-primary text-xs">You</span>
              )}
            </div>
            <p className="text-sm text-text-muted capitalize">{user.specialization.replace('_', ' ')}</p>
            <p className="text-xs text-primary-600">{level.title}</p>
          </div>
        </div>

        {/* XP */}
        <div className="text-right w-32">
          <div className="flex items-center justify-end gap-1 mb-1">
            <Zap size={16} className="text-primary-500" />
            <span className="font-bold text-text-primary">{user.xp.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="w-20 text-center">
          {user.currentStreak > 0 ? (
            <div className="flex items-center justify-center gap-1">
              <Flame size={16} className="text-warning-500" />
              <span className="font-bold text-warning-600">{user.currentStreak}</span>
            </div>
          ) : (
            <span className="text-text-muted">-</span>
          )}
          <p className="text-xs text-text-muted">Streak</p>
        </div>

        {/* Badges */}
        <div className="w-32">
          <div className="flex items-center gap-1">
            {user.badges.slice(0, 4).map((badge: any, index: number) => (
              <div
                key={index}
                className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center text-sm"
                title={badge.name}
              >
                {badge.icon}
              </div>
            ))}
            {user.badges.length > 4 && (
              <span className="text-xs text-text-muted">+{user.badges.length - 4}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgeCard({ badge }: { badge: any }) {
  return (
    <div className="card p-4 hover:shadow-card-hover transition-all cursor-pointer">
      <div className="text-center">
        <div className="text-4xl mb-2">{badge.icon}</div>
        <h4 className="font-semibold text-text-primary">{badge.name}</h4>
        <p className="text-xs text-text-muted mt-1">{badge.description}</p>
        <span className={`badge mt-2 ${
          badge.category === 'milestone' ? 'bg-purple-100 text-purple-600' :
          badge.category === 'streak' ? 'bg-warning-100 text-warning-600' :
          badge.category === 'quality' ? 'bg-success-100 text-success-600' :
          badge.category === 'productivity' ? 'bg-primary-100 text-primary-600' :
          'bg-info-100 text-info-600'
        }`}>
          {badge.category}
        </span>
      </div>
    </div>
  );
}

function LevelProgressCard({ level, currentXP }: { level: any; currentXP: number }) {
  const progress = ((currentXP - level.minXP) / (level.maxXP - level.minXP)) * 100;
  const xpToNext = level.maxXP - currentXP;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getLevelBadgeColor(level.level)} flex items-center justify-center`}>
          <span className="text-2xl font-bold text-white">{level.level}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-text-primary">{level.title}</h3>
          <p className="text-text-muted">Level {level.level}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-muted">Progress to Level {level.level + 1}</span>
          <span className="font-medium text-text-primary">{currentXP.toLocaleString()} / {level.maxXP.toLocaleString()} XP</span>
        </div>
        <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-1">{xpToNext.toLocaleString()} XP to next level</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-text-primary mb-2">Level Perks</h4>
        <ul className="space-y-1">
          {level.perks.map((perk: string, index: number) => (
            <li key={index} className="flex items-center gap-2 text-sm text-text-muted">
              <Star size={12} className="text-primary-500" />
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { users, currentUser, getUserLevel } = useApp();
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
  const [showBadges, setShowBadges] = useState(false);

  // Sort users by XP
  const sortedUsers = [...users]
    .filter(u => u.role !== 'admin')
    .sort((a, b) => b.xp - a.xp);

  // Get current user rank
  const currentUserRank = currentUser
    ? sortedUsers.findIndex(u => u.id === currentUser.id) + 1
    : 0;

  // Get all unique badges
  const allBadges = sortedUsers.flatMap(u => u.badges);
  const uniqueBadges = allBadges.filter((badge, index, self) =>
    index === self.findIndex(b => b.id === badge.id)
  );

  // Stats
  const totalXP = sortedUsers.reduce((acc, u) => acc + u.xp, 0);
  const avgXP = totalXP / sortedUsers.length;
  const topStreak = Math.max(...sortedUsers.map(u => u.currentStreak));

  const currentLevel = currentUser ? getUserLevel(currentUser.xp) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Leaderboard & Achievements</h1>
          <p className="text-text-muted">Compete, earn XP, and unlock badges</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBadges(!showBadges)}
            className={`btn-secondary ${showBadges ? 'bg-primary-50 border-primary-200' : ''}`}
          >
            <Award size={16} />
            {showBadges ? 'View Leaderboard' : 'View Badges'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Trophy size={20} className="text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">#{currentUserRank}</p>
          <p className="text-sm text-text-muted">Your Rank</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <Zap size={20} className="text-success-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{currentUser?.xp.toLocaleString()}</p>
          <p className="text-sm text-text-muted">Your XP</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
              <Flame size={20} className="text-warning-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{topStreak} days</p>
          <p className="text-sm text-text-muted">Top Streak</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center">
              <Award size={20} className="text-info-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary">{currentUser?.badges.length || 0}</p>
          <p className="text-sm text-text-muted">Badges Earned</p>
        </div>
      </div>

      {showBadges ? (
        /* Badges View */
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-text-primary">All Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {uniqueBadges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>

          {/* Levels */}
          <h2 className="text-xl font-bold text-text-primary">Level Progression</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levelConfigs.map(config => (
              <div key={config.level} className={`card p-4 ${
                currentLevel?.level === config.level ? 'ring-2 ring-primary-500' : ''
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getLevelBadgeColor(config.level)} flex items-center justify-center`}>
                    <span className="font-bold text-white">{config.level}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">{config.title}</h4>
                    <p className="text-xs text-text-muted">
                      {config.minXP.toLocaleString()} - {config.maxXP === Infinity ? '∞' : config.maxXP.toLocaleString()} XP
                    </p>
                  </div>
                  {currentLevel?.level === config.level && (
                    <span className="ml-auto badge-primary">Current</span>
                  )}
                </div>
                <ul className="space-y-1">
                  {config.perks.map((perk, i) => (
                    <li key={i} className="text-xs text-text-muted flex items-center gap-1">
                      <Star size={10} className="text-primary-500" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Leaderboard View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2 space-y-3">
            {/* Timeframe Filter */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-text-muted">Timeframe:</span>
              <div className="flex items-center bg-surface-100 rounded-lg p-1">
                {(['all', 'month', 'week'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors capitalize ${
                      timeframe === tf ? 'bg-white shadow text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    {tf === 'all' ? 'All Time' : `This ${tf}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-2">
              {sortedUsers.map((user, index) => (
                <LeaderboardRow
                  key={user.id}
                  user={user}
                  rank={index + 1}
                  currentUserId={currentUser?.id || ''}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Your Level Progress */}
            {currentUser && currentLevel && (
              <LevelProgressCard level={currentLevel} currentXP={currentUser.xp} />
            )}

            {/* Your Badges */}
            {currentUser && currentUser.badges.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-text-primary mb-4">Your Badges</h3>
                <div className="grid grid-cols-3 gap-2">
                  {currentUser.badges.map((badge, index) => (
                    <div
                      key={index}
                      className="p-3 bg-surface-50 rounded-lg text-center"
                      title={badge.description}
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <p className="text-xs font-medium text-text-primary truncate">
                        {badge.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Streak Info */}
            {currentUser && currentUser.currentStreak > 0 && (
              <div className="card p-5 bg-gradient-to-br from-warning-50 to-warning-100">
                <div className="flex items-center gap-3 mb-3">
                  <Flame size={32} className="text-warning-500" />
                  <div>
                    <p className="text-3xl font-bold text-warning-600">{currentUser.currentStreak}</p>
                    <p className="text-sm text-warning-700">Day Streak</p>
                  </div>
                </div>
                <p className="text-sm text-warning-600">
                  Keep completing tasks to maintain your streak and earn bonus XP!
                </p>
                <p className="text-xs text-warning-500 mt-2">
                  Longest streak: {currentUser.longestStreak} days
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
