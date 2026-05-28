'use client';

import { useState } from 'react';
import { Save, AlertTriangle, Trash2 } from 'lucide-react';
import { WeeklyGoal } from '@/lib/types';

interface Props {
  goals: WeeklyGoal;
  onUpdate: (goals: WeeklyGoal) => void;
  onClearAllData: () => void;
}

export default function SettingsPanel({ goals, onUpdate, onClearAllData }: Props) {
  const [maxDrinks, setMaxDrinks] = useState(goals.maxStandardDrinks);
  const [maxDays, setMaxDays] = useState(goals.maxDrinkingDays);
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  function handleSave() {
    onUpdate({ maxStandardDrinks: maxDrinks, maxDrinkingDays: maxDays });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearData() {
    if (confirmClear) {
      onClearAllData();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-slate-100">Weekly Goals</h2>
        <p className="text-xs text-slate-400 mt-0.5">Set your personal limits for the week</p>
      </div>

      {/* Max Standard Drinks */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-slate-200">Max Standard Drinks</p>
            <p className="text-xs text-slate-400 mt-0.5">Per week limit for standard drinks</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMaxDrinks(Math.max(1, maxDrinks - 1))}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold transition text-lg leading-none flex items-center justify-center"
            >−</button>
            <span className="text-2xl font-bold text-indigo-300 w-10 text-center">{maxDrinks}</span>
            <button
              onClick={() => setMaxDrinks(maxDrinks + 1)}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold transition text-lg leading-none flex items-center justify-center"
            >+</button>
          </div>
        </div>

        {/* Presets */}
        <div className="flex gap-2">
          {[7, 10, 14, 21].map(n => (
            <button
              key={n}
              onClick={() => setMaxDrinks(n)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition border ${
                maxDrinks === n
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-700/50 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-start gap-2">
            <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500">
              Low-risk guidelines suggest ≤14 drinks/week for men and ≤7 for women, with no more than 4 in a day.
            </p>
          </div>
        </div>
      </div>

      {/* Max Drinking Days */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-200">Max Drinking Days</p>
            <p className="text-xs text-slate-400 mt-0.5">Days per week you plan to drink</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMaxDays(Math.max(1, maxDays - 1))}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold transition text-lg leading-none flex items-center justify-center"
            >−</button>
            <span className="text-2xl font-bold text-emerald-400 w-10 text-center">{maxDays}</span>
            <button
              onClick={() => setMaxDays(Math.min(7, maxDays + 1))}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold transition text-lg leading-none flex items-center justify-center"
            >+</button>
          </div>
        </div>

        {/* Day picker */}
        <div className="flex gap-1.5 mt-3">
          {[1,2,3,4,5,6,7].map(n => (
            <button
              key={n}
              onClick={() => setMaxDays(n)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition border ${
                maxDays >= n
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-700/50 border-slate-700 text-slate-500'
              }`}
            >{n}</button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl glow-btn transition"
      >
        <Save size={16} />
        {saved ? '✓ Goals Saved!' : 'Save Goals'}
      </button>

      {/* About Section */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">About</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          Sip Tracker helps you monitor your weekly alcohol intake using the standard drinks formula:
        </p>
        <div className="mt-2 bg-slate-900/60 rounded-lg px-3 py-2 font-mono text-xs text-indigo-300">
          std drinks = (oz × (abv / 100)) / 0.6
        </div>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          All data is stored locally on your device. Nothing is sent to any server.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/20 border border-red-800/30 rounded-2xl p-4">
        <p className="text-xs text-red-400 uppercase tracking-wider font-medium mb-3">Danger Zone</p>
        <button
          onClick={handleClearData}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition ${
            confirmClear
              ? 'bg-red-600 border-red-600 text-white hover:bg-red-500'
              : 'border-red-800/50 text-red-400 hover:bg-red-900/30'
          }`}
        >
          <Trash2 size={15} />
          {confirmClear ? 'Confirm — Delete Everything' : 'Clear All Data'}
        </button>
        {confirmClear && (
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-red-400">This cannot be undone!</p>
            <button onClick={() => setConfirmClear(false)} className="text-xs text-slate-400 hover:text-slate-200">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
