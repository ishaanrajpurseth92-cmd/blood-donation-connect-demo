import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateAPI } from '../../services/api';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import {
  ShieldCheck, AlertCircle, CheckCircle2, Building2, Calendar,
  User, Award, Droplet, ArrowRight
} from 'lucide-react';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (certificateId) {
      setLoading(true);
      certificateAPI.verifyCertificate(certificateId)
        .then(res => {
          if (res.data.isValid) {
            setCertData(res.data.certificate);
          } else {
            setError(res.data.message || 'Certificate verification failed.');
          }
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Certificate not found or unverified.');
        })
        .finally(() => setLoading(false));
    }
  }, [certificateId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xl border border-white/80 space-y-6">
        
        {loading ? (
          <div className="py-12 text-center space-y-4">
            <span className="animate-spin rounded-full h-10 w-10 border-4 border-crimson-red border-t-transparent inline-block" />
            <p className="text-sm font-semibold text-slate-600">Verifying digital certificate seal against National Healthcare Registry...</p>
          </div>
        ) : error ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-crimson-red flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-primary-navy">Verification Failed</h2>
            <p className="text-sm text-rose-700 bg-rose-50 p-4 rounded-xl border border-rose-200">
              {error}
            </p>
            <div className="pt-4">
              <Link to="/" className="text-xs font-bold text-slate-600 hover:text-crimson-red underline">
                &larr; Return to Homepage
              </Link>
            </div>
          </div>
        ) : certData ? (
          <div className="space-y-6 animate-in zoom-in-95">
            {/* Authenticity Badge */}
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs shadow-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Official Healthcare Record
              </span>
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-primary-navy">
                Certificate Authenticated
              </h1>
              <p className="text-xs font-mono font-bold text-purple-700">
                Registry ID: {certData.certificateId}
              </p>
            </div>

            {/* Donor & Donation Details */}
            <div className="p-6 rounded-2xl bg-white/90 border border-slate-200/80 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Donor Full Name</span>
                <span className="text-base font-black text-slate-900">{certData.donorName}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Blood Group</span>
                <BloodGroupBadge group={certData.bloodGroup} size="sm" />
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Collection Date</span>
                <span className="font-bold text-slate-800">{certData.donationDate}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Accredited Hospital</span>
                <span className="font-bold text-slate-800">{certData.hospitalName}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Hospital Medical License</span>
                <span className="font-mono text-slate-700 font-bold">{certData.licenseNumber}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Authorized Officer</span>
                <span className="font-semibold text-slate-800">{certData.representativeName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Certificate Issue Date</span>
                <span className="font-medium text-slate-600">{certData.issueDate}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                This digital record was verified directly against the Blood Donation Connect cryptographic hospital audit ledger. The verified donor contributed voluntary whole blood for patient healthcare support.
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson-red hover:text-dark-crimson"
              >
                Learn More About Blood Donation Connect <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};

export default VerifyCertificate;
