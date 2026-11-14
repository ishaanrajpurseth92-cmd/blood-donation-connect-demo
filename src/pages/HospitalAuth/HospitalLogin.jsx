import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../services/api';
import { Building2, Mail, Lock, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

const HospitalLogin = () => {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('apollo.delhi@bloodconnect.org');
  const [password, setPassword] = useState('Hospital@1234');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your official email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.loginHospital({ email, password });
      setAuthSession(res.data.token, res.data.hospital, 'hospital');
      showToast(`Welcome, ${res.data.hospital.name}!`, 'success');
      navigate('/hospital/dashboard');
    } catch (err) {
      showToast(err.response?.data?.error || 'Hospital authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('apollo.delhi@bloodconnect.org');
    setPassword('Hospital@1234');
    showToast('Demo hospital credentials loaded (Apollo Lifeline Hospital).', 'info');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl shadow-xl border border-white/80 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal text-white flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-primary-navy tracking-tight">
            Hospital & Blood Bank Portal
          </h2>
          <p className="text-xs text-slate-500">
            Authorized administrative access for accredited hospital blood bank personnel.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Hospital Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="hospital@domain.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <span className="text-xs text-teal-700 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-teal w-full py-3.5 rounded-xl text-white text-sm font-bold shadow-md shadow-teal-900/20 hover:bg-teal-700 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                Sign In to Hospital Portal <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fill Helper */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2.5 rounded-xl border border-dashed border-teal-300 text-xs font-bold text-teal-800 bg-teal-50/50 hover:bg-teal-50 transition flex items-center justify-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-teal-600" /> Quick Fill Demo Hospital (Apollo Delhi)
          </button>
        </div>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-200/80 text-center text-xs text-slate-500">
          Want to register your healthcare facility?{' '}
          <Link to="/hospital/register" className="font-bold text-teal-700 hover:underline">
            Register Hospital
          </Link>
        </div>

      </div>
    </div>
  );
};

export default HospitalLogin;
