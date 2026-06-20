import React, { useState, useCallback, useEffect } from 'react';
import { Transaction, RiskLevel, TransactionType } from '../types';
import { RiskBadge } from './ui/RiskBadge';
import { Filter, Search, FileWarning, LineChart, Network, Info } from 'lucide-react';
import {TransactionDetailsModal, useModal} from "./ui/TransactionDetailModal"
import {fetchTransactions, fetchTransactionCount} from "../services/database"


interface LiveMonitorProps {
  transactions: Transaction[];
  onGenerateSTR: (tx: Transaction) => void;
  onViewTimeline: (customerId: string) => void;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({ transactions, onGenerateSTR, onViewTimeline, updateTransactions }) => {
  const [filterText, setFilterText] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');

  const [pageCount, setPageCount] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);

  const [selectedTransaction, setSelectedTransaction] = useState({});
  const { isOpen, openModal, closeModal } = useModal();

   
  /*
  const filtered = transactions.filter(tx => {
    const matchesText = tx.id.toLowerCase().includes(filterText.toLowerCase()) || 
                        tx.to_account.toLowerCase().includes(filterText.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || tx.risk_level === riskFilter;
    return matchesText && matchesRisk;
  });
  */

  const filtered = transactions;

  function onShowMoreInfo(tx){
    setSelectedTransaction(tx)
    openModal()
  }

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
  const itemsPerPage = 15;
  
  // const [hasNextPage, setHasNextPage] = useState(true); 

  async function update_counts(){
    const all_transactions = await fetchTransactionCount({
      search: debouncedFilterText
    });
    setTransactionsCount(all_transactions);
    setPageCount(Math.round(all_transactions/itemsPerPage))

  }
   useEffect(() => {
    
    update_counts();
    
  },[debouncedFilterText, riskFilter])
  
  useEffect(() => {
    async function getData(){
      const offset = (currentPage - 1) * itemsPerPage;
      const data = await fetchTransactions({
        limit: itemsPerPage,
        offset: offset,
        search: debouncedFilterText,
        risk_filter: riskFilter
      });

      updateTransactions(data)

    }
    getData();    
  
}, [currentPage, debouncedFilterText, riskFilter]);

  useEffect(()=>{
      setCurrentPage(1)
    }, [debouncedFilterText])

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col h-full shadow-sm">
      {/* Header (Same as before: Title, Search, Filter) */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          Live Transaction Feed ({transactionsCount})
        </h2>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Name or Account No..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded pl-8 pr-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-2 top-2.5 w-4 h-4 text-slate-500" />
            <select
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded pl-8 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500 appearance-none text-slate-900 dark:text-slate-100"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
            >
              <option value="ALL">Sort By Time</option>
              <option value={RiskLevel.CRITICAL}>Sort By Risk</option>
              {
                /*
                <option value={RiskLevel.HIGH}>High</option>
                <option value={RiskLevel.MEDIUM}>Medium</option>
                <option value={RiskLevel.LOW}>Low</option>
                */
              }
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-3 font-medium">Timestamp</th>
              <th className="p-3 font-medium">Tx ID</th>
              <th className="p-3 font-medium">From</th>
              <th className="p-3 font-medium">Account</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium text-right">Amount</th>
              <th className="p-3 font-medium">To</th>
              <th className="p-3 font-medium">Risk Level</th>
              <th className="p-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {/* NOTE: `filtered` should now represent the single page of data fetched from the API */}
            {filtered.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="p-3 text-slate-600 dark:text-slate-500 whitespace-nowrap">
                  {tx.generated_at}
                </td>
                <td className="p-3 font-mono text-xs text-blue-600 dark:text-blue-400">{tx.transaction_id}</td>
                <td className="p-3 text-slate-800 dark:text-slate-200">{tx.from_name}</td>
                <td className="p-3 text-slate-800 dark:text-slate-200">{tx.from_account}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold
                    ${tx.transaction_type === TransactionType.WIRE ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      tx.transaction_type === TransactionType.MOBILE_BANKING ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                      'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {tx.transaction_type}
                  </span>
                </td>
                <td className="p-3 text-right font-mono text-slate-900 dark:text-slate-200">
                  {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {"ETB"}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1 text-blue-500">
                    {tx.to_account} 
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs w-6 text-right text-slate-600 dark:text-slate-400">{/* tx.risk_level */}</span>
                    <RiskBadge level={tx.risk_level} />
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onGenerateSTR(tx)}
                      title="Generate STR"
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <FileWarning className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onViewTimeline(tx.id)}
                      title="Timeline Analysis"
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                    <button
                      title="Link Analysis (Graph)"
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                    >
                      <Network className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onShowMoreInfo(tx)}
                      title="Show More Info"
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No transactions matching filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TransactionDetailsModal
          isOpen={isOpen}
          onClose={closeModal}
          data={selectedTransaction}
        />
      </div>

      {/* Pagination Footer - Added for table pagination */}
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
  );
};