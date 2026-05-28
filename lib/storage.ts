import { AppData, DrinkEntry, DrinkPreset, WeeklyGoal, WeekNote } from './types';

const STORAGE_KEY = 'sip-tracker-data';

export const DEFAULT_PRESETS: DrinkPreset[] = [
  { id: 'beer', name: 'Beer / Can', ounces: 12, abv: 5, color: 'amber', icon: '🍺', isDefault: true },
  { id: 'tallboy', name: 'Tall Boy', ounces: 16, abv: 5, color: 'yellow', icon: '🍻', isDefault: true },
  { id: 'shot', name: 'Shot', ounces: 1.5, abv: 40, color: 'orange', icon: '🥃', isDefault: true },
  { id: 'mixed', name: 'Mixed Drink', ounces: 2, abv: 35, color: 'pink', icon: '🍹', isDefault: true },
  { id: 'vodka', name: 'Vodka', ounces: 1.5, abv: 40, color: 'blue', icon: '🫧', isDefault: true },
  { id: 'whiskey', name: 'Whiskey', ounces: 1.5, abv: 40, color: 'orange', icon: '🥃', isDefault: true },
  { id: 'wine', name: 'Wine', ounces: 5, abv: 12, color: 'purple', icon: '🍷', isDefault: true },
];

export const DEFAULT_GOALS: WeeklyGoal = {
  maxStandardDrinks: 14,
  maxDrinkingDays: 4,
};

export const DEFAULT_DATA: AppData = {
  entries: [],
  presets: DEFAULT_PRESETS,
  goals: DEFAULT_GOALS,
  weekNotes: {},
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA, presets: [...DEFAULT_PRESETS] };
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      entries: parsed.entries ?? [],
      presets: parsed.presets ?? [...DEFAULT_PRESETS],
      goals: parsed.goals ?? { ...DEFAULT_GOALS },
      weekNotes: parsed.weekNotes ?? {},
    };
  } catch {
    return { ...DEFAULT_DATA, presets: [...DEFAULT_PRESETS] };
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function exportWeeklySummary(entries: DrinkEntry[], weekLabel: string): void {
  const lines = [
    `Weekly Summary: ${weekLabel}`,
    '='.repeat(40),
    '',
    ...entries.map(e =>
      `${e.date} | ${e.name} | ${e.quantity}x ${e.ounces}oz @ ${e.abv}% ABV | ${e.standardDrinks} std drinks${e.notes ? ` | ${e.notes}` : ''}`
    ),
    '',
    `Total: ${entries.reduce((s, e) => s + e.standardDrinks, 0).toFixed(2)} standard drinks`,
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sip-tracker-${weekLabel}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
