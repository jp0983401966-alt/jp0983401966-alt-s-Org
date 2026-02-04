
import React, { useState, useEffect } from 'react';
import { UserData, GameStats, GameRecord } from '../types';
import { generateAnalysis, AIAnalysis } from '../services/geminiService';
import { saveGameResult } from '../services/supabaseService';
import { DB_KEY } from '../constants';

interface ReportProps {
  userData: UserData;
  stats: GameStats;
  onReset: () => void;
}

const Report: React.FC<ReportProps> = ({ userData, stats, onReset }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(true);
  const [history, setHistory] = useState<GameRecord[]>([]);

  useEffect(() => {
    const rawDb = localStorage.getItem(DB_KEY);
    const parsedHistory: GameRecord[] = rawDb ? JSON.parse(rawDb) : [];
    setHistory(parsedHistory);

    const startSync = async () => {
      try {
        await saveGameResult(userData, stats);
      } finally {
        setSyncing(false);
      }
    };

    const startAnalysis = async () => {
      try {
        const result = await generateAnalysis(userData, stats);
        setAnalysis(result);
        
        const newRecord: GameRecord = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          userData,
          stats
        };
        const updatedHistory = [newRecord, ...parsedHistory].slice(0, 5);
        localStorage.setItem(DB_KEY, JSON.stringify(updatedHistory));
        setHistory(updatedHistory);
      } catch (error) {
        setAnalysis({
          fortalezas: "Resistencia física ante ataques persistentes.",
          debilidades: "Latencias en el procesador aritmético.",
          planEstudio: "Reforzar algoritmos de respuesta rápida.",
          consejos: "Mantén el ritmo constante."
        });
      } finally {
        setLoading(false);
      }
    };

    startSync();
    startAnalysis();
  }, [userData, stats]);

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center py-12 px-4 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl w-full space-y-12">
        
        <div className="text-center space-y-4">
          <div className="arcade-font text-pink-500 text-4xl md:text-5xl neon-text animate-pulse uppercase">FIN DEL JUEGO</div>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-yellow-500 animate-ping' : 'bg-green-500'}`}></div>
            <div className="arcade-font text-blue-500 text-[8px] tracking-widest uppercase">
              {syncing ? 'SUBIENDO_A_LA_NUBE...' : 'SINCRONIZACIÓN_EXITOSA'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="neon-border bg-black p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 arcade-font text-[6px] text-zinc-800 uppercase">PROYECTO: MATH-MAN</div>
            <div className="arcade-font text-yellow-400 text-xs mb-4 uppercase">RENDIMIENTO_USUARIO</div>
            <StatRow label="PUNTAJE_FINAL" value={stats.points.toLocaleString()} color="text-white" />
            <StatRow label="PRECISIÓN" value={`${Math.round((stats.mathCorrect / (stats.mathCorrect + stats.mathIncorrect || 1)) * 100)}%`} color="text-green-400" />
            <StatRow label="NODOS_COLECTADOS" value={stats.hits.toString()} color="text-pink-400" />
            <StatRow label="FALLOS_DE_RED" value={stats.misses.toString()} color="text-red-400" />
            
            <div className="pt-6 border-t border-zinc-800">
               <div className="arcade-font text-[7px] text-zinc-500 mb-2 uppercase">ID_DE_AVATAR</div>
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-yellow-400 p-1 bg-zinc-900">
                    <img src={userData.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userData.name}`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="arcade-font text-[10px] text-white uppercase tracking-tight">{userData.name}</div>
                    <div className="arcade-font text-[7px] text-zinc-500 mt-1 uppercase">NIVEL: {userData.difficulty}</div>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-zinc-900/10 border-2 border-zinc-900 p-8 space-y-8 backdrop-blur-sm">
            <div className="arcade-font text-blue-500 text-xs uppercase tracking-widest">ESCÁNEO_LÓGICO_IA</div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent animate-spin"></div>
                <div className="arcade-font text-[6px] text-zinc-700 animate-pulse uppercase">PROCESANDO_REGISTROS_NEURALES...</div>
              </div>
            ) : analysis && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <AnalysisBit title="ONDA_DE_REFLEJOS" content={analysis.fortalezas} color="text-green-500" />
                <AnalysisBit title="ERRORES_LÓGICOS" content={analysis.debilidades} color="text-red-500" />
                <AnalysisBit title="PARCHE_DE_MEJORA" content={analysis.planEstudio} color="text-blue-400" />
                <AnalysisBit title="CÓDIGOS_DE_TRUCO" content={analysis.consejos} color="text-yellow-400" />
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={onReset}
          className="w-full arcade-font text-sm bg-blue-700 hover:bg-yellow-400 hover:text-black text-white p-7 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] transform active:scale-95 uppercase"
        >
          INSERTAR MONEDA PARA REJUGAR
        </button>

        <div className="pt-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-900"></div>
            <div className="arcade-font text-[8px] text-zinc-600 uppercase tracking-widest">HISTORIAL_LOCAL</div>
            <div className="h-px flex-1 bg-zinc-900"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {history.map((record) => (
              <div key={record.id} className="border border-zinc-900 bg-black p-3 flex flex-col gap-2 hover:border-zinc-700 transition-colors">
                <div className="arcade-font text-[7px] text-white truncate">{record.userData.name}</div>
                <div className="arcade-font text-[9px] text-yellow-400">{record.stats.points.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
    <span className="arcade-font text-[7px] text-zinc-600 uppercase">{label}</span>
    <span className={`arcade-font text-[10px] ${color}`}>{value}</span>
  </div>
);

const AnalysisBit = ({ title, content, color }: { title: string, content: string, color: string }) => (
  <div className="space-y-2">
    <div className={`arcade-font text-[7px] ${color} uppercase tracking-tighter`}>{title}</div>
    <p className="text-zinc-400 text-[10px] leading-relaxed font-medium uppercase">{content}</p>
  </div>
);

export default Report;
