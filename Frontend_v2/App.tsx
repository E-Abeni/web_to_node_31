import React, { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, Activity, AlertTriangle, ShieldCheck, Menu, Users, Settings, Moon, Sun, ExternalLink } from 'lucide-react';


import { Dashboard } from './components/Dashboard';
import { CustomerProfile } from "./components/Profile"
import { LiveMonitor } from './components/LiveMonitor';
import { STRManager } from './components/STRManager';
import { CustomerRiskMonitor } from './components/CustomerRiskMonitor';
import {ProfilesTab} from "./components/Profiles_v2"

import {get_transactions, get_customers} from "./services/database"

enum View {
  DASHBOARD = 'DASHBOARD',
  MONITOR = 'MONITOR',
  CUSTOMERS = 'CUSTOMERS',
  ALERTS = 'ALERTS',
  PROFILE = 'PROFILE'
}


const App: React.FC = () => {

  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // State
  const [stats, setStats] = useState({
    transactionsProcessed: 1245890,
    messagesInQueue: 42,
    processingSpeed: 850,
    flaggedCount: 142,
    cpuUsage: 42,
    ramUsage: 65
  });
  
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [strs, setStrs] = useState([]);
  const [volumeHistory, setVolumeHistory] = useState([]);

  const [customersCount, setCustomersCount] = useState(0)

  useEffect(()=>{
    setCustomersCount(p => customers.length)

  }, [transactions, customers])

  // Navigation state for deep linking
  const [targetCustomerId, setTargetCustomerId] = useState<string | null>(null);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useState(() => {
    toggleTheme();
  } , [])

  const handleGenerateSTR = (tx) => {
    // Check if duplicate
    const exists = strs.find(s => s.transactionId === tx.id);
    if (exists) {
      alert(`STR already exists for Transaction ${tx.id}`);
      return;
    }
    const customer = customers.find(c => c.id === 3);
    if (!customer) return;

    const newSTR = null;
    //newSTR.reason = "Manual Trigger by Analyst";
    setStrs(prev => [newSTR, ...prev]);
    //alert(`STR Generated successfully: ${newSTR.id}`);
  };

  const handleViewCustomerTimeline = (customerId: string) => {
    setTargetCustomerId(customerId);
    setCurrentView(View.CUSTOMERS);
  };

  async function set_transactions_and_customers(){
    const t = await get_transactions()
    const c = await get_customers()

    setTransactions(prev => t)
    setCustomers(prev => c)

  }


  useEffect(() => {
    
    set_transactions_and_customers()

    const interval = setInterval(() => {
      
      set_transactions_and_customers()

      console.log("Fetched Transactions: ", get_transactions())
      console.log("Fetched Customers: ", get_customers())


      setStats(prev => ({
        ...prev,
        transactionsProcessed: prev.transactionsProcessed + 1,
        messagesInQueue: Math.floor(Math.random() * 50),
        processingSpeed: 800 + Math.floor(Math.random() * 100),
        flaggedCount: prev.flaggedCount + 1,
        cpuUsage: Math.floor(Math.random() * 40) + 20, 
        ramUsage: Math.floor(Math.random() * 20) + 50 
      }));

  
      setVolumeHistory(prev => {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const newPoint = {
          time: timeStr,
          count: Math.floor(Math.random() * 50) + 100, 
          riskScoreAvg: Math.floor(Math.random() * 30) + 20
        };
        return [...prev, newPoint].slice(-20);
      });

    }, 3000000); 

    return () => clearInterval(interval);
  }, []);

  function updateTransactions(transactions){
      setTransactions(transactions)
  }

  function updateCustomers(customers){
    setCustomers(customers)
  }

  return (
    <div className="flex flex-col h-screen text-slate-100 dark:text-slate-100 font-sans transition-colors duration-300" style={{ backgroundColor: 'rgb(237, 244, 246)' }}>
      {/* Sidebar */}
      <aside className="border-r border-slate-700 dark:border-slate-800 dark:bg-slate-950 flex flex-row hidden md:flex h-24" style={{ backgroundColor: 'rgb(252, 253, 253)' }}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-700 dark:border-slate-800">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold tracking-tight text-black">CTMS Fusion Analysis</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 flex flex-row">
          <button 
            onClick={() => setCurrentView(View.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === View.DASHBOARD ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-900 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>

          <button 
            onClick={() => setCurrentView(View.PROFILE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === View.PROFILE ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-900 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Users className="w-5 h-5" />
            Entitiy Profiles
          </button>
          
          <button 
            onClick={() => setCurrentView(View.MONITOR)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === View.MONITOR ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-900 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Activity className="w-5 h-5" />
            Live Monitor
          </button>

          <button 
            onClick={() => setCurrentView(View.CUSTOMERS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === View.CUSTOMERS ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-900 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Users className="w-5 h-5" />
            Risk Assessment
          </button>
          
          <button 
            onClick={() => setCurrentView(View.ALERTS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === View.ALERTS ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-900 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="flex-1 text-left">STR Alerts</span>
            {strs.filter(s => s.status === 'PENDING').length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {strs.filter(s => s.status === 'PENDING').length}
              </span>
            )}
          </button>
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-2">
             <ShieldCheck className="w-6 h-6 text-blue-500" />
             <span className="font-bold text-slate-900 dark:text-slate-100">CTMS Fusion</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-500">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="text-slate-500"><Menu /></button>
          </div>
        </header>

        {/* View Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentView === View.DASHBOARD && 'Operational Overview'}
                  {currentView === View.MONITOR && 'Real-time Transaction Analysis'}
                  {currentView === View.CUSTOMERS && 'Customer Risk Profiling'}
                  {currentView === View.ALERTS && 'Suspicious Activity Reports'}
                  {currentView === View.PROFILE && 'Behavioral Profile Analysis'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {currentView === View.DASHBOARD && 'Central Database & Message Broker Metrics'}
                  {currentView === View.MONITOR && 'Live stream of processed transactions and risk scoring'}
                  {currentView === View.CUSTOMERS && 'Behavioral analysis, peer grouping, and KYC integrity checks'}
                  {currentView === View.ALERTS && 'Review and file generated STRs'}
                  {currentView === View.PROFILE && 'Statistical behavior profiling of customer accounts'}
                </p>
              </div>
            </header>

            {currentView === View.DASHBOARD && (
              <Dashboard 
                stats={stats} 
                transactions={transactions} 
              />
            )}

            {currentView === View.PROFILE && (
              <ProfilesTab 
                
              />
            )}

            
            {currentView === View.MONITOR && (
              <div className="h-[calc(100vh-200px)]">
                <LiveMonitor 
                  transactions={transactions} 
                  onGenerateSTR={handleGenerateSTR}
                  onViewTimeline={handleViewCustomerTimeline}
                  updateTransactions={updateTransactions}
                />
              </div>
            )}

            {currentView === View.CUSTOMERS && (
              <CustomerRiskMonitor 
                customers={customers} 
                targetCustomerId={targetCustomerId}
                updateCustomers={updateCustomers}
                count = {customersCount}
              />
            )}
            
            {currentView === View.ALERTS && (
              <STRManager 
                strs={strs} 
                transactions={transactions} 
                customers={customers} 
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
