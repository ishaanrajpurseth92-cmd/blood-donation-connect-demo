import React from 'react';

const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl glass-panel animate-pulse flex flex-col gap-3"
        >
          <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
          <div className="h-4 bg-slate-100 rounded-md w-2/3"></div>
          <div className="h-10 bg-slate-100 rounded-xl w-full mt-2"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
