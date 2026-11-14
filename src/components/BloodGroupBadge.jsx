import React from 'react';

const BloodGroupBadge = ({ group, size = 'md', showCompat = false }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1 font-bold',
    lg: 'text-lg px-4 py-2 font-black'
  };

  const groupColors = {
    'O+': 'bg-rose-100 text-rose-800 border-rose-300',
    'O-': 'bg-red-600 text-white border-red-700 shadow-sm', // Universal donor
    'A+': 'bg-blue-100 text-blue-800 border-blue-300',
    'A-': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'B+': 'bg-teal-100 text-teal-800 border-teal-300',
    'B-': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'AB+': 'bg-purple-100 text-purple-800 border-purple-300', // Universal recipient
    'AB-': 'bg-violet-100 text-violet-800 border-violet-300'
  };

  const compatInfo = {
    'O-': 'Universal Red Cell Donor',
    'O+': 'Gives to O+, A+, B+, AB+',
    'A+': 'Gives to A+, AB+',
    'A-': 'Gives to A+, A-, AB+, AB-',
    'B+': 'Gives to B+, AB+',
    'B-': 'Gives to B+, B-, AB+, AB-',
    'AB+': 'Universal Plasma Donor / Recipient',
    'AB-': 'Gives to AB+, AB-'
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`rounded-xl border inline-flex items-center justify-center tracking-tight ${sizeClasses[size] || sizeClasses.md} ${groupColors[group] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {group}
      </span>
      {showCompat && compatInfo[group] && (
        <span className="text-[11px] font-medium text-slate-500 bg-white/70 px-2 py-0.5 rounded-md border border-slate-200">
          {compatInfo[group]}
        </span>
      )}
    </div>
  );
};

export default BloodGroupBadge;
