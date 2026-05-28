'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, RotateCcw } from 'lucide-react';
import { DrinkPreset } from '@/lib/types';
import { calcStandardDrinks } from '@/lib/calculations';
import { generateId, DEFAULT_PRESETS } from '@/lib/storage';

interface Props {
  presets: DrinkPreset[];
  onUpdate: (presets: DrinkPreset[]) => void;
}

const PRESET_COLORS = ['amber', 'yellow', 'orange', 'pink', 'purple', 'blue', 'emerald', 'red', 'indigo', 'teal'];
const PRESET_ICONS = ['🍺', '🍻', '🥃', '🍹', '🫧', '🍷', '🍸', '🧉', '🥂', '🍾', '🧃', '🫙'];

const COLOR_PREVIEW: Record<string, string> = {
  amber: '#f59e0b', yellow: '#eab308', orange: '#f97316', pink: '#ec4899',
  purple: '#a855f7', blue: '#3b82f6', emerald: '#10b981', red: '#ef4444',
  indigo: '#6366f1', teal: '#14b8a6',
};

interface PresetFormState {
  name: string;
  ounces: number;
  abv: number;
  color: string;
  icon: string;
}

const EMPTY_FORM: PresetFormState = { name: '', ounces: 12, abv: 5, color: 'indigo', icon: '🍺' };

export default function PresetsPanel({ presets, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<PresetFormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function startEdit(preset: DrinkPreset) {
    setEditingId(preset.id);
    setAddingNew(false);
    setForm({ name: preset.name, ounces: preset.ounces, abv: preset.abv, color: preset.color, icon: preset.icon });
  }

  function startAdd() {
    setAddingNew(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function cancelForm() {
    setEditingId(null);
    setAddingNew(false);
    setForm(EMPTY_FORM);
  }

  function saveEdit() {
    if (!form.name.trim()) return;
    if (editingId) {
      onUpdate(presets.map(p => p.id === editingId ? { ...p, ...form } : p));
    } else {
      const newPreset: DrinkPreset = { id: generateId(), ...form, isDefault: false };
      onUpdate([...presets, newPreset]);
    }
    cancelForm();
  }

  function deletePreset(id: string) {
    if (confirmDelete === id) {
      onUpdate(presets.filter(p => p.id !== id));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  }

  function resetToDefaults() {
    onUpdate([...DEFAULT_PRESETS]);
  }

  const sd = calcStandardDrinks(form.ounces, form.abv, 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Drink Presets</h2>
          <p className="text-xs text-slate-400 mt-0.5">Customize your quick-add buttons</p>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-2.5 py-1.5 rounded-lg transition"
        >
          <RotateCcw size={12} />
          Defaults
        </button>
      </div>

      {/* Presets List */}
      <div className="flex flex-col gap-2">
        {presets.map(preset => (
          <div key={preset.id}>
            {editingId === preset.id ? (
              <PresetFormUI
                form={form}
                onChange={setForm}
                onSave={saveEdit}
                onCancel={cancelForm}
                sd={sd}
                isEdit
              />
            ) : (
              <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: `${COLOR_PREVIEW[preset.color] ?? '#6366f1'}22`, border: `1px solid ${COLOR_PREVIEW[preset.color] ?? '#6366f1'}44` }}
                >
                  {preset.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100">{preset.name}</p>
                  <p className="text-xs text-slate-400">
                    {preset.ounces}oz · {preset.abv}% · <span className="text-indigo-400">{calcStandardDrinks(preset.ounces, preset.abv, 1).toFixed(2)} std drinks</span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(preset)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition">
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className={`p-1.5 rounded-lg transition ${confirmDelete === preset.id ? 'text-red-400 bg-red-500/20' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
            {confirmDelete === preset.id && editingId !== preset.id && (
              <div className="flex items-center justify-between px-3.5 py-2 bg-red-950/30 border border-red-800/30 rounded-xl mt-1 animate-slide-up">
                <p className="text-xs text-red-400">Tap trash again to delete</p>
                <button onClick={() => setConfirmDelete(null)} className="text-xs text-slate-400 hover:text-slate-200">Cancel</button>
              </div>
            )}
          </div>
        ))}

        {/* Add New Form */}
        {addingNew && (
          <PresetFormUI
            form={form}
            onChange={setForm}
            onSave={saveEdit}
            onCancel={cancelForm}
            sd={sd}
            isEdit={false}
          />
        )}
      </div>

      {/* Add Button */}
      {!addingNew && (
        <button
          onClick={startAdd}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-400 transition text-sm font-medium"
        >
          <Plus size={16} />
          Add Custom Preset
        </button>
      )}
    </div>
  );
}

function PresetFormUI({
  form, onChange, onSave, onCancel, sd, isEdit
}: {
  form: PresetFormState;
  onChange: (f: PresetFormState) => void;
  onSave: () => void;
  onCancel: () => void;
  sd: number;
  isEdit: boolean;
}) {
  return (
    <div className="bg-slate-800/80 border border-indigo-500/30 rounded-xl p-4 animate-slide-up flex flex-col gap-3">
      {/* Icon row */}
      <div>
        <p className="text-xs text-slate-400 mb-2">Icon</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_ICONS.map(icon => (
            <button
              key={icon}
              type="button"
              onClick={() => onChange({ ...form, icon })}
              className={`w-9 h-9 rounded-lg text-xl transition ${form.icon === icon ? 'bg-indigo-500/30 ring-1 ring-indigo-500' : 'bg-slate-700/60 hover:bg-slate-700'}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <input
        type="text"
        value={form.name}
        onChange={e => onChange({ ...form, name: e.target.value })}
        placeholder="Preset name..."
        className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition"
      />

      {/* Ounces / ABV */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Ounces</label>
          <input type="number" value={form.ounces} onChange={e => onChange({ ...form, ounces: parseFloat(e.target.value) || 0 })}
            min={0.5} step={0.5}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm text-center transition" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">ABV %</label>
          <input type="number" value={form.abv} onChange={e => onChange({ ...form, abv: parseFloat(e.target.value) || 0 })}
            min={0} max={100} step={0.1}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm text-center transition" />
        </div>
      </div>

      {/* SD Preview */}
      <div className="text-center text-xs text-indigo-300 bg-indigo-950/40 rounded-lg py-2 border border-indigo-800/30">
        {sd.toFixed(2)} standard drinks per serving
      </div>

      {/* Color */}
      <div>
        <p className="text-xs text-slate-400 mb-2">Color</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ ...form, color })}
              className={`w-7 h-7 rounded-full transition ring-offset-2 ring-offset-slate-800 ${form.color === color ? 'ring-2 ring-white' : ''}`}
              style={{ backgroundColor: COLOR_PREVIEW[color] }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 text-sm rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition">Cancel</button>
        <button onClick={onSave} className="flex-1 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium glow-btn transition flex items-center justify-center gap-1.5">
          <Save size={14} />
          {isEdit ? 'Update' : 'Add Preset'}
        </button>
      </div>
    </div>
  );
}
