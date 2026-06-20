
import React, {useState, useEffect} from 'react';
import {get_user_profiles, getUserProfilesCount} from '../../services/data'

const EntityTable = ({  
  onShowDetails,   
}) => {

  const [data, setData] = useState([])
  const [pageSize, setPageSize] = useState(10);
  const [filterText, setFilterText] = useState('');
  const [profileCount, setProfileCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('');

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
  
  useEffect(() => {
          async function getData(){
            const offset = (currentPage - 1) * itemsPerPage;
            const data = await get_user_profiles({
              limit: itemsPerPage,
              offset: offset,
              search: debouncedFilterText,
              sortField: sortField
            });
  
            setData(data)
            console.log(data)
      
          }
          getData(); 
  }, [currentPage, debouncedFilterText, sortField])
  

  async function update_counts(){
          const all_profiles = await getUserProfilesCount({
            search: debouncedFilterText
          });
          setProfileCount(all_profiles);
          setPageSize(Math.round(all_profiles/itemsPerPage))
      
        }
    
    useEffect(() => {
      update_counts(); 
    },[debouncedFilterText])

    useEffect(() => {
        setCurrentPage(1);
      }, [filterText, sortField]);

  
  const formatCurrency = (val: number | null) => {
    if (val === null) return '-';
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'ETB',
        maximumFractionDigits: 0
    }).format(val);
  };


  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  

 const sortOptions = [
  { label: 'None', field: '' },
  { label: 'Entity ID', field: 'index' },
  { label: 'Aliases', field: 'unique_aliases_used' },
  { label: 'Phones', field: 'unique_phone_numbers_used' },
  { label: 'Accounts Held', field: 'unique_accounts_held' },
  { label: 'Account Age (Days)', field: 'account_age_days' },
  { label: 'Account Age (Years)', field: 'account_age_years' },
  { label: 'Transactions Sent', field: 'no_of_transactions_sent' },
  { label: 'Transactions Received', field: 'no_of_transactions_received' },
  { label: 'Avg Amount Sent', field: 'avg_transaction_amount_sent' },
  { label: 'Avg Amount Received', field: 'avg_transaction_amount_received' },
  { label: 'Std Dev Sent', field: 'std_transaction_amount_sent' },
  { label: 'Std Dev Received', field: 'std_transaction_amount_received' },
  { label: 'Std Dev Sent/Received', field: 'std_transaction_amount_sent_and_received' },
  { label: 'Max Freq (1hr)', field: 'max_freq_1hr' },
  { label: 'Max Freq (24hr)', field: 'max_freq_24hr' },
  { label: 'Max Freq (7d)', field: 'max_freq_7d' },
  { label: 'Max Freq (1m)', field: 'max_freq_1m' },
  { label: 'Max Volume (1hr)', field: 'max_volume_1hr' },
  { label: 'Max Volume (24hr)', field: 'max_volume_24hr' },
  { label: 'Max Volume (7d)', field: 'max_volume_7d' },
  { label: 'Max Volume (1m)', field: 'max_volume_1m' },
  { label: 'Total Amount Received', field: 'total_amount_received' },
  { label: 'Total Amount Sent', field: 'total_amount_sent' },
  { label: 'Received vs Sent Ratio', field: 'amount_received_vs_sent_ratio' },
  { label: 'Cash Transactions', field: 'cash_transactions' },
  { label: 'Non-Cash Transactions', field: 'non_cash_transactions' },
  { label: 'Cash vs Non-Cash Ratio', field: 'cash_vs_non_cash_ratio' },
  { label: 'Cross Border Risk', field: 'cross_border_risk' },
  { label: 'Night Time Ratio', field: 'night_time_transaction_ratio' },
  { label: 'New Beneficiary Ratio', field: 'new_beneficiary_ratio' },
  { label: 'Min Time Lapse (m)', field: 'min_time_lapse_minutes' },
  { label: 'Max Time Lapse (m)', field: 'max_time_lapse_minutes' },
  { label: 'Avg Time Lapse (m)', field: 'avg_time_lapse_minutes' }
];


  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-12">
      <header className="bg-white border-b border-slate-200 px-10 py-5 top-0 z-50">
        <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner w-full">

            <div className="w-1/2">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input 
                type="text" 
                placeholder="Search Entity ID..."
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
                  {
                  sortOptions.map(opt => (
                    <option key={opt.field} value={opt.field}>{opt.label}</option>
                  ))}
                </select>
              </div>
                

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
        Profiling Behavior ( Total Entities = {<span className="px-2.5 py-1 bg-green-100 rounded text-slate-700 font-black">{Number(profileCount).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>})
      </h2>
      

      <main className="max-w-[1800px] mx-auto px-10 mt-4">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/30 flex flex-col">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <table className="w-full text-left text-[12px] border-collapse table-auto min-w-max font-bold">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entity ID</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Aliases</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Accounts</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Phones</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sent Amount</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Received Amount</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sent No</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Received No</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Risk</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Activity</th>
                  <th className="px-8 py-4 bg-slate-50/90 border-b border-l border-slate-200 sticky right-0 z-30 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-slate-500 text-center shadow-[-8px_0_12px_-6px_rgba(0,0,0,0.05)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length > 0 ? data.map((entity) => (
                  <tr key={entity.index} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-900 truncate block max-w-[180px]" title={entity.index}>
                        {entity.index}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600 font-medium">
                      {entity.unique_aliases_used}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600 font-medium">
                      {entity.unique_accounts_held}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600 font-medium">
                      {entity.unique_phone_numbers_used}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(entity.total_amount_sent)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(entity.total_amount_received)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600 font-medium">
                      {entity.no_of_transactions_sent}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-600 font-medium">
                      {entity.no_of_transactions_received}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        entity.cross_border_risk === 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {entity.cross_border_risk === 0 ? 'Low' : 'High'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {formatDate(entity.last_transaction_time)}
                    </td>
                    <td className="px-8 py-4.5 text-center sticky right-0 z-10 bg-white/95 backdrop-blur-sm group-hover:bg-blue-50/80 transition-all border-l border-slate-100 shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.06)]">
                      <button 
                        onClick={() => onShowDetails(entity)}
                        className="group/btn relative inline-flex items-center justify-center gap-2 px-5 py-2 overflow-hidden font-bold transition-all bg-blue-400 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white active:scale-95 shadow-sm"
                      >
                        <span className="text-[10px] uppercase tracking-widest">Details</span>
                        <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center text-gray-400 italic text-sm">
                      No entities found matching your criteria.
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
              Page {currentPage} of {pageSize}
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
    </div>
  );
};

export default EntityTable;
