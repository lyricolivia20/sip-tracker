'use client';

import { useState } from 'react';
import { X, Plus, Pencil, Trash2, ChevronLeft } from 'lucide-react';
import { DrinkEntry, DrinkPreset, MOOD_TAGS } from '@/lib/types';
import { getDayTotal, parseDate } from '@/lib/calculations';
import DrinkForm from './DrinkForm';

interface Props {
  dateStr: string;
  entries: DrinkEntry[];
  presets: DrinkPreset[];
  onClose: () => void;
  onAddEntry: (entry: DrinkEntry) => void;
  onEditEntry: (entry: DrinkEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export default function DayModal({ dateStr, entries, presets, onClose, onAddEntry, onEditEntry, onDeleteEntry }: Props) {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingEntry, setEditingEntry] = useState<DrinkEntry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const dayEntries = entries.filter(e => e.date === dateStr);
  const dayTotal = getDayTotal(entries, dateStr);

  const date = parseDate(dateStr);
  const dayLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  function handleSave(entry: DrinkEntry) {
    if (view === 'edit' && editingEntry) {
      onEditEntry(entry);
    } else {
      onAddEntry(entry);
    }
    setView('list');
    setEditingEntry(null);
  }

  function startEdit(entry: DrinkEntry) {
    setEditingEntry(entry);
    setView('edit');
  }

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      onDeleteEntry(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  }

  const getMoodEmoji = (mood: string) => MOOD_TAGS.find(m => m.value === mood)?.emoji ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-modal max-h-[90vh] flex flex-col" style={{ background: '#13161f', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            {(view === 'add' || view === 'edit') && (
              <button onClick={() => { setView('list'); setEditingEntry(null); }} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 transition" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <ChevronLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="font-semibold text-slate-100">
                {view === 'list' ? dayLabel : view === 'edit' ? 'Edit Drink' : 'Log a Drink'}
              </h2>
              {view === 'list' && (
                <p className="text-xs text-slate-400">
                  {dayTotal > 0 ? `${dayTotal.toFixed(2)} std drinks` : 'No drinks logged'}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 transition" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5">
          {view === 'list' ? (
            <div className="flex flex-col gap-3">
              {dayEntries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-5xl mb-4 opacity-30">○</p>
                  <p className="text-sm font-medium" style={{ color: '#475569' }}>Nothing logged</p>
                  <p className="text-xs mt-1" style={{ color: '#334155' }}>Tap below to add a drink.</p>
                </div>
              ) : (
                <>
                  {dayEntries.map(entry => (
                    <div key={entry.id} className="rounded-xl p-3.5 animate-slide-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-100 font-medium text-sm">
                              {entry.quantity > 1 ? `${entry.quantity}x ` : ''}{entry.name}
                            </span>
                            {entry.mood && <span className="text-base">{getMoodEmoji(entry.mood)}</span>}
                          </div>
                          <p className="text-slate-400 text-xs mt-0.5">
                            {entry.ounces}oz · {entry.abv}% ABV · <span className="text-indigo-400 font-medium">{entry.standardDrinks.toFixed(2)} std drinks</span>
                          </p>
                          {entry.notes && <p className="text-slate-500 text-xs mt-1 truncate">{entry.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => startEdit(entry)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className={`p-1.5 rounded-lg transition ${
                              confirmDelete === entry.id
                                ? 'text-red-400 bg-red-500/20'
                                : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                            }`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      {confirmDelete === entry.id && (
                        <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                          <p className="text-xs text-red-400">Tap trash again to confirm delete</p>
                          <button onClick={() => setConfirmDelete(null)} className="text-xs text-slate-400 hover:text-slate-200">Cancel</button>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center justify-between rounded-xl p-3.5 mt-1" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Day total</span>
                    <span className="font-bold text-base" style={{ color: '#a5b4fc' }}>{dayTotal.toFixed(2)} std</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <DrinkForm
              presets={presets}
              initialDate={dateStr}
              entry={editingEntry}
              onSave={handleSave}
              onCancel={() => { setView('list'); setEditingEntry(null); }}
            />
          )}
        </div>

        {/* Footer */}
        {view === 'list' && (
          <div className="p-4 pb-safe" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setView('add')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold rounded-xl glow-btn transition"
            >
              <Plus size={18} />
              Add Drink
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
