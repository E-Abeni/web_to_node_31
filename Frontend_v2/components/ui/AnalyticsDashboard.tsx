
import React, { useState, useMemo, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, 
  Legend 
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

export const AnalyticsDashboard: React.FC = ({account}) => {
    if (!account) return null;

    const TRANSACTION_DATA = useMemo(() => {
      if (!account) return {};

      try {
        return {
          frequency_1hr_all: JSON.parse(account.frequency_1hr_all || '{}'),
          frequency_24hr_all: JSON.parse(account.frequency_24hr_all || '{}'),
          volume_1hr_all: JSON.parse(account.volume_1hr_all || '{}'),
          volume_24hr_all: JSON.parse(account.volume_24hr_all || '{}'),
          frequent_destinations: JSON.parse(account.frequent_destinations || '{}'),
          prefered_branches: JSON.parse(account.prefered_branches || '{}'),
          top_beneficiaries: JSON.parse(account.top_beneficiaries || '{}'),
          used_transaction_types: JSON.parse(account.used_transaction_types || '{}'),
        };
      } catch (e) {
        console.error("Error parsing account data", e);
        return {};
      }
    }, [account]); // Recalculates whenever 'account' changes

    // To check if it's working, log it in the body of the component
    console.log("Current TRANSACTION_DATA:", TRANSACTION_DATA);

    
    
   if (Object.keys(TRANSACTION_DATA).length === 0 || !TRANSACTION_DATA || 
        Object.keys(TRANSACTION_DATA.frequency_1hr_all).length === 0 ||
        Object.keys(TRANSACTION_DATA.frequency_24hr_all).length === 0 ||
        Object.keys(TRANSACTION_DATA.volume_1hr_all).length === 0 ||
        Object.keys(TRANSACTION_DATA.volume_24hr_all).length === 0 ||
        //Object.keys(TRANSACTION_DATA.frequent_destinations).length === 0 ||
        Object.keys(TRANSACTION_DATA.prefered_branches).length === 0 ||
        Object.keys(TRANSACTION_DATA.top_beneficiaries).length === 0
        ){
      return <div className="text-black">Loading...</div>;
    }  

  const [timeMode, setTimeMode] = useState<'1hr' | '24hr'>('1hr');
  const [metricMode, setMetricMode] = useState<'frequency' | 'volume'>('frequency');

  const timeSeriesData = useMemo(() => {
    const key = `${metricMode}_${timeMode}_all` as keyof typeof TRANSACTION_DATA;
    const raw = TRANSACTION_DATA[key] as Record<string, number>;
    return Object.entries(raw).map(([time, value]) => ({
      // Formatting time to be more readable
      time: time.split(' ')[1].substring(0, 5),
      fullDate: time,
      value
    }));
  }, [timeMode, metricMode]);

  const destinationData = useMemo(() => {
    return Object.entries(TRANSACTION_DATA.frequent_destinations)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any|number, b: any|number) => b.value - a.value)
      .slice(0, 8);
  }, []);

  
  const beneficiaryData = useMemo(() => {
    return Object.entries(TRANSACTION_DATA.top_beneficiaries)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 5);
  }, []);

  const branchData = useMemo(() => {
    return Object.entries(TRANSACTION_DATA.prefered_branches)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 5);
  }, []);

  const transactionTypeData = useMemo(() => {
    return Object.entries(TRANSACTION_DATA.used_transaction_types)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 5);
  }, []);

  

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button 
            onClick={() => setMetricMode('frequency')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${metricMode === 'frequency' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Frequency
          </button>
          <button 
            onClick={() => setMetricMode('volume')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${metricMode === 'volume' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Volume
          </button>
        </div>

        <div className="flex items-center gap-3 p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setTimeMode('1hr')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${timeMode === '1hr' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Hourly (1h)
          </button>
          <button 
            onClick={() => setTimeMode('24hr')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${timeMode === '24hr' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Daily (24h)
          </button>
        </div>
      </div>

      {/* Main Time Series Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">
            {metricMode.charAt(0).toUpperCase() + metricMode.slice(1)} over Time
          </h3>
          <p className="text-sm text-slate-500">Visualizing {timeMode} interval metrics</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#94a3b8'}} 
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#94a3b8'}}
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelClassName="font-bold text-slate-800"
              />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid for smaller charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequent Destinations */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Frequent Destinations</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={destinationData} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {destinationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Beneficiaries Table-style chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Beneficiary Accounts</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {beneficiaryData.map((ben, i) => (
              <div key={ben.name} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm border border-slate-100">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-mono font-medium text-slate-700">{ben.name}</div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(ben.value / beneficiaryData[0].value) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-800 bg-indigo-50 px-3 py-1 rounded-lg">
                  {ben.value} tx
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Branches Table-style chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Branches Used</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {branchData.map((ben, i) => (
              <div key={ben.name} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm border border-slate-100">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-mono font-medium text-slate-700">{ben.name}</div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(ben.value / branchData[0].value) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-800 bg-indigo-50 px-3 py-1 rounded-lg">
                  {ben.value} tx
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Types */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Transaction Types</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={transactionTypeData} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {destinationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100">
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">Total Transactions</p>
          <p className="text-3xl font-extrabold">{TRANSACTION_DATA.used_transaction_types.TRANSFER} Txs</p>
          <div className="mt-4 flex items-center gap-2 text-indigo-100 text-xs">
            <span className="bg-white/20 p-1 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </span>
            
          </div>
        </div>
      </div>
    </div>
  );
};
