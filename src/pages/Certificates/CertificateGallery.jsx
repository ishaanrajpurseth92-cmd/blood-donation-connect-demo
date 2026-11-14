
import React, { useState, useEffect, useMemo } from 'react';
import { certificateAPI } from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import BloodGroupBadge from '../../components/BloodGroupBadge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import {
  Award, Download, Printer, Droplet, FileText,
  Calendar, Building2, ShieldCheck, QrCode, AlertCircle
} from 'lucide-react';

const formatDate = (value) => {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const normalizeCertificate = (cert) => ({
  id: cert.id,
  certificateNumber:
    cert.certificateNumber ||
    cert.certificate_number ||
    cert.id ||
    'Not available',
  donorName:
    cert.donorName ||
    cert.donor_name ||
    'Donor name unavailable',
  bloodGroup:
    cert.bloodGroup ||
    cert.blood_group ||
    'Not available',
  donationDate:
    cert.donationDate ||
    cert.donation_date ||
    null,
  hospitalName:
    cert.hospitalName ||
    cert.hospital_name ||
    'Hospital name unavailable',
  hospitalLocation:
    cert.hospitalLocation ||
    cert.hospital_location ||
    '',
  issuedAt:
    cert.issuedAt ||
    cert.issued_at ||
    null,
  units: cert.units ?? cert.donation?.units ?? null,
  qrToken: cert.qrToken || cert.qr_verification_token || null,
  status: cert.status || cert.certificate_status || 'UNKNOWN'
});

const CertificateGallery = () => {
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadCertificates = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await certificateAPI.getMyCertificates();

        // The API returns certificates both inside data and as an
        // additional top-level certificates property.
        const rawCertificates =
          res.data?.certificates ||
          res.data?.data?.certificates ||
          (Array.isArray(res.data?.data) ? res.data.data : []) ||
          [];

        const normalized = rawCertificates
          .map(normalizeCertificate)
          .filter((cert) => cert.id || cert.certificateNumber);

        if (mounted) {
          setCertificates(normalized);
          setSelectedCert(normalized[0] || null);
        }
      } catch (err) {
        console.error('Certificate loading failed:', err);

        if (mounted) {
          setError(
            err.response?.data?.message ||
            'Unable to load certificates. Please try again.'
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCertificates();

    return () => {
      mounted = false;
    };
  }, []);

  const qrVerifyUrl = useMemo(() => {
    if (!selectedCert?.certificateNumber ||
        selectedCert.certificateNumber === 'Not available') {
      return '';
    }

    return `${window.location.origin}/verify-certificate/${encodeURIComponent(
      selectedCert.certificateNumber
    )}`;
  }, [selectedCert]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!selectedCert) return;

    const cert = selectedCert;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const w = 297;
    const h = 210;

    doc.setFillColor(244, 247, 251);
    doc.rect(0, 0, w, h, 'F');

    doc.setDrawColor(16, 42, 67);
    doc.setLineWidth(3);
    doc.rect(8, 8, w - 16, h - 16);

    doc.setDrawColor(215, 38, 61);
    doc.setLineWidth(0.8);
    doc.rect(12, 12, w - 24, h - 24);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(21);
    doc.setTextColor(16, 42, 67);
    doc.text('BLOOD DONATION CONNECT', w / 2, 32, {
      align: 'center'
    });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('BLOOD DONATION CERTIFICATE', w / 2, 39, {
      align: 'center'
    });

    doc.setFontSize(25);
    doc.setTextColor(215, 38, 61);
    doc.text('CERTIFICATE OF APPRECIATION', w / 2, 59, {
      align: 'center'
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('PRESENTED TO', w / 2, 73, {
      align: 'center'
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(25);
    doc.setTextColor(16, 42, 67);
    doc.text(cert.donorName.toUpperCase(), w / 2, 88, {
      align: 'center'
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);

    doc.text(
      'In recognition of your voluntary blood donation and your contribution to the community.',
      w / 2,
      105,
      { align: 'center', maxWidth: 210 }
    );

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(25, 120, 247, 37, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(16, 42, 67);

    doc.text(`Blood Group: ${cert.bloodGroup}`, 35, 132);
    doc.text(`Donation Date: ${formatDate(cert.donationDate)}`, 110, 132);
    doc.text(`Hospital: ${cert.hospitalName}`, 35, 143);
    doc.text(`Certificate No: ${cert.certificateNumber}`, 110, 143);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    doc.text(
      `Issued: ${formatDate(cert.issuedAt)}`,
      w / 2,
      171,
      { align: 'center' }
    );

    doc.text(
      'Use the certificate verification page to check its current status.',
      w / 2,
      180,
      { align: 'center' }
    );

    doc.save(`Certificate_${cert.certificateNumber}.pdf`);
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            Donor Recognition
          </div>

          <h1 className="text-3xl font-black text-primary-navy">
            Blood Donation Certificate Gallery
          </h1>

          <p className="text-sm text-slate-600 mt-1">
            View and download your blood donation certificates.
          </p>
        </div>

        {selectedCert && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              <Printer className="w-4 h-4" />
              Print Certificate
            </button>

            <button
              onClick={handleDownloadPDF}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-4 space-y-3 print:hidden">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Your Certificates ({certificates.length})
            </div>

            {certificates.map((cert) => (
              <button
                type="button"
                key={cert.id || cert.certificateNumber}
                onClick={() => setSelectedCert(cert)}
                className={`w-full text-left p-4 rounded-2xl border transition ${
                  selectedCert?.certificateNumber === cert.certificateNumber
                    ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-400/30 shadow-md'
                    : 'bg-white/80 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="font-mono text-xs font-bold text-purple-800 truncate">
                    {cert.certificateNumber}
                  </span>

                  {cert.bloodGroup !== 'Not available' && (
                    <BloodGroupBadge group={cert.bloodGroup} size="sm" />
                  )}
                </div>

                <div className="text-xs font-bold text-slate-900 truncate">
                  {cert.hospitalName}
                </div>

                <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(cert.donationDate)}
                </div>
              </button>
            ))}
          </div>

          {selectedCert && (
            <div className="lg:col-span-8">
              <div className="w-full bg-[#FBFDFF] p-6 sm:p-12 rounded-3xl border-8 border-primary-navy shadow-2xl relative overflow-hidden print:m-0 print:border-4 print:shadow-none">

                <div className="absolute inset-2 border-2 border-crimson-red/40 pointer-events-none rounded-2xl" />

                <div className="relative z-10 text-center space-y-6">

                  <div className="flex items-center justify-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-crimson-red text-white flex items-center justify-center">
                      <Droplet className="w-5 h-5 fill-white" />
                    </div>

                    <span className="text-xl font-black text-primary-navy tracking-tight">
                      Blood<span className="text-crimson-red">Connect</span>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-4xl font-black text-crimson-red tracking-wide uppercase">
                      Certificate of Appreciation
                    </h2>

                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2">
                      Blood Donation Connect
                    </p>
                  </div>

                  <div className="py-2">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                      This certificate is presented to
                    </p>

                    <div className="text-2xl sm:text-4xl font-serif font-bold text-primary-navy border-b-2 border-crimson-red/40 inline-block px-8 pb-2">
                      {selectedCert.donorName}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                    In recognition of your voluntary blood donation.
                    Your contribution represents a meaningful act of
                    generosity and community support.
                  </p>

                  <div className="max-w-lg mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Blood Group
                      </div>
                      <div className="font-black text-crimson-red text-sm mt-1">
                        {selectedCert.bloodGroup}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Donation Date
                      </div>
                      <div className="font-bold text-slate-800 mt-1">
                        {formatDate(selectedCert.donationDate)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Hospital
                      </div>
                      <div className="font-bold text-slate-800 mt-1 break-words">
                        {selectedCert.hospitalName}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Units
                      </div>
                      <div className="font-bold text-slate-800 mt-1">
                        {selectedCert.units ?? 'Not provided'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">

                    <div className="text-center sm:text-left">
                      <Building2 className="w-6 h-6 text-slate-400 mx-auto sm:mx-0 mb-2" />
                      <div className="font-bold text-slate-800 text-sm">
                        {selectedCert.hospitalName}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase mt-1">
                        Issuing Hospital
                      </div>
                      {selectedCert.hospitalLocation && (
                        <div className="text-xs text-slate-400 mt-1">
                          {selectedCert.hospitalLocation}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-2">
                      {qrVerifyUrl ? (
                        <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                          <QRCodeSVG value={qrVerifyUrl} size={90} level="H" />
                        </div>
                      ) : (
                        <QrCode className="w-16 h-16 text-slate-300" />
                      )}

                      <span className="text-[10px] font-mono text-purple-700 font-bold break-all">
                        {selectedCert.certificateNumber}
                      </span>

                      <span className="text-[9px] text-slate-400">
                        Scan to check certificate status
                      </span>
                    </div>

                    <div className="text-center sm:text-right">
                      <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto sm:ml-auto mb-2" />

                      <div className="text-[10px] font-bold text-slate-600 uppercase">
                        Status: {selectedCert.status}
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1">
                        Issued: {formatDate(selectedCert.issuedAt)}
                      </div>

                      <div className="text-[9px] text-slate-400 mt-1">
                        Blood Donation Connect
                      </div>
                    </div>

                  </div>

                  <div className="text-[10px] text-slate-400 pt-2">
                    Certificate No: {selectedCert.certificateNumber}
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No Certificates Available"
          description="Your certificates will appear here after a hospital verifies a donation and issues a certificate."
          actionText="Find Hospitals to Donate"
          actionLink="/find-blood"
          icon={FileText}
        />
      )}

    </div>
  );
};

export default CertificateGallery;
