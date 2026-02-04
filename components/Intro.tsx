
import React, { useEffect, useState } from 'react';
import { UserData } from '../types';
import { generateIntroData, IntroData } from '../services/geminiService';

interface IntroProps {
  userData: UserData;
  onStart: () => void;
}

const Intro: React.FC<IntroProps> = ({ userData, onStart }) => {
  const [data, setData] = useState<IntroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    generateIntroData(userData)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Intro generation failed, using fallback:", err);
        setData({
          imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
          story: `El sistema ha detectado una anomalía en la red. ${userData.name}, has sido seleccionado para purgar los sectores corruptos del laberinto de neón usando tu entrenamiento en ${userData.style}. Tu procesador lógico es nuestra única esperanza.`
        });
        setError(true);
        setLoading(false);
      });
  }, [userData]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#facc15]"></div>
        <div className="arcade-font text-[8px] text-yellow-400 animate-pulse uppercase">Sincronizando con el Núcleo...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] flex items-center justify-center p-6 overflow-hidden">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-in fade-in zoom-in duration-1000">
        <div className="relative group">
           <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
           <img 
            src={data?.imageUrl} 
            className="relative border-4 border-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.4)] rounded-sm grayscale hover:grayscale-0 transition-all duration-700 w-full aspect-square object-cover"
            alt="Póster Arcade"
           />
           {error && (
             <div className="absolute top-4 left-4 bg-red-600/80 px-2 py-1 arcade-font text-[6px] text-white">MODO_SEGURO_ACTIVO</div>
           )}
        </div>
        
        <div className="space-y-8 text-center md:text-left">
          <div className="space-y-2">
            <h2 className="arcade-font text-pink-500 text-xs tracking-widest uppercase">CAPÍTULO_01: EL_DESPERTAR</h2>
            <h1 className="arcade-font text-4xl text-white neon-text-yellow leading-tight uppercase">EL ORIGEN DE <br/> <span className="text-yellow-400">{userData.name}</span></h1>
          </div>
          
          <p className="text-zinc-400 text-sm leading-relaxed italic border-l-4 border-yellow-400 pl-6 arcade-font leading-loose text-[9px] uppercase">
            "{data?.story}"
          </p>

          <button 
            onClick={onStart}
            className="w-full md:w-auto bg-yellow-400 text-black arcade-font text-xs py-6 px-12 hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_#facc15] uppercase"
          >
            INICIALIZAR LABERINTO NEÓN
          </button>
        </div>
      </div>
    </div>
  );
};

export default Intro;
