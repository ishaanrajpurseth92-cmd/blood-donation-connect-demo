import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThreeBloodDrop from '../../components/ThreeBloodDrop';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import { inventoryAPI, requestAPI, adminAPI } from '../../services/api';
import {
  Search,
  HeartHandshake,
  Building2,
  ShieldCheck,
  Clock,
  ArrowRight,
  Users,
  Activity,
  Award,
  AlertCircle,
  MapPin
} from 'lucide-react';

// Blood group compatibility information
const BLOOD_GROUPS = [
  {
    group: 'O-',
    type: 'Universal Red Cell Donor',
    canGive: 'Everyone (All Groups)',
    canReceive: 'O- Only',
    color: 'border-rose-400 bg-rose-50/70'
  },
  {
    group: 'O+',
    type: 'Most Common Blood Type',
    canGive: 'O+, A+, B+, AB+',
    canReceive: 'O+, O-',
    color: 'border-rose-300 bg-rose-50/50'
  },
  {
    group: 'A+',
    type: 'High Demand Platelets',
    canGive: 'A+, AB+',
    canReceive: 'A+, A-, O+, O-',
    color: 'border-blue-300 bg-blue-50/60'
  },
  {
    group: 'A-',
    type: 'Essential Donor',
    canGive: 'A+, A-, AB+, AB-',
    canReceive: 'A-, O-',
    color: 'border-indigo-300 bg-indigo-50/60'
  },
  {
    group: 'B+',
    type: 'Important Rh+ Group',
    canGive: 'B+, AB+',
    canReceive: 'B+, B-, O+, O-',
    color: 'border-teal-300 bg-teal-50/60'
  },
  {
    group: 'B-',
    type: 'Rare Blood Group',
    canGive: 'B+, B-, AB+, AB-',
    canReceive: 'B-, O-',
    color: 'border-emerald-300 bg-emerald-50/60'
  },
  {
    group: 'AB+',
    type: 'Universal Recipient',
    canGive: 'AB+ Only',
    canReceive: 'All Blood Types',
    color: 'border-purple-300 bg-purple-50/60'
  },
  {
    group: 'AB-',
    type: 'Universal Plasma Donor',
    canGive: 'AB+, AB-',
    canReceive: 'AB-, A-, B-, O-',
    color: 'border-violet-300 bg-violet-50/60'
  }
];

// Safely extract API response data
const getApiPayload = (response) => {
  return response?.data?.data ?? response?.data ?? {};
};

// Extract public request list from different response structures
const getRequestList = (response) => {
  const payload = getApiPayload(response);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.requests)) {
    return payload.requests;
  }

  if (Array.isArray(response?.data?.requests)) {
    return response.data.requests;
  }

  return [];
};

// Normalize backend fields into one consistent frontend format
const normalizeRequest = (req = {}) => ({
  id: req.id,

  patientName:
    req.patientName ||
    req.patient_name ||
    'Patient name unavailable',

  bloodGroup:
    req.bloodGroup ||
    req.blood_group ||
    'N/A',

  units:
    req.unitsNeeded ??
    req.requiredUnits ??
    req.required_units ??
    req.units_needed ??
    req.units ??
    0,

  hospitalName:
    req.hospitalName ||
    req.hospital_name ||
    'Hospital not specified',

  city: req.city || '',
  state: req.state || '',

  location:
    req.treatmentLocation ||
    req.treatment_location ||
    req.city ||
    'Location not specified',

  pinCode:
    req.pinCode ||
    req.pin_code ||
    '',

  urgency:
    req.emergencyLevel ||
    req.emergency_level ||
    req.urgency ||
    'Normal',

  requiredDate:
    req.requiredDate ||
    req.required_date ||
    null,

  notes:
    req.additionalNotes ||
    req.additional_notes ||
    req.description ||
    '',

  status:
    req.status ||
    req.request_status ||
    'PENDING'
});

