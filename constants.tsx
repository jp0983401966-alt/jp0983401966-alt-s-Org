
import React from 'react';

export const DIFFICULTIES = ['Recruit', 'Veteran', 'Elite'] as const;
export const GENDERS = ['Male', 'Female', 'Non-binary', 'Classified'] as const;
export const STYLES = ['Muay Thai', 'Jiu Jitsu', 'Boxing', 'Mixed Martial Arts'] as const;

export const DB_KEY = 'math_kombat_db';

export const Icons = {
  Target: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
};
