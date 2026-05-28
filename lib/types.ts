export interface DrinkEntry {
  id: string;
  date: string; // YYYY-MM-DD
  presetId: string | null;
  name: string;
  ounces: number;
  abv: number;
  quantity: number;
  notes: string;
  standardDrinks: number;
  mood?: string;
  createdAt: string;
}

export interface DrinkPreset {
  id: string;
  name: string;
  ounces: number;
  abv: number;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface WeeklyGoal {
  maxStandardDrinks: number;
  maxDrinkingDays: number;
}

export interface WeekNote {
  weekKey: string; // e.g. "2024-W20"
  text: string;
  reflection: string;
}

export interface AppData {
  entries: DrinkEntry[];
  presets: DrinkPreset[];
  goals: WeeklyGoal;
  weekNotes: Record<string, WeekNote>;
}

export type MoodTag = 'happy' | 'social' | 'stressed' | 'bored' | 'celebratory' | 'anxious' | 'relaxed';

export const MOOD_TAGS: { value: MoodTag; label: string; emoji: string }[] = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'social', label: 'Social', emoji: '🥂' },
  { value: 'stressed', label: 'Stressed', emoji: '😤' },
  { value: 'bored', label: 'Bored', emoji: '😐' },
  { value: 'celebratory', label: 'Celebrating', emoji: '🎉' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'relaxed', label: 'Relaxed', emoji: '😌' },
];
