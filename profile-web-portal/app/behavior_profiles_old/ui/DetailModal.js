
import React, { useMemo, useState, useEffect } from 'react';
import { ACCOUNTS_DATA, PERSONAL_DATA } from '../../services/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';


const TabButton = ({ id, label, activeTab, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
      activeTab === id 
        ? 'border-blue-600 text-blue-600' 
        : 'border-transparent text-gray-400 hover:text-gray-600'
    }`}
  >
    {label}
  </button>
);

const InfoBox = ({ label, value, subLabel }) => (
  <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg shadow-xl hover:border-slate-700 transition-colors">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className="text-xl font-bold text-slate-100">
      {value}
    </p>
    {subLabel && (
      <p className="text-[10px] text-slate-400 font-medium mt-1 leading-tight">
        {subLabel}
      </p>
    )}
  </div>
);

export function DetailModal ({ entity, onClose }){
  const [activeTab, setActiveTab] = useState('general');
  const [overlay, setOverlay] = useState('none');
  const [entityAccounts, setEntityAccounts] = useState([]);
  const [entityPersonal, setEntityPersonal] = useState([]);

  async function changeInfo(){
    let ad = await ACCOUNTS_DATA(entity.index)
    let pd = await PERSONAL_DATA(entity.index)
    setEntityAccounts(prev => ad)
    setEntityPersonal(prev => pd)
  }

  useEffect(() => {
    changeInfo()
  }, [entity])


  const entityAccountss = useMemo(async () => {
    let data = await ACCOUNTS_DATA(entity.index)
    console.log("From entityAccounts: ", data)
    //return data.filter(acc => acc.ownerentity === entity.index);
    return data
  }, [entity.index]);

  const entityPersonall = useMemo(async () => {
    let data = await PERSONAL_DATA(entity.index)
    console.log("From entityPersonal: ", data)
    return data
    //return data.filter(p => p.personid === entity.index);
  }, [entity.index]);

  const parsedTransactionTimes = useMemo(() => {
    try {
      const data = JSON.parse(entity.all_transaction_times);
      return Object.entries(data).map(([time, details]) => ({
        time,
        lapse: details[0],
        role: details[1] ,
      }));
    } catch (e) { return []; }
  }, [entity]);

  const auditVisualData = useMemo(() => {
    return parsedTransactionTimes.map((tx, idx) => {
      const match = tx.lapse.match(/(\d+) days (\d+):(\d+):(\d+)/);
      let totalMinutes = 0;
      if (match) {
        totalMinutes = parseInt(match[1]) * 1440 + parseInt(match[2]) * 60 + parseInt(match[3]);
      }
      return {
        name: `Seq ${idx + 1}`,
        minutes: totalMinutes,
        role: tx.role,
        fullTime: tx.time
      };
    });
  }, [parsedTransactionTimes]);

  const parsedBranches = useMemo(() => {
    try {
      const data = JSON.parse(entity.prefered_branches)
      return Object.entries(data).map(([branch, count]) => ({ name: branch, value: count }));
    } catch (e) { return []; }
  }, [entity]);

  const parsedTypes = useMemo(() => {
    try {
      const data = JSON.parse(entity.used_transaction_types)
      return Object.entries(data).map(([type, count]) => ({ name: type, value: count }));
    } catch (e) { return []; }
  }, [entity]);

  const parsedDestinations = useMemo(() => {
    try {
      const data = JSON.parse(entity.frequent_destinations)
      return Object.entries(data).map(([dest, count]) => ({ dest, count }));
    } catch (e) { return []; }
  }, [entity]);

  const parsedBeneficiaries = useMemo(() => {
    try {
      const data = JSON.parse(entity.top_beneficiaries)
      return Object.entries(data).map(([id, count]) => ({ id, count }));
    } catch (e) { return []; }
  }, [entity]);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(val);
  };

  const formatRatio = (val) => {
    if (val === null || val === undefined) return '-';
    return val?.toFixed(4);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const ROLE_COLORS = { sender: '#3b82f6', beneficiary: '#10b981' };
  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-950 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col relative border border-slate-800">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Customer Analysis</h2>
            <p className="text-xs font-mono text-slate-500 uppercase mt-1">{entity.index}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setOverlay(overlay === 'fayda' ? 'none' : 'fayda')}
              className={`px-4 py-2 text-xs font-bold rounded transition-all uppercase tracking-wider ${
                overlay === 'fayda' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              Fayda Info
            </button>
            <button 
              onClick={() => setOverlay(overlay === 'personal' ? 'none' : 'personal')}
              className={`px-4 py-2 text-xs font-bold rounded transition-all uppercase tracking-wider ${
                overlay === 'personal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              Personal Info
            </button>
            <button 
              onClick={() => setOverlay(overlay === 'accounts' ? 'none' : 'accounts')}
              className={`px-4 py-2 text-xs font-bold rounded transition-all uppercase tracking-wider ${
                overlay === 'accounts' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              Accounts Info
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white p-2 ml-2 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        {overlay === 'none' && (
          <div className="flex px-6 border-b border-slate-800 bg-slate-950">
            {/* Note: TabButton component should be updated internally to handle dark mode colors */}
            <TabButton id="general" label="Basic Info" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="timeline" label="Timeline" activeTab={activeTab} onClick={setActiveTab} />
            <TabButton id="network" label="Network" activeTab={activeTab} onClick={setActiveTab} />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative bg-slate-950 text-slate-300">
          
          {/* Personal Overlay View */}
          {overlay === 'personal' && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-lg font-bold text-slate-100">Personal Information</h3>
                <button 
                  onClick={() => setOverlay('none')}
                  className="text-blue-400 text-xs font-bold hover:text-blue-300 uppercase tracking-widest transition-colors"
                >
                  Back to Details
                </button>
              </div>

              {entityPersonal.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {entityPersonal.map((person, idx) => (
                    <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alias</p>
                          <h4 className="text-lg font-bold text-slate-100 uppercase">{person.alias}</h4>
                        </div>
                        {person.sex && (
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${person.sex === 'M' ? 'bg-blue-900/40 text-blue-400' : 'bg-pink-900/40 text-pink-400'}`}>
                             {person.sex}
                           </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-t border-slate-800/50 pt-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone</p>
                          <p className="text-sm font-mono text-slate-300">{person.phonenumber || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</p>
                          <p className="text-sm text-slate-300 uppercase">{person.location || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Birthdate</p>
                          <p className="text-sm text-slate-300">{formatDate(person.birthdate)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Occupation</p>
                          <p className="text-sm text-slate-300 uppercase">{person.occupation || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                  <p className="font-medium">No personal information records available for this entity.</p>
                </div>
              )}
            </div>
          )}

          {/* Fayda Overlay View */}
          {overlay === 'fayda' && (
            <div className="animate-in slide-in-from-right-4 duration-300 w-full max-w-full mx-auto space-y-4">
              <div className="w-full border border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-900">
                <iframe
                  src="http://172.20.105.148:3010" 
                  title="Fayda Information System"
                  className="w-full h-[800px] md:h-[calc(100vh-250px)] opacity-90 hover:opacity-100 transition-opacity" 
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Accounts Overlay View */}
          {overlay === 'accounts' && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-lg font-bold text-slate-100">Registered Accounts</h3>
                <button 
                  onClick={() => setOverlay('none')}
                  className="text-blue-400 text-xs font-bold hover:text-blue-300 uppercase tracking-widest"
                >
                  Back to Details
                </button>
              </div>

              {entityAccounts.length > 0 ? (
                <div className="border border-slate-800 rounded-lg overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Account No</th>
                        <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Owner Name</th>
                        <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Opened</th>
                        <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950">
                      {entityAccounts.map((acc, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium text-slate-200">{acc.accountno}</td>
                          <td className="px-4 py-3 text-slate-300 uppercase">{acc.ownername}</td>
                          <td className="px-4 py-3 text-slate-400">{acc.accounttype || 'N/A'}</td>
                          <td className="px-4 py-3 text-slate-400">{formatDate(acc.openeddate)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${acc.closeddate ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                              {acc.closeddate ? 'Closed' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                  <p className="font-medium">No account data available for this entity.</p>
                </div>
              )}
            </div>
          )}

          {overlay === 'none' && (
            <div className="space-y-12">
              {/* TAB: GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {/* Note: InfoBox component should be updated for Dark Mode */}
                    <InfoBox label="Aliases" value={entity.unique_aliases_used} />
                    <InfoBox label="Phone Numbers" value={entity.unique_phone_numbers_used} />
                    <InfoBox label="Accounts" value={entity.unique_accounts_held} />
                    <InfoBox label="Account Age (Y)" value={entity.account_age_years?.toFixed(1)} />
                    <InfoBox label="Risk Level" value={entity.cross_border_risk === 0 ? 'Low' : 'High'} />
                    <InfoBox label="Age Bucket" value={entity.account_age_bucket} />
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-800 rounded-lg p-6 space-y-4 bg-slate-900/20">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Recieved </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Total Amount</p>
                          <p className="text-lg font-bold text-slate-100">{formatCurrency(entity.total_amount_received)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Count</p>
                          <p className="text-lg font-bold text-slate-100">{entity.no_of_transactions_received || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Avg Received</p>
                          <p className="text-lg font-bold text-slate-100">{formatCurrency(entity.avg_transaction_amount_received)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Std Dev (Recv)</p>
                          <p className="text-lg font-bold text-slate-100">{formatCurrency(entity.std_transaction_amount_received)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border border-slate-800 rounded-lg p-6 space-y-4 bg-slate-900/20">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Sent</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Total Amount</p>
                          <p className="text-lg font-bold text-slate-100">{formatCurrency(entity.total_amount_sent)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Count</p>
                          <p className="text-lg font-bold text-slate-100">{entity.no_of_transactions_sent}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Avg Sent</p>
                          <p className="text-lg font-bold text-slate-100">{formatCurrency(entity.avg_transaction_amount_sent)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Std Dev (Sent)</p>
                          <p className="text-lg font-bold text-slate-100">{formatCurrency(entity.std_transaction_amount_sent)}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="border border-slate-800 rounded-lg p-6 space-y-4 bg-slate-900/20">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Transaction Composition & Ratios</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Cash Transactions</p>
                        <p className="text-lg font-bold text-slate-100">{formatCurrency(entity.cash_transactions)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Non-Cash Volume</p>
                        <p className="text-lg font-bold text-slate-100">{formatCurrency(entity.non_cash_transactions)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Cash/Non-Cash Ratio</p>
                        <p className="text-lg font-bold text-slate-100">{formatRatio(entity.cash_vs_non_cash_ratio)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Recv/Sent Ratio</p>
                        <p className="text-lg font-bold text-slate-100">{formatRatio(entity.amount_received_vs_sent_ratio)}</p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* TAB: TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">Frequency Analysis</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      <InfoBox label="Max Freq (1H)" value={entity.max_freq_1hr} />
                      <InfoBox label="Max Freq (24H)" value={entity.max_freq_24hr} />
                      <InfoBox label="Max Freq (7D)" value={entity.max_freq_7d} />
                      <InfoBox label="Max Freq (1M)" value={entity.max_freq_1m} />
                      <InfoBox label="Avg Gap (Mins)" value={entity.avg_time_lapse_minutes} />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">Volume Analysis</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <InfoBox label="Max Vol (1H)" value={formatCurrency(entity.max_volume_1hr)} />
                      <InfoBox label="Max Vol (24H)" value={formatCurrency(entity.max_volume_24hr)} />
                      <InfoBox label="Max Vol (7D)" value={formatCurrency(entity.max_volume_7d)} />
                      <InfoBox label="Max Vol (1M)" value={formatCurrency(entity.max_volume_1m)} />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">Behavioral Indicators</h3>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                      <InfoBox label="Night Ratio" value={`${(entity.night_time_transaction_ratio * 100)?.toFixed(0)}%`} subLabel="Percentage of transactions occurring at night" />
                      <InfoBox label="New Beneficiary Ratio" value={entity.new_beneficiary_ratio?.toFixed(2)} subLabel="Growth in unique outgoing connections" />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Transaction Sequence (Gap in Mins)</h3>
                    <div className="border border-slate-800 rounded-lg p-6 h-64 bg-slate-900/20">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={auditVisualData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis dataKey="name" hide />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} />
                          <Bar dataKey="minutes">
                            {auditVisualData.map((entry, index) => (
                              <Cell key={index} fill={entry.role === 'sender' ? '#3b82f6' : '#10b981'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="border border-slate-800 rounded-lg overflow-hidden shadow-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-400 uppercase">Timestamp</th>
                          <th className="px-4 py-3 font-bold text-slate-400 uppercase text-center">Role</th>
                          <th className="px-4 py-3 font-bold text-slate-400 uppercase text-right">Lapse</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950">
                        {parsedTransactionTimes.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-slate-200">{tx.time}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.role === 'sender' ? 'bg-blue-900/40 text-blue-400' : 'bg-green-900/40 text-green-400'}`}>{tx.role}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-slate-400 font-mono">{tx.lapse}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                </div>
              )}

              {/* TAB: NETWORK */}
              {activeTab === 'network' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preferred Branches</h3>
                      <div className="border border-slate-800 rounded-lg p-6 h-64 bg-slate-900/20">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={parsedBranches}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                            <YAxis stroke="#64748b" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Transaction Types</h3>
                      <div className="border border-slate-800 rounded-lg p-6 h-64 flex items-center bg-slate-900/20">
                        <div className="w-1/2 h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={parsedTypes} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {parsedTypes.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 space-y-2">
                          {parsedTypes.map((t, i) => (
                            <div key={i} className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-500">{t.name}</span>
                              <span className="text-slate-200">{t.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border border-slate-800 rounded-lg p-6 bg-slate-900/20 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Top Beneficiaries</h3>
                      <div className="space-y-2">
                        {parsedBeneficiaries.slice(0, 5).map((ben, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
                            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[240px]">{ben.id}</span>
                            <span className="font-bold text-slate-100">{ben.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-6 border border-slate-800 rounded-lg bg-slate-900/40">
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Preferred Destinations</p>
                           <div className="flex flex-wrap gap-2 mt-2">
                             {parsedDestinations.map(({ dest, count }, i) => (
                               <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-bold uppercase text-slate-300">
                                 {dest}: {count}
                               </span>
                             ))}
                           </div>
                        </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button onClick={onClose} className="px-8 py-2 bg-slate-100 text-slate-950 font-bold rounded hover:bg-white transition-all transform active:scale-95">
            Close
          </button>
        </div>
      </div>
    </div>
);
};

