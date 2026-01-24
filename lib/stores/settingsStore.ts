import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface SettingsState {
  macroTargets: MacroTargets;
  updateMacroTargets: (targets: Partial<MacroTargets>) => void;
  resetMacroTargets: () => void;
}

// Default targets from workout-routine.md
const defaultTargets: MacroTargets = {
  calories: 2450,
  protein: 152,
  carbs: 290,
  fats: 65,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      macroTargets: defaultTargets,

      updateMacroTargets: (targets) =>
        set((state) => ({
          macroTargets: { ...state.macroTargets, ...targets },
        })),

      resetMacroTargets: () =>
        set({
          macroTargets: defaultTargets,
        }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
