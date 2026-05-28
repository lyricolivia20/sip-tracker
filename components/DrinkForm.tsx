'use client';

import { useState } from 'react';
import { DrinkEntry, DrinkPreset, MOOD_TAGS, MoodTag } from '@/lib/types';
import { calcStandardDrinks } from '@/lib/calculations';
import { generateId } from '@/lib/storage';

interface Props {
  presets: DrinkPreset[];
  initialDate: string;
  entry?: DrinkEntry | null;
  onSave: (entry: DrinkEntry) => void;
  onCancel: () => void;
}

export default function DrinkForm({ presets, initialDate, entry, onSave, onCancel }: Props) {
  const [name, setName] = useState(entry?.name ?? '');
  const [ounces, setOunces] = useState(entry?.ounces ?? 12);
  const [abv, setAbv] = useState(entry?.abv ?? 5);
  const [quantity, setQuantity] = useState(entry?.quantity ?? 1);
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [mood, setMood] = useState<MoodTag | ''>(entry?.mood as MoodTag ?? '');
  const [date, setDate] = useState(entry?.date ?? initialDate);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(entry?.presetId ?? null);
  const [showCustom, setShowCustom] = useState(!entry?.presetId);

  const standardDrinks = calcStandardDrinks(ounces, abv, quantity);

  function applyPreset(preset: DrinkPreset) {
    setSelectedPreset(preset.id);
    setName(preset.name);
    setOunces(preset.ounces);
    setAbv(preset.abv);
    setShowCustom(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entryData: DrinkEntry = {
      id: entry?.id ?? generateId(),
      date,
      presetId: selectedPreset,
      name: name || 'Custom Drink',
      ounces,
      abv,
      quantity,
      notes,
      standardDrinks: calcStandardDrinks(ounces, abv, quantity),
      mood: mood || undefined,
      createdAt: entry?.createdAt ?? new Date().toISOString(),
    };
    onSave(entryData);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Preset Buttons */}
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">Quick Select</p>
        <div className="grid grid-cols-4 gap-2">
          {presets.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-center ${
                selectedPreset === preset.id
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:bg-slate-700/60'
              }`}
            >
              <span className="text-xl">{preset.icon}</span>
              <span className="text-xs leading-tight">{preset.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setSelectedPreset(null); setShowCustom(true); }}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-center ${
              showCustom && !selectedPreset
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500'
            }`}
          >
            <span className="text-xl">✏️</span>
            <span className="text-xs">Custom</span>
          </button>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-medium">Drink Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. IPA, Margarita..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition"
        />
      </div>

      {/* Ounces / ABV / Quantity */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-medium">Oz</label>
          <input
            type="number"
            value={ounces}
            onChange={e => setOunces(parseFloat(e.target.value) || 0)}
            min={0.5}
            step={0.5}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-center"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-medium">ABV %</label>
          <input
            type="number"
            value={abv}
            onChange={e => setAbv(parseFloat(e.target.value) || 0)}
            min={0}
            max={100}
            step={0.1}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-center"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-medium">Qty</label>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(parseInt(e.target.value) || 1)}
            min={1}
            max={20}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-center"
          />
        </div>
      </div>

      {/* Standard Drinks Preview */}
      <div className="flex items-center justify-center bg-indigo-950/60 border border-indigo-800/50 rounded-xl py-3">
        <div className="text-center">
          <p className="text-3xl font-bold text-indigo-300">{standardDrinks.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-0.5">standard drinks</p>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition [color-scheme:dark]"
        />
      </div>

      {/* Mood */}
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">Mood / Trigger (optional)</label>
        <div className="flex flex-wrap gap-2">
          {MOOD_TAGS.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(mood === m.value ? '' : m.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                mood === m.value
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                  : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500'
              }`}
            >
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-medium">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Any notes about this drink..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold glow-btn transition"
        >
          {entry ? 'Update Drink' : 'Log Drink'}
        </button>
      </div>
    </form>
  );
}
