
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { requestAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import {
  AlertCircle,
  PlusCircle,
  Filter,
  Phone,
  MapPin,
  Calendar,
  Building2
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const createInitialForm = (user, searchParams) => ({
  patientName: 'Riya Kapoor',
  bloodGroup: searchParams?.get('bloodGroup') || 'O+',
  unitsNeeded: 1,
  hospitalName: searchParams?.get('hospitalName') || 'City Care Hospital',
  treatmentLocation: 'Jalandhar, Punjab',
  pinCode: searchParams?.get('pinCode') || '144003',
  contactNumber: user?.mobile || '9812345678',
  emergencyLevel: 'Urgent',
  requiredDate: new Date().toISOString().split('T')[0],
  additionalNotes: 'Sample request for a scheduled surgery. Please contact the hospital blood bank to confirm availability.'
});

const getRequestsFromResponse = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.requests)) return payload.requests;
  if (Array.isArray(payload?.data?.requests)) return payload.data.requests;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

const getStatus = (request) =>
  String(request?.status || request?.request_status || 'PENDING')
    .toUpperCase()
    .replaceAll(' ', '_');

const getStatusLabel = (status) => {
  const labels = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    IN_PROGRESS: 'In Progress',
    FULFILLED: 'Fulfilled',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected'
  };

  return labels[status] || status.replaceAll('_', ' ');
};

