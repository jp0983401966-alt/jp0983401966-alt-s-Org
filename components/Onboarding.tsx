
import React, { useState } from 'react';
import { UserData, Difficulty, Gender, FightingStyle } from '../types';
import { DIFFICULTIES, GENDERS, STYLES } from '../constants';

interface OnboardingProps {
  onComplete: (data: UserData) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    age: 25,
    gender: 'Male',
    style: 'Mixed Martial Arts',
    difficulty: 'Recruit',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      onComplete(formData);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-12 animate-pulse-slow">
        <div className="text-center space-y-4">
          <div className="arcade-font text-blue-500 text-[10px] tracking-widest mb-2">READY PLAYER ONE</div>
          <h1 className="text-6xl font-black italic text-yellow-400 uppercase tracking-tighter neon-text-yellow leading-none arcade-font">
            MATH<span className="text-white">-</span>MAN
          </h1>
          <div className="text-pink-500 text-xs font-bold tracking-[0.4em] arcade-font mt-4">NEON MAZE PROTOCOL</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-black border-4 border-blue-900 p-8 shadow-[0_0_30px_rgba(59,130,246,0.3)] space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="arcade-font text-[8px] text-zinc-500 uppercase">User_ID</label>
              <input
                required
                type="text"
                placeholder="NICKNAME"
                className="w-full bg-zinc-900 border-2 border-zinc-800 text-yellow-400 p-3 font-bold uppercase focus:border-yellow-400 focus:outline-none arcade-font text-[10px]"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="arcade-font text-[8px] text-zinc-500 uppercase">Age_Scan</label>
              <input
                required
                type="number"
                min="5"
                max="99"
                className="w-full bg-zinc-900 border-2 border-zinc-800 text-yellow-400 p-3 font-bold focus:border-yellow-400 focus:outline-none arcade-font text-[10px]"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="arcade-font text-[8px] text-zinc-500 uppercase block">Difficulty_Level</label>
            <div className="grid grid-cols-3 gap-4">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: d })}
                  className={`py-4 border-2 arcade-font text-[8px] transition-all ${
                    formData.difficulty === d 
                    ? 'bg-yellow-400 border-yellow-400 text-black shadow-[0_0_15px_#facc15]' 
                    : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-500'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white arcade-font text-xs py-6 hover:bg-yellow-400 hover:text-black transition-all transform active:scale-95 shadow-[0_0_20px_#db2777]"
          >
            INSERT COIN & START
          </button>
        </form>

        <div className="text-center arcade-font text-[7px] text-zinc-700 animate-pulse">
          © 1980-2025 LOGIC-CORP ENTERTAINMENT
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
