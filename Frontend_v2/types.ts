export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TransactionType {
  WIRE = 'WIRE',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  MOBILE_BANKING = 'MOBILE_BANKING',
  TRADE = 'TRADE'
}

export interface Customer {
  Account_No: string;
  Customer_ID: string | null;
  Profile_ID: number;
  Full_Name: string;

  CREATED_AT: string;
  LAST_REVIEW_DATE: string;
  NEXT_REVIEW_DATE: string;
  UPDATED_AT: string;
  STATUS: string;

  RISK_SCORE: number;
  RISK_LEVEL: string;
  REVIEW_FREQUENCY_DAYS: number;

  KYC_INTEGRITY_COMPLETENESS_RATIO: number;
  
  DEMOGRAPHICS_RISK: any;
  KYC_INTEGRITY_UNIQUENESS: any;
  PEP_HITS: any;
  SANCTION_HITS: any;
  WATCHLIST_HITS: any;
  
  PEER_PROFILE_ACCOUNT_AGE: any;
  PEER_PROFILE_OCCUPATION: any ;
  PEER_PROFILE_REGION: any;

  REASON_CODES_JSON: any;
  TIME_SERIES_GAP: string;

  account_age: number;
  occupation: string;
  region: string;
}

export interface Transaction {
  from_account: string;
  from_name: string;
  to_account: string;
  to_name: string;
  amount: number;
  transaction_type: string;
  transaction_time: string;

  frequency_1hr: number;
  frequency_7days: number;
  frequency_24hr: number;
  
  generated_at: string; 
  time_window_1hr: number;
  time_window_7days: number;
  time_window_24hr: number;
  
  id: number;
  transaction_id: string;

  overall_risk_score: number | null;
  risk_level: string | null;
  reason_codes: string | null;
  
  percentile_branch: number;
  percentile_transaction_type: number;
  z_score_branch: number;
  z_score_individual: number;
  z_score_population: number;

  turnover_ratio_7days: number;
  turnover_ratio_24hr: number;
  variance_7days: number;
  variance_24hr: number;
  
  leading_digit_distribution: string;
  round_number_hoarding: number;
  transaction_geography_risk: number; 

}

export interface STR {
  id: string;
  transactionId: string;
  customerId: string;
  generatedAt: Date;
  reason: string;
  status: 'PENDING' | 'FILED' | 'DISMISSED';
  aiAnalysis?: string;
}

export interface EngineStats {
  transactionsProcessed: number;
  messagesInQueue: number;
  processingSpeed: number; // tx/sec
  flaggedCount: number;
  cpuUsage: number; // %
  ramUsage: number; // %
}









export interface EntityData {
  index: string;
  unique_aliases_used: string;
  unique_phone_numbers_used: string;
  unique_accounts_held: number;
  account_age_days: number;
  account_age_years: number;
  account_age_bucket: string;
  no_of_transactions_sent: number;
  no_of_transactions_received: number | null;
  avg_transaction_amount_sent: number;
  avg_transaction_amount_received: number | null;
  std_transaction_amount_sent: number | null;
  std_transaction_amount_received: number | null;
  std_transaction_amount_sent_and_received: number | null;
  max_freq_1hr: number;
  max_freq_24hr: number;
  max_freq_7d: number;
  max_freq_1m: number;
  max_volume_1hr: number;
  max_volume_24hr: number;
  max_volume_7d: number;
  max_volume_1m: number;
  total_amount_received: number | null;
  total_amount_sent: number;
  amount_received_vs_sent_ratio: number | null;
  cash_transactions: number | null;
  non_cash_transactions: number;
  cash_vs_non_cash_ratio: number | null;
  cross_border_risk: number;
  night_time_transaction_ratio: number;
  new_beneficiary_ratio: number;
  all_transaction_times: string; // JSON string
  min_time_lapse_minutes: number;
  max_time_lapse_minutes: number;
  avg_time_lapse_minutes: number;
  last_transaction_time: string;
  prefered_branches: string; // JSON string
  used_transaction_types: string; // JSON string
  frequent_destinations: string; // JSON string
  top_beneficiaries: string; // JSON string
}

export interface TransactionTime {
  time: string;
  lapse: string;
  role: 'sender' | 'beneficiary';
}

export interface AccountInfo {
  accountno: string;
  ownername: string;
  accounttype: string | null;
  openeddate: string | null;
  closeddate: string | null;
  accountid: string;
  ownerentity: string;
}

export interface PersonalInfo {
  alias: string;
  location: string | null;
  phonenumber: string | null;
  sex: string | null;
  birthdate: string | null;
  occupation: string | null;
  personid: string;
}
