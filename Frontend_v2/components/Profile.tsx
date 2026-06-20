
import React, { useState, useEffect, useCallback } from 'react';
import RiskAnalysisModal from './ui/RiskAnalysisModal';
import { AnalyticsDashboard } from './ui/AnalyticsDashboard';
import {fetchCustomerProfile, fetchCustomerProfileCount} from "../services/database"

export const CustomerProfile: React.FC = () => {

  const [filterText, setFilterText] = useState('');
  //const [riskFilter, setRiskFilter] = useState('ALL');
  const [pageCount, setPageCount] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [profileCount, setProfileCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('max_sum_24hr');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    if (selectedAccount) {
      setIsModalOpen(false);
    } else {
      setIsModalOpen(false);
    }
  }, [selectedAccount]);


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

    async function update_counts(){
        const all_profiles = await fetchCustomerProfileCount({
          search: debouncedFilterText
        });
        setProfileCount(all_profiles);
        setPageCount(Math.round(all_profiles/itemsPerPage))
    
      }
       useEffect(() => {
        
        update_counts();
        
      },[debouncedFilterText])
      
      useEffect(() => {
        async function getData(){
          const offset = (currentPage - 1) * itemsPerPage;
          const data = await fetchCustomerProfile({
            limit: itemsPerPage,
            offset: offset,
            search: debouncedFilterText,
            sortField: sortField
          });

          setProfiles(data)
          console.log(data)
    
        }
        getData();    
      
    }, [currentPage, debouncedFilterText, sortField]);
 


 

  // Reset pagination when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, sortField]);


  const toggleSort = (field) => {
    if (sortField !== field) {
      setSortField(field);
    } 
  };



  const TableHeader: React.FC<{ field; label: string; align?: 'left' | 'right' | 'center' }> = ({ field, label, align = 'left' }) => {
    const isSorted = sortField === field;
    return (
      <th 
        className={`px-4 py-4 cursor-pointer select-none transition-all hover:bg-slate-100 border-b border-slate-200 group ${isSorted ? 'bg-slate-50' : ''}`}
        onClick={() => toggleSort(field)}
      >
        <div className={`flex items-center gap-2 whitespace-nowrap ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isSorted ? 'text-blue-600' : 'text-slate-500'}`}>
            {label}
          </span>
          <div className={`flex flex-col opacity-0 group-hover:opacity-100 transition-opacity ${isSorted ? 'opacity-100' : ''}`}>
            <svg className={`w-2 h-2 -mt-0.5 ${isSorted ? 'text-blue-600' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
          </div>
        </div>
      </th>
    );
  };

  const sortOptions = [
    //{ label: 'Risk Score', field: 'unknown_beneficiary_risk_score' },
    { label: 'Account no', field: '' },
    { label: 'Mean Trans.', field: 'mean' },
    { label: 'TX Count', field: 'count' },
    { label: '1h Velocity', field: 'max_freq_1hr' },
    { label: '1h Volume', field: 'max_sum_1hr' },
    { label: '24h Velocity', field: 'max_freq_24hr' },
    { label: '24h Volume', field: 'max_sum_24hr' },
    { label: 'Days Active', field: 'account_age_days' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-12">
      <header className="bg-white border-b border-slate-200 px-10 py-5 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner w-full">

            <div className="w-3/4">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input 
                type="text" 
                placeholder="Search Account ID..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full text-black pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="h-6 w-px bg-slate-200 mx-1" />

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Sort By: </span>
                <select 
                  value={sortField || ''}
                  onChange={(e) => setSortField(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 py-1.5 focus:ring-0 outline-none cursor-pointer"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.field} value={opt.field}>{opt.label}</option>
                  ))}
                </select>
              </div>
                {
                  /*
              <select 
                value={filters.riskScore}
                onChange={(e) => setFilters(prev => ({ ...prev, riskScore: e.target.value === 'all' ? 'all' : Number(e.target.value) }))}
                className="bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer hover:bg-slate-50 transition-all shadow-sm min-w-[120px]"
              >
                <option value="all">ANY RISK</option>
                <option value="7">HIGH (7+)</option>
                <option value="4">MED (4+)</option>
              </select>

              <select 
                value={filters.ageBucket}
                onChange={(e) => setFilters(prev => ({ ...prev, ageBucket: e.target.value }))}
                className="bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer hover:bg-slate-50 transition-all shadow-sm min-w-[130px]"
              >
                <option value="all">ANY HISTORY</option>
                {ageBuckets.map(bucket => (
                  <option key={bucket} value={bucket}>{bucket} YEARS</option>
                ))}
              </select>
              */
                }

              <button 
                onClick={() => {
                  setFilterText("");
                  setSortField('');
                }}
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-all shadow-sm"
                title="Reset Filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100 mt-2 mx-10">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
        Profiling Behavior ( Total Accounts = {<span className="px-2.5 py-1 bg-green-100 rounded text-slate-700 font-black">{Number(profileCount).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>})
      </h2>

      <main className="max-w-[1800px] mx-auto px-10 mt-4">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/30 flex flex-col">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <table className="w-full text-left text-[12px] border-collapse table-auto min-w-max">
              <thead>
                <tr className="bg-slate-50/50">
                  <TableHeader field="accountno" label="Account ID" />
                  <TableHeader field="mean" label="Mean Trans." align="right" />
                  <TableHeader field="std" label="Volatility" align="right" />
                  <TableHeader field="count" label="Count" align="center" />
                  <TableHeader field="max_freq_1hr" label="Freq (1h)" align="center" />
                  <TableHeader field="max_sum_1hr" label="Sum (1h)" align="right" />
                  <TableHeader field="max_freq_24hr" label="Freq (24h)" align="center" />
                  <TableHeader field="max_sum_24hr" label="Sum (24h)" align="right" />
                  <TableHeader field="min_time_lapse_minutes" label="Min Lapse" align="center" />
                  <TableHeader field="max_time_lapse_minutes" label="Max Lapse" align="center" />
                  <TableHeader field="avg_time_lapse_minutes" label="Avg Lapse" align="center" />
                  <TableHeader field="account_age_days" label="Age (Days)" align="right" />
                  <TableHeader field="account_age_years" label="Age (Yrs)" align="right" />
                  <TableHeader field="account_age_bucket" label="Segment" />
                  <th className="px-8 py-4 bg-slate-50/90 border-b border-l border-slate-200 sticky right-0 z-30 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-slate-500 text-center shadow-[-8px_0_12px_-6px_rgba(0,0,0,0.05)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.length > 0 ? (
                  profiles.map((acc) => (
                    <tr 
                      key={acc.accountno} 
                      className="hover:bg-blue-50/30 transition-all group tabular-nums"
                    >
                      <td className="px-4 py-4.5 font-mono font-bold text-slate-900 whitespace-nowrap border-r border-slate-50/50">
                        {acc.accountno.replace(/^'/, '')}
                      </td>
                      <td className="px-4 py-4.5 font-bold text-blue-700 text-right">
                        {Number(acc.mean).toLocaleString(undefined, { maximumFractionDigits: 1 }) + " ETB"}
                      </td>
                      <td className="px-4 py-4.5 text-slate-500 text-right font-medium">
                        ±{Number(acc.std).toLocaleString(undefined, { maximumFractionDigits: 0 }) + " ETB"}
                      </td>
                      <td className="px-4 py-4.5 text-center">
                        <span className="px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-black">
                          {acc.count}
                        </span>
                      </td>
                      <td className="px-4 py-4.5 text-center font-semibold text-slate-600">
                        {acc.max_freq_1hr}
                      </td>
                      <td className="px-4 py-4.5 text-slate-600 text-right">
                        
                        {Number(acc.max_sum_1hr).toLocaleString(undefined, { maximumFractionDigits: 1 }) + " ETB"}
                      </td>
                      <td className="px-4 py-4.5 text-center font-semibold text-slate-600">
                        {acc.max_freq_24hr}
                      </td>
                      <td className="px-4 py-4.5 text-slate-600 text-right">
                        {Number(acc.max_sum_24hr).toLocaleString(undefined, { maximumFractionDigits: 1 }) + " ETB"}
                      </td>
                      <td className="px-4 py-4.5 text-slate-400 text-center">
                        {acc.min_time_lapse_minutes}m
                      </td>
                      <td className="px-4 py-4.5 text-slate-400 text-center">
                        {acc.max_time_lapse_minutes}m
                      </td>
                      <td className="px-4 py-4.5 text-slate-900 font-bold text-center">
                        {acc.avg_time_lapse_minutes}m
                      </td>
                      <td className="px-4 py-4.5 text-slate-400 text-right">
                        {Number(acc.account_age_days).toLocaleString()}
                      </td>
                      <td className="px-4 py-4.5 text-slate-500 text-right font-medium">
                        {Number(acc.account_age_years).toFixed(1)}
                      </td>
                      <td className="px-4 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${acc.unknown_beneficiary_risk_score > 7 ? 'bg-rose-500 animate-pulse' : 'bg-blue-300'}`} />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                             {acc.account_age_bucket} yrs
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-4.5 text-center sticky right-0 z-10 bg-white/95 backdrop-blur-sm group-hover:bg-blue-50/80 transition-all border-l border-slate-100 shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.06)]">
                        <button 
                          onClick={() => setSelectedAccount(acc)}
                          className="group/btn relative inline-flex items-center justify-center gap-2 px-5 py-2 overflow-hidden font-bold transition-all bg-blue-400 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white active:scale-95 shadow-sm"
                        >
                          <span className="text-[10px] uppercase tracking-widest">Details</span>
                          <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="px-6 py-32 text-center">
                       <div className="flex flex-col items-center gap-5">
                         <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                         </div>
                         <div className="space-y-2">
                           <h3 className="text-slate-900 font-black text-xl tracking-tight">Zero Records Found</h3>
                           <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">No results match your current query parameters. Try refining your filters or resetting the view.</p>
                         </div>
                         <button 
                          onClick={() => {
                            setFilterText("")
                            setSortField('');
                          }}
                          className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all"
                         >
                           Reset Dashboard
                         </button>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} // Assumes `setCurrentPage` is defined
          disabled={currentPage === 1} // Assumes `currentPage` is defined
          className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-50 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Previous
        </button>
        
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Page {currentPage} of {pageCount}
        </span>
        
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          // You should use a prop/state like `hasNextPage` returned by the API to disable this.
          // disabled={!hasNextPage} 
          className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-50 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Next
        </button>
      </div>
          
        </div>
      </main>

      <RiskAnalysisModal 
        account={selectedAccount} 
        onClose={() => setSelectedAccount(null)} 
        openModal={() => setIsModalOpen(true)}
      />



      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Analytics Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-[90vw] lg:max-w-6xl rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Transaction Timeline details</h2>
                  {/*
                  <p className="text-xs text-slate-500 font-medium">Transactional Data Exploration</p>*/
                  }
                </div>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
              <AnalyticsDashboard account = {selectedAccount} />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
              >
                Close Detail View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>




    </div>
  );
};





/*

export function Test(){
    const [filterText, setFilterText] = useState("");
    const [profileCount, setProfileCount] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [profiles, setProfiles] = useState([]);


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

    async function update_counts(){
        const all_profiles = await fetchCustomerProfileCount({
          search: debouncedFilterText
        });
        setProfileCount(all_profiles);
        setPageCount(Math.round(all_profiles/itemsPerPage))
    
      }
       useEffect(() => {
        
        update_counts();
        
      },[debouncedFilterText])
      
      useEffect(() => {
        async function getData(){
          const offset = (currentPage - 1) * itemsPerPage;
          const data = await fetchCustomerProfile({
            limit: itemsPerPage,
            offset: offset,
            search: debouncedFilterText
          });

          setProfiles(data)
          console.log(data)
    
        }
        getData();    
      
    }, [currentPage, debouncedFilterText]);


    return (
        <div className="text-black"> hi </div>
    )
}

*/