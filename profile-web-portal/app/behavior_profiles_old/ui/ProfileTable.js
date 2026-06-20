import React, { useState, useEffect } from 'react';
import { get_user_profiles, getUserProfilesCount } from '../../services/data';

export function ProfileTable ({ onShowDetails }){
  const [data, setData] = useState([]);
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
    async function getData() {
      const offset = (currentPage - 1) * itemsPerPage;
      const data = await get_user_profiles({
        limit: itemsPerPage,
        offset: offset,
        search: debouncedFilterText,
        sortField: sortField,
      });

      setData(data);
    }
    getData();
  }, [currentPage, debouncedFilterText, sortField]);

  async function update_counts() {
    const all_profiles = await getUserProfilesCount({
      search: debouncedFilterText,
    });
    setProfileCount(all_profiles);
    setPageSize(Math.max(1, Math.ceil(all_profiles / itemsPerPage)));
  }

  useEffect(() => {
    update_counts();
  }, [debouncedFilterText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, sortField]);

  const formatCurrency = (val) => {
    if (val === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sortOptions = [
    { label: 'None', field: '' },
    { label: 'Customer ID', field: 'index' },
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
    { label: 'Avg Time Lapse (m)', field: 'avg_time_lapse_minutes' },
  ];

  return (
  <div className="min-h-screen bg-[#09141f] py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-200">
    <div className="max-w-[1800px] mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Total Customers: <span className="font-semibold text-slate-300">{Number(profileCount).toLocaleString()}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time entity profiling and risk assessment
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Customer ID..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg text-sm bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-lg"
            />
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-lg focus-within:ring-2 focus-within:ring-blue-600 transition-all">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sort:</span>
            <select
              value={sortField || ''}
              onChange={(e) => setSortField(e.target.value)}
              className="bg-transparent text-sm text-slate-100 border-none focus:ring-0 outline-none cursor-pointer p-0 w-full"
            >
              {sortOptions.map((opt) => (
                <option key={opt.field} value={opt.field} className="bg-slate-900 text-slate-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setFilterText('');
              setSortField('');
            }}
            className="p-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            title="Reset Filters"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer ID</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Freq 24h</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Accounts</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Phones</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Sent Amount</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Received Amount</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Sent #</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Received #</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Activity</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider sticky right-0 bg-slate-800/95 backdrop-blur-md border-l border-slate-700 z-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.length > 0 ? (
                data.map((entity) => (
                  <tr key={entity.index} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-mono text-sm font-medium text-slate-100 max-w-[150px] truncate" title={entity.index}>
                          {entity.index}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-slate-300">
                      {entity.max_freq_24hr}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-slate-300">
                      {entity.unique_accounts_held}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-slate-300">
                      {entity.unique_phone_numbers_used}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-white">
                      {formatCurrency(entity.total_amount_sent)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-white">
                      {formatCurrency(entity.total_amount_received)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-slate-300">
                      {entity.no_of_transactions_sent}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-slate-300">
                      {entity.no_of_transactions_received}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        entity.cross_border_risk === 0 
                          ? 'bg-green-900/30 text-green-400 border-green-800' 
                          : 'bg-red-900/30 text-red-400 border-red-800'
                      }`}>
                        {entity.cross_border_risk === 0 ? 'Low' : 'High'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                      {formatDate(entity.last_transaction_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center sticky right-0 bg-slate-900 group-hover:bg-slate-800 transition-colors border-l border-slate-800 z-10">
                      <button
                        onClick={() => onShowDetails(entity)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-sm font-medium text-blue-400 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-800/50 rounded-md transition-colors"
                      >
                        Details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <svg className="w-12 h-12 mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-base font-medium text-slate-300">No records found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-slate-700 text-sm font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= pageSize}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-700 text-sm font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Showing page <span className="font-semibold text-white">{currentPage}</span> of{' '}
                <span className="font-semibold text-white">{pageSize}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-700 bg-slate-900 text-sm font-medium text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage >= pageSize}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-700 bg-slate-900 text-sm font-medium text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-colors"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
