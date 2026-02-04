
import { createClient } from '@supabase/supabase-js';
import { UserData, GameStats } from '../types';

const SUPABASE_URL = 'https://lbdudwiauodhxucneims.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tGDv96NbR59oJoJBhdVXwQ_jVcsXAUV';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const saveGameResult = async (userData: UserData, stats: GameStats) => {
  try {
    const accuracy = Math.round((stats.mathCorrect / (stats.mathCorrect + stats.mathIncorrect || 1)) * 100);
    
    const { data, error } = await supabase
      .from('game_records')
      .insert([
        {
          player_name: userData.name,
          score: stats.points,
          difficulty: userData.difficulty,
          accuracy: accuracy,
          math_correct: stats.mathCorrect,
          nodes_collected: stats.hits,
          meta_data: {
            age: userData.age,
            gender: userData.gender,
            missed_questions: stats.missedQuestions,
            timestamp: new Date().toISOString()
          }
        },
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    // Silent fail if table doesn't exist yet, but log for dev
    return null;
  }
};
