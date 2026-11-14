import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donorAPI } from '../../services/api';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { Droplet, CheckCircle2, FileText, Calendar, Building2, Download } from 'lucide-react';

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donorAPI.getHistory()
      .then(res => setDonations(res.data.donations || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson-red uppercase tracking-wider mb-1">
            <Droplet className="w-3.5 h-3.5 fill-crimson-red" />
            Verified Lifesaving Records
          </div>
          <h1 className="text-3xl font-black text-primary-navy">
            Blood Donation History
          </h1>
          <p className="text-sm text-slate-600">
            Official chronological history of your verified voluntary blood contributions at accredited hospitals.
          </p>
        </div>

        <Link
          to="/reports"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
        >
          <Download className="w-4 h-4 text-slate-500" /> Export Full Report (PDF/CSV)
        </Link>
      </div>

      {/* Table Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : donations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Donation Date</th>
                  <th className="py-3.5 px-4">Hospital / Blood Bank</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Units Donated</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4">Certificate ID</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {d.donation_date}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {d.hospital_name}
                    </td>
                    <td className="py-4 px-4">
                      <BloodGroupBadge group={d.blood_group} size="sm" />
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {d.units} pint(s) (450ml)
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-purple-700">
                      {d.certificate_id || '—'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {d.certificate_id && (
                        <Link
                          to="/certificates"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition border border-purple-200 text-xs"
                        >
                          <FileText className="w-3 h-3" /> Certificate
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Donation Records"
            description="You haven't logged any verified blood donations yet. Schedule a donation at an accredited hospital to start your lifesaving journey!"
            actionText="Find Nearby Hospitals"
            actionLink="/find-blood"
            icon={Droplet}
          />
        )}
      </div>

    </div>
  );
};

export default DonationHistory;
