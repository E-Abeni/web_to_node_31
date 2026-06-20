
import React, { useState, useEffect } from 'react';
//import { analyzeAccountRisk } from '../../services/geminiService';
import Badge from './Badge';
import { BarChart as BarIcon, Code, Database, ChevronRight, AlertCircle } from 'lucide-react';
import { combineDomainOfAllAppliedNumericalValuesIncludingErrorValues } from 'recharts/types/state/selectors/axisSelectors';




const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col py-2 border-b border-slate-50 last:border-0">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</span>
    <span className="text-sm text-slate-700 font-medium truncate" title={String(value)}>{value ?? 'N/A'}</span>
  </div>
);

const RiskAnalysisModal = ({ account, onClose, openModal }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);  


  useEffect(() => {
    if (account) {
      const fetchAnalysis = async () => {
        setLoading(true);
        setAnalysis('');
        const result = "test"; //await analyzeAccountRisk(account);
        setAnalysis(result);
        setLoading(false);
      };
      fetchAnalysis();
    }
  }, [account]);

  if (!account) return null;

  const getRiskVariant = (score: number) => {
    if (score >= 8) return 'error';
    if (score >= 4) return 'warning';
    return 'success';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full animate-pulse bg-${getRiskVariant(account.unknown_beneficiary_risk_score) === 'error' ? 'rose' : getRiskVariant(account.unknown_beneficiary_risk_score) === 'warning' ? 'amber' : 'emerald'}-500`} />
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Account: {account.accountno.replace(/^'/, '')}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Column 1: Core Metrics */}
            <div className="space-y-6">
              <section>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Financial Profile
                </h4>
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-1">
                  <DetailRow label="Mean Transaction" value={`$${account.mean.toLocaleString()}`} />
                  <DetailRow label="Std Deviation" value={`$${account.std.toLocaleString()}`} />
                  <DetailRow label="Total Count" value={account.count} />
                  <DetailRow label="Risk Score" value={<Badge variant={getRiskVariant(account.unknown_beneficiary_risk_score)}>{account.unknown_beneficiary_risk_score}/100</Badge>} />
                </div>
              </section>

              <section>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Temporal Data
                </h4>
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-1">
                  <DetailRow label="Last Transaction" value={new Date(account.last_transaction_time).toLocaleString()} />
                  <DetailRow label="Account Age" value={`${Math.round(account.account_age_years)} Years (${account.account_age_days} days)`} />
                  <DetailRow label="Age Bucket" value={account.account_age_bucket} />
                </div>
              </section>
            </div>

            {/* Column 2: Velocity & Behavior */}
            <div className="space-y-6">
              <section>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Velocity (1h / 24h)
                </h4>
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-1">
                  <DetailRow label="Max Freq (1hr)" value={account.max_freq_1hr} />
                  <DetailRow label="Max Sum (1hr)" value={`$${Number(account.max_sum_1hr).toLocaleString()}`} />
                  <DetailRow label="Max Freq (24hr)" value={account.max_freq_24hr} />
                  <DetailRow label="Max Sum (24hr)" value={`$${Number(account.max_sum_24hr).toLocaleString()}`} />
                </div>
              </section>

              <section>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" /> Lapses & Destinations
                </h4>
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-1">
                  <DetailRow label="Min Lapse (min)" value={account.min_time_lapse_minutes} />
                  <DetailRow label="Max Lapse (min)" value={account.max_time_lapse_minutes} />
                  <DetailRow label="Avg Lapse (min)" value={account.avg_time_lapse_minutes} />
                  {
                    //<DetailRow label="Frequent Dest." value={Object.keys(JSON.parse(account.frequent_destinations))?.join(', ') || 'None Detected'} />
                  }
                </div>
              </section>
            </div>
            <button
                onClick={() => openModal()}
                className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 justify-center col-span-1 lg:col-span-2"
              >
                Open Timeline View
            </button>
            
          </div>
        </div>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            Close Details
          </button>
          <button 
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysisModal;
