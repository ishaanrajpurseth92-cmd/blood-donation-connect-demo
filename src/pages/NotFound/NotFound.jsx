import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-crimson-red flex items-center justify-center mx-auto shadow-md border border-rose-200">
          <Droplet className="w-10 h-10 fill-crimson-red" />
        </div>
        <h1 className="text-6xl font-black text-primary-navy">404</h1>
        <h2 className="text-2xl font-black text-slate-800">Page Not Found</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          The requested page could not be located on the Blood Donation Connect platform. It may have been moved or the address may be incorrect.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-crimson-red hover:bg-dark-crimson text-white text-xs font-bold transition flex items-center gap-2 shadow-md"
          >
            <Home className="w-4 h-4" /> Return to Home
          </Link>
          <Link
            to="/find-blood"
            className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Find Blood
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
