import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Heart, Phone, Mail, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#102A43] text-slate-200 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Healthcare Disclaimer Alert */}
        <div className="p-5 rounded-2xl bg-[#0B1F33] border border-slate-700/80 mb-12 flex items-start gap-3.5 text-xs leading-relaxed text-slate-200 shadow-lg">
          <AlertCircle className="w-5 h-5 text-[#D7263D] shrink-0 mt-0.5" />
          <div>
            <strong className="text-white font-bold">Healthcare & Availability Notice:</strong> Blood Donation Connect facilitates verified digital communication between patients, registered donors, and accredited hospitals. Real-time stock counts represent verified hospital declarations; patients and caregivers should always call the hospital helpline prior to physical transit to reserve specific emergency units.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#D7263D] text-white flex items-center justify-center shadow-md">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Blood<span className="text-[#D7263D]">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              A healthcare technology platform connecting voluntary blood donors, patients in critical need, and certified hospital blood banks through real-time inventory tracking and location intelligence.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Verified Hospital Network
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/find-blood" className="hover:text-white transition">Find Blood Units</Link></li>
              <li><Link to="/requests" className="hover:text-white transition">Urgent Blood Requests</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Become a Donor</Link></li>
              <li><Link to="/reports" className="hover:text-white transition">Blood Stock Reports</Link></li>
              <li><Link to="/donor-points" className="hover:text-white transition">Donor Rewards & Points</Link></li>
            </ul>
          </div>

          {/* Column 3: Portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Access Portals</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/login" className="hover:text-white transition">Donor Login</Link></li>
              <li><Link to="/hospital/login" className="hover:text-white transition">Hospital Portal Login</Link></li>
              <li><Link to="/hospital/register" className="hover:text-white transition">Register Hospital</Link></li>
              <li><Link to="/admin" className="hover:text-white transition">Administrative Portal</Link></li>
            </ul>
          </div>

          {/* Column 4: Emergency Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">24/7 Helpline</h4>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-white font-bold">1800-BLOOD-CONNECT</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>support@bloodconnect.org</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Healthcare Tech Center, Connaught Place, New Delhi 110001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Blood Donation Connect. All rights reserved. Built with precision for healthcare impact.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              Made with <Heart className="w-3.5 h-3.5 text-[#D7263D] fill-[#D7263D]" /> to save lives
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;