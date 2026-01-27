
import React, { useState, useEffect } from 'react';
import { UserData, GameStats, GameRecord } from '../types';
import { generateAnalysis, AIAnalysis } from '../services/geminiService';
import { DB_KEY } from '../constants';

interface ReportProps {
  userData: UserData;
  stats: GameStats;
  onReset: () => void;
}

const Report: React.FC<ReportProps> = ({ userData, stats, onReset }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<GameRecord[]>([]);

  useEffect(() => {
    const rawDb = localStorage.getItem(DB_KEY);
    const parsedHistory: GameRecord[] = rawDb ? JSON.parse(rawDb) : [];
    setHistory(parsedHistory);

    const getAIAnalysis = async () => {
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
        console.error("Diagnostic failed:", error);
        setAnalysis({
          fortalezas: "Procesamiento de datos estable bajo condiciones de baja latencia.",
          debilidades: "Se detectaron picos de desincronización en cálculos aritméticos complejos.",
          planEstudio: "Actualización de firmware mental necesaria: Módulo de multiplicación rápida.",
          consejos: "Activa el modo de concentración profunda antes de cada nodo de datos."
        });
      } finally {
        setLoading(false);
      }
    };

    getAIAnalysis();
  }, [userData, stats]);

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center py-12 px-4 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl w-full space-y-12">
        
        {/* Arcade Header */}
        <div className="text-center space-y-4">
          <div className="arcade-font text-pink-500 text-4xl neon-text animate-pulse">GAME OVER</div>
          <div className="arcade-font text-blue-500 text-[8px] tracking-widest">SYSTEM_DIAGNOSTIC_COMPLETED</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Stats Card */}
          <div className="neon-border bg-black p-8 space-y-6">
            <div className="arcade-font text-yellow-400 text-xs mb-4">USER_PERFORMANCE</div>
            <StatRow label="FINAL_SCORE" value={stats.points.toString()} color="text-white" />
            <StatRow label="ACCURACY" value={`${Math.round((stats.mathCorrect / (stats.mathCorrect + stats.mathIncorrect || 1)) * 100)}%`} color="text-green-400" />
            <StatRow label="NODES_FOUND" value={stats.hits.toString()} color="text-pink-400" />
            <StatRow label="GLITCHES" value={stats.misses.toString()} color="text-red-400" />
            
            <div className="pt-6 border-t border-zinc-800">
               <div className="arcade-font text-[7px] text-zinc-500 mb-2">USER_AVATAR</div>
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-yellow-400 p-1">
                    <img src={userData.avatar || `https://picsum.photos/seed/${userData.name}/200/200`} className="w-full h-full object-cover grayscale" />
                  </div>
                  <div>
                    <div className="arcade-font text-[10px] text-white uppercase">{userData.name}</div>
                    <div className="arcade-font text-[7px] text-zinc-500 mt-1">RANK: {userData.difficulty}</div>
                  </div>
               </div>
            </div>
          </div>

          {/* AI Analysis Card */}
          <div className="bg-zinc-900/20 border-2 border-zinc-800 p-8 space-y-8">
            <div className="arcade-font text-blue-500 text-xs">AI_SYSTEM_ANALYSIS</div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent animate-spin"></div>
                <div className="arcade-font text-[6px] text-zinc-600 animate-pulse">DECRYPTING_BIO_DATA...</div>
              </div>
            ) : analysis && (
              <div className="space-y-6">
                <AnalysisBit title="REFLEX_WAVE" content={analysis.fortalezas} color="text-green-500" />
                <AnalysisBit title="LOGIC_GLITCHES" content={analysis.debilidades} color="text-red-500" />
                <AnalysisBit title="UPGRADE_PATCH" content={analysis.planEstudio} color="text-blue-400" />
                <AnalysisBit title="CHEAT_CODES" content={analysis.consejos} color="text-yellow-400" />
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={onReset}
          className="w-full arcade-font text-sm bg-blue-600 hover:bg-yellow-400 hover:text-black text-white p-6 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
        >
          INSERT NEW COIN (RESTART)
        </button>

        {/* High Score History */}
        <div className="pt-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800"></div>
            <div className="arcade-font text-[8px] text-zinc-600">PREVIOUS_RECORDS</div>
            <div className="h-px flex-1 bg-zinc-800"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((record) => (
              <div key={record.id} className="border border-zinc-900 bg-black p-4 flex justify-between items-center">
                <div className="arcade-font text-[7px] text-white truncate max-w-[100px]">{record.userData.name}</div>
                <div className="arcade-font text-[7px] text-yellow-400">{record.stats.points}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
    <span className="arcade-font text-[7px] text-zinc-500">{label}</span>
    <span className={`arcade-font text-[9px] ${color}`}>{value}</span>
  </div>
);

const AnalysisBit = ({ title, content, color }: { title: string, content: string, color: string }) => (
  <div className="space-y-2">
    <div className={`arcade-font text-[7px] ${color}`}>{title}</div>
    <p className="text-zinc-400 text-[10px] leading-relaxed font-medium">{content}</p>
  </div>
);

export default Report;
