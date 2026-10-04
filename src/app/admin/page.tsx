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

  const reviewsQuery = useQuery({ queryKey: ['admin-reviews'], queryFn: () => getAdminReviews(30) });
  const reportsQuery = useQuery({ queryKey: ['admin-reports'], queryFn: () => getPendingReports(30) });
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: () => getAdminUsers(50) });

  const { data: reviews } = reviewsQuery;
  const { data: reports } = reportsQuery;
  const { data: users } = usersQuery;

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
    <div className="grid min-w-0 gap-8 lg:grid-cols-2">
      <div className="grid min-w-0 gap-4 sm:grid-cols-3 lg:col-span-2">
        <StatCard
          label="Total Reviews"
          value={reviews?.length}
          loading={reviewsQuery.isLoading}
          error={reviewsQuery.isError}
          icon="📝"
        />
        <StatCard
          label="Pending Reports"
          value={reports?.length}
          loading={reportsQuery.isLoading}
          error={reportsQuery.isError}
          icon="🚩"
        />
        <StatCard
          label="Total Users"
          value={users?.length}
          loading={usersQuery.isLoading}
          error={usersQuery.isError}
          icon="👥"
        />
      </div>

      <section className="card min-w-0 p-5" aria-labelledby="admin-reports-heading">
        <h2 id="admin-reports-heading" className="mb-4 text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          🚩 Pending Reports{reportsQuery.isSuccess ? ` (${reports.length})` : ''}
        </h2>
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {reportsQuery.isLoading ? (
            <AdminSectionLoading label="Loading reports…" />
          ) : reportsQuery.isError ? (
            <AdminSectionError
              message="Reports could not be loaded."
              onRetry={() => void reportsQuery.refetch()}
            />
          ) : reports.length > 0 ? (
            reports.map((r: Report) => (
              <div key={r.id} className="rounded-xl border p-3" style={{ borderColor: 'var(--border-primary)' }}>
                <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{r.reason}</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{timeAgo(r.createdAt)}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => handleReport(r.id, 'reviewed')} className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500 transition-colors hover:bg-emerald-500/20">Accept</button>
                  <button onClick={() => handleReport(r.id, 'dismissed')} className="rounded-lg bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-500/20">Dismiss</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No pending reports 🎉</p>
          )}
        </div>
      </section>

      <section className="card min-w-0 p-5" aria-labelledby="admin-reviews-heading">
        <h2 id="admin-reviews-heading" className="mb-4 text-base font-bold" style={{ color: 'var(--text-primary)' }}>📝 Recent Reviews</h2>
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {reviewsQuery.isLoading ? (
            <AdminSectionLoading label="Loading reviews…" />
          ) : reviewsQuery.isError ? (
            <AdminSectionError
              message="Reviews could not be loaded."
              onRetry={() => void reviewsQuery.refetch()}
            />
          ) : reviews.length > 0 ? (
            reviews.map((r: Review) => (
              <div key={r.id} className={`rounded-xl border p-3 ${r.isHidden ? 'opacity-50' : ''}`} style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.userName}</p>
                    <StarRating value={r.rating} size="sm" />
                  </div>
                  <div className="flex flex-wrap gap-1 sm:justify-end">
                    <button onClick={() => handleHideReview(r.id, r.isHidden)} className="rounded px-2 py-1 text-xs font-medium transition-colors hover:bg-surface-100 dark:hover:bg-surface-700" style={{ color: 'var(--text-secondary)' }}>
                      {r.isHidden ? '👁️ Show' : '🙈 Hide'}
                    </button>
                    <button onClick={() => handleFeature(r.id, r.isFeatured)} className="rounded px-2 py-1 text-xs font-medium transition-colors hover:bg-surface-100 dark:hover:bg-surface-700" style={{ color: 'var(--text-secondary)' }}>
                      {r.isFeatured ? '⭐ Unfeature' : '⭐ Feature'}
                    </button>
                  </div>
                </div>
                <p className="mt-1 truncate text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.content}</p>
              </div>
            ))
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No reviews yet.</p>
          )}
        </div>
      </section>

      <section className="card min-w-0 p-5 lg:col-span-2" aria-labelledby="admin-users-heading">
        <h2 id="admin-users-heading" className="mb-4 text-base font-bold" style={{ color: 'var(--text-primary)' }}>👥 Users</h2>
        {usersQuery.isLoading ? (
          <AdminSectionLoading label="Loading users…" />
        ) : usersQuery.isError ? (
          <AdminSectionError
            message="Users could not be loaded."
            onRetry={() => void usersQuery.refetch()}
          />
        ) : users.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No users found.</p>
        ) : (
          <div className="max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr style={{ color: 'var(--text-tertiary)' }}>
                  <th className="py-2 text-left font-medium">Name</th>
                  <th className="py-2 text-left font-medium">Role</th>
                  <th className="py-2 text-left font-medium">Reviews</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid} className="border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                    <td className="py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{u.displayName}</td>
                    <td className="py-2"><span className="rounded bg-surface-100 px-2 py-0.5 text-xs font-medium dark:bg-surface-700" style={{ color: 'var(--text-secondary)' }}>{u.role}</span></td>
                    <td className="py-2" style={{ color: 'var(--text-secondary)' }}>{u.reviewCount}</td>
                    <td className="py-2">{u.isBanned ? <span className="text-xs text-rose-500">Banned</span> : <span className="text-xs text-emerald-500">Active</span>}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => handleBan(u.uid, u.isBanned)} className="text-xs font-medium text-rose-500 transition-colors hover:text-rose-600">
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function AdminSectionLoading({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4" role="status" aria-live="polite">
      <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function AdminSectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4" role="alert">
      <p className="text-sm font-medium text-[var(--text-primary)]">{message}</p>
      <button type="button" onClick={onRetry} className="secondary-action mt-3">Retry</button>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  error,
  icon,
}: {
  label: string;
  value?: number;
  loading: boolean;
  error: boolean;
  icon: string;
}) {
  return (
    <div className="card p-5 text-center">
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      {loading ? (
        <div className="mx-auto mt-2 h-8 w-12 skeleton" role="status" aria-label={`${label} loading`} />
      ) : error ? (
        <p className="mt-2 text-sm font-semibold text-rose-500">Unavailable</p>
      ) : (
        <p className="mt-2 bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-2xl font-bold text-transparent">{value ?? 0}</p>
      )}
      <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
    </div>
  );
}
