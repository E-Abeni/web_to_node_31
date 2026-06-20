import React, { useState } from 'react';
import { STR, Transaction, Customer } from '../types';
import { AlertTriangle, Bot, CheckCircle, FileText, Loader2, XCircle, Search, Filter, Activity, Flag, User, Globe, Briefcase, ShieldAlert } from 'lucide-react';

interface STRManagerProps {
  strs: STR[];
  transactions: Transaction[];
  customers: Customer[];
}

export const STRManager: React.FC<STRManagerProps> = ({ strs, transactions, customers }) => {
  const [selectedSTR, setSelectedSTR] = useState<STR | null>(null);

  // Filter State
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'FILED' | 'DISMISSED'>('ALL');
  const [searchText, setSearchText] = useState('');

  // Calculate counts for filter dropdown
  const pendingCount = strs.filter(s => s.status === 'PENDING').length;
  const filedCount = strs.filter(s => s.status === 'FILED').length;
  const dismissedCount = strs.filter(s => s.status === 'DISMISSED').length;


  // Helper to ensure flags are visible in reason
  const getDisplayReason = (str: STR) => {
    const tx = transactions.find(t => t.id === str.transactionId);
    if (tx && tx.flags && tx.flags.length > 0) {
      // Check if flags are already in the reason text
      const flagsInReason = tx.flags.every(flag => str.reason.includes(flag));
      if (!flagsInReason) {
         // Filter out flags that are already there to avoid duplicates if partial
         const newFlags = tx.flags.filter(flag => !str.reason.includes(flag));
         return `${str.reason} | Flags: ${newFlags.join(', ')}`;
      }
    }
    return str.reason;
  };

  // Filter Logic
  const filteredSTRs = strs.filter(str => {
    // 1. Status Filter
    const matchesStatus = filterStatus === 'ALL' || str.status === filterStatus;
    
    // 2. Text Search (ID, Reason, Customer Name, Transaction ID)
    const customer = customers.find(c => c.id === str.customerId);
    const searchLower = searchText.toLowerCase();
    
    const matchesSearch = searchText === '' || 
      str.id.toLowerCase().includes(searchLower) ||
      str.reason.toLowerCase().includes(searchLower) ||
      str.transactionId.toLowerCase().includes(searchLower) ||
      str.customerId.toLowerCase().includes(searchLower) ||
      (customer && customer.name.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  const selectedTransaction = selectedSTR 
    ? transactions.find(t => t.id === selectedSTR.transactionId) 
    : null;

  const selectedCustomer = selectedSTR
    ? customers.find(c => c.id === selectedSTR.customerId)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* List of STRs */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <AlertTriangle className="text-yellow-500 w-5 h-5" />
            Generated Reports (STR)
          </h2>
          
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-2 top-2.5 w-3 h-3 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Filter by ID, Reason, or Customer..." 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded pl-7 pr-8 py-1.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 transition-all"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button 
                  onClick={() => setSearchText('')}
                  className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="relative w-36">
              <Filter className="absolute left-2 top-2.5 w-3 h-3 text-slate-500" />
              <select 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded pl-7 pr-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 appearance-none text-slate-800 dark:text-slate-300"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All ({strs.length})</option>
                <option value="PENDING">Pending ({pendingCount})</option>
                <option value="FILED">Filed ({filedCount})</option>
                <option value="DISMISSED">Dismissed ({dismissedCount})</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          {filteredSTRs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No reports match your filters.
            </div>
          ) : (
            filteredSTRs.map((str) => (
              <div 
                key={str.id}
                onClick={() => { setSelectedSTR(str); }}
                className={`p-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ${selectedSTR?.id === str.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono text-slate-500">{str.id}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${str.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' : str.status === 'DISMISSED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500'}`}>
                    {str.status}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{getDisplayReason(str)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{str.generatedAt.toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* STR Detail & Analysis */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col p-6 overflow-auto shadow-sm">
        {selectedSTR ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Investigation Details</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Case Reference: <span className="font-mono text-slate-700 dark:text-slate-300">{selectedSTR.id}</span></p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50 text-sm transition-colors">
                  <CheckCircle className="w-4 h-4" /> File SAR
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50 text-sm transition-colors">
                  <XCircle className="w-4 h-4" /> Dismiss
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800">
               <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Flag className="w-4 h-4 text-slate-500" />
                  Trigger Logic
               </h4>
               <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{getDisplayReason(selectedSTR)}</p>
            </div>

            

            {/* Transaction Details Section */}
            {selectedTransaction && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                   <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                   Transaction Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Transaction ID</span>
                    <div className="mt-1 font-mono text-sm text-blue-600 dark:text-blue-400 break-all">{selectedTransaction.id}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Amount</span>
                    <div className="mt-1 font-mono text-lg text-slate-900 dark:text-white">
                      {selectedTransaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm text-slate-500 dark:text-slate-400">{selectedTransaction.currency}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Type</span>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300`}>
                        {selectedTransaction.type}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Destination</span>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{selectedTransaction.destinationCountry}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800 md:col-span-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Timestamp</span>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-200 font-mono">
                      {selectedTransaction.timestamp.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800 md:col-span-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Risk Flags</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedTransaction.flags.length > 0 ? (
                        selectedTransaction.flags.map((flag, idx) => (
                          <span key={idx} className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                            {flag}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-sm italic">No specific flags triggered</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Risk Profile Section */}
            {selectedCustomer && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                   <User className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                   Customer Risk Profile
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Customer Name</span>
                    <div className="mt-1 font-medium text-slate-800 dark:text-slate-200">{selectedCustomer.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{selectedCustomer.id}</div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Risk Level</span>
                    <div className="mt-1">
                       <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                          selectedCustomer.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                          selectedCustomer.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
                          selectedCustomer.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' :
                          'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                       }`}>
                        {selectedCustomer.riskLevel}
                      </span>
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">Score: {selectedCustomer.riskScore}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Occupation
                    </span>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{selectedCustomer.occupation}</div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800">
                     <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Region
                    </span>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{selectedCustomer.region}</div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded border border-slate-200 dark:border-slate-800 md:col-span-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Risk Tags & Flags
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCustomer.tags.length > 0 || selectedCustomer.isSanctioned ? (
                        <>
                          {selectedCustomer.isSanctioned && (
                             <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-600 border border-red-300 dark:bg-red-950 dark:text-red-500 dark:border-red-900 animate-pulse">
                                SANCTION MATCH
                             </span>
                          )}
                          {selectedCustomer.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
                              {tag}
                            </span>
                          ))}
                        </>
                      ) : (
                        <span className="text-slate-500 text-sm italic">No specific risk tags associated.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a Suspicious Transaction Report to view details and generate AI analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};