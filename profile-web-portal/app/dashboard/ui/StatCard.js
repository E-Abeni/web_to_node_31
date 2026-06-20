import React from 'react';


export const StatCard = ({ title, value, icon: Icon, trend, trendUp, color = "text-slate-400" }) => {
  return (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg shadow-md shadow-black/20">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    
    <div className="flex items-end justify-between">
      <span className="text-2xl font-bold text-slate-100">{value}</span>
      
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          trendUp 
            ? 'bg-green-900/30 text-green-400' 
            : 'bg-red-900/30 text-red-400'
        }`}>
          {trend}
        </span>
      )}
    </div>
  </div>
);
};