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
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#334155' }}>Quick Select</p>
        <div className="grid grid-cols-4 gap-2">
          {presets.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center active:scale-95"
              style={{
                background: selectedPreset === preset.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedPreset === preset.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span className="text-xl">{preset.icon}</span>
              <span className="text-[10px] leading-tight" style={{ color: selectedPreset === preset.id ? '#a5b4fc' : '#94a3b8' }}>{preset.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setSelectedPreset(null); setShowCustom(true); }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center active:scale-95"
            style={{
              background: showCustom && !selectedPreset ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${showCustom && !selectedPreset ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <span className="text-xl">✏️</span>
            <span className="text-[10px]" style={{ color: showCustom && !selectedPreset ? '#a5b4fc' : '#64748b' }}>Custom</span>
          </button>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#334155' }}>Drink Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. IPA, Margarita..."
          className="w-full rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
      </div>

      {/* Ounces / ABV / Quantity */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#334155' }}>oz</label>
          <input
            type="number"
            value={ounces}
            onChange={e => setOunces(parseFloat(e.target.value) || 0)}
            min={0.5}
            step={0.5}
            className="w-full rounded-xl px-3 py-3 text-slate-100 focus:outline-none transition text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#334155' }}>abv %</label>
          <input
            type="number"
            value={abv}
            onChange={e => setAbv(parseFloat(e.target.value) || 0)}
            min={0}
            max={100}
            step={0.1}
            className="w-full rounded-xl px-3 py-3 text-slate-100 focus:outline-none transition text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#334155' }}>qty</label>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(parseInt(e.target.value) || 1)}
            min={1}
            max={20}
            className="w-full rounded-xl px-3 py-3 text-slate-100 focus:outline-none transition text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
      </div>

      {/* Standard Drinks Preview */}
      <div className="flex items-center justify-center rounded-2xl py-5" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="text-center">
          <p className="text-[36px] font-bold tracking-tight leading-none" style={{ color: '#a5b4fc' }}>{standardDrinks.toFixed(2)}</p>
          <p className="text-[10px] font-medium uppercase tracking-widest mt-2" style={{ color: '#4338ca' }}>standard drinks</p>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#334155' }}>Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-slate-100 focus:outline-none transition [color-scheme:dark]"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* Mood */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#334155' }}>Mood (optional)</label>
        <div className="flex flex-wrap gap-2">
          {MOOD_TAGS.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(mood === m.value ? '' : m.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all active:scale-95"
              style={{
                background: mood === m.value ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${mood === m.value ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
                color: mood === m.value ? '#a5b4fc' : '#64748b',
              }}
            >
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#334155' }}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Any notes..."
          className="w-full rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none transition resize-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl font-medium text-slate-500 hover:text-slate-300 transition active:scale-95"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
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
