import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hospitalAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import {
  ShieldCheck, CheckCircle2, User, Droplet, Calendar, FileText,
  Award, ArrowRight, Building2, Activity, AlertTriangle, AlertCircle
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HospitalVerifyDonation = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    donorIdentifier: 'donor@example.com',
    bloodGroup: 'O+',
    units: 1,
    donationType: 'whole_blood',
    donationDate: new Date().toISOString().split('T')[0],
    screeningHb: 13.5,
    screeningWeight: 60,
    screeningBp: '120/80',
    screeningConfirmed: true,
    medicalOverride: false,
    notes: 'Voluntary whole blood collection (450ml). Passed pre-donation hemoglobin, vitals, and viral screening.'
  });
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [intervalViolation, setIntervalViolation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.screeningConfirmed) {
      showToast('Please confirm pre-donation physical screening compliance.', 'error');
      return;
    }
    setLoading(true);
    setIntervalViolation(null);
    try {
      const res = await hospitalAPI.verifyDonation(formData);
      setResultData(res.data);
      showToast('Donation verified! Points awarded and certificate issued.', 'success');
    } catch (err) {
      if (err.response?.data?.isIntervalViolation) {
        setIntervalViolation(err.response.data);
        showToast(err.response.data.error, 'error');
      } else {
        showToast(err.response?.data?.error || 'Verification failed.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setFormData({
      donorIdentifier: 'donor@example.com',
      bloodGroup: 'O+',
      units: 1,
      donationType: 'whole_blood',
      donationDate: new Date().toISOString().split('T')[0],
      screeningHb: 14.2,
      screeningWeight: 65,
      screeningBp: '120/80',
      screeningConfirmed: true,
      medicalOverride: false,
      notes: 'Routine voluntary blood donation. Hemoglobin 14.2 g/dL. All MoHFW markers non-reactive.'
    });
    setIntervalViolation(null);
    showToast('Demo donor (donor@example.com) pre-filled.', 'info');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Clinical Verification Workflow
        </div>
        <h1 className="text-3xl font-black text-primary-navy">
          Verify Blood Donation & Issue Certificate
        </h1>
        <p className="text-sm text-slate-600">
          Record a completed donor blood collection. This action automatically credits +100 points to the donor, generates a tamper-proof digital Certificate of Appreciation with QR validation, and updates your hospital blood stock.
        </p>
      </div>

      {resultData ? (
        <div className="p-8 rounded-3xl glass-panel border border-emerald-300 shadow-xl space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              Donation Verified & Certificate Issued!
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Donor <strong>{resultData.donor?.name}</strong> has received <strong>+{resultData.pointsAwarded} points</strong> and their official certificate is now ready.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Certificate Identifier:</span>
              <span className="font-mono font-bold text-purple-700">{resultData.certificateId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Donor Account:</span>
              <span className="font-bold text-slate-800">{resultData.donor?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Inventory Status:</span>
              <span className="font-bold text-emerald-700">Stock automatically incremented</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/verify-certificate/${resultData.certificateId}`}
              className="flex-1 py-3 px-4 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition text-center flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" /> View Public Certificate Page
            </Link>
            <button
              onClick={() => {
                setResultData(null);
                setFormData({
                  donorIdentifier: '',
                  bloodGroup: 'O+',
                  units: 1,
                  donationDate: new Date().toISOString().split('T')[0],
                  notes: ''
                });
              }}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              Verify Another Donation
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xl border border-white/80 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Donor Registered Email or Mobile *</label>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                >
                  Fill Demo Donor (donor@example.com)
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. donor@example.com or 9876543210"
                value={formData.donorIdentifier}
                onChange={(e) => setFormData({ ...formData, donorIdentifier: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>

            {/* Donation Modality Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Donation Modality (India MoHFW 2025 Guidelines) *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, donationType: 'whole_blood' })}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                    formData.donationType === 'whole_blood'
                      ? 'border-[#D7263D] bg-rose-50/50 ring-2 ring-[#D7263D]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <Droplet className={`w-5 h-5 ${formData.donationType === 'whole_blood' ? 'text-[#D7263D] fill-[#D7263D]' : 'text-slate-400'}`} />
                  <div>
                    <strong className="block text-xs font-bold text-slate-800">Whole Blood</strong>
                    <span className="text-[10px] text-slate-500">Male: 90d / Female: 120d interval</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, donationType: 'platelet_apheresis' })}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                    formData.donationType === 'platelet_apheresis'
                      ? 'border-teal bg-teal-50/50 ring-2 ring-teal/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <Activity className={`w-5 h-5 ${formData.donationType === 'platelet_apheresis' ? 'text-teal' : 'text-slate-400'}`} />
                  <div>
                    <strong className="block text-xs font-bold text-slate-800">Single Platelet Apheresis</strong>
                    <span className="text-[10px] text-slate-500">48h post apheresis / 28d post-WB</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Collected Blood Group *</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-slate-800 bg-white"
                >
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Units (Pints / Bags) *</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Collection Date *</label>
                <input
                  type="date"
                  required
                  value={formData.donationDate}
                  onChange={(e) => setFormData({ ...formData, donationDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
                />
              </div>
            </div>

            {/* MANDATORY PRE-DONATION MEDICAL SCREENING SECTION */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Mandatory Medical Screening (eRaktkosh / MoHFW 2025)
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Physical On-Site Screening</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Hemoglobin (Hb in g/dL) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="10.0"
                    max="20.0"
                    required
                    value={formData.screeningHb}
                    onChange={(e) => setFormData({ ...formData, screeningHb: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-500">Min 12.5 g/dL required</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Body Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="40"
                    max="200"
                    required
                    value={formData.screeningWeight}
                    onChange={(e) => setFormData({ ...formData, screeningWeight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-500">Min 45 kg (WB) / 50 kg (Apheresis)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Blood Pressure (mmHg) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="120/80"
                    value={formData.screeningBp}
                    onChange={(e) => setFormData({ ...formData, screeningBp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-500">Norm: 100-140 / 60-90</span>
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.screeningConfirmed}
                  onChange={(e) => setFormData({ ...formData, screeningConfirmed: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 mt-0.5"
                />
                <span>
                  <strong>Clinical Certification:</strong> I certify that the donor's physical vitals, hemoglobin level (≥ 12.5 g/dL), body weight, and mandatory recovery intervals have been verified in accordance with India's 2025 MoHFW donor selection standards.
                </span>
              </label>
            </div>

            {/* Interval Violation Alert Box (if detected) */}
            {intervalViolation && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 space-y-2 animate-in fade-in">
                <div className="flex items-start gap-2.5 text-xs text-rose-900 font-bold">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-rose-950">Safe Donation Interval Violation Detected!</h4>
                    <p className="font-normal text-rose-800 mt-0.5">{intervalViolation.error}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-rose-200">
                  <label className="flex items-center gap-2 text-xs text-rose-900 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.medicalOverride}
                      onChange={(e) => setFormData({ ...formData, medicalOverride: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>
                      Authorized Physician Override (Emergency clinical exception documented in hospital records)
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Screening & Laboratory Notes</label>
              <textarea
                rows={3}
                placeholder="e.g. Whole blood collection, screening negative for HIV, HBV, HCV, Syphilis, and Malaria."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>

            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-teal-700" /> Automated Verification Actions
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                <li>+100 Points automatically awarded to the donor</li>
                <li>Digital Certificate of Appreciation generated with unique certificate ID & QR seal</li>
                <li>Hospital inventory for {formData.bloodGroup} incremented by +{formData.units} unit(s)</li>
                <li>Email confirmation dispatched to donor</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-teal w-full py-3.5 rounded-xl text-white text-sm font-bold shadow-md shadow-teal-900/10 hover:bg-teal-700 transition flex items-center justify-center gap-2 cursor-pointer pt-3"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                'Confirm Verification & Issue Certificate'
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default HospitalVerifyDonation;
