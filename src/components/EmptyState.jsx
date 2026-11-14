import React from 'react';
import { Droplet, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ title, description, actionText, actionLink, icon: Icon = Inbox }) => {
  return (
    <div className="p-12 text-center rounded-2xl glass-panel border border-dashed border-slate-300 flex flex-col items-center justify-center my-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4 shadow-sm border border-rose-100">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title || 'No Records Found'}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description || 'There are currently no items to display in this section.'}
      </p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crimson-red text-white text-sm font-semibold hover:bg-dark-crimson transition-all shadow-md shadow-rose-900/10"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
