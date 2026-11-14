import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { donorAPI, authAPI } from '../../services/api';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import {
  User, Award, Droplet, Calendar, ShieldCheck, Heart, MapPin,
  FileText, ArrowRight, Edit3, CheckCircle2, AlertCircle, Clock,
  Bell, Activity, Info, ExternalLink, Sparkles
} from 'lucide-react';

const UserDashboard = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [togglingReminder, setTogglingReminder] = useState(false);
  const [testingReminder, setTestingReminder] = useState(false);
  const [selectedModalityTab, setSelectedModalityTab] = useState('whole_blood');
  const [editForm, setEditForm] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    emergencyContact: ''
  });

  const loadData = () => {
    setLoading(true);
    donorAPI.getDashboard()
      .then(res => {
        setDashboardData(res.data);
        if (res.data.profile) {
          setEditForm({
            fullName: res.data.profile.fullName || '',
            gender: res.data.profile.gender || 'Female',
            address: res.data.profile.address || '',
            city: res.data.profile.city || '',
            state: res.data.profile.state || '',
            pinCode: res.data.profile.pinCode || '',
            emergencyContact: res.data.profile.emergencyContact || ''
          });
        }
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateProfile(editForm);
      showToast('Profile updated successfully.', 'success');
      setIsEditing(false);
      refreshUser();
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Profile update failed.', 'error');
    }
  };

  const handleToggleReminder = async () => {
    setTogglingReminder(true);
    const newStatus = !dashboardData?.stats?.eligibilityReminderEnabled;
    try {
      await donorAPI.toggleReminderPreference(newStatus);
      showToast(
        newStatus
          ? 'Automatic eligibility reminders enabled! You will be notified when your safe interval arrives.'
          : 'Automatic eligibility reminders paused.',
        'success'
      );
      loadData();
    } catch (err) {
      showToast('Failed to update reminder settings.', 'error');
    } finally {
      setTogglingReminder(false);
    }
  };

  const handleTriggerTestReminder = async () => {
    setTestingReminder(true);
    try {
      await donorAPI.triggerTestReminder();
      showToast('Official MoHFW 2025 eligibility alert dispatched to your in-app notifications and email!', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to dispatch test reminder.', 'error');
    } finally {
      setTestingReminder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  const { profile, stats, recentDonations, rewards, certificates, matchingRequests } = dashboardData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-navy to-slate-800 text-white flex items-center justify-center text-2xl font-black shadow-lg">
              {profile?.fullName?.charAt(0) || 'D'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-primary-navy">
                  {profile?.fullName}
                </h1>
                <BloodGroupBadge group={profile?.bloodGroup} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>{profile?.email}</span> • <span>PIN: {profile?.pinCode}</span> • <span>{profile?.city}, {profile?.state}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <Link
              to="/find-blood"
              className="px-5 py-2.5 rounded-xl bg-crimson-red hover:bg-dark-crimson text-white text-xs font-bold shadow-md shadow-rose-900/10 transition"
            >
              Find Blood Availability
            </Link>
          </div>
        </div>

        {/* Profile Edit Modal / Drawer */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender (MoHFW 2025 Interval)</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-white font-bold"
              >
                <option value="Male">Male (90-Day Whole Blood Interval)</option>
                <option value="Female">Female (120-Day Whole Blood Interval)</option>
                <option value="Other">Other (120-Day Safe Interval)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                required
                value={editForm.state}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={editForm.pinCode}
                onChange={(e) => setEditForm({ ...editForm, pinCode: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="tel"
                value={editForm.emergencyContact}
                onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-teal text-white text-xs font-bold hover:bg-teal-700 transition"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Points & Level */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Donor Level</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-primary-navy">{stats?.donorLevel}</div>
          <div className="text-xs text-slate-600 mt-1">
            <strong>{stats?.totalPoints}</strong> Total Lifetime Points
          </div>
          {/* Progress bar to next level */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>{stats?.progressPercent}% to {stats?.nextLevel}</span>
              <span>{stats?.pointsToNextLevel} pts left</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${stats?.progressPercent || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Verified Donations */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Donations</span>
            <Droplet className="w-5 h-5 text-crimson-red fill-crimson-red" />
          </div>
          <div className="text-3xl font-black text-primary-navy">{stats?.verifiedDonations}</div>
          <div className="text-xs text-slate-500 mt-1">
            Directly verified by hospital blood banks
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> ~{stats?.verifiedDonations * 3} Potential Lives Saved
          </div>
        </div>

        {/* Last Donation Date */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Donation</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-xl font-black text-primary-navy">
            {stats?.lastDonationDate || 'No Prior Records'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {stats?.lastDonationDate ? 'Hospital certified record' : 'Awaiting first verified donation'}
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
            Certified Interval Tracking
          </div>
        </div>

        {/* Next Eligible Donation Date */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligibility Status</span>
            <Clock className="w-5 h-5 text-teal" />
          </div>
          {stats?.isEligibleNow ? (
            <div>
              <div className="text-lg font-black text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5" /> Eligible to Donate
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {profile?.gender === 'Female' ? '120-day' : '90-day'} whole blood interval completed.
              </p>
            </div>
          ) : (
            <div>
              <div className="text-lg font-black text-amber-600">
                In {stats?.daysUntilEligible} Days
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Next eligible: <strong className="text-slate-800">{stats?.nextEligibleDate}</strong> ({profile?.gender === 'Female' ? '120d interval' : '90d interval'})
              </p>
            </div>
          )}
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>MoHFW 2025 Rules</span>
            <span className="text-teal-700 font-bold">{profile?.gender || 'Donor'}</span>
          </div>
        </div>

      </div>

      {/* SECTION: INDIA 2025 MOHFW / ERAKTKOSH DONOR ELIGIBILITY & COUNTDOWN CENTER */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/90 shadow-xl relative overflow-hidden">
        
        {/* Top Header Row with Government Guidelines Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#D7263D] text-xs font-black uppercase tracking-wider mb-2">
              <Activity className="w-4 h-4" />
              India MoHFW / eRaktkosh 2025 Guidelines
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#102A43] tracking-tight">
              Donor Eligibility & Automatic Reminder Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
              Personalized recovery tracking adhering to India's Ministry of Health and Family Welfare guidelines. Male donors: 90 days (every 3 months); Female donors: 120 days (every 4 months); Platelet apheresis: 48h / 28d post-WB.
            </p>
          </div>

          {/* Donor Profile Tag & Reminder Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleReminder}
              disabled={togglingReminder}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                stats?.eligibilityReminderEnabled
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
              title="Toggle automatic email alerts on eligibility date"
            >
              <Bell className={`w-4 h-4 ${stats?.eligibilityReminderEnabled ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'}`} />
              {stats?.eligibilityReminderEnabled ? 'Eligibility Reminders: Active' : 'Enable Reminders'}
            </button>

            <button
              onClick={handleTriggerTestReminder}
              disabled={testingReminder}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              title="Test the eligibility reminder notification system"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {testingReminder ? 'Sending...' : 'Test Reminder'}
            </button>
          </div>
        </div>

        {/* Modality Selector Tabs */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mb-6">
          <button
            onClick={() => setSelectedModalityTab('whole_blood')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              selectedModalityTab === 'whole_blood'
                ? 'bg-[#102A43] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            Whole Blood (Male: 90d / Female: 120d)
          </button>
          <button
            onClick={() => setSelectedModalityTab('platelet_apheresis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              selectedModalityTab === 'platelet_apheresis'
                ? 'bg-[#102A43] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            Platelet Apheresis (48h / 28d post-WB)
          </button>
        </div>

        {/* Tab 1: Whole Blood Details */}
        {selectedModalityTab === 'whole_blood' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            {/* Left Col: Live Countdown & Status (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Modality</span>
                  <h3 className="text-xl font-black text-primary-navy">Whole Blood Donation</h3>
                </div>
                {stats?.eligibility?.wholeBlood?.isEligible ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Eligible to Donate Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-300">
                    <Clock className="w-4 h-4 text-amber-600" /> Safe Interval in Progress
                  </span>
                )}
              </div>

              {/* Countdown Metric or Ready Banner */}
              {stats?.eligibility?.wholeBlood?.isEligible ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 font-black text-xl shadow-md">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-900">Your Full Recovery Interval is Complete</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      You meet the recommended gap ({stats?.eligibility?.wholeBlood?.intervalDescription}) from your last donation on <strong>{stats?.lastDonationDate || 'Record initial'}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#102A43] text-white space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                    <span>Recovery Interval Progress</span>
                    <span>{stats?.eligibility?.wholeBlood?.progressPercent || 0}% Complete</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full transition-all duration-500"
                      style={{ width: `${stats?.eligibility?.wholeBlood?.progressPercent || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[11px] text-slate-400">Next Safe Donation Date</span>
                      <div className="text-base font-black text-white">{stats?.eligibility?.wholeBlood?.nextEligibleDate}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Countdown Remaining</span>
                      <div className="text-2xl font-black text-amber-400">{stats?.eligibility?.wholeBlood?.daysRemaining} Day(s)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Protocol Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Donor Gender</span>
                  <strong className="text-slate-800 text-sm font-black">{profile?.gender || 'Not Specified'}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Mandatory Gap</span>
                  <strong className="text-slate-800 text-sm font-black">
                    {stats?.eligibility?.wholeBlood?.intervalDescription || (profile?.gender === 'Female' ? '120 Days' : '90 Days')}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Annual Cap</span>
                  <strong className="text-slate-800 text-sm font-black">
                    {profile?.gender === 'Female' ? 'Max 3 times/yr' : 'Max 4 times/yr'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Right Col: Hospital Screening Protocol (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Pre-Donation Protocol</span>
                <h3 className="text-base font-black text-primary-navy">Hospital Clinical Screening</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The blood bank conducts physical verification before collection:
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/70">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Hemoglobin (Hb):</strong> Minimum <strong>12.5 g/dL</strong> (copper sulfate or hemoglobinometer test).
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/70">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Body Weight:</strong> Minimum <strong>45 kg</strong> for 350 mL / <strong>55 kg</strong> for 450 mL.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/70">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Blood Pressure:</strong> Systolic 100–140 mmHg, Diastolic 60–90 mmHg, resting pulse 60–100 bpm.
                  </div>
                </div>
              </div>

              <Link
                to="/find-blood"
                className="btn-primary w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md"
              >
                Find Accredited Blood Banks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: Platelet Apheresis Details */}
        {selectedModalityTab === 'platelet_apheresis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Modality</span>
                  <h3 className="text-xl font-black text-primary-navy">Single Platelet Apheresis</h3>
                </div>
                {stats?.eligibility?.plateletApheresis?.isEligible ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Eligible for Apheresis
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-300">
                    <Clock className="w-4 h-4 text-amber-600" /> Recovery Active
                  </span>
                )}
              </div>

              {stats?.eligibility?.plateletApheresis?.isEligible ? (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal text-white flex items-center justify-center shrink-0 font-black text-xl shadow-md">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-teal-900">Platelet Apheresis Safe Interval Met</h4>
                    <p className="text-xs text-teal-800 mt-0.5">
                      You meet India's requirement ({stats?.eligibility?.plateletApheresis?.intervalDescription}). Platelet apheresis directly supports dengue and oncology patients.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950 text-white space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                    <span>Apheresis Recovery Progress</span>
                    <span>{stats?.eligibility?.plateletApheresis?.progressPercent || 0}% Complete</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${stats?.eligibility?.plateletApheresis?.progressPercent || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[11px] text-slate-400">Next Apheresis Date</span>
                      <div className="text-base font-black text-white">{stats?.eligibility?.plateletApheresis?.nextEligibleDate}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Countdown Remaining</span>
                      <div className="text-2xl font-black text-teal-300">{stats?.eligibility?.plateletApheresis?.daysRemaining} Day(s)</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Between Sessions</span>
                  <strong className="text-slate-800 text-sm font-black">Min 48 Hours</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Post Whole Blood</span>
                  <strong className="text-slate-800 text-sm font-black">Min 28 Days</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Max Frequency</span>
                  <strong className="text-slate-800 text-sm font-black">Max 24 times/yr</strong>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Apheresis Criteria</span>
                <h3 className="text-base font-black text-slate-900">Platelet Pre-Screening</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Platelet apheresis requires specific pre-screening metrics:
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-teal-200/70">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Minimum Platelet Count:</strong> ≥ 150,000 / µL prior to cell separator procedure.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-teal-200/70">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Body Weight:</strong> Minimum <strong>50 kg</strong> required for apheresis centrifuge.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-teal-200/70">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Medications:</strong> No aspirin, NSAIDs, or antiplatelet drugs within 48 hours.
                  </div>
                </div>
              </div>

              <Link
                to="/requests"
                className="btn-teal w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md"
              >
                View Urgent Hospital Requests <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Mandatory Medical Disclaimer (As strictly requested by user) */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-300 flex items-start gap-3.5 text-xs text-amber-950">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-900 font-bold">Important Medical Screening Protocol:</strong>{' '}
            The countdown and eligibility dates are projections based on India's 2025 Ministry of Health & Family Welfare (eRaktkosh) donor-selection guidelines. The accredited hospital blood bank must conduct final physical screening (hemoglobin ≥ 12.5 g/dL, body weight ≥ 45 kg, blood pressure, vitals, and medical questionnaire) on the day of donation before confirming clinical eligibility.
          </div>
        </div>

      </div>

      {/* Main Grid: Donation History (Left) + Certificates & Badges (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 Cols): Donation History & Matching Requests */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Recent Verified Donations */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-primary-navy">Recent Verified Donations</h3>
              <Link to="/donations" className="text-xs font-bold text-crimson-red hover:underline">
                View Full History &rarr;
              </Link>
            </div>

            {recentDonations && recentDonations.length > 0 ? (
              <div className="space-y-3">
                {recentDonations.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-xl bg-white/80 border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{d.hospital_name}</div>
                      <div className="text-xs text-slate-500">
                        Date: {d.donation_date} • {d.units} Unit(s) {d.blood_group}
                      </div>
                      {d.certificate_id && (
                        <div className="text-[11px] text-purple-700 font-semibold mt-1">
                          Cert ID: {d.certificate_id}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Donations Recorded Yet"
                description="Once an accredited hospital logs your completed donation, it will automatically appear here with points and certificates."
                icon={Droplet}
              />
            )}
          </div>

          {/* Urgent Requests Matching Your Blood Group */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-crimson-red animate-ping" />
                <h3 className="text-lg font-black text-primary-navy">
                  Urgent Requests for Your Blood Group ({profile?.bloodGroup})
                </h3>
              </div>
              <Link to="/requests" className="text-xs font-bold text-crimson-red hover:underline">
                Browse All &rarr;
              </Link>
            </div>

            {matchingRequests && matchingRequests.length > 0 ? (
              <div className="space-y-3">
                {matchingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-white/80 border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">Patient: {req.patient_name}</div>
                      <div className="text-xs text-slate-500">
                        {req.hospital_name} ({req.pin_code}) • Needs {req.units_needed} Unit(s)
                      </div>
                    </div>
                    <div>
                      <Link
                        to="/requests"
                        className="px-3.5 py-1.5 rounded-lg bg-crimson-red text-white text-xs font-bold hover:bg-dark-crimson transition"
                      >
                        Respond
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">
                No critical requests matching your blood group in your area right now.
              </p>
            )}
          </div>

        </div>

        {/* Right Column (5 Cols): Certificates & Achievements */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Certificates Issued */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-black text-primary-navy">Certificates</h3>
              </div>
              <Link to="/certificates" className="text-xs font-bold text-purple-700 hover:underline">
                Gallery & Print &rarr;
              </Link>
            </div>

            {certificates && certificates.length > 0 ? (
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl bg-gradient-to-tr from-purple-50/50 to-white border border-purple-200/80 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-purple-950 uppercase tracking-wide">
                        Certificate of Appreciation
                      </div>
                      <div className="text-xs text-slate-600 font-mono mt-0.5">
                        {cert.certificate_id}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Issued by: {cert.hospital_name}
                      </div>
                    </div>
                    <Link
                      to="/certificates"
                      className="px-3 py-1.5 rounded-lg bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                No certificates issued yet. Complete a hospital verified donation to generate your official certificate.
              </div>
            )}
          </div>

          {/* Badges & Achievements */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black text-primary-navy">Earned Badges</h3>
              </div>
              <Link to="/donor-points" className="text-xs font-bold text-amber-700 hover:underline">
                Leaderboard &rarr;
              </Link>
            </div>

            {rewards && rewards.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {rewards.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-center"
                  >
                    <Award className="w-7 h-7 text-amber-500 mx-auto mb-1" />
                    <div className="font-bold text-xs text-amber-950">{r.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">{r.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                Donate blood to unlock exclusive lifesaver badges!
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default UserDashboard;
