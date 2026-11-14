
import React, { useEffect, useMemo, useState } from 'react';
import { donorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  Trophy, Star, ShieldCheck, Heart, Sparkles,
  Award, Users, CheckCircle2
} from 'lucide-react';

const DONOR_TIERS = [
  { name: 'Beginner', min: 0, max: 99, badge: '🌱', desc: 'Welcome to the donor community.' },
  { name: 'Bronze Donor', min: 100, max: 299, badge: '🥉', desc: 'Your first verified donation milestone.' },
  { name: 'Silver Donor', min: 300, max: 599, badge: '🥈', desc: 'Recognized for continued contributions.' },
  { name: 'Gold Donor', min: 600, max: 999, badge: '🥇', desc: 'An outstanding community contribution.' },
  { name: 'Platinum Donor', min: 1000, max: Infinity, badge: '🏆', desc: 'Exceptional humanitarian recognition.' },
];

const DEMO_HISTORY = [
  {
    id: 'demo-1',
    reason: 'DONATION_VERIFIED',
    points_awarded: 100,
    created_at: new Date().toISOString(),
    hospital_name: 'Apollo Demo Blood Center',
  },
];

const DEMO_LEADERBOARD = [
  { rank: 1, name: 'Priya Nair', bloodGroup: 'O+', city: 'New Delhi', totalPoints: 300, verifiedDonations: 3 },
  { rank: 2, name: 'Rahul Sharma', bloodGroup: 'A+', city: 'New Delhi', totalPoints: 200, verifiedDonations: 2 },
  { rank: 3, name: 'Ananya Patel', bloodGroup: 'B+', city: 'Mumbai', totalPoints: 100, verifiedDonations: 1 },
];

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

const formatReason = (item) => {
  const value =
    item?.reason ||
    item?.transaction_type ||
    item?.description ||
    'Reward earned';

  return String(value)
    .replace(/\[BDC-DEMO-ACTIVITY\]/g, '')
    .replace(/_/g, ' ')
    .trim() || 'Reward earned';
};

const getTier = (points) =>
  DONOR_TIERS.slice().reverse().find((tier) => points >= tier.min) ||
  DONOR_TIERS[0];

