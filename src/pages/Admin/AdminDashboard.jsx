import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import {
  ShieldAlert, Building2, Users, Droplet, Clock, CheckCircle2,
  XCircle, AlertTriangle, RefreshCw, Eye, ShieldCheck, Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('hospitals');
  const [loading, setLoading] = useState(true);
  const [triggeringCheck, setTriggeringCheck] = useState(false);

  const loadAdminData = () => {
    setLoading(true);
    Promise.all([
      adminAPI.getStats().then(r => setStats(r.data)),
      adminAPI.getHospitals().then(r => setHospitals(r.data.hospitals || [])),
      adminAPI.getUsers().then(r => setUsers(r.data.users || [])),
      adminAPI.getAuditLogs().then(r => setLogs(r.data.logs || []))
    ])
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApproveHospital = async (hospitalId, name) => {
    try {
      await adminAPI.approveHospital(hospitalId, { notes: 'Medical license validated. Accredited by Admin.' });
      showToast(`Hospital "${name}" approved successfully! Inventory publication enabled.`, 'success');
      loadAdminData();
    } catch (err) {
      showToast('Approval action failed.', 'error');
    }
  };

  const handleToggleSuspension = async (hospitalId, name, currentActive) => {
    try {
      await adminAPI.toggleHospitalStatus(hospitalId, { isActive: !currentActive, reason: 'Administrative review' });
      showToast(`Hospital "${name}" ${!currentActive ? 'reactivated' : 'suspended'}.`, 'info');
      loadAdminData();
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const handleTriggerReminderCheck = async () => {
    setTriggeringCheck(true);
    try {
      const res = await adminAPI.triggerReminderCheck();
      showToast(`Manual inventory schedule check ran for ${res.data.processedCount} hospitals.`, 'success');
      loadAdminData();
    } catch (err) {
      showToast('Reminder check trigger failed.', 'error');
    } finally {
      setTriggeringCheck(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            Superadmin Governance Portal
          </div>
          <h1 className="text-3xl font-black text-primary-navy">
            Platform Administration
          </h1>
          <p className="text-xs text-slate-500">
            Verify hospital licenses, monitor global blood inventory, and maintain healthcare audit ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerReminderCheck}
            disabled={triggeringCheck}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-900/10 transition"
          >
            {triggeringCheck ? (
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Clock className="w-4 h-4" /> Trigger Reminder Cron
              </>
            )}
          </button>
          <button
            onClick={loadAdminData}
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Donors</span>
          <div className="text-2xl font-black text-primary-navy mt-1">{stats?.totalDonors}</div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Hospitals</span>
          <div className="text-2xl font-black text-teal mt-1">{stats?.totalHospitals}</div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Review</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats?.pendingVerificationCount}</div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Units</span>
          <div className="text-2xl font-black text-crimson-red mt-1">{stats?.totalAvailableUnits}</div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Requests</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{stats?.activeRequests}</div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Overdue Stock</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{stats?.overdueHospitalsCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'hospitals'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hospital Verifications ({hospitals.length})
        </button>
        <button
          onClick={() => setActiveTab('donors')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'donors'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Registered Donors ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security Audit Logs ({logs.length})
        </button>
      </div>

      {/* Tab 1: Hospitals Verification Queue */}
      {activeTab === 'hospitals' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Hospital Name</th>
                  <th className="py-3 px-4">License No.</th>
                  <th className="py-3 px-4">City / PIN</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Reminder Status</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitals.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{h.name}</div>
                      <div className="text-[10px] text-slate-500">{h.email} • {h.contact_number}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{h.license_number}</td>
                    <td className="py-3.5 px-4 text-slate-600">{h.city} ({h.pin_code})</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{h.total_units}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          h.reminder_status === 'Update overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {h.reminder_status || 'Up to date'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {h.is_verified ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                          Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {!h.is_verified && (
                        <button
                          onClick={() => handleApproveHospital(h.id, h.name)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition"
                        >
                          Approve Account
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleSuspension(h.id, h.name, h.is_active)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                          h.is_active
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                        }`}
                      >
                        {h.is_active ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Registered Donors */}
      {activeTab === 'donors' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">City / PIN</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Donations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{u.full_name}</td>
                    <td className="py-3.5 px-4"><BloodGroupBadge group={u.blood_group} size="sm" /></td>
                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.mobile}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.city} ({u.pin_code})</td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">{u.total_points} pts</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{u.donation_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{l.actor_name}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-600">{l.actor_type}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-purple-700">{l.action}</td>
                    <td className="py-3 px-4 text-slate-600">{l.resource_type}</td>
                    <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">{l.details}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{l.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
