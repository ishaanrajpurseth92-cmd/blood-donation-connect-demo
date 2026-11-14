import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../services/api';
import { Droplet, User, Mail, Phone, Lock, Calendar, MapPin, ShieldCheck, HeartHandshake } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const UserRegister = () => {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: 'Aarav Sharma',
    email: 'new.donor@example.org',
    mobile: '9876543210',
    password: 'Donor@1234',
    confirmPassword: 'Donor@1234',
    dob: '1995-04-18',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '14 Model Town',
    city: 'Phagwara',
    state: 'Punjab',
    pinCode: '144401',
    emergencyContact: '9876543219',
    termsAccepted: true
  });
  const [loading, setLoading] = useState(false);

  // Simple password strength check
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: 'Empty', score: 0, color: 'bg-slate-200' };
    if (pass.length < 6) return { label: 'Weak', score: 1, color: 'bg-rose-500' };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /\d/.test(pass)) {
      return { label: 'Strong', score: 3, color: 'bg-emerald-500' };
    }
    return { label: 'Medium', score: 2, color: 'bg-amber-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      showToast('Please accept the donor terms and conditions.', 'warning');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.registerUser(formData);
      setAuthSession(res.data.token, res.data.user, 'donor');
      showToast('Registration successful! +10 welcome points credited.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.error || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xl border border-white/80 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-crimson-red text-white flex items-center justify-center mx-auto shadow-md">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-primary-navy tracking-tight">
            Register as a Voluntary Donor
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Become a part of our life-saving community. Receive notifications when your blood group is needed, earn recognition points, and download official donation certificates.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Nair"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-slate-800 bg-white"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. donor@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">10-Digit Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800 bg-white"
              >
                <option value="Male">Male (90-Day Whole Blood Interval)</option>
                <option value="Female">Female (120-Day Whole Blood Interval)</option>
                <option value="Other">Other (120-Day Safe Medical Interval)</option>
              </select>
              <span className="text-[10px] text-slate-500">India 2025 MoHFW donor-selection interval standard</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Street Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. 14 Park Avenue, Connaught Place"
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
                placeholder="e.g. 110001"
                value={formData.pinCode}
                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Phone (Optional)</label>
            <input
              type="tel"
              placeholder="e.g. 9876543219"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
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
              {/* Password strength indicator */}
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all`}
                    style={{ width: `${(strength.score / 3) * 100}%` }}
                  />
                </div>
                <span>{strength.label}</span>
              </div>
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

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                required
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="mt-0.5 rounded text-crimson-red focus:ring-rose-500"
              />
              <span>
                I agree to the <strong>Terms of Voluntary Blood Donation</strong>, acknowledge that my information may be used by accredited hospital blood banks in medical emergencies, and confirm I am medically fit to donate.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 rounded-xl text-white text-sm font-bold shadow-md shadow-rose-900/20 hover:bg-dark-crimson transition flex items-center justify-center gap-2 cursor-pointer pt-3"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              'Complete Registration (+10 Points)'
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200/80 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-crimson-red hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default UserRegister;
