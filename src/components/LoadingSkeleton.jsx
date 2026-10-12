import React from 'react';

export default function LoadingSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse flex flex-col justify-between">
          <div>
            <div className="bg-slate-200 h-44 rounded-xl mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-slate-200 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
          </div>
          <div>
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-3"></div>
            <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
