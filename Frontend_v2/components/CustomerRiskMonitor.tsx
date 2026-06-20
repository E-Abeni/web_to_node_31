import React, { useState, useMemo, useEffect } from 'react';
import { Customer, RiskLevel } from '../types';
import { RiskBadge } from './ui/RiskBadge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
  Search, Users, Clock, ShieldCheck, AlertOctagon, UserCheck, 
  TrendingUp, Activity, FileWarning, Fingerprint, History 
} from 'lucide-react';

import { fetchCustomers, fetchCustomerCount } from '../services/database';

interface CustomerRiskMonitorProps {
  customers: Customer[];
  targetCustomerId?: string | null;
}

export const CustomerRiskMonitor: React.FC<CustomerRiskMonitorProps> = ({ customers, targetCustomerId, updateCustomers, count }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const [pageCount, setPageCount] = useState(0);
  const [customersCount, setTransactionsCount] = useState(0);

  // Handle prop-based selection (e.g. from navigation)
  useEffect(() => {
    if (targetCustomerId) {
      setSelectedCustomerId(targetCustomerId);
    }
  }, [targetCustomerId]);

  /*
  // Sort by risk score desc
  const sortedCustomers = useMemo(() => {
    return [...customers]
      .filter(c => 
        c.name.toLowerCase().includes(filterText.toLowerCase()) || 
        c.id.toLowerCase().includes(filterText.toLowerCase())
      )
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [customers, filterText]);
  */

  function useDebounce(value, delay) {
      const [debouncedValue, setDebouncedValue] = useState(value);
  
      useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);
  
        return () => {
          clearTimeout(handler);
        };
      }, [value, delay]); 
  
      return debouncedValue;
    }
  
  
    const debouncedFilterText = useDebounce(filterText, 500);
  
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    useEffect(() => {
      async function getData(){
        const offset = (currentPage - 1) * itemsPerPage;
        const data = await fetchCustomers({
          limit: itemsPerPage,
          offset: offset,
          search: debouncedFilterText
        });
  
        updateCustomers(data)
  
      }
      getData();    
    
  }, [currentPage, debouncedFilterText]);

  async function update_counts(){
      const all_customers = await fetchCustomerCount({
        search: debouncedFilterText
      });
      setTransactionsCount(all_customers);
      setPageCount(Math.ceil(all_customers/itemsPerPage))
  
    }
     useEffect(() => {
      
      update_counts();
      
    },[debouncedFilterText])

  useEffect(()=>{
    setCurrentPage(1)
  }, [debouncedFilterText])
 
  const sortedCustomers = customers;

  const selectedCustomer = useMemo(() => {
    if (selectedCustomerId) {
      const found = customers.find(c => c.Profile_ID === selectedCustomerId);
      if (found) return found;
    }
    return sortedCustomers[0];
  }, [customers, selectedCustomerId, sortedCustomers]);

  
  // Mock Historical Data for Gap Analysis (Time Series)
  const gapAnalysisData = useMemo(() => {
    if (!selectedCustomer) return [];
    const data = [];
    
    for(let i = 0; i < selectedCustomer.TIME_SERIES_GAP.TIMESTAMP.length; i++){
      data.push({
        month: `t-${i}`,
        activity: selectedCustomer.TIME_SERIES_GAP.TIME_DIFF[i],
        threshold: 1200
      });
    }

    
    
    console.log("Time gap: ", data)
    return data;
  }, [selectedCustomer]);
  

  // Peer Comparison Data
  const peerData = useMemo(() => {
    if (!selectedCustomer) return [];
    return [
      {
        metric: 'Peer Occupation',
        Customer: Math.floor(selectedCustomer.PEER_PROFILE_OCCUPATION.amount),
        'Peer Average': Math.floor(selectedCustomer.PEER_PROFILE_OCCUPATION.peer_average),
      },
      {
        metric: 'Peer Region',
        Customer: selectedCustomer.PEER_PROFILE_REGION.amount,
        'Peer Average': Math.floor(selectedCustomer.PEER_PROFILE_OCCUPATION.peer_average)
      },
      {
        metric: 'Peer Account Age',
        Customer: selectedCustomer.PEER_PROFILE_ACCOUNT_AGE.amount,
        'Peer Average': Math.floor(selectedCustomer.PEER_PROFILE_ACCOUNT_AGE.peer_average)
      }
    ];
  }, [selectedCustomer]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      
      {/* Sidebar List with Pagination */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Users className="w-5 h-5 text-blue-500" />
            Risk Profiles ({customersCount})
          </h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Customer..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded pl-8 pr-2 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </div>

        {/* Customer List Container */}
        <div className="overflow-auto flex-1 p-2 space-y-2">
          {/* NOTE: You would likely fetch a *paginated* list of customers (e.g., `paginatedCustomers`) 
            here instead of filtering/sorting the full list (`sortedCustomers`).
          */}
          {sortedCustomers.map(customer => (
            <div
              key={customer.Profile_ID}
              onClick={() => setSelectedCustomerId(customer.Profile_ID)}
              className={`p-3 rounded border cursor-pointer transition-all ${
                selectedCustomer?.Profile_ID === customer.Profile_ID
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-slate-900 dark:text-slate-200 truncate">{customer.Full_Name}</span>
                <RiskBadge level={customer.RISK_LEVEL} />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-mono">{customer.Account_No}</span>
                <span>•</span>
                <span>{customer.occupation}</span>
              </div>
              {/* Mini Indicators */}
              <div className="flex gap-2">
                {(customer.SANCTION_HITS.account_sanction_hit || customer.SANCTION_HITS.beneficiary_sanction_hit) && (
                  <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">SANCTION</span>
                )}
                {
                  customer.REASON_CODES_JSON.includes("Zombie Account") && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Zombie
                    </span>
                  )
                }
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
            disabled={currentPage === 1} 
            className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 disabled:opacity-50 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Page {currentPage} of {pageCount}
          </span>
          
          <button
            
            onClick={() => setCurrentPage(prev => prev + 1)} 
            // disabled={!hasNextPage}
            className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 disabled:opacity-50 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>


      {/* Main Dashboard */}
      <div className="lg:col-span-3 space-y-6 overflow-auto pr-2">
        {selectedCustomer && (
          <>
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    {selectedCustomer.Full_Name}
                    {selectedCustomer.SANCTION_HITS.account_sanction_hit && (
                      <span className="flex items-center gap-1 bg-red-600 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                        <AlertOctagon className="w-3 h-3" /> MATCH FOUND
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Fingerprint className="w-4 h-4" /> {selectedCustomer.Account_No}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {selectedCustomer.occupation}</span>
                    <span className="flex items-center gap-1"><History className="w-4 h-4" /> Account Age: {selectedCustomer.account_age} days</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Composite Risk Score</div>
                  <div className={`text-3xl font-bold font-mono ${
                    selectedCustomer.RISK_SCORE > 80 ? 'text-red-600 dark:text-red-500' : 
                    selectedCustomer.RISK_SCORE > 50 ? 'text-orange-600 dark:text-orange-500' : 'text-green-600 dark:text-green-500'
                  }`}>
                    {selectedCustomer.RISK_SCORE}/100
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. Peer Group Analysis */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      Peer Group Behavior
                    </h3>
                    <p className="text-xs text-slate-500">Vs. {selectedCustomer.occupation}s in {selectedCustomer.region}</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peerData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis dataKey="metric" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                      <Tooltip 
                         cursor={{fill: '#334155', opacity: 0.1}}
                         contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                      />
                      <Legend />
                      <Bar dataKey="Customer" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                      <Bar dataKey="Peer Average" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded">
                  Analysis: Customer transaction value deviates by <span className="text-red-600 dark:text-red-400 font-bold">
                    {Math.abs((selectedCustomer.PEER_PROFILE_OCCUPATION.amount - selectedCustomer.PEER_PROFILE_OCCUPATION.peer_average) / selectedCustomer.PEER_PROFILE_OCCUPATION.peer_average * 100).toFixed(0)
                    }
                  %</span> from peer group baseline.
                </div>
              </div>


              {/* 2. Time Series Gap Analysis */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
                 <div className="mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <Clock className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                      Time Series Gap Analysis
                    </h3>
                    <p className="text-xs text-slate-500">Detecting "Zombie Account" patterns and dormancy</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={gapAnalysisData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                        />
                        <Line type="stepAfter" dataKey="activity" stroke="#f97316" strokeWidth={2} dot={false} name="Activity Level" />
                        <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Dormancy Threshold" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {false && (
                     <div className="mt-2 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-2 rounded">
                        <Activity className="w-4 h-4" />
                        <span>Alert: Account dormant for 6+ months then sudden high-value activity.</span>
                     </div>
                  )}
              </div>

              

              {/* 3. KYC Integrity */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <UserCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    KYC Data Integrity
                  </h3>
                  <p className="text-xs text-slate-500">Completeness and Uniqueness Checks</p>
                </div>
                <div className="flex items-center justify-center h-48 relative">
                   {/* Custom Circular Progress */}
                   <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:stroke-slate-800" />
                        <circle 
                          cx="50" cy="50" r="45" fill="none" stroke={selectedCustomer.KYC_INTEGRITY_COMPLETENESS_RATIO > 0.9 ? "#10b981" : "#eab308"} strokeWidth="10"
                          strokeDasharray={`${selectedCustomer.KYC_INTEGRITY_COMPLETENESS_RATIO * 283} 283`}
                          transform="rotate(-90 50 50)"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{(selectedCustomer.KYC_INTEGRITY_COMPLETENESS_RATIO * 100).toFixed(0)}%</span>
                        <span className="text-[10px] text-slate-500">Score</span>
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                   <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded">
                      <span className="text-slate-500">Identity Verify</span>
                      <span className="text-green-600 dark:text-green-400">Passed</span>
                   </div>
                   <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded">
                      <span className="text-slate-500">KYC Completness</span>
                      <span className={selectedCustomer.KYC_INTEGRITY_COMPLETENESS_RATIO > 0.85 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}>
                        {selectedCustomer.KYC_INTEGRITY_COMPLETENESS_RATIO > 0.85 ? "Complete" : "Partial"}
                      </span>
                   </div>
                   <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded">
                      <span className="text-slate-500">fullname_matches</span>
                      <span className="text-green-600 dark:text-green-400">{selectedCustomer.KYC_INTEGRITY_UNIQUENESS.fullname_matches}</span>
                   </div>
                   <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded">
                      <span className="text-slate-500">ID Match</span>
                      <span className="text-slate-700 dark:text-slate-200">{selectedCustomer.KYC_INTEGRITY_UNIQUENESS.idcard_matches}</span>
                   </div>
                </div>
              </div>



              {/* 4. Sanctions & Watchlist */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm relative overflow-hidden">
                <div className="mb-4 z-10 relative">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <ShieldCheck className="w-5 h-5 text-red-500 dark:text-red-400" />
                    Sanction & Watchlist
                  </h3>
                  <p className="text-xs text-slate-500">Sanction and Watchlist Database match</p>
                </div>
                
                {selectedCustomer.SANCTION_HITS.account_sanction_hit ? (
                  <div className="h-full flex flex-col justify-center items-center text-center z-10 relative pb-10">
                     <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <AlertOctagon className="w-8 h-8 text-red-500" />
                     </div>
                     <h4 className="text-xl font-bold text-red-500">POSITIVE MATCH</h4>
                     <p className="text-sm text-red-600 dark:text-red-300 mt-2">Entity appears on Sanction and Watch List</p>
                     <div className="mt-6 w-full">
                       <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition-colors">
                         Generate SAR Report
                       </button>
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center pb-10">
                     <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8 text-green-500" />
                     </div>
                     <h4 className="text-lg font-bold text-green-500">CLEAN STATUS</h4>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">No matches found in our databases.</p>
                     <div className="mt-6 text-xs text-slate-500">
                        Last screened: {new Date().toLocaleDateString()}
                     </div>
                  </div>
                )}
              </div>



            </div>
        </>
      )}
    </div>

    </div>
  );
};