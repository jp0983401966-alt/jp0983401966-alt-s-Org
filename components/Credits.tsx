
import React from 'react';

interface CreditsProps {
  onRestart: () => void;
}

const Credits: React.FC<CreditsProps> = ({ onRestart }) => {
  const authors = [
    "MATHIAS MOYA",
    "JOEL PINTA",
    "ANTHONY PAREDES",
    "SEBASTIAN MEDINA"
  ];

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in zoom-in duration-1000 relative overflow-hidden">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#00ff0012_1px,transparent_1px),linear-gradient(to_bottom,#00ff0012_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      </div>

      <div className="text-center space-y-6 relative z-10">
        <div className="arcade-font text-blue-500 text-[10px] tracking-[0.5em] animate-pulse uppercase">FIN_DE_TRANSMISIÓN</div>
        <h1 className="arcade-font text-4xl md:text-6xl text-yellow-400 neon-text-yellow uppercase leading-tight">CRÉDITOS_DEL_SISTEMA</h1>
      </div>

      <div className="max-w-2xl w-full bg-zinc-900/40 border-2 border-blue-900/50 p-10 md:p-16 space-y-12 relative z-10 shadow-[0_0_50px_rgba(30,58,138,0.3)]">
        <div className="space-y-4">
           <h3 className="arcade-font text-pink-500 text-xs text-center mb-8 tracking-widest uppercase">AUTORES_PRINCIPALES</h3>
           <div className="grid grid-cols-1 gap-6">
              {authors.map((name, i) => (
                <div key={i} className="flex items-center justify-center gap-4 group">
                  <div className="w-2 h-2 bg-yellow-400 group-hover:animate-ping"></div>
                  <div className="arcade-font text-lg md:text-2xl text-white group-hover:text-yellow-400 transition-colors cursor-default">
                    {name}
                  </div>
                  <div className="w-2 h-2 bg-yellow-400 group-hover:animate-ping"></div>
                </div>
              ))}
           </div>
        </div>

        <div className="pt-8 border-t border-zinc-800 text-center">
          <p className="arcade-font text-[8px] text-zinc-500 leading-relaxed uppercase">
            DESARROLLADO CON TECNOLOGÍA DE NÚCLEO CUÁNTICO GEMINI AI Y REACT NEÓN.<br/>
            MATH-MAN: NEON MAZE © 2025 ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>

      <button 
        onClick={onRestart}
        className="relative z-10 arcade-font text-sm bg-blue-700 hover:bg-yellow-400 hover:text-black text-white py-6 px-12 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] transform active:scale-95 uppercase"
      >
        VOLVER AL MENÚ PRINCIPAL
      </button>

      <div className="absolute bottom-10 arcade-font text-[6px] text-zinc-800 uppercase tracking-widest">
        ESTADO: TRANSMISIÓN_COMPLETA // LOG_SUCCESS
      </div>
    </div>
  );
};

export default Credits;
