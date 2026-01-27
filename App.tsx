
import React, { useState } from 'react';
import { UserData, GameStats } from './types';
import Onboarding from './components/Onboarding';
import Combat from './components/Combat';
import Report from './components/Report';
import Intro from './components/Intro';

type View = 'onboarding' | 'intro' | 'combat' | 'report';

const App: React.FC = () => {
  const [view, setView] = useState<View>('onboarding');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);

  const handleOnboardingComplete = (data: UserData) => {
    setUserData(data);
    setView('intro');
  };

  const handleIntroComplete = () => {
    setView('combat');
  };

  const handleCombatComplete = (results: GameStats) => {
    setStats(results);
    setView('report');
  };

  const handleReset = () => {
    setStats(null);
    setView('onboarding');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {view === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      
      {view === 'intro' && userData && (
        <Intro userData={userData} onStart={handleIntroComplete} />
      )}
      
      {view === 'combat' && userData && (
        <Combat userData={userData} onComplete={handleCombatComplete} />
      )}
      
      {view === 'report' && userData && stats && (
        <Report userData={userData} stats={stats} onReset={handleReset} />
      )}

      {/* Global Arcade Overlay */}
      <div className="fixed top-0 left-0 w-full h-1 bg-yellow-400/20 z-50 overflow-hidden">
        <div className="h-full bg-yellow-400 w-1/4 animate-[loading_1.5s_linear_infinite]"></div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .neon-text-yellow { text-shadow: 0 0 10px #facc15; }
      `}</style>
    </div>
  );
};

export default App;
