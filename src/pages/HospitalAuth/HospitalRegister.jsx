import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../services/api';
import MapPicker from '../../components/MapPicker';
import { Building2, ShieldCheck, MapPin, Phone, Mail, Lock, User, FileText } from 'lucide-react';

const HospitalRegister = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: 'Apollo Lifeline Demo Hospital',
    email: 'demo.hospital@bloodconnect.org',
    contactNumber: '9876501234',
    password: 'Hospital@1234',
    confirmPassword: 'Hospital@1234',
    licenseNumber: 'DL-BB-2026-0042',
    hospitalType: 'Private',
    address: 'Sector 12, Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    pinCode: '110001',
    latitude: 28.6139,
    longitude: 77.2090,
    bloodBankAvailable: true,
    representativeName: 'Dr. Kavita Rao'
  });
  const [loading, setLoading] = useState(false);

  const handleCoordinatesChange = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.registerHospital(formData);
      showToast('Hospital registered successfully! Your account will be reviewed by administrators.', 'success');
      navigate('/hospital/login');
    } catch (err) {
      showToast(err.response?.data?.error || 'Hospital registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xl border border-white/80 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal text-white flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-primary-navy tracking-tight">
            Register Healthcare Blood Bank
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Join the certified Blood Donation Connect hospital network. Maintain independent blood stock, receive verified donations, and coordinate emergency transfers.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Blood Center Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. City Care Medical Institute"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Hospital Email *</label>
              <input
                type="email"
                required
                placeholder="e.g. admin@citycare.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medical License / NABH No. *</label>
              <input
                type="text"
                required
                placeholder="e.g. DL-HOSP-2024-9182"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Type *</label>
              <select
                value={formData.hospitalType}
                onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-slate-800 bg-white"
              >
                <option value="Private">Private Hospital</option>
                <option value="Government">Government / Public</option>
                <option value="Trust">Trust / Non-Profit</option>
                <option value="Clinic">Specialized Blood Center</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 011-26825000"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Authorized Representative Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Rajesh Varma (Chief Blood Transfusion Officer)"
              value={formData.representativeName}
              onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Street Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sarita Vihar, Mathura Road"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                placeholder="e.g. New Delhi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                placeholder="e.g. Delhi"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. 110076"
                value={formData.pinCode}
                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>
          </div>

          {/* Interactive Map Picker Section */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Precise Hospital Geolocation on Interactive Map *
            </label>
            <MapPicker
              initialLat={formData.latitude}
              initialLng={formData.longitude}
              onChange={handleCoordinatesChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-600 inline mr-1" />
            <strong>Verification Policy:</strong> To protect public health, all newly registered hospital accounts require administrative validation of license authenticity before public search publishing is enabled.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-teal w-full py-3.5 rounded-xl text-white text-sm font-bold shadow-md shadow-teal-900/20 hover:bg-teal-700 transition flex items-center justify-center gap-2 cursor-pointer pt-3"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              'Submit Hospital Registration for Review'
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200/80 text-center text-xs text-slate-500">
          Already registered as a hospital?{' '}
          <Link to="/hospital/login" className="font-bold text-teal-700 hover:underline">
            Sign In to Hospital Portal
          </Link>
        </div>

      </div>
    </div>
  );
};

export default HospitalRegister;