// Format dates safely
const formatRequestDate = (value) => {
  if (!value) {
    return 'Not specified';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not specified';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Convert raw backend statuses into readable labels
const formatRequestStatus = (status) => {
  const normalized = String(status || 'PENDING').toUpperCase();

  const labels = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    IN_PROGRESS: 'In Progress',
    FULFILLED: 'Fulfilled',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected'
  };

  return (
    labels[normalized] ||
    normalized
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
};

const Home = () => {
  const navigate = useNavigate();

  const [pinCode, setPinCode] = useState('110001');
  const [selectedGroup, setSelectedGroup] = useState('O+');

  const [stats, setStats] = useState({
    totalDonors: 1420,
    totalHospitals: 48,
    totalAvailableUnits: 380,
    totalDonations: 920
  });

  const [urgentRequests, setUrgentRequests] = useState([]);
  const [quickSearchResults, setQuickSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Load homepage statistics and public blood requests
  useEffect(() => {
    // Fetch live platform statistics
    adminAPI.getStats()
      .then((res) => {
        const data = getApiPayload(res);

        setStats((prev) => ({
          ...prev,
          totalDonors: Number(
            data.totalDonors ?? prev.totalDonors
          ),
          totalHospitals: Number(
            data.verifiedHospitals ??
            data.totalHospitals ??
            prev.totalHospitals
          ),
          totalAvailableUnits: Number(
            data.totalAvailableUnits ??
            prev.totalAvailableUnits
          ),
          totalDonations: Number(
            data.totalDonations ??
            prev.totalDonations
          )
        }));
      })
      .catch((error) => {
        console.error('Failed to load homepage statistics:', error);
      });

    // Fetch active public blood requests
    requestAPI.getPublicRequests({ limit: 4 })
      .then((res) => {
        const requests = getRequestList(res)
          .map(normalizeRequest)
          .filter((request) => request.id);

        setUrgentRequests(requests.slice(0, 4));
      })
      .catch((error) => {
        console.error(
          'Failed to load public blood requests:',
          error
        );

        setUrgentRequests([]);
      });
  }, []);

  // Quick blood availability search
  const handleQuickSearch = (e) => {
    e.preventDefault();

    if (!pinCode.trim() && !selectedGroup) {
      navigate('/find-blood');
      return;
    }

    if (pinCode.trim() && pinCode.trim().length !== 6) {
      alert('Please enter a valid 6-digit PIN code.');
      return;
    }

    setSearching(true);

    inventoryAPI.searchBlood({
      pinCode: pinCode.trim(),
      bloodGroup: selectedGroup
    })
      .then((res) => {
        const data = getApiPayload(res);

        setQuickSearchResults(
          Array.isArray(data.hospitals)
            ? data.hospitals
            : []
        );
      })
      .catch((error) => {
        console.error('Blood search failed:', error);

        navigate(
          `/find-blood?pinCode=${encodeURIComponent(pinCode.trim())}&bloodGroup=${encodeURIComponent(selectedGroup)}`
        );
      })
      .finally(() => {
        setSearching(false);
      });
  };

  return (
    <div className="space-y-24 pb-20">

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 lg:pt-16 overflow-hidden">

        <div className="absolute top-10 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="absolute top-40 right-10 w-96 h-96 bg-teal/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-[#D7263D] text-xs font-extrabold uppercase tracking-wider shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#D7263D] animate-ping" />
                Real-Time Hospital Blood Network
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#102A43] tracking-tight leading-[1.12]">
                Donate Blood, <br />
                <span className="hero-gradient-text text-[#D7263D]">
                  Save Precious Lives
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Connecting voluntary blood donors, patients in critical emergencies, and accredited hospitals through certified real-time inventory tracking and location intelligence.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">

                <Link
                  to="/find-blood"
                  className="btn-primary w-full sm:w-auto px-7 py-3.5 rounded-2xl text-base font-bold shadow-lg text-center flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5 text-white" />
                  Find Blood Availability
                </Link>

                <Link
                  to="/register"
                  className="btn-secondary w-full sm:w-auto px-7 py-3.5 rounded-2xl text-base font-bold text-center flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-5 h-5 text-[#D7263D]" />
                  Become a Donor
                </Link>

              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-medium">

                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Hospital Blood Banks
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Strict 24h Freshness Tracking
                </span>

                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Digital QR Verified Certificates
                </span>

              </div>
            </div>

            {/* Right: Interactive 3D Blood Drop */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md glass-panel p-4 rounded-3xl relative overflow-hidden shadow-2xl border border-white/80">

                <div className="text-center pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Interactive 3D Visualizer
                  </span>
                </div>

                <ThreeBloodDrop />

                <div className="text-center pb-2 text-xs text-slate-500 font-medium">
                  Rotate with your cursor to explore the cellular plasma structure
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. INSTANT BLOOD AVAILABILITY SEARCH */}
      <section className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/90 relative z-20">

          <div className="mb-4 text-center sm:text-left">
            <h3 className="text-lg font-black text-[#102A43]">
              Check Blood Availability Near You
            </h3>

            <p className="text-xs sm:text-sm text-slate-500">
              Enter your six-digit PIN code to search accredited hospital inventories and reserve emergency units.
            </p>
          </div>

          <form
            onSubmit={handleQuickSearch}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3.5"
          >

            <div className="sm:col-span-5 relative">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                placeholder="Enter 6-Digit PIN Code (e.g. 110001)"
                maxLength={6}
                value={pinCode}
                onChange={(e) => {
                  setPinCode(e.target.value.replace(/\D/g, ''));
                }}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-sm font-medium text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl glass-input text-sm font-bold text-slate-800 bg-white"
              >
                <option value="">All Blood Groups</option>

                {BLOOD_GROUPS.map((group) => (
                  <option key={group.group} value={group.group}>
                    {group.group} ({group.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={searching}
                className="btn-primary w-full h-full py-3.5 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
              >
                {searching ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Search className="w-4 h-4 text-white" />
                    Search Stock
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Quick Search Preview Results */}
          {quickSearchResults && (
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">

              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>
                  Found {quickSearchResults.length} hospitals near PIN {pinCode || 'all'}
                </span>

                <Link
                  to={`/find-blood?pinCode=${encodeURIComponent(pinCode)}&bloodGroup=${encodeURIComponent(selectedGroup)}`}
                  className="text-[#D7263D] font-bold hover:underline"
                >
                  View Full Map & Directory →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {quickSearchResults.slice(0, 4).map((hospital, index) => {
                  const stock = hospital.bloodStock?.find(
                    (item) => item.bloodGroup === selectedGroup
                  ) || hospital.bloodStock?.[0];

                  return (
                    <div
                      key={hospital.hospitalId || hospital.id || index}
                      className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">
                          {hospital.hospitalName || hospital.name || 'Hospital'}
                        </div>

                        <div className="text-xs text-slate-500">
                          {hospital.city || 'Location unavailable'}
                          {' - '}
                          {hospital.pinCode || hospital.pin_code || 'PIN unavailable'}

                          {hospital.distanceKm != null &&
                            ` (~${hospital.distanceKm} km away)`}
                        </div>

                        {hospital.isStale && (
                          <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold mt-1 inline-block border border-amber-200">
                            Unverified stock (&gt;24h)
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-[#D7263D]">
                          {stock?.availableUnits ?? stock?.available_units ?? 0}
                        </span>

                        <span className="text-xs text-slate-500 block">
                          units ({selectedGroup || stock?.bloodGroup || 'Blood'})
                        </span>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          )}

        </div>
      </section>

      {/* 3. BLOOD GROUP COMPATIBILITY MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">

          <span className="text-xs font-extrabold text-[#D7263D] uppercase tracking-widest">
            Biological Compatibility
          </span>

          <h2 className="text-3xl font-black text-[#102A43]">
            Blood Groups & Donor Matching
          </h2>

          <p className="text-sm text-slate-600">
            Transfusion matching is critical. Understand how each blood type gives and receives life.
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {BLOOD_GROUPS.map((blood) => (
            <div
              key={blood.group}
              className={`p-6 rounded-2xl glass-panel border ${blood.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between`}
            >

              <div>

                <div className="flex items-center justify-between mb-3">

                  <span className="text-3xl font-black text-[#102A43]">
                    {blood.group}
                  </span>

                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {blood.type.includes('Universal') ? '★ Special' : 'Standard'}
                  </span>

                </div>

                <div className="text-xs font-semibold text-slate-700 mb-4">
                  {blood.type}
                </div>

                <div className="space-y-2 text-xs border-t border-slate-200/80 pt-3">

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Can give to:</span>
                    <span className="font-bold text-slate-800 text-right">
                      {blood.canGive}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Can receive:</span>
                    <span className="font-bold text-slate-800 text-right">
                      {blood.canReceive}
                    </span>
                  </div>

                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60">
                <Link
                  to={`/find-blood?bloodGroup=${encodeURIComponent(blood.group)}`}
                  className="text-xs font-bold text-[#D7263D] hover:text-[#A4132A] flex items-center justify-between group"
                >
                  <span>Check {blood.group} Inventory</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* 4. ACTIVE BLOOD REQUESTS FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">

          <div>

            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D7263D] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#D7263D] animate-ping" />
              Emergency Broadcast
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#102A43]">
              Active Blood Requests
            </h2>

            <p className="text-sm text-slate-600">
              Patients and hospitals requesting blood donations.
            </p>

          </div>

          <Link
            to="/requests"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#D7263D] hover:text-[#A4132A]"
          >
            View All Blood Requests
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {urgentRequests.length > 0 ? (

            urgentRequests.map((req) => {
              const urgency = String(req.urgency || 'NORMAL').toUpperCase();
              const status = String(req.status || 'PENDING').toUpperCase();

              const urgencyStyle =
                urgency === 'CRITICAL'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : urgency === 'URGENT'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300';

              const statusStyle =
                status === 'FULFILLED'
                  ? 'text-emerald-700'
                  : status === 'CANCELLED' || status === 'REJECTED'
                  ? 'text-red-700'
                  : 'text-teal-700';

              return (
                <div
                  key={req.id}
                  className="p-6 rounded-2xl glass-panel border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between"
                >

                  <div>

                    <div className="flex items-center justify-between gap-2 mb-4">

                      <BloodGroupBadge
                        group={req.bloodGroup}
                        size="md"
                      />

                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border ${urgencyStyle}`}
                      >
                        {urgency} Emergency
                      </span>

                    </div>

                    <h4 className="font-black text-slate-900 text-base mb-1">
                      Patient: {req.patientName}
                    </h4>

                    <p className="text-xs text-slate-600 mb-4">
                      Needs{' '}
                      <strong className="text-[#D7263D]">
                        {req.units} Unit(s)
                      </strong>
                      {' '}at {req.hospitalName}
                    </p>

                    <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 mb-4">

                      <div>
                        <strong>Blood Group:</strong> {req.bloodGroup}
                      </div>

                      <div>
                        <strong>Hospital:</strong> {req.hospitalName}
                      </div>

                      <div>
                        <strong>Location:</strong>{' '}
                        {req.state && req.location?.endsWith(req.state)
                          ? req.location
                          : [req.location, req.state].filter(Boolean).join(', ')}
                      </div>

                      <div>
                        <strong>PIN Code:</strong>{' '}
                        {req.pinCode || 'Not provided'}
                      </div>

                      <div>
                        <strong>Required By:</strong>{' '}
                        {formatRequestDate(req.requiredDate)}
                      </div>

                      {req.notes && (
                        <div className="pt-2 border-t border-slate-200">
                          <strong>Additional Notes:</strong>
                          <p className="italic mt-1 break-words">
                            {req.notes}
                          </p>
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">

                    <span className="text-[11px] font-semibold text-slate-500">
                      Status:{' '}
                      <span className={`font-bold ${statusStyle}`}>
                        {formatRequestStatus(req.status)}
                      </span>
                    </span>

                    <Link
                      to="/requests"
                      className="px-4 py-2 rounded-xl bg-[#102A43] text-white text-xs font-bold hover:bg-slate-800 transition"
                    >
                      Respond
                    </Link>

                  </div>
                </div>
              );
            })

          ) : (

            <div className="col-span-full p-8 text-center glass-panel rounded-2xl text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-3 text-slate-400" />

              <p className="font-bold">
                No active blood requests available.
              </p>

              <p className="text-xs mt-1">
                New requests will appear here when submitted.
              </p>
            </div>

          )}

        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">

          <span className="text-xs font-extrabold text-teal-700 uppercase tracking-widest">
            Streamlined Healthcare Flow
          </span>

          <h2 className="text-3xl font-black text-[#102A43]">
            How Blood Donation Connect Works
          </h2>

          <p className="text-sm text-slate-600">
            A reliable 4-step framework engineered for patients, voluntary donors, and hospital blood banks.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {[
            {
              step: '01',
              title: 'Register Profile',
              desc: 'Sign up as a voluntary donor with your blood group and location. Earn your first 10 welcome points.',
              icon: HeartHandshake,
              color: 'text-[#D7263D] bg-rose-50'
            },
            {
              step: '02',
              title: 'Find or Request',
              desc: 'Use PIN code search to locate verified blood units near you or post an urgent blood request for hospital patients.',
              icon: Search,
              color: 'text-teal-700 bg-teal-50'
            },
            {
              step: '03',
              title: 'Hospital Verification',
              desc: 'Hospitals verify your physical blood donation on their official portal, automatically updating live inventory.',
              icon: Building2,
              color: 'text-purple-600 bg-purple-50'
            },
            {
              step: '04',
              title: 'Rewards & Certificates',
              desc: 'Receive +100 donor points, advance through donor tiers (Bronze to Platinum), and download your QR-verified certificate.',
              icon: Award,
              color: 'text-amber-600 bg-amber-50'
            }
          ].map((item) => (
            <div
              key={item.step}
              className="p-7 rounded-2xl glass-panel relative group hover:-translate-y-1 transition duration-300"
            >

              <span className="text-4xl font-black text-slate-200 absolute top-4 right-4">
                {item.step}
              </span>

              <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-5`}>
                <item.icon className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {item.desc}
              </p>

            </div>
          ))}

        </div>
      </section>

      {/* 6. LIVE PLATFORM STATISTICS */}
      <section className="stats-section-dark py-16 relative overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">

            <div className="space-y-2">

              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-rose-400">
                <Users className="w-6 h-6" />
              </div>

              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white stat-number">
                {stats.totalDonors}+
              </div>

              <div className="text-xs font-semibold text-slate-300 stat-label uppercase tracking-wider">
                Registered Donors
              </div>

            </div>

            <div className="space-y-2">

              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-teal-400">
                <Building2 className="w-6 h-6" />
              </div>

              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white stat-number">
                {stats.totalHospitals}+
              </div>

              <div className="text-xs font-semibold text-slate-300 stat-label uppercase tracking-wider">
                Accredited Hospitals
              </div>

            </div>

            <div className="space-y-2">

              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-rose-400">
                <Activity className="w-6 h-6" />
              </div>

              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white stat-number">
                {stats.totalAvailableUnits}
              </div>

              <div className="text-xs font-semibold text-slate-300 stat-label uppercase tracking-wider">
                Units Available Right Now
              </div>

            </div>

            <div className="space-y-2">

              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-amber-400">
                <Award className="w-6 h-6" />
              </div>

              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white stat-number">
                {stats.totalDonations}+
              </div>

              <div className="text-xs font-semibold text-slate-300 stat-label uppercase tracking-wider">
                Verified Lives Saved
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="cta-banner-dark p-10 sm:p-14 rounded-3xl relative overflow-hidden shadow-2xl">

          <div className="relative z-10 max-w-2xl space-y-4">

            <span className="text-xs font-black tracking-widest text-rose-400 uppercase">
              Join the Lifesaving Community
            </span>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Your Blood Can Give Someone Another Birthday.
            </h2>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              One pint of blood saves up to three lives. Register today, discover nearby hospitals in need, and receive official certificates for your humanitarian contribution.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">

              <Link
                to="/register"
                className="btn-primary px-8 py-3.5 rounded-2xl text-sm font-bold shadow-lg flex items-center justify-center"
              >
                Sign Up as a Donor
              </Link>

              <Link
                to="/hospital/register"
                className="px-8 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold border border-white/30 transition hover:scale-102 flex items-center justify-center"
              >
                Register Your Hospital
              </Link>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
