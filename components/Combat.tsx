
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserData, GameStats, MathQuestion } from '../types';

interface CombatProps {
  userData: UserData;
  onComplete: (stats: GameStats) => void;
}

const GRID_SIZE = 12;
const MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const generateQuestion = (difficulty: UserData['difficulty']): MathQuestion => {
  const range = difficulty === 'Recruit' ? 15 : difficulty === 'Veteran' ? 50 : 120;
  const a = Math.floor(Math.random() * range) + 2;
  const b = Math.floor(Math.random() * range) + 2;
  const ops = difficulty === 'Recruit' ? ['+', '-'] : difficulty === 'Veteran' ? ['+', '-', '*'] : ['+', '-', '*', '/'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  
  let answer: number;
  let qText: string;
  
  if (op === '/') {
    answer = a;
    qText = `${a * b} / ${b}`;
  } else if (op === '*') {
    answer = a * b;
    qText = `${a} * ${b}`;
  } else if (op === '-') {
    answer = a - b;
    qText = `${a} - ${b}`;
  } else {
    answer = a + b;
    qText = `${a} + ${b}`;
  }

  const options = new Set([answer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 20) - 10;
    if (offset !== 0) options.add(answer + offset);
  }
  return { question: qText, answer, options: Array.from(options).sort(() => Math.random() - 0.5) };
};

const Combat: React.FC<CombatProps> = ({ userData, onComplete }) => {
  const [pos, setPos] = useState({ x: 1, y: 1 });
  const [direction, setDirection] = useState(0); 
  const [lives, setLives] = useState(3);
  const [points, setPoints] = useState(0);
  const [showResurrection, setShowResurrection] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [mathCorrect, setMathCorrect] = useState(0);
  const [missedQs, setMissedQs] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);

  const config = useMemo(() => {
    switch(userData.difficulty) {
      case 'Elite': return { ghostCount: 5, speed: 220, chaseProb: 0.85 };
      case 'Veteran': return { ghostCount: 4, speed: 350, chaseProb: 0.55 };
      default: return { ghostCount: 3, speed: 500, chaseProb: 0.25 };
    }
  }, [userData.difficulty]);

  const [ghosts, setGhosts] = useState(() => [
    { name: 'Blinky', x: 10, y: 1, color: 'bg-red-600' },
    { name: 'Pinky', x: 1, y: 10, color: 'bg-pink-400' },
    { name: 'Inky', x: 10, y: 10, color: 'bg-cyan-400' },
    { name: 'Clyde', x: 5, y: 5, color: 'bg-orange-500' },
    { name: 'Glitchy', x: 8, y: 5, color: 'bg-green-500' },
  ].slice(0, config.ghostCount));

  const [nodes, setNodes] = useState<{x: number, y: number}[]>(() => {
    const n = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (MAZE[y][x] === 0 && Math.random() > 0.65) n.push({x, y});
      }
    }
    return n;
  });

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (showResurrection) return;
    const newX = pos.x + dx;
    const newY = pos.y + dy;
    
    if (dx === 1) setDirection(0);
    if (dx === -1) setDirection(180);
    if (dy === 1) setDirection(90);
    if (dy === -1) setDirection(270);

    if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE && MAZE[newY][newX] === 0) {
      setPos({ x: newX, y: newY });
      const nodeIdx = nodes.findIndex(n => n.x === newX && n.y === newY);
      if (nodeIdx !== -1) {
        setPoints(p => p + 150);
        setNodes(n => n.filter((_, i) => i !== nodeIdx));
      }
    }
  }, [pos, nodes, showResurrection]);

  useEffect(() => {
    if (showResurrection) return;
    const interval = setInterval(() => {
      setGhosts(prev => prev.map(g => {
        const dirs = [{x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0}];
        let chosenDir;
        
        // Prioritize chasing Pac-Man (Aggressive AI)
        if (Math.random() < config.chaseProb) {
          const validDirs = dirs.filter(d => {
            const nx = g.x + d.x; const ny = g.y + d.y;
            return nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && MAZE[ny][nx] === 0;
          });
          
          if (validDirs.length > 0) {
            chosenDir = validDirs.sort((a, b) => {
              const distA = Math.abs(pos.x - (g.x + a.x)) + Math.abs(pos.y - (g.y + a.y));
              const distB = Math.abs(pos.x - (g.x + b.x)) + Math.abs(pos.y - (g.y + b.y));
              return distA - distB;
            })[0];
          }
        } else {
          const valid = dirs.filter(d => {
            const nx = g.x + d.x; const ny = g.y + d.y;
            return nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && MAZE[ny][nx] === 0;
          });
          chosenDir = valid[Math.floor(Math.random() * valid.length)];
        }
        return chosenDir ? { ...g, x: g.x + chosenDir.x, y: g.y + chosenDir.y } : g;
      }));
    }, config.speed);
    return () => clearInterval(interval);
  }, [showResurrection, config.speed, config.chaseProb, pos]);

  useEffect(() => {
    if (showResurrection) return;
    if (ghosts.some(g => g.x === pos.x && g.y === pos.y)) {
      setCurrentQuestion(generateQuestion(userData.difficulty));
      setTimeLeft(userData.difficulty === 'Elite' ? 7 : 10);
      setShowResurrection(true);
    }
  }, [pos, ghosts, showResurrection, userData.difficulty]);

  useEffect(() => {
    if (showResurrection && timeLeft > 0 && !feedback) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (showResurrection && timeLeft === 0 && !feedback) {
      handleResurrection(-99999);
    }
  }, [showResurrection, timeLeft, feedback]);

  const handleResurrection = (val: number) => {
    const isCorrect = val === currentQuestion?.answer;
    if (isCorrect) {
      setFeedback("LOGIC_RESTORED");
      setMathCorrect(c => c + 1);
      setPos({ x: 1, y: 1 });
    } else {
      setFeedback("SYSTEM_FAILURE");
      setLives(l => l - 1);
      setMissedQs(m => [...m, currentQuestion?.question || ""]);
      setPos({ x: 1, y: 1 });
    }
    
    setTimeout(() => {
      if (!isCorrect && lives <= 1) {
        onComplete({ 
          hits: Math.floor(points / 150), 
          misses: 3 - (lives - 1), 
          mathCorrect, 
          mathIncorrect: 3 - (lives - 1), 
          points, 
          missedQuestions: [...missedQs, currentQuestion?.question || ""] 
        });
      } else {
        setShowResurrection(false);
        setFeedback(null);
      }
    }, 1500);
  };

  useEffect(() => {
    if (nodes.length === 0 && points > 0 && !showResurrection) {
      onComplete({ 
        hits: 12, 
        misses: 3 - lives, 
        mathCorrect, 
        mathIncorrect: 0, 
        points: points + (lives * 2000), 
        missedQuestions: missedQs 
      });
    }
  }, [nodes, lives, points, mathCorrect, onComplete, missedQs, showResurrection]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') movePlayer(0, -1);
      if (e.key === 'ArrowDown') movePlayer(0, 1);
      if (e.key === 'ArrowLeft') movePlayer(-1, 0);
      if (e.key === 'ArrowRight') movePlayer(1, 0);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [movePlayer]);

  if (showResurrection && currentQuestion) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in zoom-in duration-500">
        {feedback ? (
          <div className="text-center space-y-8">
            <div className={`arcade-font text-5xl md:text-7xl ${feedback === "LOGIC_RESTORED" ? 'text-green-500 neon-text-yellow' : 'text-red-600'}`}>
              {feedback}
            </div>
            <div className="arcade-font text-xs text-zinc-500 animate-pulse uppercase">REBOOTING_QUANTUM_DRIVE...</div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-6 max-w-3xl">
              <div className="flex justify-center gap-4 mb-4">
                <div className="arcade-font text-red-500 text-sm animate-pulse">ALERTA: COLISIÓN EN SECTOR {pos.x},{pos.y}</div>
              </div>
              <h2 className="arcade-font text-blue-400 text-xs tracking-[0.5em] uppercase">Protocolo de Resurrección Crítica</h2>
              <p className="text-zinc-500 text-[10px] arcade-font leading-loose uppercase max-w-xl mx-auto">
                LA INTEGRIDAD DEL NÚCLEO ESTÁ COMPROMETIDA. ELIGE LA RESPUESTA CORRECTA PARA EVITAR LA DESFRAGMENTACIÓN TOTAL.
              </p>
            </div>

            <div className="space-y-16 w-full flex flex-col items-center">
              <div className="relative">
                <div className="absolute -inset-12 bg-pink-500/10 blur-3xl rounded-full"></div>
                <div className="arcade-font text-7xl md:text-9xl text-white neon-text-yellow relative tracking-tighter">
                  {currentQuestion.question}
                </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="arcade-font text-xs text-pink-500 tracking-widest uppercase">VENTAJA_TIEMPO:</div>
                <div className={`text-5xl arcade-font ${timeLeft < 4 ? 'text-red-600 animate-pulse' : 'text-white'}`}>
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full max-w-5xl px-4">
                {currentQuestion.options.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleResurrection(opt)} 
                    className="group relative bg-zinc-950 border-4 border-blue-800 p-10 arcade-font text-2xl text-white hover:bg-yellow-400 hover:text-black hover:border-white transition-all transform active:scale-95 shadow-[0_0_15px_rgba(30,64,175,0.5)]"
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500"></div>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8">
               <div className="flex gap-4">
                 {[...Array(lives)].map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-yellow-400 rounded-full animate-chomp shadow-[0_0_15px_#facc15]"></div>
                 ))}
               </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <div className="neon-border bg-black/95 p-6 space-y-8 backdrop-blur-xl border-t-4 border-t-yellow-400">
            <div className="space-y-4">
              <div className="arcade-font text-[8px] text-pink-500 tracking-widest uppercase">NÚCLEOS_RESTANTES</div>
              <div className="flex gap-4">
                {[...Array(lives)].map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-yellow-400 rounded-full animate-chomp shadow-[0_0_15px_#facc15]"></div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6 pt-4 border-t border-zinc-800">
               <div className="flex flex-col gap-2">
                 <span className="arcade-font text-[7px] text-zinc-600 uppercase">DIFICULTAD_ACTIVA</span>
                 <span className={`arcade-font text-xs ${userData.difficulty === 'Elite' ? 'text-red-500' : 'text-blue-400'}`}>{userData.difficulty}</span>
               </div>
               <div className="flex flex-col gap-2">
                 <span className="arcade-font text-[7px] text-zinc-600 uppercase">SCORE_TOTAL</span>
                 <span className="arcade-font text-3xl text-white neon-text-yellow">{points.toLocaleString()}</span>
               </div>
               <div className="flex flex-col gap-2">
                 <span className="arcade-font text-[7px] text-zinc-600 uppercase">NODOS_DATA</span>
                 <div className="flex items-center gap-3">
                    <div className="h-3 flex-1 bg-zinc-900 rounded-none border border-zinc-800 overflow-hidden">
                       <div 
                        className="h-full bg-blue-500 transition-all duration-700" 
                        style={{ width: `${(nodes.length / 25) * 100}%` }}
                       ></div>
                    </div>
                    <span className="arcade-font text-[10px] text-white">{nodes.length}</span>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="hidden lg:block bg-black border border-zinc-900 p-5">
             <div className="arcade-font text-[6px] text-zinc-700 space-y-3 uppercase leading-relaxed">
               > SYSTEM_SYNC: ONLINE<br/>
               > ENEMY_AI: {userData.difficulty === 'Elite' ? 'LETHAL' : userData.difficulty === 'Veteran' ? 'AGGRESSIVE' : 'SEARCHING'}<br/>
               > TARGET_LOCK: {config.chaseProb * 100}%<br/>
               > ENGINE_LOAD: {config.speed}ms/tick
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 relative">
          <div className="aspect-square bg-black border-[10px] border-blue-800 rounded-sm grid grid-cols-12 grid-rows-12 relative shadow-[0_0_100px_rgba(37,99,235,0.15)] overflow-hidden">
            {MAZE.map((row, y) => row.map((cell, x) => (
              <div key={`${x}-${y}`} className={`relative ${cell === 1 ? 'bg-blue-950/40 border-[0.5px] border-blue-500/5' : ''}`}>
                {nodes.some(n => n.x === x && n.y === y) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white] node-pulse"></div>
                  </div>
                )}
              </div>
            )))}

            {ghosts.map((g, i) => (
              <div key={i} className="absolute w-[8.33%] h-[8.33%] transition-all duration-[220ms] flex items-center justify-center z-10" style={{ left: `${g.x * 8.33}%`, top: `${g.y * 8.33}%` }}>
                <div className={`w-4/5 h-5/6 ${g.color} ghost-skirt relative shadow-2xl`}>
                   {/* Ghost Eyes */}
                   <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-black rounded-full translate-x-[1px]"></div>
                   </div>
                   <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-black rounded-full translate-x-[1px]"></div>
                   </div>
                   {/* Name Label (Optional, for flavor) */}
                   <div className="absolute -top-4 left-0 w-full text-center arcade-font text-[4px] text-white opacity-0 group-hover:opacity-100 transition-opacity uppercase">{g.name}</div>
                </div>
              </div>
            ))}

            <div 
              className={`absolute w-[8.33%] h-[8.33%] transition-all duration-[120ms] z-20 direction-${direction}`} 
              style={{ left: `${pos.x * 8.33}%`, top: `${pos.y * 8.33}%` }}
            >
               <div className="w-[90%] h-[90%] bg-yellow-400 rounded-full animate-chomp shadow-[0_0_30px_#facc15] relative mx-auto">
                  <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-black rounded-full"></div>
               </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-4 w-48 mx-auto lg:hidden">
            <div />
            <button onClick={() => movePlayer(0, -1)} className="aspect-square bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-white text-2xl hover:bg-yellow-400 hover:text-black">↑</button>
            <div />
            <button onClick={() => movePlayer(-1, 0)} className="aspect-square bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-white text-2xl hover:bg-yellow-400 hover:text-black">←</button>
            <button onClick={() => movePlayer(0, 1)} className="aspect-square bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-white text-2xl hover:bg-yellow-400 hover:text-black">↓</button>
            <button onClick={() => movePlayer(1, 0)} className="aspect-square bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-white text-2xl hover:bg-yellow-400 hover:text-black">→</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Combat;
