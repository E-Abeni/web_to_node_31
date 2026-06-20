// --- Data Interface (Optional but recommended for TypeScript or clarity) ---
// type TransactionData = {
//   id: number;
//   transaction_id: string;
//   time_window_1hr: number;
//   // ... all other keys
//   from_account: string;
//   from_name: string;
//   to_account: string;
//   to_name: string;
//   amount: number;
//   transaction_type: string;
//   transaction_time: string;
//   generated_at: string;
// };

import React, { useState, useCallback } from 'react';

// --- 1. Custom Hook for Modal Logic ---
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, openModal, closeModal, toggleModal };
};

// --- 2. The Transaction Details Modal Component ---
export const TransactionDetailsModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  // Function to render the key/value pairs in a readable way
  const renderDetail = (key, value) => {
    // Basic formatting for JSON string data
    let displayValue = value;
    if (key === 'leading_digit_distribution' && typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        displayValue = (
          <pre style={{ margin: 0, padding: 0, overflowX: 'auto', fontSize: '0.9em' }}>
            {JSON.stringify(parsed)}
          </pre>
        );
      } catch (e) {
        // If parsing fails, display the raw string
        displayValue = value;
      }
    } else if (value === null) {
        displayValue = <span style={{ color: '#aaa' }}>N/A</span>;
    } else if(key === "ID") {
        displayValue = value
    } else if (typeof value === 'number') {
        // Simple formatting for large numbers (Amount)
        displayValue = key === 'amount' ? `${value.toLocaleString()} Birr` : value.toLocaleString();
    }


    // Function to convert snake_case to Title Case for display
    const formatKey = (str) => {
      return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    return (
      <div key={key} style={styles.detailRow}>
        <span style={styles.detailKey}>{formatKey(key)}: </span>
        <span style={styles.detailValue}>{displayValue}</span>
      </div>
    );
  };

  // Separate the data into sections for better readability
  const accountInfo = ['from_name', 'from_account', 'to_name', 'to_account'];
  const riskScores = [
    'overall_risk_score', 'risk_level', 'reason_codes', 'transaction_geography_risk',
    'z_score_individual', 'z_score_branch', 'z_score_population',
    'percentile_branch', 'percentile_transaction_type'
  ];
  const timeAndFrequency = [
    'time_window_1hr', 'time_window_24hr', 'time_window_7days',
    'frequency_1hr', 'frequency_24hr', 'frequency_7days',
    'variance_24hr', 'variance_7days', 'turnover_ratio_24hr', 'turnover_ratio_7days'
  ];
  const otherDetails = Object.keys(data).filter(key =>
    ![...accountInfo, ...riskScores, ...timeAndFrequency, 'id', 'transaction_id', 'amount', 'transaction_type', 'transaction_time', 'generated_at'].includes(key)
  );

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={{ margin: 0, ...styles.sectionHeader }}>Transaction Details</h2>
          <button onClick={onClose} style={styles.closeButton}>&times;</button>
        </div>
      
        <div style={styles.modalBody}>
          {renderDetail('ID', data.id)}
          {renderDetail('transaction_type', data.transaction_type)}
          {renderDetail('transaction_time', data.transaction_time)}          

          {/* Transaction Summary */}
          <h3 style={styles.sectionHeader}>Transaction Summary</h3>
          {renderDetail('amount', data.amount)}
          {renderDetail('transaction_id', data.transaction_id)}
          {renderDetail('generated_at', data.generated_at)}

          {/* Account Information */}
          <h3 style={styles.sectionHeader}>Account Information</h3>
          {accountInfo.map(key => renderDetail(key, data[key]))}

          {/* Risk Scores */}
          <h3 style={styles.sectionHeader}>Risk & Z-Scores</h3>
          {riskScores.map(key => renderDetail(key, data[key]))}

          {/* Time and Frequency */}
          <h3 style={styles.sectionHeader}>Time & Frequency Analysis</h3>
          {timeAndFrequency.map(key => renderDetail(key, data[key]))}

          {/* Other Details */}
          <h3 style={styles.sectionHeader}>Other Details</h3>
          {otherDetails.map(key => renderDetail(key, data[key]))}
        </div>
      </div>
    </div>
  );
};


// --- Basic Inline Styles (Replace with CSS/Styled Components in a real app) ---
const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#333',
    padding: '5px 10px',
    lineHeight: '1',
  },
  modalBody: {
    paddingTop: '10px',
  },
  summaryText: {
      fontSize: '1.1em',
      marginBottom: '20px',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '5px'
  },
  sectionHeader: {
      marginTop: '25px',
      marginBottom: '10px',
      borderBottom: '2px solid #eee',
      paddingBottom: '5px',
      color: '#007bff'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    borderBottom: '1px dotted #eee',
    fontSize: '0.95em',
  },
  detailKey: {
    flex: 1,
    fontWeight: 'bold',
    color: '#555',
    textTransform: 'capitalize',
  },
  detailValue: {
    flex: 2,
    textAlign: 'right',
    wordBreak: 'break-all',
    color: 'black',
  },
};
