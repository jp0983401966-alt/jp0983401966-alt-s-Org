
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { UserData, GameStats, MathQuestion, PowerUp, PowerUpType } from '../types';

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
  const range = difficulty === 'Recruit' ? 20 : difficulty === 'Veteran' ? 60 : 180;
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
    const offset = Math.floor(Math.random() * 40) - 20;
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
  const [hasWon, setHasWon] = useState(false);
  
  // Estados de Potenciadores
  const [isInvulnerable, setIsInvulnerable] = useState(true); 
  const [speedBoostActive, setSpeedBoostActive] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isMultiplierActive, setIsMultiplierActive] = useState(false);
  
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [timers, setTimers] = useState<{
    shield: number, 
    speed: number, 
    freeze: number, 
    multiplier: number, 
    ghost: number
  }>({ shield: 3000, speed: 0, freeze: 0, multiplier: 0, ghost: 0 });

  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [mathCorrect, setMathCorrect] = useState(0);
  const [missedQs, setMissedQs] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  
  const lastMoveTime = useRef(0);

  const config = useMemo(() => {
    switch(userData.difficulty) {
      case 'Elite': return { ghostCount: 5, speed: 140, chaseProb: 0.98, moveCooldown: 100 }; 
      case 'Veteran': return { ghostCount: 4, speed: 250, chaseProb: 0.85, moveCooldown: 120 };
      default: return { ghostCount: 3, speed: 380, chaseProb: 0.60, moveCooldown: 150 };
    }
  }, [userData.difficulty]);

  const [ghosts, setGhosts] = useState(() => [
    { name: 'Blinky', x: 10, y: 1, color: 'bg-red-600' },
    { name: 'Pinky', x: 1, y: 10, color: 'bg-pink-400' },
    { name: 'Inky', x: 10, y: 10, color: 'bg-cyan-400' },
    { name: 'Clyde', x: 2, y: 2, color: 'bg-orange-500' },
    { name: 'Glitchy', x: 9, y: 9, color: 'bg-green-600' },
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

  // Manejo de todos los contadores de tiempo de efectos
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const next = {
          shield: Math.max(0, prev.shield - 100),
          speed: Math.max(0, prev.speed - 100),
          freeze: Math.max(0, prev.freeze - 100),
          multiplier: Math.max(0, prev.multiplier - 100),
          ghost: Math.max(0, prev.ghost - 100)
        };
        
        if (next.shield === 0 && prev.shield > 0) setIsInvulnerable(false);
        if (next.speed === 0 && prev.speed > 0) setSpeedBoostActive(false);
        if (next.freeze === 0 && prev.freeze > 0) setIsFrozen(false);
        if (next.multiplier === 0 && prev.multiplier > 0) setIsMultiplierActive(false);
        if (next.ghost === 0 && prev.ghost > 0) setIsGhostMode(false);
        
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Generación aleatoria de potenciadores variados
  useEffect(() => {
    if (hasWon) return;
    const interval = setInterval(() => {
      if (powerUps.length < 3 && Math.random() > 0.6) {
        const emptyCells = [];
        for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
            if (MAZE[y][x] === 0 && !(x === pos.x && y === pos.y)) {
              if (!nodes.some(n => n.x === x && n.y === y)) emptyCells.push({x, y});
            }
          }
        }
        if (emptyCells.length > 0) {
          const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          const types: PowerUpType[] = ['shield', 'speed', 'points', 'freeze', 'multiplier', 'ghost'];
          const type = types[Math.floor(Math.random() * types.length)];
          setPowerUps(prev => [...prev, { ...cell, type, id: crypto.randomUUID() }]);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [powerUps, pos, hasWon, nodes]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (showResurrection || hasWon) return;
    
    const now = Date.now();
    const cooldown = speedBoostActive ? config.moveCooldown / 2 : config.moveCooldown;
    if (now - lastMoveTime.current < cooldown) return;
    lastMoveTime.current = now;

    const newX = pos.x + dx;
    const newY = pos.y + dy;
    
    if (dx === 1) setDirection(0);
    if (dx === -1) setDirection(180);
    if (dy === 1) setDirection(90);
    if (dy === -1) setDirection(270);

    if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE && MAZE[newY][newX] === 0) {
      setPos({ x: newX, y: newY });
      
      // Recoger Nodos
      const nodeIdx = nodes.findIndex(n => n.x === newX && n.y === newY);
      if (nodeIdx !== -1) {
        const pointsToAdd = isMultiplierActive ? 700 : 350;
        setPoints(p => p + pointsToAdd); 
        setNodes(n => {
            const next = n.filter((_, i) => i !== nodeIdx);
            if (next.length === 0) {
                setHasWon(true);
                setTimeout(() => {
                    onComplete({ 
                        hits: 20, 
                        misses: 3 - lives, 
                        mathCorrect, 
                        mathIncorrect: 3 - lives, 
                        points: points + (lives * 10000) + pointsToAdd, 
                        missedQuestions: missedQs 
                    });
                }, 5000);
            }
            return next;
        });
      }

      // Recoger Potenciadores
      const pwIdx = powerUps.findIndex(p => p.x === newX && p.y === newY);
      if (pwIdx !== -1) {
        const pw = powerUps[pwIdx];
        switch(pw.type) {
          case 'shield':
            setIsInvulnerable(true);
            setTimers(prev => ({ ...prev, shield: 6000 }));
            break;
          case 'speed':
            setSpeedBoostActive(true);
            setTimers(prev => ({ ...prev, speed: 6000 }));
            break;
          case 'freeze':
            setIsFrozen(true);
            setTimers(prev => ({ ...prev, freeze: 5000 }));
            break;
          case 'multiplier':
            setIsMultiplierActive(true);
            setTimers(prev => ({ ...prev, multiplier: 8000 }));
            break;
          case 'ghost':
            setIsGhostMode(true);
            setTimers(prev => ({ ...prev, ghost: 5000 }));
            break;
          case 'points':
            setPoints(p => p + 5000);
            break;
        }
        setPowerUps(prev => prev.filter((_, i) => i !== pwIdx));
      }
    }
  }, [pos, nodes, powerUps, showResurrection, speedBoostActive, config.moveCooldown, lives, mathCorrect, missedQs, onComplete, points, hasWon, isMultiplierActive]);

  useEffect(() => {
    if (showResurrection || hasWon || isFrozen) return;
    const interval = setInterval(() => {
      setGhosts(prev => prev.map(g => {
        const dirs = [{x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0}];
        let chosenDir;
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
  }, [showResurrection, config.speed, config.chaseProb, pos, hasWon, isFrozen]);

  useEffect(() => {
    if (showResurrection || isInvulnerable || isGhostMode || hasWon) return;
    if (ghosts.some(g => g.x === pos.x && g.y === pos.y)) {
      setCurrentQuestion(generateQuestion(userData.difficulty));
      setTimeLeft(userData.difficulty === 'Elite' ? 4 : userData.difficulty === 'Veteran' ? 7 : 10);
      setShowResurrection(true);
    }
  }, [pos, ghosts, showResurrection, isInvulnerable, isGhostMode, userData.difficulty, hasWon]);

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
      setFeedback("LÓGICA_RESTAURADA");
      setMathCorrect(c => c + 1);
      setPos({ x: 1, y: 1 });
      setIsInvulnerable(true); 
      setTimers(prev => ({ ...prev, shield: 3000 }));
    } else {
      setFeedback("FALLO_DE_SISTEMA");
      setLives(l => l - 1);
      setMissedQs(m => [...m, currentQuestion?.question || ""]);
      setPos({ x: 1, y: 1 });
      setIsInvulnerable(true); 
      setTimers(prev => ({ ...prev, shield: 3000 }));
    }
    setTimeout(() => {
      if (!isCorrect && lives <= 1) {
        onComplete({ 
          hits: Math.floor(points / 350), 
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
    }, 1200);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) movePlayer(0, -1);
      if (['ArrowDown', 's', 'S'].includes(e.key)) movePlayer(0, 1);
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) movePlayer(-1, 0);
      if (['ArrowRight', 'd', 'D'].includes(e.key)) movePlayer(1, 0);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [movePlayer]);

  if (hasWon) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-10 animate-in fade-in zoom-in duration-1000">
        <div className="arcade-font text-6xl md:text-9xl text-yellow-400 neon-text-yellow animate-bounce text-center leading-tight">
          ¡HAS GANADO!
        </div>
        <div className="arcade-font text-blue-500 text-sm md:text-xl tracking-[0.5em] text-center uppercase animate-pulse">
          SISTEMA PURIFICADO AL 100%
        </div>
        <div className="flex flex-col items-center gap-6 mt-12 bg-zinc-900/50 p-10 border-2 border-yellow-400">
            <div className="arcade-font text-white text-2xl uppercase">Puntuación Final</div>
            <div className="arcade-font text-6xl text-yellow-400 neon-text-yellow">{(points + (lives * 10000)).toLocaleString()}</div>
            <div className="arcade-font text-[10px] text-green-400 uppercase">BONO_POR_VIDAS_EXTRAS: +{(lives * 10000).toLocaleString()}</div>
        </div>
        <div className="arcade-font text-[10px] text-zinc-600 animate-pulse mt-12 uppercase tracking-widest">SUBIENDO_PUNTUACIONES_A_LA_IA...</div>
      </div>
    );
  }

  if (showResurrection && currentQuestion) {
    return (
      <div className={`w-full min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in zoom-in duration-500 ${feedback === "FALLO_DE_SISTEMA" ? "animate-shake" : ""}`}>
        {feedback ? (
          <div className="text-center space-y-8">
            <div className={`arcade-font text-5xl md:text-7xl ${feedback === "LÓGICA_RESTAURADA" ? 'text-green-500 neon-text-yellow' : 'text-red-600'}`}>
              {feedback}
            </div>
            <div className="arcade-font text-[8px] text-zinc-500 animate-pulse uppercase tracking-[0.3em]">REINICIANDO_NÚCLEO_CUÁNTICO...</div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-6 max-w-3xl">
              <div className="arcade-font text-red-500 text-[10px] animate-pulse">ALERTA: COLISIÓN DETECTADA</div>
              <h2 className="arcade-font text-blue-400 text-xs tracking-[0.5em] uppercase">Recuperación de Datos</h2>
              <p className="text-zinc-500 text-[9px] arcade-font leading-relaxed uppercase max-w-xl mx-auto italic">
                Sincroniza el procesador aritmético para restaurar la integridad.
              </p>
            </div>
            <div className="space-y-16 w-full flex flex-col items-center">
              <div className="arcade-font text-7xl md:text-9xl text-white neon-text-yellow tracking-tighter">
                {currentQuestion.question}
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className={`text-6xl arcade-font ${timeLeft <= 2 ? 'text-red-600 animate-pulse scale-125' : 'text-white'}`}>
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 w-full max-w-4xl px-4">
                {currentQuestion.options.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleResurrection(opt)} 
                    className="relative bg-zinc-950 border-4 border-blue-900 p-8 arcade-font text-3xl text-white hover:bg-yellow-400 hover:text-black hover:border-white transition-all transform active:scale-90 shadow-[0_0_20px_rgba(30,64,175,0.4)]"
                  >
                    {opt}
                  </button>
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
        <div className="lg:col-span-1 space-y-4">
          <div className="neon-border bg-black/95 p-6 space-y-8 border-t-4 border-t-yellow-400">
            <div className="space-y-4">
              <div className="arcade-font text-[8px] text-pink-500 tracking-widest uppercase">VIDAS</div>
              <div className="flex gap-4">
                {[...Array(lives)].map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-yellow-400 rounded-full animate-chomp shadow-[0_0_15px_#facc15]"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6 pt-2 border-t border-zinc-800">
               <div className="flex flex-col gap-2">
                 <span className="arcade-font text-[7px] text-zinc-600 uppercase">PUNTAJE</span>
                 <span className="arcade-font text-2xl text-white neon-text-yellow">{points.toLocaleString()}</span>
               </div>
            </div>
            
            {/* Monitor de Potenciadores Dinámico */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
               <div className="arcade-font text-[8px] text-blue-500 uppercase tracking-widest">ESTADO_SISTEMA</div>
               
               {timers.shield > 0 && (
                 <div className="space-y-1">
                   <div className="flex justify-between arcade-font text-[6px] text-cyan-400 uppercase">
                     <span>ESCUDO</span>
                     <span>{Math.ceil(timers.shield / 1000)}S</span>
                   </div>
                   <div className="h-1.5 w-full bg-zinc-900">
                     <div className="h-full bg-cyan-400 transition-all duration-100" style={{ width: `${(timers.shield / 6000) * 100}%` }}></div>
                   </div>
                 </div>
               )}

               {timers.speed > 0 && (
                 <div className="space-y-1">
                   <div className="flex justify-between arcade-font text-[6px] text-white uppercase">
                     <span>TURBO</span>
                     <span>{Math.ceil(timers.speed / 1000)}S</span>
                   </div>
                   <div className="h-1.5 w-full bg-zinc-900">
                     <div className="h-full bg-white transition-all duration-100" style={{ width: `${(timers.speed / 6000) * 100}%` }}></div>
                   </div>
                 </div>
               )}

               {timers.freeze > 0 && (
                 <div className="space-y-1">
                   <div className="flex justify-between arcade-font text-[6px] text-blue-300 uppercase">
                     <span>CRIOGENIA</span>
                     <span>{Math.ceil(timers.freeze / 1000)}S</span>
                   </div>
                   <div className="h-1.5 w-full bg-zinc-900">
                     <div className="h-full bg-blue-300 transition-all duration-100" style={{ width: `${(timers.freeze / 5000) * 100}%` }}></div>
                   </div>
                 </div>
               )}

               {timers.multiplier > 0 && (
                 <div className="space-y-1">
                   <div className="flex justify-between arcade-font text-[6px] text-yellow-400 uppercase">
                     <span>PUNTAJE_X2</span>
                     <span>{Math.ceil(timers.multiplier / 1000)}S</span>
                   </div>
                   <div className="h-1.5 w-full bg-zinc-900">
                     <div className="h-full bg-yellow-400 transition-all duration-100" style={{ width: `${(timers.multiplier / 8000) * 100}%` }}></div>
                   </div>
                 </div>
               )}

               {timers.ghost > 0 && (
                 <div className="space-y-1">
                   <div className="flex justify-between arcade-font text-[6px] text-purple-400 uppercase">
                     <span>INTANGIBLE</span>
                     <span>{Math.ceil(timers.ghost / 1000)}S</span>
                   </div>
                   <div className="h-1.5 w-full bg-zinc-900">
                     <div className="h-full bg-purple-400 transition-all duration-100" style={{ width: `${(timers.ghost / 5000) * 100}%` }}></div>
                   </div>
                 </div>
               )}
            </div>
          </div>
          
          <div className="hidden lg:block bg-black border border-zinc-900 p-4">
             <div className="arcade-font text-[6px] text-zinc-700 space-y-2 uppercase">
               > IA_STATE: {isFrozen ? 'HALTED' : 'ACTIVE'}<br/>
               > MULTIPLIER: {isMultiplierActive ? 'X2_ENABLED' : 'NORMAL'}<br/>
               > SYNC: 100%_STABLE<br/>
               > MODE: {isGhostMode ? 'GHOST_OVERRIDE' : 'PHYSICAL'}
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 relative">
          <div className="aspect-square bg-black border-[10px] border-blue-900 rounded-sm grid grid-cols-12 grid-rows-12 relative shadow-[0_0_100px_rgba(30,58,138,0.2)] overflow-hidden">
            {MAZE.map((row, y) => row.map((cell, x) => (
              <div key={`${x}-${y}`} className={`relative ${cell === 1 ? 'bg-blue-950/20 border-[0.5px] border-blue-900/10' : ''}`}>
                {nodes.some(n => n.x === x && n.y === y) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_15px_white] node-pulse"></div>
                  </div>
                )}
              </div>
            )))}

            {/* Renderizado de Potenciadores con Iconos y Colores distintivos */}
            {powerUps.map((p) => (
              <div key={p.id} className="absolute w-[8.33%] h-[8.33%] flex items-center justify-center z-10" style={{ left: `${p.x * 8.33}%`, top: `${p.y * 8.33}%` }}>
                <div className={`w-5 h-5 rounded-md animate-pulse border-2 flex items-center justify-center shadow-lg transition-transform hover:scale-125 ${
                  p.type === 'shield' ? 'border-cyan-400 bg-cyan-900/30 shadow-cyan-500/50' : 
                  p.type === 'speed' ? 'border-white bg-zinc-800 shadow-white/50' : 
                  p.type === 'freeze' ? 'border-blue-300 bg-blue-900/30 shadow-blue-400/50' :
                  p.type === 'multiplier' ? 'border-yellow-400 bg-yellow-900/30 shadow-yellow-500/50' :
                  p.type === 'ghost' ? 'border-purple-400 bg-purple-900/30 shadow-purple-500/50' :
                  'border-green-400 bg-green-900/30 shadow-green-500/50'
                }`}>
                  <span className="arcade-font text-[7px] text-white font-bold">
                    {p.type === 'shield' ? '🛡️' : p.type === 'speed' ? '⚡' : p.type === 'freeze' ? '❄️' : p.type === 'multiplier' ? '2X' : p.type === 'ghost' ? '👻' : '$'}
                  </span>
                </div>
              </div>
            ))}

            {ghosts.map((g, i) => (
              <div key={i} className={`absolute w-[8.33%] h-[8.33%] transition-all duration-[${config.speed}ms] flex items-center justify-center z-10`} style={{ left: `${g.x * 8.33}%`, top: `${g.y * 8.33}%` }}>
                <div className={`w-[70%] h-[75%] ${isFrozen ? 'bg-blue-400 opacity-60' : g.color} ghost-skirt relative shadow-lg ${isInvulnerable || isGhostMode ? 'opacity-30' : 'opacity-100'}`}>
                   <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
                   <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                   {isFrozen && <div className="absolute inset-0 flex items-center justify-center text-[10px]">❄️</div>}
                </div>
              </div>
            ))}

            <div 
              className={`absolute w-[8.33%] h-[8.33%] transition-all duration-[100ms] z-20 direction-${direction} ${isInvulnerable || speedBoostActive || isGhostMode ? 'animate-pulse' : ''}`} 
              style={{ left: `${pos.x * 8.33}%`, top: `${pos.y * 8.33}%` }}
            >
               <div className={`w-[85%] h-[85%] rounded-full animate-chomp mx-auto ${
                 isGhostMode ? 'bg-purple-400/50 border-2 border-white' :
                 isInvulnerable ? 'bg-cyan-400 shadow-[0_0_25px_#22d3ee] border-2 border-white' : 
                 speedBoostActive ? 'bg-white shadow-[0_0_25px_white] border-2 border-blue-400' : 
                 'bg-yellow-400 shadow-[0_0_20px_#facc15]'
               }`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Combat;
