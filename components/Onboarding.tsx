
import React, { useState } from 'react';
import { UserData, Difficulty, Gender, FightingStyle, CyberPower } from '../types';
import { DIFFICULTIES, GENDERS, STYLES } from '../constants';

const POWERS: CyberPower[] = ['Neon Fire', 'Digital Ice', 'Quantum Void', 'Electric Acid'];

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
    power: 'Neon Fire'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      onComplete(formData);
    }
  };

  const translateGender = (g: string) => {
    switch(g) {
      case 'Male': return 'Hombre';
      case 'Female': return 'Mujer';
      case 'Non-binary': return 'No binario';
      default: return 'Clasificado';
    }
  };

  const translateDifficulty = (d: string) => {
    switch(d) {
      case 'Recruit': return 'Recluta';
      case 'Veteran': return 'Veterano';
      case 'Elite': return 'Élite';
      default: return d;
    }
  };

  const translatePower = (p: string) => {
    switch(p) {
      case 'Neon Fire': return 'Fuego Neón';
      case 'Digital Ice': return 'Hielo Digital';
      case 'Quantum Void': return 'Vacío Cuántico';
      case 'Electric Acid': return 'Ácido Eléctrico';
      default: return p;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] flex items-center justify-center p-4 py-12">
      <div className="max-w-4xl w-full space-y-10">
        <div className="text-center space-y-2">
          <div className="arcade-font text-blue-500 text-[8px] tracking-[0.5em] mb-2 animate-pulse">ESTABLECIENDO_UPLINK_SEGURO</div>
          <h1 className="text-5xl md:text-7xl font-black italic text-yellow-400 uppercase tracking-tighter neon-text-yellow leading-none arcade-font">
            MATH<span className="text-white">-</span>MAN
          </h1>
          <div className="text-pink-500 text-[10px] font-bold tracking-[0.3em] arcade-font uppercase">Inicialización de Personaje Avanzada</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-black/80 border-2 border-blue-900/50 backdrop-blur-xl p-6 md:p-10 shadow-[0_0_50px_rgba(30,58,138,0.2)] space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-400"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-400"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="arcade-font text-blue-400 text-[8px] border-b border-blue-900/50 pb-2 uppercase tracking-widest">01_Datos_Biológicos</div>
              
              <div className="space-y-2">
                <label className="arcade-font text-[7px] text-zinc-500 uppercase">Apodo_Digital</label>
                <input
                  required
                  type="text"
                  placeholder="ID_DE_USUARIO"
                  className="w-full bg-zinc-900/50 border-2 border-zinc-800 text-yellow-400 p-4 font-bold uppercase focus:border-yellow-400 focus:outline-none arcade-font text-[10px] transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="arcade-font text-[7px] text-zinc-500 uppercase">Verificación_Edad</label>
                <input
                  required
                  type="number"
                  min="5"
                  max="99"
                  className="w-full bg-zinc-900/50 border-2 border-zinc-800 text-yellow-400 p-4 font-bold focus:border-yellow-400 focus:outline-none arcade-font text-[10px]"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-3">
                <label className="arcade-font text-[7px] text-zinc-500 uppercase">Selección_Género</label>
                <div className="grid grid-cols-2 gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`py-3 border-2 arcade-font text-[6px] transition-all uppercase ${
                        formData.gender === g 
                        ? 'bg-blue-600 border-blue-400 text-white' 
                        : 'bg-transparent border-zinc-900 text-zinc-600 hover:border-zinc-700'
                      }`}
                    >
                      {translateGender(g)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="arcade-font text-pink-400 text-[8px] border-b border-pink-900/50 pb-2 uppercase tracking-widest">02_Parámetros_Combate</div>
              
              <div className="space-y-3">
                <label className="arcade-font text-[7px] text-zinc-500 uppercase">Protocolo_Combate</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, style: s })}
                      className={`py-3 border-2 arcade-font text-[6px] transition-all uppercase ${
                        formData.style === s 
                        ? 'bg-pink-600 border-pink-400 text-white' 
                        : 'bg-transparent border-zinc-900 text-zinc-600 hover:border-zinc-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="arcade-font text-[7px] text-zinc-500 uppercase">Núcleo_Poder_Aura</label>
                <div className="grid grid-cols-2 gap-2">
                  {POWERS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, power: p })}
                      className={`py-3 border-2 arcade-font text-[6px] transition-all uppercase ${
                        formData.power === p 
                        ? 'bg-yellow-400 border-yellow-400 text-black shadow-[0_0_15px_#facc15]' 
                        : 'bg-transparent border-zinc-900 text-zinc-600 hover:border-zinc-700'
                      }`}
                    >
                      {translatePower(p)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-zinc-900">
            <label className="arcade-font text-[7px] text-zinc-500 uppercase block text-center">Matriz_Dificultad</label>
            <div className="grid grid-cols-3 gap-4">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: d })}
                  className={`flex flex-col items-center gap-2 py-4 border-2 arcade-font transition-all ${
                    formData.difficulty === d 
                    ? 'bg-white border-white text-black shadow-[0_0_30px_white]' 
                    : 'bg-transparent border-zinc-900 text-zinc-600 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[9px] uppercase">{translateDifficulty(d)}</span>
                  <span className={`text-[5px] opacity-70 ${formData.difficulty === d ? 'text-black' : 'text-zinc-700'}`}>
                    {d === 'Elite' ? '98% LETAL' : d === 'Veteran' ? 'AVANZADO' : 'ESTÁNDAR'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full overflow-hidden bg-yellow-400 text-black arcade-font text-sm py-8 transition-all hover:bg-white shadow-[0_0_30px_#facc15] active:scale-95"
          >
            <span className="relative z-10 uppercase tracking-widest">Inicializar Enlace Neural</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>

        <div className="flex justify-between items-center arcade-font text-[6px] text-zinc-800 px-4 uppercase">
          <span>LOGIC-CORP ENTERTAINMENT UNIT #0921</span>
          <span className="animate-pulse">SISTEMA_ESTADO: NOMINAL</span>
          <span>© 1980-2025</span>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