const formatDate = (value) => {
  if (!value) return 'Date not specified';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date not specified';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const Requests = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isHospital } = useAuth();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [filterGroup, setFilterGroup] = useState('');
  const [filterEmergency, setFilterEmergency] = useState('');

  const [formData, setFormData] = useState(() =>
    createInitialForm(user, searchParams)
  );

  const loadRequests = useCallback(async () => {
    setLoading(true);

    try {
      const response = await requestAPI.getPublicRequests({
        bloodGroup: filterGroup || undefined,
        emergencyLevel: filterEmergency || undefined
      });

      setRequests(getRequestsFromResponse(response));
    } catch (error) {
      console.error('Failed to load blood requests:', error);
      setRequests([]);
      showToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Unable to load blood requests. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [filterGroup, filterEmergency, showToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (searchParams.get('hospitalName')) {
      setShowModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.mobile) {
      setFormData((previous) => ({
        ...previous,
        contactNumber: previous.contactNumber || user.mobile
      }));
    }
  }, [user?.mobile]);

  const updateFormField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (formData.pinCode.length !== 6) {
      showToast('Please enter a valid 6-digit PIN code.', 'error');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    if (new Date(formData.requiredDate) < new Date(
      new Date().toDateString()
    )) {
      showToast('Required date cannot be in the past.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      await requestAPI.createRequest({
        ...formData,
        unitsNeeded: Number(formData.unitsNeeded)
      });

      showToast(
        'Blood request submitted successfully!',
        'success'
      );

      setShowModal(false);
      setFormData(createInitialForm(user, null));

      await loadRequests();
    } catch (error) {
      console.error('Blood request submission failed:', error);

      showToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to submit blood request.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    setUpdatingId(requestId);

    try {
      await requestAPI.updateStatus(requestId, {
        status: newStatus
      });

      showToast(
        `Request updated to ${getStatusLabel(newStatus)}.`,
        'success'
      );

      await loadRequests();
    } catch (error) {
      console.error('Request status update failed:', error);

      showToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Status update failed.',
        'error'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getUrgencyClass = (urgency) => {
    switch (String(urgency || '').toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border border-red-300 animate-pulse';
      case 'URGENT':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D7263D] uppercase tracking-wider mb-1">
            <AlertCircle className="w-4 h-4" />
            Live Blood Request Center
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#102A43]">
            Emergency Blood Requests
          </h1>

          <p className="text-sm text-slate-600 max-w-xl">
            View active blood requirements and connect with hospitals
            and donors.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-bold shadow-lg transition hover:scale-102 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          Post Blood Request
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </span>

          <select
            value={filterGroup}
            onChange={(event) => setFilterGroup(event.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
          >
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <select
            value={filterEmergency}
            onChange={(event) => setFilterEmergency(event.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
          >
            <option value="">All Emergency Levels</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
            <option value="Standard">Standard</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          {requests.length} Active Requests
        </div>
      </div>

      {/* Request Cards */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => {
            const bloodGroup =
              request.bloodGroup || request.blood_group || 'N/A';

            const urgency =
              request.emergencyLevel ||
              request.urgency ||
              request.emergency_level ||
              'Standard';

            const patientName =
              request.patientName ||
              request.patient_name ||
              'Patient name unavailable';

            const units =
              request.unitsNeeded ??
              request.requiredUnits ??
              request.required_units ??
              request.units_needed ??
              1;

            const hospitalName =
              request.hospitalName ||
              request.hospital_name ||
              'Hospital not specified';

            const location =
              request.treatmentLocation ||
              request.treatment_location ||
              [request.city, request.state].filter(Boolean).join(', ') ||
              'Location not specified';

            const pinCode =
              request.pinCode || request.pin_code || '';

            const requiredDate =
              request.requiredDate ||
              request.required_date;

            const notes =
              request.additionalNotes ||
              request.description ||
              request.additional_notes ||
              '';

            const contact =
              request.contactNumber ||
              request.contact_number ||
              '';

            const status = getStatus(request);
            const statusLabel = getStatusLabel(status);

            return (
              <div
                key={request.id}
                className="p-6 rounded-2xl glass-panel border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <BloodGroupBadge group={bloodGroup} size="lg" />

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${getUrgencyClass(urgency)}`}
                    >
                      {urgency}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-slate-400 font-semibold uppercase">
                      Patient
                    </div>

                    <h3 className="text-lg font-black text-slate-900">
                      {patientName}
                    </h3>

                    <div className="text-xs font-bold text-[#D7263D] mt-0.5">
                      Needs {units} Unit(s) of {bloodGroup} Blood
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 mb-4">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Hospital:</strong> {hospitalName}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {location}
                        {pinCode ? ` (PIN: ${pinCode})` : ' (PIN unavailable)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        <strong>Needed By:</strong> {formatDate(requiredDate)}
                      </span>
                    </div>

                    {notes && (
                      <div className="pt-2 border-t border-slate-200/60 text-slate-700 italic">
                        &ldquo;{notes}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-3 pt-2 border-t border-slate-100 gap-2">
                    <span className="text-slate-500">
                      Status:{' '}
                      <strong className="text-teal-700">
                        {statusLabel}
                      </strong>
                    </span>

                    {contact ? (
                      <a
                        href={`tel:${contact}`}
                        className="flex items-center gap-1 font-bold text-[#D7263D] hover:text-[#A4132A]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {contact}
                      </a>
                    ) : (
                      <span className="text-slate-400">
                        Contact unavailable
                      </span>
                    )}
                  </div>

                  {/* Hospital Actions */}
                  {isHospital && (
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      {status === 'PENDING' && (
                        <button
                          disabled={updatingId === request.id}
                          onClick={() =>
                            handleStatusUpdate(request.id, 'ACCEPTED')
                          }
                          className="btn-teal flex-1 py-2 px-3 rounded-xl text-white text-xs font-bold transition disabled:opacity-50"
                        >
                          {updatingId === request.id
                            ? 'Updating...'
                            : 'Accept Request'}
                        </button>
                      )}

                      {status === 'ACCEPTED' && (
                        <button
                          disabled={updatingId === request.id}
                          onClick={() =>
                            handleStatusUpdate(request.id, 'IN_PROGRESS')
                          }
                          className="btn-teal flex-1 py-2 px-3 rounded-xl text-white text-xs font-bold transition disabled:opacity-50"
                        >
                          {updatingId === request.id
                            ? 'Updating...'
                            : 'Start Processing'}
                        </button>
                      )}

                      {status === 'IN_PROGRESS' && (
                        <button
                          disabled={updatingId === request.id}
                          onClick={() =>
                            handleStatusUpdate(request.id, 'FULFILLED')
                          }
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          {updatingId === request.id
                            ? 'Updating...'
                            : 'Mark as Fulfilled'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Active Blood Requests"
          description="There are currently no matching blood requests for the selected filter."
          actionText="Post a New Blood Request"
          actionLink="#"
          icon={AlertCircle}
        />
      )}

      {/* Create Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/80 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h3 className="text-xl font-black text-[#102A43]">
                  Post Blood Request
                </h3>
                <p className="text-xs text-slate-500">
                  Submit a blood requirement for a patient.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 font-bold"
                aria-label="Close request form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Arjun Sharma"
                    value={formData.patientName}
                    onChange={(e) =>
                      updateFormField('patientName', e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Blood Group Required *
                  </label>
                  <select
                    required
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      updateFormField('bloodGroup', e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-slate-800 bg-white"
                  >
                    {BLOOD_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Units Needed (Pints) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={formData.unitsNeeded}
                    onChange={(e) =>
                      updateFormField(
                        'unitsNeeded',
                        Math.max(1, Math.min(20, Number(e.target.value) || 1))
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emergency Level *
                  </label>
                  <select
                    required
                    value={formData.emergencyLevel}
                    onChange={(e) =>
                      updateFormField('emergencyLevel', e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-slate-800 bg-white"
                  >
                    <option value="Critical">
                      Critical (Immediate Life-Threatening)
                    </option>
                    <option value="Urgent">
                      Urgent (Within 24 Hours)
                    </option>
                    <option value="Standard">
                      Standard (Scheduled Surgery)
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hospital / Medical Center *
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder="e.g. Apollo Lifeline Hospital"
                  value={formData.hospitalName}
                  onChange={(e) =>
                    updateFormField('hospitalName', e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Treatment Ward / Location *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    placeholder="e.g. ICU Ward 3, Phagwara"
                    value={formData.treatmentLocation}
                    onChange={(e) =>
                      updateFormField('treatmentLocation', e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    minLength={6}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="e.g. 144401"
                    value={formData.pinCode}
                    onChange={(e) =>
                      updateFormField(
                        'pinCode',
                        e.target.value.replace(/\D/g, '').slice(0, 6)
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    placeholder="e.g. 9876543210"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      updateFormField(
                        'contactNumber',
                        e.target.value.replace(/\D/g, '').slice(0, 10)
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date Needed By *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.requiredDate}
                    onChange={(e) =>
                      updateFormField('requiredDate', e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  placeholder="Additional information about the blood requirement..."
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    updateFormField('additionalNotes', e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 py-3 px-4 rounded-xl text-sm font-bold transition shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Publishing Request...' : 'Broadcast Request Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
