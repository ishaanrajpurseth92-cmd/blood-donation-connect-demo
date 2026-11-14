
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reportAPI } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  FileText,
  Download,
  Activity,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const COLORS = [
  '#D7263D',
  '#2A9D8F',
  '#102A43',
  '#7667C7',
  '#F59E0B',
  '#3B82F6',
  '#10B981',
  '#EC4899'
];

// Extract report from the API response wrapper.
const normalizeReport = (response) => {
  return response?.data?.data || response?.data || {};
};

const formatDate = (value) => {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString('en-IN')
    : '0';
};

const getStatusLabel = (status) => {
  if (!status) return 'Not available';

  return String(status)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const BloodReports = () => {
  const { isHospital } = useAuth();

  const [activeTab, setActiveTab] = useState(
    isHospital ? 'hospital' : 'user'
  );

  const [timeRange, setTimeRange] = useState('30days');
  const [userReport, setUserReport] = useState(null);
  const [hospitalReport, setHospitalReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==========================================
  // LOAD REPORT
  // ==========================================

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (isHospital) {
        const response = await reportAPI.getHospitalReport({
          timeRange
        });

        setHospitalReport(normalizeReport(response));
      } else {
        const response = await reportAPI.getUserReport({
          timeRange
        });

        setUserReport(normalizeReport(response));
      }
    } catch (err) {
      console.error('Blood report loading error:', err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load report. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [isHospital, timeRange]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // ==========================================
  // DONOR REPORT DATA
  // ==========================================

  const profile = userReport?.profile || {};
  const userSummary = userReport?.summary || {};

  const donations = Array.isArray(userReport?.donations)
    ? userReport.donations
    : [];

  const verifiedDonations = Number(
    userSummary.verifiedDonationsCount ??
    userSummary.totalDonations ??
    0
  );

  const rewardPoints = Number(
    userSummary.lifetimeTotalPoints ??
    userSummary.totalPoints ??
    0
  );

  // Illustrative estimate, not a confirmed clinical outcome.
  const estimatedLivesImpacted = verifiedDonations * 3;

  // ==========================================
  // HOSPITAL REPORT DATA
  // ==========================================

  const hospital = hospitalReport?.hospital || {};
  const hospitalSummary = hospitalReport?.summary || {};
  const stockTotals = hospitalReport?.stockTotals || {};
  const requestMetrics = hospitalReport?.requestMetrics || {};

  const bloodStock = Array.isArray(hospitalReport?.bloodStock)
    ? hospitalReport.bloodStock
    : [];

  const pieStock = bloodStock.filter(
    (item) => Number(item.available_units) > 0
  );

  // ==========================================
  // DONOR PDF
  // ==========================================

  const handleDownloadUserPDF = () => {
    if (!userReport) return;

    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(16, 42, 67);

    doc.text(
      'BLOOD DONATION CONNECT - DONOR ACTIVITY REPORT',
      14,
      22,
      { maxWidth: 180 }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    doc.text(
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      14,
      31
    );

    doc.line(14, 35, 196, 35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(16, 42, 67);

    doc.text(
      `Donor: ${profile.full_name || 'Not available'}`,
      14,
      45
    );

    doc.text(
      `Blood Group: ${profile.blood_group || 'Not available'}`,
      14,
      52
    );

    doc.text(
      `Verified Donations: ${verifiedDonations}`,
      14,
      59
    );

    doc.text(
      `Lifetime Reward Points: ${rewardPoints}`,
      14,
      66
    );

    doc.text(
      `Estimated Lives Potentially Impacted: ${estimatedLivesImpacted}`,
      14,
      73
    );

    const tableData = donations.map((donation) => [
      formatDate(donation.date),
      donation.hospitalName || 'Hospital unavailable',
      donation.bloodGroup || 'N/A',
      `${donation.units ?? 0} unit(s)`,
      getStatusLabel(donation.status),
      donation.certificateId || 'N/A'
    ]);

    autoTable(doc, {
      startY: 82,
      head: [[
        'Date',
        'Hospital',
        'Blood Group',
        'Units',
        'Status',
        'Certificate ID'
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 42, 67],
        textColor: 255
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      }
    });

    const finalY = (doc.lastAutoTable?.finalY || 90) + 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text(
      'This report shows donation activity, not medical laboratory results. Estimated impact is not a confirmed patient outcome.',
      14,
      finalY,
      { maxWidth: 180 }
    );

    const fileName = (profile.full_name || 'Donor')
      .replace(/[^a-z0-9]/gi, '_');

    doc.save(`Donor_Report_${fileName}.pdf`);
  };

  // ==========================================
  // HOSPITAL PDF
  // ==========================================

  const handleDownloadHospitalPDF = () => {
    if (!hospitalReport) return;

    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(16, 42, 67);

    doc.text(
      'HOSPITAL BLOOD BANK INVENTORY REPORT',
      14,
      22,
      { maxWidth: 180 }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    doc.text(
      `Facility: ${hospital.name || 'Hospital'}`,
      14,
      31
    );

    doc.text(
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      14,
      37
    );

    doc.line(14, 41, 196, 41);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(16, 42, 67);

    doc.text(
      `Available Units: ${formatNumber(stockTotals.available)}`,
      14,
      51
    );

    doc.text(
      `Reserved Units: ${formatNumber(stockTotals.reserved)}`,
      14,
      58
    );

    doc.text(
      `Expired Units: ${formatNumber(stockTotals.expired)}`,
      14,
      65
    );

    doc.text(
      `Requests Received: ${formatNumber(requestMetrics.totalReceived)}`,
      14,
      72
    );

    doc.text(
      `Fulfillment Rate: ${formatNumber(requestMetrics.fulfillmentRate)}%`,
      14,
      79
    );

    const stockTable = bloodStock.map((item) => [
      item.blood_group || 'N/A',
      formatNumber(item.available_units),
      formatNumber(item.reserved_units),
      formatNumber(item.expired_units),
      getStatusLabel(item.status),
      formatDate(item.last_updated)
    ]);

    autoTable(doc, {
      startY: 88,
      head: [[
        'Blood Group',
        'Available',
        'Reserved',
        'Expired',
        'Status',
        'Last Updated'
      ]],
      body: stockTable,
      theme: 'grid',
      headStyles: {
        fillColor: [42, 157, 143],
        textColor: 255
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      }
    });

    const fileName = (hospital.name || 'Hospital')
      .replace(/[^a-z0-9]/gi, '_');

    doc.save(`Hospital_Blood_Report_${fileName}.pdf`);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            Healthcare Analytics & Audit Logs
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-primary-navy">
            Blood Donation & Inventory Reports
          </h1>

          <p className="text-sm text-slate-600 mt-1">
            View donation activity, reward points, blood inventory
            and hospital fulfillment analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={timeRange}
            onChange={(event) => setTimeRange(event.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
            <option value="1year">Last 1 Year</option>
          </select>

          {isHospital ? (
            <button
              onClick={handleDownloadHospitalPDF}
              disabled={!hospitalReport}
              className="btn-teal inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              Download PDF Report
            </button>
          ) : (
            <>
              <a
                href={reportAPI.downloadCsvUrl}
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </a>

              <button
                onClick={handleDownloadUserPDF}
                disabled={!userReport}
                className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* HEALTHCARE NOTICE */}

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />

        <div>
          <strong>Healthcare Classification Notice:</strong>{' '}
          This page displays donation activity and blood bank
          inventory information. It is not a clinical laboratory
          diagnostic report. Estimated lives impacted are illustrative
          estimates, not confirmed patient outcomes.
        </div>
      </div>

      {/* LOADING */}

      {loading ? (
        <LoadingSkeleton count={3} />

      ) : error ? (

        <div className="glass-panel p-8 text-center rounded-3xl border border-red-200">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />

          <p className="text-sm font-bold text-red-700">
            {error}
          </p>

          <button
            onClick={loadReports}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-navy text-white text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>

      ) : isHospital && hospitalReport ? (

        /* ======================================
           HOSPITAL REPORT
        ====================================== */

        <div className="space-y-8">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <div className="p-6 rounded-2xl glass-panel border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Available Units
              </span>

              <div className="text-3xl font-black text-primary-navy mt-2">
                {formatNumber(stockTotals.available)}
              </div>

              <div className="text-xs text-slate-500 mt-2">
                Ready for patient dispatch
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Reserved & Expired
              </span>

              <div className="text-2xl font-black text-amber-600 mt-2">
                {formatNumber(stockTotals.reserved)}
                {' / '}
                {formatNumber(stockTotals.expired)}
              </div>

              <div className="text-xs text-slate-500 mt-2">
                Reserved vs expired units
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Request Fulfillment
              </span>

              <div className="text-3xl font-black text-teal mt-2">
                {formatNumber(requestMetrics.fulfillmentRate)}%
              </div>

              <div className="text-xs text-slate-500 mt-2">
                {formatNumber(requestMetrics.fulfilled)} of{' '}
                {formatNumber(requestMetrics.totalReceived)} fulfilled
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Verified Donations
              </span>

              <div className="text-3xl font-black text-emerald-600 mt-2">
                {formatNumber(hospitalSummary.verifiedDonationsCount)}
              </div>

              <div className="text-xs text-slate-500 mt-2">
                In selected reporting period
              </div>
            </div>

          </div>

          {/* INVENTORY TABLE */}

          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">
            <h3 className="text-xl font-black text-primary-navy mb-5">
              Blood Inventory Details
            </h3>

            {bloodStock.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Blood Group</th>
                      <th className="py-3 px-4">Available</th>
                      <th className="py-3 px-4">Reserved</th>
                      <th className="py-3 px-4">Expired</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Last Updated</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {bloodStock.map((item, index) => (
                      <tr key={`${item.blood_group}-${index}`}>
                        <td className="py-3 px-4">
                          <BloodGroupBadge
                            group={item.blood_group}
                            size="sm"
                          />
                        </td>

                        <td className="py-3 px-4 font-bold text-emerald-700">
                          {formatNumber(item.available_units)}
                        </td>

                        <td className="py-3 px-4">
                          {formatNumber(item.reserved_units)}
                        </td>

                        <td className="py-3 px-4 text-red-600">
                          {formatNumber(item.expired_units)}
                        </td>

                        <td className="py-3 px-4">
                          {getStatusLabel(item.status)}
                        </td>

                        <td className="py-3 px-4">
                          {formatDate(item.last_updated)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500 py-8">
                No inventory records found.
              </p>
            )}
          </div>

          {/* CHARTS */}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="text-lg font-black text-primary-navy">
                Blood Group Unit Distribution
              </h3>

              <div className="h-72 w-full">
                {bloodStock.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bloodStock}>
                      <XAxis
                        dataKey="blood_group"
                        stroke="#64748B"
                        fontSize={12}
                      />

                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip />
                      <Legend />

                      <Bar
                        dataKey="available_units"
                        name="Available Units"
                        fill="#D7263D"
                        radius={[6, 6, 0, 0]}
                      />

                      <Bar
                        dataKey="reserved_units"
                        name="Reserved Units"
                        fill="#2A9D8F"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No inventory chart data available.
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="text-lg font-black text-primary-navy">
                Available Stock Proportions
              </h3>

              <div className="h-72 w-full flex items-center justify-center">
                {pieStock.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieStock}
                        dataKey="available_units"
                        nameKey="blood_group"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        label
                      >
                        {pieStock.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-sm text-slate-400">
                    No available stock data.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      ) : !isHospital && userReport ? (

        /* ======================================
           DONOR REPORT
        ====================================== */

        <div className="space-y-8">

          {/* DONOR SUMMARY */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <div className="p-6 rounded-2xl glass-panel border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Donor Profile
              </span>

              <div className="text-xl font-black text-slate-900 mt-2">
                {profile.full_name || 'Name unavailable'}
              </div>

              <div className="text-xs text-crimson-red font-bold mt-2 flex items-center gap-2">
                Blood Group:

                {profile.blood_group ? (
                  <BloodGroupBadge
                    group={profile.blood_group}
                    size="sm"
                  />
                ) : (
                  'Not available'
                )}
              </div>

              <div className="text-xs text-slate-500 mt-2">
                {profile.city || 'City unavailable'}
                {profile.state ? `, ${profile.state}` : ''}
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Verified Donations
              </span>

              <div className="text-3xl font-black text-primary-navy mt-2">
                {formatNumber(verifiedDonations)}
              </div>

              <div className="text-xs text-emerald-600 font-semibold mt-2">
                ~{formatNumber(estimatedLivesImpacted)} estimated
                lives potentially impacted
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Lifetime Reward Points
              </span>

              <div className="text-3xl font-black text-amber-500 mt-2">
                {formatNumber(rewardPoints)}
                <span className="text-sm ml-1">pts</span>
              </div>

              <div className="text-xs text-slate-600 font-semibold mt-2">
                Total recorded reward points
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Account Information
              </span>

              <div className="text-sm font-black text-teal mt-2">
                {formatDate(profile.created_at)}
              </div>

              <div className="text-xs text-slate-500 mt-2">
                Account registration date
              </div>
            </div>

          </div>

          {/* DONATION HISTORY */}

          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="text-xl font-black text-primary-navy">
                  Donation Activity Breakdown
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Donation records for the selected time period.
                </p>
              </div>

              <span className="text-xs font-bold text-slate-500">
                {donations.length} record(s)
              </span>
            </div>

            {donations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Hospital Name</th>
                      <th className="py-3 px-4">Blood Group</th>
                      <th className="py-3 px-4">Units</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Verified By</th>
                      <th className="py-3 px-4">Certificate ID</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {donations.map((donation) => (
                      <tr
                        key={donation.id}
                        className="hover:bg-slate-50/50"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {formatDate(donation.date)}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {donation.hospitalName || 'Hospital unavailable'}

                          {donation.hospitalCity && (
                            <div className="text-[10px] font-normal text-slate-500 mt-1">
                              {donation.hospitalCity}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {donation.bloodGroup ? (
                            <BloodGroupBadge
                              group={donation.bloodGroup}
                              size="sm"
                            />
                          ) : (
                            'N/A'
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {formatNumber(donation.units)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            donation.status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {getStatusLabel(donation.status)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {donation.verifiedBy || 'Not provided'}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                          {donation.certificateId || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />

                <p className="text-sm font-bold text-slate-600">
                  No donations found for this time period.
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  Try selecting a longer reporting period.
                </p>
              </div>
            )}

          </div>

        </div>

      ) : (

        <div className="glass-panel p-8 text-center text-sm text-slate-500 rounded-3xl">
          No report data is available for this account.
        </div>

      )}

    </div>
  );
};

export default BloodReports;
