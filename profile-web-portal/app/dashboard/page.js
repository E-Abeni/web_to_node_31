"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, RadialBarChart, RadialBar, LineChart, Line 
} from 'recharts';

import {Users, Wallet} from 'lucide-react';
import { 
  Activity, Database, Server, ShieldAlert, Globe, Zap, 
  AlertOctagon, Cpu, Radio, Network, Search, AlertTriangle, Brain 
} from 'lucide-react';
import { StatCard } from './ui/StatCard';
import { RiskBadge } from '../common-ui/RiskBadge';
import {get_dashboard_data} from '../services/data'


const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

export default function Dashboard () {

  const [stats, setStats] = useState({
    transactionsProcessed: 1245890,
    messagesInQueue: 42,
    processingSpeed: 850,
    flaggedCount: 142,
    cpuUsage: 42,
    ramUsage: 65
  });
  const [transactions, setTransactions] = useState([]);
  
  
  const geoData = useMemo(() => {
    const counts = {};
   
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  // Calculate Flag Distribution
  const flagData = useMemo(() => {
    const counts = {};
   

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

  const [transactionsCount, setTransactionsCount] = useState(120906097);
  const [cleanedCount, setCleanedCount] = useState(113573826)
  const [accountsCount, setAccountsCount] = useState(52529572)
  const [entitiesCount, setEntitiesCount] = useState("-")

  const [totalRecieved, setTotalRecieved] = useState(0)
  const [totalSent, setTotalSent] = useState(0)

  
  useEffect(()=>{
    /*
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
      */

  },[])

  const [volumeHistory, setVolumeHistory] = useState([
  { time: '2/12/2026', sent: 0, received: 0 },
  ]);

  useEffect(()=>{
    setVolumeHistory([{ time: '2/12/2026', sent: totalSent, received: totalRecieved }]);
    console.log(volumeHistory)
    console.log(totalRecieved, totalSent)
  }, [totalRecieved, totalSent])


  //********************************
  //  */


  const riskDistributionData = [
  { tier: "Low", count: 1020, color: "#10b981" },
  { tier: "Medium", count: 80, color: "#f59e0b" },
  { tier: "High", count: 20, color: "#ef4444" },
  //{ tier: "Critical", count: 58, color: "#f97316" },
];

const riskTrendData = [
  { day: "1", score: 2 },
  { day: "5", score: 2 },
  { day: "10", score: 2 },
  { day: "15", score: 2 },
  { day: "20", score: 2 },
  { day: "25", score: 2 },
  { day: "30", score: 2 },
];


  //*********************** */

  const serviceTrafficData = [
  { service: "ML Engine", rpm: 1240 },
  { service: "Rule Engine", rpm: 980 },
  { service: "Risk Scoring", rpm: 860 },
  { service: "Alert Service", rpm: 540 },
];

const connectedServices = [
  {
    name: "Machine Learning Engine",
    description: "Consumes behavioral embeddings for anomaly scoring",
    rpm: 1240,
    latency: "84ms",
    errorRate: "0.2%",
    usage: 88,
    status: "healthy",
  },
  {
    name: "Rule-Based Analysis",
    description: "Evaluates transaction patterns against compliance rules",
    rpm: 980,
    latency: "102ms",
    errorRate: "0.6%",
    usage: 74,
    status: "healthy",
  },
  {
    name: "Risk Aggregator",
    description: "Real-time risk assessment and aggregation service",
    rpm: 720,
    latency: "168ms",
    errorRate: "2.1%",
    usage: 61,
    status: "warning",
  },
];


  //****************************** */


/* ================================
   Risk Score Gauge
================================ */
const riskGaugeData = [
  {
    name: "Risk",
    value: 82,
    fill: "#ef4444",
  },
];


/* ================================
   Rolling Frequency Trend
================================ */
const frequencyTrend = [
  { day: "1", count: 24 },
  { day: "5", count: 31 },
  { day: "10", count: 28 },
  { day: "15", count: 44 },
  { day: "20", count: 51 },
  { day: "25", count: 47 },
  { day: "30", count: 63 },
];


/* ================================
   Rolling Amount Trend
================================ */
const amountTrend = [
  { date: "Week 1", amount: 12000 },
  { date: "Week 2", amount: 18500 },
  { date: "Week 3", amount: 16400 },
  { date: "Week 4", amount: 22800 },
  { date: "Week 5", amount: 27400 },
  { date: "Week 6", amount: 31200 },
];


/* ================================
   Beneficiary Network Nodes
================================ */
const beneficiaryNodes = [
  {
    id: "C1",
    type: "customer",
    risk: "high",
    x: 80,
    y: 70,
  },
  {
    id: "B2",
    type: "beneficiary",
    risk: "medium",
    x: 180,
    y: 160,
  },
  {
    id: "B7",
    type: "beneficiary",
    risk: "low",
    x: 320,
    y: 90,
  },
  {
    id: "B9",
    type: "beneficiary",
    risk: "critical",
    x: 260,
    y: 240,
  },
];

const beneficiaryEdges = [
  { source: "C1", target: "B2", transactions: 18 },
  { source: "B2", target: "B7", transactions: 9 },
  { source: "B2", target: "B9", transactions: 27 },
];


/* ================================
   Activity Heatmap
================================ */
const heatmapData = [
  { day: "Mon", hour: "00", intensity: 0.1 },
  { day: "Mon", hour: "06", intensity: 0.2 },
  { day: "Mon", hour: "12", intensity: 0.7 },
  { day: "Mon", hour: "18", intensity: 0.4 },

  { day: "Tue", hour: "00", intensity: 0.15 },
  { day: "Tue", hour: "06", intensity: 0.22 },
  { day: "Tue", hour: "12", intensity: 0.84 },
  { day: "Tue", hour: "18", intensity: 0.5 },

  { day: "Wed", hour: "00", intensity: 0.18 },
  { day: "Wed", hour: "06", intensity: 0.35 },
  { day: "Wed", hour: "12", intensity: 0.92 },
  { day: "Wed", hour: "18", intensity: 0.68 },

  { day: "Thu", hour: "00", intensity: 0.11 },
  { day: "Thu", hour: "06", intensity: 0.29 },
  { day: "Thu", hour: "12", intensity: 0.73 },
  { day: "Thu", hour: "18", intensity: 0.57 },

  { day: "Fri", hour: "00", intensity: 0.24 },
  { day: "Fri", hour: "06", intensity: 0.41 },
  { day: "Fri", hour: "12", intensity: 0.97 },
  { day: "Fri", hour: "18", intensity: 0.8 },

  { day: "Sat", hour: "00", intensity: 0.35 },
  { day: "Sat", hour: "06", intensity: 0.48 },
  { day: "Sat", hour: "12", intensity: 0.6 },
  { day: "Sat", hour: "18", intensity: 0.4 },

  { day: "Sun", hour: "00", intensity: 0.28 },
  { day: "Sun", hour: "06", intensity: 0.31 },
  { day: "Sun", hour: "12", intensity: 0.44 },
  { day: "Sun", hour: "18", intensity: 0.26 },
];


/* ================================
   Risk Factor Contribution
================================ */
const riskFactors = [
  {
    name: "High Frequency",
    value: 34,
    color: "#ef4444",
  },
  {
    name: "Amount Spike",
    value: 24,
    color: "#f97316",
  },
  {
    name: "New Beneficiaries",
    value: 18,
    color: "#eab308",
  },
  {
    name: "Geo Deviation",
    value: 14,
    color: "#06b6d4",
  },
  {
    name: "Currency Anomaly",
    value: 10,
    color: "#8b5cf6",
  },
];


/* ================================
   Alert Feed
================================ */
const alerts = [
  {
    id: 1,
    title: "Sudden transaction spike detected",
    description:
      "Customer exceeded 4x normal transfer frequency within 2 hours.",
    severity: "Critical",
    timestamp: "2 min ago",
  },
  {
    id: 2,
    title: "High-risk beneficiary linked",
    description:
      "Transfer sent to previously flagged beneficiary cluster.",
    severity: "High",
    timestamp: "5 min ago",
  },
  {
    id: 3,
    title: "Cross-border anomaly",
    description:
      "Unexpected foreign currency activity detected outside profile baseline.",
    severity: "Medium",
    timestamp: "12 min ago",
  },
  {
    id: 4,
    title: "Dormant account reactivated",
    description:
      "Account inactive for 180+ days initiated large transfer.",
    severity: "High",
    timestamp: "22 min ago",
  },
];


/* ================================
   Amount Outlier Box Plot
================================ */
const amountOutlierData = [
  {
    category: "Normal",
    min: 120,
    q1: 450,
    median: 920,
    q3: 1600,
    max: 2800,
    outliers: [5200, 7400],
  },
  {
    category: "High Risk",
    min: 400,
    q1: 1800,
    median: 4200,
    q3: 8900,
    max: 14000,
    outliers: [22000, 34000],
  },
];


/* ================================
   Branch Deviation Map
================================ */
const branchDeviationData = [
  {
    branch: "Addis Ababa Central",
    deviationScore: 84,
    riskLevel: "High",
    lat: 8.9806,
    lng: 38.7578,
  },
  {
    branch: "Bole Branch",
    deviationScore: 61,
    riskLevel: "Medium",
    lat: 8.9981,
    lng: 38.787,
  },
  {
    branch: "Megenagna Branch",
    deviationScore: 43,
    riskLevel: "Low",
    lat: 9.01,
    lng: 38.799,
  },
];


/* ================================
   Currency Anomaly Chart
================================ */
const currencyAnomalyData = [
  {
    currency: "USD",
    anomalies: 34,
    color: "#ef4444",
  },
  {
    currency: "EUR",
    anomalies: 22,
    color: "#f97316",
  },
  {
    currency: "GBP",
    anomalies: 11,
    color: "#eab308",
  },
  {
    currency: "AED",
    anomalies: 18,
    color: "#06b6d4",
  },
  {
    currency: "KES",
    anomalies: 7,
    color: "#8b5cf6",
  },
];




  //********************************** */


  return (
  <div className="space-y-6 min-h-screen p-10 bg-[#09141f] text-slate-100">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Transactions Processed" 
        value={transactionsCount.toLocaleString()} 
        icon={Database} 
        trendUp={true} 
        color="text-blue-400"
      />
      <StatCard 
        title="Cleaned Transactions" 
        value={cleanedCount.toLocaleString()} 
        icon={Database} 
        trendUp={true}
        color="text-green-400" 
      />
      <StatCard 
        title="Accounts Identified" 
        value={accountsCount.toLocaleString()} 
        icon={Wallet} 
        trendUp={false}
        color="text-red-400" 
      />
      <StatCard 
        title="Unique Customers Identified" 
        value={entitiesCount.toLocaleString()} 
        icon={Users} 
        color="text-yellow-400"
      />
    </div>

    {/* Row 1: Volume & Alert Distribution */}
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
      
      {/* High-Level Risk Overview Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col shadow-xl shadow-black/40">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            High-Level Risk Overview
          </h3>
          <p className="text-xs text-slate-400">
            Real-time profile risk health and anomaly monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Risk Distribution Histogram */}
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-slate-200">
                Risk Distribution
              </h4>
              <p className="text-[11px] text-slate-500">
                Customers grouped by current risk tier
              </p>
            </div>

            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={riskDistributionData.map(entry => {
                    const total = riskDistributionData.reduce((sum, e) => sum + e.count, 0);
                    return { ...entry, percentage: parseFloat(((entry.count / total) * 100).toFixed(1)) };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
                  <XAxis
                    dataKey="tier"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                    formatter={(value) => [`${value}%`, 'Share']}
                  />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Risk Score Trend */}
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Average Risk Trend
                </h4>
                <p className="text-[11px] text-slate-500">
                  Profile risk movement over 30 days
                </p>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-amber-500">67</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">
                  Avg Score
                </div>
              </div>
            </div>

            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrendData}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#riskGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Anomalous Spike Indicator */}
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Anomalous Spike
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Customers deviating from baseline
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              </div>

              <div className="mt-8">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold text-red-500">2%</span>
                  <span className="text-sm font-medium text-red-400 mb-1">+0%</span>
                </div>
                <div className="mt-2 text-sm text-slate-400 leading-relaxed">
                  2% of customers are currently behaving outside their normal activity profile.
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 text-center">
                <div className="text-lg font-bold text-emerald-500">74.5%</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Stable</div>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 text-center">
                <div className="text-lg font-bold text-amber-500">3.5%</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Watch</div>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 text-center">
                <div className="text-lg font-bold text-red-500">2%</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Critical</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Row 2: Live Monitor & Geo */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Profiling Activity Section */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl shadow-black/40">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-500" />
              Profiling Service Activity
            </h3>
            <p className="text-xs text-slate-500">
              Downstream system request distribution
            </p>
          </div>

          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Healthy
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              Degraded
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              Critical
            </span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} vertical={false} />
              <XAxis dataKey="service" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
              />
              <Bar dataKey="rpm" fill="#06b6d4" radius={[5, 5, 0, 0]} barSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Connected Components Sub-cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {connectedServices.map((service, idx) => (
            <div key={idx} className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${service.status === "healthy" ? "bg-emerald-500" : service.status === "warning" ? "bg-amber-500" : "bg-red-500"}`} />
                    <h4 className="text-sm font-semibold text-slate-100">{service.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{service.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-cyan-500">{service.rpm}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">RPM</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
                  <div className="text-xs text-slate-500 mb-1">Latency</div>
                  <div className="text-sm font-semibold text-slate-200">{service.latency}</div>
                </div>
                <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
                  <div className="text-xs text-slate-500 mb-1">Errors</div>
                  <div className="text-sm font-semibold text-slate-200">{service.errorRate}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Consumption</span>
                  <span className="text-slate-300 font-medium">{service.usage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: `${service.usage}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  </div>
);
};



{/* Rolling Frequency Trend Section */}

/*


      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl shadow-black/40">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-500" />
            Frequency Trend
          </h3>
          <p className="text-xs text-slate-500">Rolling 30-day activity pattern</p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={frequencyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

*/