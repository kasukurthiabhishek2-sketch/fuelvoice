/**
 * Admin Dashboard
 * Shows recent reviews, reports, and user management.
 */

'use client';

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminReviews, getPendingReports, getAdminUsers, hideReview, unhideReview, featureReview, banUser, updateReportStatus } from '@/lib/firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { StarRating } from '@/components/ui/StarRating';
import { timeAgo } from '@/lib/utils/format';
import type { Review } from '@/types/review';
import type { Report } from '@/types/user';

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews } = useQuery({ queryKey: ['admin-reviews'], queryFn: () => getAdminReviews(30) });
  const { data: reports } = useQuery({ queryKey: ['admin-reports'], queryFn: () => getPendingReports(30) });
  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: () => getAdminUsers(50) });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const handleHideReview = async (reviewId: string, hidden: boolean) => {
    try {
      if (hidden) await unhideReview(reviewId);
      else await hideReview(reviewId);
      toast(hidden ? 'Review restored' : 'Review hidden', 'success');
      refresh();
    } catch { toast('Action failed', 'error'); }
  };

  const handleFeature = async (reviewId: string, featured: boolean) => {
    try {
      await featureReview(reviewId, !featured);
      toast(!featured ? 'Review featured' : 'Feature removed', 'success');
      refresh();
    } catch { toast('Action failed', 'error'); }
  };

  const handleBan = async (userId: string, banned: boolean) => {
    try {
      await banUser(userId, !banned);
      toast(!banned ? 'User banned' : 'User unbanned', 'success');
      refresh();
    } catch { toast('Action failed', 'error'); }
  };

  const handleReport = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    if (!user) return;
    try {
      await updateReportStatus(reportId, status, user.uid);
      toast(`Report ${status}`, 'success');
      refresh();
    } catch { toast('Action failed', 'error'); }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Stats */}
      <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Reviews" value={reviews?.length || 0} icon="📝" />
        <StatCard label="Pending Reports" value={reports?.length || 0} icon="🚩" />
        <StatCard label="Total Users" value={users?.length || 0} icon="👥" />
      </div>

      {/* Pending Reports */}
      <div className="card p-5">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>🚩 Pending Reports ({reports?.length || 0})</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {reports?.map((r: Report) => (
            <div key={r.id} className="p-3 rounded-xl border" style={{ borderColor: 'var(--border-primary)' }}>
              <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{r.reason}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{timeAgo(r.createdAt)}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleReport(r.id, 'reviewed')} className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors">Accept</button>
                <button onClick={() => handleReport(r.id, 'dismissed')} className="px-3 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors">Dismiss</button>
              </div>
            </div>
          ))}
          {(!reports || reports.length === 0) && <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No pending reports 🎉</p>}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="card p-5">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>📝 Recent Reviews</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {reviews?.map((r: Review) => (
            <div key={r.id} className={`p-3 rounded-xl border ${r.isHidden ? 'opacity-50' : ''}`} style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.userName}</p>
                  <StarRating value={r.rating} size="sm" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleHideReview(r.id, r.isHidden)} className="px-2 py-1 rounded text-xs font-medium hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    {r.isHidden ? '👁️ Show' : '🙈 Hide'}
                  </button>
                  <button onClick={() => handleFeature(r.id, r.isFeatured)} className="px-2 py-1 rounded text-xs font-medium hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    {r.isFeatured ? '⭐ Unfeature' : '⭐ Feature'}
                  </button>
                </div>
              </div>
              <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-tertiary)' }}>{r.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Users */}
      <div className="lg:col-span-2 card p-5">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>👥 Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--text-tertiary)' }}>
                <th className="text-left py-2 font-medium">Name</th>
                <th className="text-left py-2 font-medium">Role</th>
                <th className="text-left py-2 font-medium">Reviews</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-right py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.uid} className="border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                  <td className="py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{u.displayName}</td>
                  <td className="py-2"><span className="px-2 py-0.5 rounded text-xs font-medium bg-surface-100 dark:bg-surface-700" style={{ color: 'var(--text-secondary)' }}>{u.role}</span></td>
                  <td className="py-2" style={{ color: 'var(--text-secondary)' }}>{u.reviewCount}</td>
                  <td className="py-2">{u.isBanned ? <span className="text-xs text-rose-500">Banned</span> : <span className="text-xs text-emerald-500">Active</span>}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => handleBan(u.uid, u.isBanned)} className="text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors">
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="card p-5 text-center">
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold mt-2 bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
    </div>
  );
}
