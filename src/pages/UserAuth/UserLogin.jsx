import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../services/api';
import { Droplet, Lock, Mail, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

const UserLogin = () => {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('donor@example.com');
  const [password, setPassword] = useState('Donor@1234');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Please provide your email/mobile and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.loginUser({ identifier, password });
      const role = res.data.role || (res.data.type === 'admin' ? 'superadmin' : 'donor');
      setAuthSession(res.data.token, res.data.user, role);
      showToast(`Welcome back, ${res.data.user.fullName || res.data.user.name}!`, 'success');
      navigate(role === 'superadmin' ? '/admin' : '/dashboard');
    } catch (err) {
      showToast(err.response?.data?.error || 'Login failed. Please verify your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIdentifier('donor@example.com');
    setPassword('Donor@1234');
    showToast('Demo donor credentials loaded.', 'info');
  };

  const handleAdminDemoFill = () => {
    setIdentifier('admin@bloodconnect.org');
    setPassword('Admin@1234');
    showToast('Demo administrator credentials loaded.', 'info');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl shadow-xl border border-white/80 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-crimson-red text-white flex items-center justify-center mx-auto shadow-md">
            <Droplet className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-2xl font-black text-primary-navy tracking-tight">
            Donor Account Login
          </h2>
          <p className="text-xs text-slate-500">
            Access your donor dashboard, reward points, and verified donation certificates.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address or Mobile</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="donor@example.com or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl glass-input text-sm text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <span className="text-xs text-crimson-red hover:underline cursor-pointer">
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
            className="btn-primary w-full py-3.5 rounded-xl text-white text-sm font-bold shadow-md shadow-rose-900/20 hover:bg-dark-crimson transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                Sign In to Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Helper */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2.5 rounded-xl border border-dashed border-rose-300 text-xs font-bold text-crimson-red bg-rose-50/50 hover:bg-rose-50 transition flex items-center justify-center gap-1.5"
          >
            <HeartHandshake className="w-3.5 h-3.5" /> Quick Fill Demo Donor Credentials
          </button>
        </div>

        <button type="button" onClick={handleAdminDemoFill} className="w-full py-2.5 rounded-xl border border-dashed border-purple-300 text-xs font-bold text-purple-700 bg-purple-50/50 hover:bg-purple-50 transition flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Quick Fill Demo Admin Credentials
        </button>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-200/80 text-center text-xs text-slate-500">
          Not yet a registered donor?{' '}
          <Link to="/register" className="font-bold text-crimson-red hover:underline">
            Register Now (+10 Welcome Points)
          </Link>
        </div>

      </div>
    </div>
  );
};

export default UserLogin;