const DonorPoints = () => {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPoints = async () => {
      try {
        const response = await donorAPI.getPointsAndRewards();

        // Support both normal Axios responses and unwrapped API responses.
        const payload = response?.data?.data ?? response?.data ?? response ?? {};

        if (active) {
          setData(payload);
          setApiError(false);
        }
      } catch (error) {
        console.error('Rewards API error:', error);

        if (active) {
          setApiError(true);
          setData(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPoints();

    return () => {
      active = false;
    };
  }, []);

  const userPoints = data?.userPoints ?? {};
  const history = Array.isArray(userPoints.history)
    ? userPoints.history
    : Array.isArray(data?.history)
      ? data.history
      : [];

  const leaderboard = Array.isArray(data?.leaderboard)
    ? data.leaderboard
    : [];

  const totalPoints = useMemo(() => {
    const suppliedTotal = userPoints.totalPoints ?? userPoints.total_points;

    if (suppliedTotal !== undefined && suppliedTotal !== null) {
      return safeNumber(suppliedTotal);
    }

    return history.reduce(
      (total, item) =>
        total + safeNumber(item?.points_awarded ?? item?.points),
      0,
    );
  }, [userPoints, history]);

  const tier = getTier(totalPoints);
  const nextTier = DONOR_TIERS.find((item) => item.min > totalPoints);
  const progress = nextTier
    ? Math.min(100, (totalPoints / nextTier.min) * 100)
    : 100;

  const pointsNeeded = nextTier
    ? Math.max(0, nextTier.min - totalPoints)
    : 0;

  const verifiedDonations = safeNumber(
    userPoints.verifiedDonations ??
    userPoints.verified_donations ??
    history.filter((item) =>
      String(item?.transaction_type || item?.reason || '')
        .toUpperCase()
        .includes('DONATION')
    ).length,
  );

  const displayHistory = history.length
    ? history
    : apiError
      ? DEMO_HISTORY
      : [];

  const displayLeaderboard = leaderboard.length
    ? leaderboard
    : apiError
      ? DEMO_LEADERBOARD
      : [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4" />
          Gamified Donor Recognition
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-primary-navy">
          Donor Points, Levels & Leaderboard
        </h1>

        <p className="text-sm text-slate-600 max-w-xl mt-2">
          Every verified donation can earn 100 reward points.
          Progress through donor tiers and celebrate your contribution.
        </p>
      </div>

      {apiError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Rewards could not be loaded from the server. The information below
          is a sample demo preview and is not your verified account balance.
        </div>
      )}

      {/* Points summary */}
      <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-primary-navy via-slate-900 to-dark-navy text-white shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              Current Rank: {tier.name}
            </div>

            <div className="text-5xl font-black">
              {apiError ? 'Demo' : totalPoints}
              <span className="text-2xl text-slate-300 ml-2">Points</span>
            </div>

            <p className="text-xs text-slate-300">
              Points are credited after hospital verification. Eligibility
              and medical guidance always take priority.
            </p>

            <div className="pt-3 max-w-md space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>
                  {nextTier ? `Next: ${nextTier.name}` : 'Highest tier achieved'}
                </span>
                <span>
                  {nextTier ? `${pointsNeeded} points needed` : '100%'}
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <div className="p-7 rounded-2xl bg-white/10 border border-white/20 text-center w-full max-w-xs space-y-3">
              <div className="text-5xl">{tier.badge}</div>
              <div className="font-black text-xl">{tier.name}</div>
              <div className="text-xs text-slate-300">{tier.desc}</div>
            </div>
          </div>

        </div>
      </section>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <Star className="text-amber-500 mb-3" />
          <p className="text-sm text-slate-500">Total Reward Points</p>
          <p className="text-3xl font-black text-slate-900">
            {apiError ? 'Preview' : totalPoints}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <Heart className="text-red-500 mb-3" />
          <p className="text-sm text-slate-500">Verified Donations</p>
          <p className="text-3xl font-black text-slate-900">
            {apiError ? 'Preview' : verifiedDonations}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <ShieldCheck className="text-emerald-500 mb-3" />
          <p className="text-sm text-slate-500">Current Donor Level</p>
          <p className="text-xl font-black text-slate-900">{tier.name}</p>
        </div>
      </div>

      {/* Tiers */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-primary-navy mb-5">
          Honor Tiers & Milestone Progression
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {DONOR_TIERS.map((item) => {
            const isCurrent = tier.name === item.name;

            return (
              <div
                key={item.name}
                className={`p-5 rounded-2xl border ${
                  isCurrent
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-3xl mb-2">{item.badge}</div>
                <div className="font-black text-slate-900 text-sm">{item.name}</div>
                <div className="text-xs font-bold text-amber-700 mt-1">
                  {item.min === 1000
                    ? '1000+ Points'
                    : `${item.min}–${item.max} Points`}
                </div>
                <p className="text-xs text-slate-500 mt-2">{item.desc}</p>

                {isCurrent && (
                  <div className="mt-3 text-xs font-bold text-amber-800">
                    <CheckCircle2 className="inline w-4 h-4 mr-1" />
                    Current tier
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Leaderboard and history */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <section className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black text-primary-navy">
              Top Community Donors
            </h2>
          </div>

          {displayLeaderboard.length > 0 ? (
            <div className="space-y-3">
              {displayLeaderboard.map((donor, index) => (
                <div
                  key={donor.id || donor.rank || index}
                  className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                      #{donor.rank || index + 1}
                    </div>

                    <div>
                      <p className="font-bold text-sm text-slate-900">
                        {donor.name || donor.full_name || 'Demo Donor'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {donor.bloodGroup || donor.blood_group || 'N/A'}
                        {' • '}
                        {donor.city || 'City unavailable'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-primary-navy">
                      {safeNumber(donor.totalPoints ?? donor.total_points)} pts
                    </p>
                    <p className="text-xs text-slate-500">
                      {safeNumber(donor.verifiedDonations ?? donor.verified_donations)} donations
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">
              No leaderboard entries available yet.
            </p>
          )}

          {apiError && (
            <p className="text-xs text-amber-700 mt-4">
              Sample leaderboard shown for demonstration only.
            </p>
          )}
        </section>

        <section className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-primary-navy mb-5">
            Points Activity Log
          </h2>

          {displayHistory.length > 0 ? (
            <div className="space-y-3">
              {displayHistory.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 capitalize">
                      {formatReason(item)}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(item.created_at || item.createdAt)}
                    </p>

                    {(item.hospital_name || item.hospital?.hospital_name) && (
                      <p className="text-xs text-slate-500 mt-1">
                        {item.hospital_name || item.hospital?.hospital_name}
                      </p>
                    )}
                  </div>

                  <div className="text-sm font-black text-emerald-600 whitespace-nowrap">
                    +{safeNumber(item.points_awarded ?? item.points)} pts
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                No reward transactions available yet.
              </p>
            </div>
          )}

          {apiError && (
            <p className="text-xs text-amber-700 mt-4">
              Sample activity shown for demonstration only.
            </p>
          )}
        </section>

      </div>

      <div className="text-xs text-slate-500 flex items-center gap-2">
        <Users className="w-4 h-4" />
        {user?.full_name || user?.name || 'Welcome, Donor'} — Thank you for supporting your community.
      </div>

    </div>
  );
};

export default DonorPoints;
