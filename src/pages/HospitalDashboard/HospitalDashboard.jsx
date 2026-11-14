
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { hospitalAPI } from '../../services/api';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  Building2,
  Droplet,
  Clock,
  AlertTriangle,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  Calendar,
  Phone,
  RefreshCw
} from 'lucide-react';

// Safely read fields with either camelCase or snake_case names.
const getField = (object, ...keys) => {
  if (!object) return undefined;

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null
    ) {
      return object[key];
    }
  }

  return undefined;
};

// Handle common API response wrappers.
const extractDashboard = (response) => {
  let payload = response?.data ?? response;

  for (let i = 0; i < 4; i += 1) {
    if (!payload || typeof payload !== 'object') break;

    if (payload.summary || payload.bloodGroups || payload.blood_groups) {
      return payload;
    }

    if (payload.data && typeof payload.data === 'object') {
      payload = payload.data;
      continue;
    }

    if (payload.dashboard && typeof payload.dashboard === 'object') {
      payload = payload.dashboard;
      continue;
    }

    break;
  }

  return payload || {};
};

const formatDate = (value) => {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatHours = (value) => {
  const hours = Number(value);

  if (!Number.isFinite(hours)) return 'Not available';

  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes ago`;
  }

  return `${hours} hours ago`;
};

const getStockStatus = (units) => {
  if (units <= 0) return 'Out of Stock';
  if (units <= 4) return 'Low Stock';
  return 'Available';
};

const normalizeBloodGroup = (item) => {
  const available = Number(
    getField(item, 'availableUnits', 'available_units') ?? 0
  );

  const reserved = Number(
    getField(item, 'reservedUnits', 'reserved_units') ?? 0
  );

  const expired = Number(
    getField(item, 'expiredUnits', 'expired_units') ?? 0
  );

  const group = getField(item, 'bloodGroup', 'blood_group');

  return {
    id: item.id || group,
    blood_group: group || 'Unknown',
    available_units: available,
    reserved_units: reserved,
    expired_units: expired,
    last_updated_at: getField(
      item,
      'lastUpdated',
      'last_updated_at'
    ),
    status: getStockStatus(available)
  };
};

const normalizeDonation = (item) => {
  const donor = item.donor || {};

  return {
    id: item.id,

    donor_name:
      getField(item, 'donorName', 'donor_name', 'full_name') ||
      donor.full_name ||
      'Unknown Donor',

    blood_group:
      getField(
        item,
        'donorBloodGroup',
        'donor_blood_group',
        'bloodGroup',
        'blood_group'
      ) ||
      donor.blood_group ||
      'Unknown',

    units: Number(item.units || 0),

    donation_date: getField(
      item,
      'donationDate',
      'donation_date',
      'date'
    ),

    verified_by_rep:
      getField(item, 'verifiedBy', 'verified_by', 'verified_by_rep') ||
      'Hospital Staff',

    donor_mobile:
      getField(
        item,
        'donorPhone',
        'donor_phone',
        'donor_mobile',
        'phone'
      ) ||
      donor.phone ||
      'Not provided',

    status:
      getField(
        item,
        'donationStatus',
        'donation_status',
        'status'
      ) || 'VERIFIED'
  };
};

const HospitalDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [frequency, setFrequency] = useState(24);
  const [updatingFreq, setUpdatingFreq] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const response = await hospitalAPI.getDashboardStats();
      const payload = extractDashboard(response);

      if (!payload || !payload.summary) {
        throw new Error('The dashboard response is incomplete.');
      }

      const summary = payload.summary || {};

      const groupsSource =
        payload.bloodGroups ||
        payload.blood_groups ||
        [];

      const donationsSource =
        payload.recentDonations ||
        payload.recent_donations ||
        [];

      const groups = Array.isArray(groupsSource)
        ? groupsSource.map(normalizeBloodGroup)
        : [];

      const donations = Array.isArray(donationsSource)
        ? donationsSource.map(normalizeDonation)
        : [];

      const availableTotal = groups.reduce(
        (sum, item) => sum + item.available_units,
        0
      );

      const reservedTotal = groups.reduce(
        (sum, item) => sum + item.reserved_units,
        0
      );

      const expiredTotal = groups.reduce(
        (sum, item) => sum + item.expired_units,
        0
      );

      const lowStockCount = groups.filter(
        (item) => item.available_units < 5
      ).length;

      const hoursSinceUpdate = getField(
        summary,
        'lastUpdatedHoursAgo',
        'hoursSinceUpdate',
        'hours_since_update'
      );

      const normalizedSummary = {
        ...summary,

        hospitalName: getField(
          summary,
          'hospitalName',
          'hospital_name'
        ),

        totalAvailable: Number(
          getField(
            summary,
            'totalAvailable',
            'totalAvailableUnits',
            'total_available_units',
            'totalUnits',
            'total_units'
          ) ?? availableTotal
        ),

        totalReserved: Number(
          getField(
            summary,
            'totalReserved',
            'totalReservedUnits',
            'total_reserved_units'
          ) ?? reservedTotal
        ),

        totalExpired: Number(
          getField(
            summary,
            'totalExpired',
            'totalExpiredUnits',
            'total_expired_units'
          ) ?? expiredTotal
        ),

        lowStockCount: lowStockCount,

        pendingRequestsCount: Number(
          getField(
            summary,
            'pendingRequestsCount',
            'pending_requests_count'
          ) ?? 0
        ),

        isOverdue: Boolean(summary.isOverdue),

        hoursSinceUpdate
      };

      setDashboardData({
        ...payload,
        summary: normalizedSummary,
        bloodGroups: groups,
        recentDonations: donations,
        reminderInfo:
          payload.reminderInfo ||
          payload.reminder_info ||
          {}
      });

      const reminderFrequency = getField(
        payload.reminderInfo || payload.reminder_info,
        'frequencyHours',
        'frequency_hours'
      );

      if (reminderFrequency) {
        setFrequency(Number(reminderFrequency));
      }
    } catch (error) {
      console.error('Hospital dashboard loading error:', error);

      setLoadError(
        error.response?.data?.message ||
        error.message ||
        'Unable to load hospital dashboard.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateFrequency = async (newFrequency) => {
    setUpdatingFreq(true);

    try {
      await hospitalAPI.updateReminderFrequency({
        frequencyHours: newFrequency
      });

      setFrequency(newFrequency);

      showToast(
        `Reminder frequency set to every ${newFrequency} hours.`,
        'success'
      );

      await loadData();
    } catch (error) {
      console.error('Reminder update error:', error);

      showToast(
        error.response?.data?.message ||
          'Failed to update reminder frequency.',
        'error'
      );
    } finally {
      setUpdatingFreq(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (loadError && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-center gap-3 text-rose-700">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="font-bold text-lg">
              Dashboard could not be loaded
            </h2>
          </div>

          <p className="text-sm text-rose-700 mt-3">
            {loadError}
          </p>

          <button
            onClick={loadData}
            className="mt-5 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const {
    summary = {},
    bloodGroups = [],
    lowStockAlerts = [],
    reminderInfo = {},
    recentDonations = []
  } = dashboardData || {};

  const isVerified =
    user?.isVerified ||
    user?.verificationStatus === 'APPROVED' ||
    user?.verification_status === 'APPROVED';

  const hospitalName =
    user?.name ||
    summary.hospitalName ||
    'Hospital Dashboard';

  const lowStockCount = bloodGroups.filter(
    (group) => group.available_units < 5
  ).length;

  const lastUpdatedText =
    summary.hoursSinceUpdate !== undefined &&
    summary.hoursSinceUpdate !== null
      ? formatHours(summary.hoursSinceUpdate)
      : 'Not available';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* OVERDUE REMINDER BANNER */}
      {summary.isOverdue && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 text-white shadow-xl border border-rose-400 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-extrabold uppercase mb-1">
                Status: {reminderInfo.status || 'Update overdue'}
              </div>

              <h3 className="text-xl font-black">
                Hospital Blood Inventory Update Overdue!
              </h3>

              <p className="text-xs text-rose-100 max-w-xl mt-1 leading-relaxed">
                Your inventory was last updated{' '}
                <strong>{lastUpdatedText}</strong>.
                Your reminder schedule is every{' '}
                {reminderInfo.frequency_hours || frequency} hours.
              </p>
            </div>
          </div>

          <Link
            to="/hospital/inventory"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-rose-700 text-sm font-black shadow-lg"
          >
            Update Blood Inventory Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* HOSPITAL PROFILE HEADER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal to-emerald-700 text-white flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-primary-navy">
                  {hospitalName}
                </h1>

                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">
                    Pending Verification
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-1">
                License:{' '}
                <strong className="text-slate-800">
                  {user?.licenseNumber || user?.registrationNumber || 'Not available'}
                </strong>
                {' '}• Representative:{' '}
                {user?.representativeName || 'Not available'}
                {' '}• PIN:{' '}
                {user?.pinCode || 'Not available'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/hospital/verify-donation"
              className="btn-teal px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Verify New Donation
            </Link>

            <Link
              to="/hospital/inventory"
              className="btn-primary px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md"
            >
              Manage Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* AVAILABLE UNITS */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Available Units
            </span>
            <Droplet className="w-5 h-5 text-rose-600 fill-rose-600" />
          </div>

          <div className="text-3xl font-black text-primary-navy">
            {summary.totalAvailable}
          </div>

          <div className="text-xs text-slate-500 mt-1">
            {summary.totalReserved} reserved • {summary.totalExpired} expired
          </div>

          <div className="mt-4 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
            Across {bloodGroups.length} Blood Groups
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>

          <div className="text-3xl font-black text-amber-600">
            {lowStockCount}
          </div>

          <div className="text-xs text-slate-500 mt-1">
            Blood groups with fewer than 5 units
          </div>

          <div className="mt-4 pt-2 border-t border-slate-100 text-xs font-semibold text-amber-700">
            {lowStockCount > 0
              ? 'Requires donor procurement'
              : 'All stocks adequate'}
          </div>
        </div>

        {/* REQUESTS */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Blood Requests
            </span>
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>

          <div className="text-3xl font-black text-primary-navy">
            {summary.pendingRequestsCount}
          </div>

          <div className="text-xs text-slate-500 mt-1">
            Total requests received by this hospital
          </div>

          <div className="mt-4 pt-2 border-t border-slate-100">
            <Link
              to="/requests"
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              View Request Queue →
            </Link>
          </div>
        </div>

        {/* REMINDER */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Reminder Status
            </span>
            <Clock className="w-5 h-5 text-teal" />
          </div>

          <div className="text-lg font-black text-slate-900">
            {summary.isOverdue ? (
              <span className="text-rose-600">Update Overdue</span>
            ) : (
              <span className="text-emerald-700">Up to Date</span>
            )}
          </div>

          <div className="text-xs text-slate-500 mt-1">
            Last updated: {lastUpdatedText}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Frequency:</span>

            <select
              value={frequency}
              disabled={updatingFreq}
              onChange={(event) =>
                handleUpdateFrequency(
                  parseInt(event.target.value, 10)
                )
              }
              className="px-2 py-1 rounded-md border border-slate-300 font-bold text-slate-800 bg-white"
            >
              <option value={12}>Every 12h</option>
              <option value={24}>Every 24h</option>
              <option value={48}>Every 48h</option>
            </select>
          </div>
        </div>
      </div>

      {/* BLOOD STOCK INVENTORY */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h3 className="text-xl font-black text-primary-navy">
              Live Blood Stock Inventory
            </h3>
            <p className="text-xs text-slate-500">
              Real-time availability declared by this facility.
            </p>
          </div>

          <Link
            to="/hospital/inventory"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            Edit All Units
          </Link>
        </div>

        {bloodGroups.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {bloodGroups.map((group) => (
              <div
                key={group.id || group.blood_group}
                className={`p-4 rounded-2xl border text-center transition ${
                  group.available_units === 0
                    ? 'bg-rose-50/60 border-rose-200'
                    : group.available_units <= 4
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="text-lg font-black text-slate-900">
                  {group.blood_group}
                </div>

                <div className="text-2xl font-black my-1 text-primary-navy">
                  {group.available_units}
                </div>

                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    group.available_units === 0
                      ? 'text-rose-600'
                      : group.available_units <= 4
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {group.status}
                </div>

                <div className="text-[10px] text-slate-500 mt-2 pt-1 border-t border-slate-100">
                  Reserved: {group.reserved_units}
                </div>

                <div className="text-[10px] text-slate-400 mt-1">
                  Expired: {group.expired_units}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-slate-500">
            No blood inventory records found.
            <div className="mt-3">
              <Link
                to="/hospital/inventory"
                className="text-teal-700 font-bold hover:underline"
              >
                Manage Blood Inventory
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* RECENT VERIFIED DONATIONS */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div>
            <h3 className="text-xl font-black text-primary-navy">
              Recent Verified Donor Donations
            </h3>

            <p className="text-xs text-slate-500">
              Voluntary donations logged and validated at this facility.
            </p>
          </div>

          <Link
            to="/hospital/verify-donation"
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            + Record New Donation →
          </Link>
        </div>

        {recentDonations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Donor Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Verified By</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentDonations.map((donation) => (
                  <tr
                    key={donation.id}
                    className="hover:bg-slate-50/50 transition"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {donation.donor_name}
                    </td>

                    <td className="py-3.5 px-4">
                      <BloodGroupBadge
                        group={donation.blood_group}
                        size="sm"
                      />
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {donation.units} unit(s)
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(donation.donation_date)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {donation.verified_by_rep}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {donation.donor_mobile}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No verified donations recorded yet at this facility.
            Click "Verify New Donation" to record a donation.
          </div>
        )}
      </div>

      {/* REFRESH */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Dashboard
        </button>
      </div>

    </div>
  );
};

export default HospitalDashboard;
