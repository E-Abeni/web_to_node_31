import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';

import {Users, Wallet} from 'lucide-react';
import { 
  Activity, Database, Server, ShieldAlert, Globe, Zap, 
  AlertOctagon, Cpu, Radio, Network, Search, AlertTriangle, Brain 
} from 'lucide-react';
import { EngineStats, Transaction, RiskLevel } from '../types';
import { StatCard } from './ui/StatCard';
import { RiskBadge } from './ui/RiskBadge';
import {get_dashboard_data} from '../services/data'



interface DashboardProps {
  stats: EngineStats;
  volumeHistory: { time: string; count: number; riskScoreAvg: number }[];
  transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

export const Dashboard: React.FC<DashboardProps> = ({ stats, transactions }) => {
  
  
  const geoData = useMemo(() => {
    const counts: Record<string, number> = {};
    /*
    transactions.forEach(t => {
      if (false && t.riskLevel === RiskLevel.HIGH || t.riskLevel === RiskLevel.CRITICAL) {
        //counts[t.destinationCountry] = (counts[t.destinationCountry] || 0) + 1;
      }
    });
    */
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  // Calculate Flag Distribution
  const flagData = useMemo(() => {
    const counts: Record<string, number> = {};
    /*
    transactions.forEach(t => {
      t.risk_level.forEach(flag => {
        counts[flag] = (counts[flag] || 0) + 1;
      });
    });
    */

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  // Get Recent High Risk Threats
  const recentThreats = useMemo(() => {
    return transactions
      .filter(t => t.riskLevel === RiskLevel.HIGH || t.riskLevel === RiskLevel.CRITICAL)
      .slice(0, 4);
  }, [transactions]);

  // get dashboard data from my backend

  const [transactionsCount, setTransactionsCount] = useState(0);
  const [cleanedCount, setCleanedCount] = useState(0)
  const [accountsCount, setAccountsCount] = useState(0)
  const [entitiesCount, setEntitiesCount] = useState(0)

  const [totalRecieved, setTotalRecieved] = useState(0)
  const [totalSent, setTotalSent] = useState(0)

  useEffect(()=>{
    get_dashboard_data()
    .then(data => {
      console.log("Dashboard", data)
      setTransactionsCount(Number(data["transactions_recieved"]))
      setCleanedCount(Number(data["transactions_cleaned"]))
      setAccountsCount(Number(data["accounts_encountered"]))
      setEntitiesCount(Number(data["entities_identified"]))
      setTotalRecieved(data['total_received'])
      setTotalSent(data['total_sent'])

    })

  },[])

  const [volumeHistory, setVolumeHistory] = useState([
  { time: '2/12/2026', sent: 0, received: 0 },
  ]);

  useEffect(()=>{
    setVolumeHistory([{ time: '2/12/2026', sent: totalSent, received: totalRecieved }]);
    console.log(volumeHistory)
    console.log(totalRecieved, totalSent)
  }, [totalRecieved, totalSent])



  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Transactions Processed" 
          value={transactionsCount.toLocaleString()} 
          icon={Database} 
          //trend="+12%" 
          trendUp={true} 
          color="text-blue-500 dark:text-blue-400"
        />
        <StatCard 
          title="Cleaned Transactions" 
          value={cleanedCount.toLocaleString()} 
          icon={Database} 
          //trend="Optimal" 
          trendUp={true}
          color="text-green-500 dark:text-green-400" 
        />
        <StatCard 
          title="Accounts Identified" 
          value={accountsCount.toLocaleString()} 
          icon={Wallet} 
          //trend="+5%" 
          trendUp={false}
          color="text-red-500 dark:text-red-400" 
        />
        <StatCard 
          title="Unique Entities Identified" 
          value={entitiesCount.toLocaleString()} 
          icon={Users} 
          color="text-yellow-500 dark:text-yellow-400"
        />
      </div>

      {/* Row 1: Volume & Alert Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm shadow-slate-200/50 dark:shadow-black/20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Transaction Volume
              </h3>
              <p className="text-xs text-slate-500">Total Sent and Received Amounts Analyzed</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Sent
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Received
              </span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {/* Changed AreaChart to BarChart */}
              <BarChart data={volumeHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#94a3b8" 
                  strokeOpacity={0.1} 
                  vertical={false} 
                />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    color: '#f1f5f9', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                />
                
                {/* Bar for Sent Amount */}
                <Bar 
                  dataKey="sent" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
                
                {/* Bar for Received Amount */}
                <Bar 
                  dataKey="received" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col shadow-sm shadow-slate-200/50 dark:shadow-black/20">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-purple-500" />
              Alert Trigger Distribution
            </h3>
            <p className="text-xs text-slate-500">Top rules triggering system alerts</p>
          </div>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={flagData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {flagData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                 <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{flagData.reduce((acc, curr) => acc + curr.value, 0)}</span>
                 <div className="text-[10px] text-slate-500 uppercase tracking-widest">Events</div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {flagData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-slate-600 dark:text-slate-400 truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Live Monitor & Geo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Threat Pulse */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm shadow-slate-200/50 dark:shadow-black/20">
          <div className="flex justify-between items-center mb-4">
             <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Live Threat Pulse
              </h3>
              <p className="text-xs text-slate-500">Real-time detected high-risk activities</p>
             </div>
             <div className="flex items-center gap-2">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-mono text-red-500 dark:text-red-400">LIVE</span>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {recentThreats.map((tx) => (
               <div key={tx.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded hover:border-red-400/50 dark:hover:border-red-900/50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-slate-500">{tx.timestamp.toLocaleTimeString()}</span>
                    <RiskBadge level={tx.riskLevel} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-slate-900 dark:text-white text-lg group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                      {tx.amount.toLocaleString()} <span className="text-sm text-slate-500">{tx.currency}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{tx.id}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tx.flags.slice(0, 3).map((f, i) => (
                      <span key={i} className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                        {f}
                      </span>
                    ))}
                  </div>
               </div>
             ))}
             {recentThreats.length === 0 && (
               <div className="col-span-2 py-8 text-center text-slate-500 text-sm border border-dashed border-slate-300 dark:border-slate-800 rounded">
                 Waiting for high risk events...
               </div>
             )}
          </div>
        </div>

        {/* Global Risk Hotspots */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col shadow-sm shadow-slate-200/50 dark:shadow-black/20">
          <div className="mb-4">
             <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                Global Risk Hotspots
             </h3>
             <p className="text-xs text-slate-500">Top destinations by risk intensity</p>
          </div>
          <div className="flex-1 h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} hide />
                <YAxis dataKey="name" type="category" width={30} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#334155', opacity: 0.1}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {geoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Health Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
              <Cpu className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400">Engine Load</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">{(stats.processingSpeed / 10).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(stats.processingSpeed / 10, 100)}%` }}></div>
              </div>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
              <Network className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400">Network Latency</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono">24ms</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
              <Server className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-slate-500 dark:text-slate-400 uppercase">CPU</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono">{stats.cpuUsage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1">
                  <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${stats.cpuUsage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-slate-500 dark:text-slate-400 uppercase">RAM</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono">{stats.ramUsage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${stats.ramUsage}%` }}></div>
                </div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};