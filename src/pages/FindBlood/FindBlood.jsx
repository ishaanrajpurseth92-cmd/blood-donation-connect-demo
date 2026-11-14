import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../../services/api';
import HospitalMap from '../../components/HospitalMap';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import {
  Search, MapPin, Filter, Phone, Navigation, Clock,
  AlertTriangle, CheckCircle2, HeartHandshake, ArrowUpDown, Building2
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const FindBlood = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [pinCode, setPinCode] = useState(searchParams.get('pinCode') || '110001');
  const [bloodGroup, setBloodGroup] = useState(searchParams.get('bloodGroup') || 'O+');
  const [radius, setRadius] = useState(searchParams.get('radius') || '25');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'distance');

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHospital, setActiveHospital] = useState(null);

  const performSearch = (currentPin, currentGroup, currentRadius, currentSort) => {
    setLoading(true);
    inventoryAPI.searchBlood({
      pinCode: currentPin,
      bloodGroup: currentGroup,
      maxDistance: currentRadius,
      sortBy: currentSort
    })
      .then(res => {
        setHospitals(res.data.hospitals || []);
        if (res.data.hospitals?.length > 0) {
          setActiveHospital(res.data.hospitals[0]);
        }
      })
      .catch(err => {
        console.error('Search error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const p = searchParams.get('pinCode') || '';
    const g = searchParams.get('bloodGroup') || '';
    const r = searchParams.get('radius') || '';
    const s = searchParams.get('sortBy') || 'distance';
    setPinCode(p);
    setBloodGroup(g);
    setRadius(r);
    setSortBy(s);
    performSearch(p, g, r, s);
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (pinCode.trim()) params.pinCode = pinCode.trim();
    if (bloodGroup) params.bloodGroup = bloodGroup;
    if (radius) params.radius = radius;
    if (sortBy) params.sortBy = sortBy;
    setSearchParams(params);
  };

  const mapCenter = activeHospital?.latitude && activeHospital?.longitude
    ? [parseFloat(activeHospital.latitude), parseFloat(activeHospital.longitude)]
    : (hospitals[0]?.latitude ? [parseFloat(hospitals[0].latitude), parseFloat(hospitals[0].longitude)] : [28.6139, 77.2090]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D7263D] uppercase tracking-wider mb-1">
          <MapPin className="w-3.5 h-3.5" />
          Location-Aware Hospital Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#102A43]">
          Find Blood Availability Near You
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Search real-time blood stock from accredited healthcare blood banks by PIN code and blood type. Verified update timestamps indicate inventory fresh status.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by PIN Code (e.g. 110001)"
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-input text-sm font-medium text-slate-800"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-sm font-bold text-slate-800 bg-white"
            >
              <option value="">All Blood Groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg} Group</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-sm text-slate-700 bg-white"
            >
              <option value="">Any Radius</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
              <option value="50">Within 50 km</option>
              <option value="100">Within 100 km</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-sm text-slate-700 bg-white"
            >
              <option value="distance">Sort: Nearest</option>
              <option value="units">Sort: Most Units</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <button
              type="submit"
              className="btn-primary w-full h-full min-h-[42px] py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center cursor-pointer shadow-md"
              title="Search and Filter"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>
      </div>

      {/* Main Grid: Hospital List (Left) + Interactive Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Hospital Cards List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-1">
            <span>Showing {hospitals.length} verified hospitals</span>
            {pinCode && <span>Location: PIN {pinCode}</span>}
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : hospitals.length > 0 ? (
            hospitals.map((h) => {
              const matchingStock = bloodGroup
                ? h.bloodStock?.find((s) => s.bloodGroup === bloodGroup)
                : null;
              const totalUnits = h.bloodStock?.reduce((acc, s) => acc + (s.availableUnits || 0), 0) || 0;
              const isSelected = activeHospital?.hospitalId === h.hospitalId;

              return (
                <div
                  key={h.hospitalId}
                  onClick={() => setActiveHospital(h)}
                  className={`p-6 rounded-2xl glass-panel transition-all duration-200 cursor-pointer border ${
                    isSelected ? 'ring-2 ring-[#D7263D] border-[#D7263D]/40 shadow-md' : 'hover:shadow-md border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-700" />
                        <h3 className="font-black text-slate-900 text-lg leading-snug">
                          {h.hospitalName}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {h.address}, {h.city}, {h.state} - <span className="font-semibold text-slate-800">{h.pinCode}</span>
                      </p>
                    </div>

                    {h.distanceKm !== null && (
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                          <Navigation className="w-3 h-3" />
                          ~{h.distanceKm} km away
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Overdue / Stale Stock Warning */}
                  {h.isStale && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium mb-4">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{h.staleWarning}</span>
                    </div>
                  )}

                  {/* Available Stock Grid */}
                  <div className="my-4 pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Available Stock by Blood Group
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {h.bloodStock?.map((stock) => {
                        const isMatch = bloodGroup && stock.bloodGroup === bloodGroup;
                        return (
                          <div
                            key={stock.bloodGroup}
                            className={`p-2 rounded-xl text-center border transition ${
                              isMatch
                                ? 'bg-[#D7263D] text-white border-[#D7263D] shadow-sm'
                                : stock.availableUnits > 0
                                ? 'bg-white text-slate-800 border-slate-200'
                                : 'bg-slate-50 text-slate-400 border-slate-100'
                            }`}
                          >
                            <div className="text-xs font-bold">{stock.bloodGroup}</div>
                            <div className={`text-sm font-black ${isMatch ? 'text-white' : stock.availableUnits > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                              {stock.availableUnits}
                            </div>
                            <div className="text-[9px] uppercase tracking-tighter opacity-80">
                              {stock.availableUnits > 4 ? 'In Stock' : stock.availableUnits > 0 ? 'Low' : 'Empty'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact & Action Row */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-slate-500">
                      {h.contactNumber && (
                        <a
                          href={`tel:${h.contactNumber}`}
                          className="flex items-center gap-1 font-bold text-slate-700 hover:text-[#D7263D] transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#D7263D]" />
                          {h.contactNumber}
                        </a>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Updated: {h.lastUpdated ? new Date(h.lastUpdated).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3 text-teal-700" /> Directions
                      </a>
                      <Link
                        to={`/requests?hospitalName=${encodeURIComponent(h.hospitalName)}&pinCode=${encodeURIComponent(h.pinCode)}&bloodGroup=${encodeURIComponent(bloodGroup || 'O+')}`}
                        className="btn-primary px-3.5 py-1.5 rounded-lg text-white font-bold transition flex items-center gap-1"
                      >
                        Request Blood
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              title="No Matching Hospital Blood Stock"
              description={`No verified hospitals currently have matching inventory for your selected filters (PIN: ${pinCode || 'All'}, Blood Group: ${bloodGroup || 'All'}).`}
              actionText="Post an Emergency Blood Request"
              actionLink="/requests"
              icon={Search}
            />
          )}
        </div>

        {/* Interactive Map Sticky Panel (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-4">
            <div className="glass-panel p-4 rounded-3xl shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#D7263D]" /> Interactive Live Map
                </span>
                <span className="text-xs text-slate-500">
                  {hospitals.length} Location Markers
                </span>
              </div>
              <div className="h-[460px] rounded-2xl overflow-hidden border border-slate-200">
                <HospitalMap
                  hospitals={hospitals}
                  center={mapCenter}
                  zoom={pinCode ? 12 : 10}
                  selectedHospitalId={activeHospital?.hospitalId}
                />
              </div>
              <div className="mt-3 px-1 text-[11px] text-slate-500 flex items-center justify-between">
                <span>🔴 Verified Up-to-date</span>
                <span>🟡 Stale / Unverified (&gt;24h)</span>
                <span>📍 Click marker for details</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default FindBlood;
