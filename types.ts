
export type Difficulty = 'Recruit' | 'Veteran' | 'Elite';
export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Classified';
export type FightingStyle = 'Muay Thai' | 'Jiu Jitsu' | 'Boxing' | 'Mixed Martial Arts';
export type CyberPower = 'Neon Fire' | 'Digital Ice' | 'Quantum Void' | 'Electric Acid';

export type PowerUpType = 'shield' | 'speed' | 'points' | 'freeze' | 'multiplier' | 'ghost';

export interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  id: string;
}

export interface UserData {
  name: string;
  age: number;
  gender: Gender;
  style: FightingStyle;
  difficulty: Difficulty;
  power: CyberPower;
  avatar?: string;
}

export interface GameStats {
  hits: number;
  misses: number;
  mathCorrect: number;
  mathIncorrect: number;
  points: number;
  missedQuestions: string[];
}

export interface GameRecord {
  id: string;
  date: string;
  userData: UserData;
  stats: GameStats;
}

export interface MathQuestion {
  question: string;
  answer: number;
  options: number[];
}
