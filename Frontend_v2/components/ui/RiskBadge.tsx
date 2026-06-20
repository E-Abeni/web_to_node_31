import React from 'react';
import { RiskLevel } from '../../types';

export const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const colors = {
    [RiskLevel.LOW]: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    [RiskLevel.MEDIUM]: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    [RiskLevel.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    [RiskLevel.CRITICAL]: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${colors[level]}`}>
      {level}
    </span>
  );
};