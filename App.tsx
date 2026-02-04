
import React, { useState } from 'react';
import { UserData, GameStats } from './types';
import Onboarding from './components/Onboarding';
import Combat from './components/Combat';
import Report from './components/Report';
import Intro from './components/Intro';
import Credits from './components/Credits';

type View = 'start' | 'onboarding' | 'intro' | 'combat' | 'report' | 'credits';

const App: React.FC = () => {
  const [view, setView] = useState<View>('start');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);

  const handleStartGame = () => {
    setView('onboarding');
  };

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

  const handleShowCredits = () => {
    setView('credits');
  };

  const handleReset = () => {
    setStats(null);
    setUserData(null);
    setView('start');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {view === 'start' && (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          </div>
          
          <div className="relative z-10 text-center space-y-12">
            <div className="space-y-4">
              <div className="arcade-font text-blue-500 text-[10px] tracking-[0.8em] animate-pulse uppercase">SISTEMA_OPERATIVO_V2.0</div>
              <h1 className="text-7xl md:text-9xl font-black italic text-yellow-400 uppercase tracking-tighter neon-text-yellow leading-none arcade-font animate-bounce">
                MATH<span className="text-white">-</span>MAN
              </h1>
              <div className="text-pink-500 text-[12px] font-bold tracking-[0.4em] arcade-font uppercase">EL_LABERINTO_DE_NEÓN</div>
            </div>

            <button 
              onClick={handleStartGame}
              className="group relative px-12 py-8 bg-transparent border-4 border-yellow-400 arcade-font text-xl text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 shadow-[0_0_30px_#facc15] hover:shadow-[0_0_60px_#facc15] transform active:scale-90"
            >
              <span className="relative z-10"> COMENZAR JUEGO </span>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-black border-l-4 border-t-4 border-yellow-400"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black border-r-4 border-b-4 border-yellow-400"></div>
            </button>

            <div className="pt-20 arcade-font text-[8px] text-zinc-700 animate-pulse space-y-2 uppercase">
              <p>PRESIONA PARA CARGAR PROTOCOLO_DE_LÓGICA</p>
              <p>© 2025 LOGIC-CORP ENTERTAINMENT</p>
            </div>
          </div>
        </div>
      )}

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
        <Report userData={userData} stats={stats} onReset={handleShowCredits} />
      )}

      {view === 'credits' && (
        <Credits onRestart={handleReset} />
      )}

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
