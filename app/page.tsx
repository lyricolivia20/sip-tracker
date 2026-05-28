'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, CalendarDays, BarChart2, Sliders, Layers } from 'lucide-react';
import { AppData, DrinkEntry, DrinkPreset, WeeklyGoal, WeekNote } from '@/lib/types';
import { loadData, saveData } from '@/lib/storage';
import { getWeekStart, formatDate, getWeekKey, getWeekDays, isToday } from '@/lib/calculations';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import Dashboard from '@/components/Dashboard';
import PresetsPanel from '@/components/PresetsPanel';
import SettingsPanel from '@/components/SettingsPanel';
import DayModal from '@/components/DayModal';
import DrinkForm from '@/components/DrinkForm';

type Tab = 'calendar' | 'dashboard' | 'presets' | 'settings';

const TAB_CONFIG: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={18} /> },
  { id: 'dashboard', label: 'Stats', icon: <BarChart2 size={18} /> },
  { id: 'presets', label: 'Presets', icon: <Layers size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Sliders size={18} /> },
];

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [dayModalDate, setDayModalDate] = useState<string | null>(null);
  const [showFabForm, setShowFabForm] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setData(loadData());
  }, []);

  // Save whenever data changes
  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setData(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  const weekKey = getWeekKey(weekStart);
  const weekNote = data.weekNotes[weekKey] ?? null;
  const isCurrentWeek = getWeekDays(weekStart).some(d => isToday(d));

  // Entry CRUD
  function addEntry(entry: DrinkEntry) {
    updateData(prev => ({ ...prev, entries: [...prev.entries, entry] }));
  }

  function editEntry(entry: DrinkEntry) {
    updateData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === entry.id ? entry : e),
    }));
  }

  function deleteEntry(id: string) {
    updateData(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
  }

  function updatePresets(presets: DrinkPreset[]) {
    updateData(prev => ({ ...prev, presets }));
  }

  function updateGoals(goals: WeeklyGoal) {
    updateData(prev => ({ ...prev, goals }));
  }

  function saveWeekNote(note: WeekNote) {
    updateData(prev => ({ ...prev, weekNotes: { ...prev.weekNotes, [note.weekKey]: note } }));
  }

  function clearAllData() {
    updateData(prev => {
      const fresh: AppData = { entries: [], presets: prev.presets, goals: prev.goals, weekNotes: {} };
      return fresh;
    });
  }

  function goToToday() {
    setWeekStart(getWeekStart(new Date()));
  }

  function goToPrevWeek() {
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function goToNextWeek() {
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  const todayStr = formatDate(new Date());

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#111318' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80" style={{ backgroundColor: '#111318ee', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <span className="text-base">🥃</span>
            </div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">Sip Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 pb-28">
        {activeTab === 'calendar' && (
          <div className="animate-fade-in">
            <WeeklyCalendar
              weekStart={weekStart}
              entries={data.entries}
              goals={data.goals}
              onPrevWeek={goToPrevWeek}
              onNextWeek={goToNextWeek}
              onToday={goToToday}
              onDayClick={setDayModalDate}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <Dashboard
              weekStart={weekStart}
              entries={data.entries}
              goals={data.goals}
              weekNote={weekNote}
              onSaveNote={saveWeekNote}
              onPrevWeek={goToPrevWeek}
              onNextWeek={goToNextWeek}
              onToday={goToToday}
              isCurrentWeek={isCurrentWeek}
            />
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="animate-fade-in">
            <PresetsPanel presets={data.presets} onUpdate={updatePresets} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fade-in">
            <SettingsPanel goals={data.goals} onUpdate={updateGoals} onClearAllData={clearAllData} />
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80" style={{ backgroundColor: '#111318ee', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-2xl mx-auto px-2">
          <div className="flex items-center">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
                  activeTab === tab.id
                    ? 'text-indigo-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={`transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`}>
                  {tab.icon}
                </span>
                <span className="text-[10px] font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* FAB - Add Drink */}
      <button
        onClick={() => setShowFabForm(true)}
        className="fixed bottom-20 right-4 sm:right-6 z-50 w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg glow-btn animate-pulse-glow transition"
        aria-label="Add drink"
      >
        <Plus size={24} />
      </button>

      {/* Day Modal */}
      {dayModalDate && (
        <DayModal
          dateStr={dayModalDate}
          entries={data.entries}
          presets={data.presets}
          onClose={() => setDayModalDate(null)}
          onAddEntry={(e) => { addEntry(e); }}
          onEditEntry={(e) => { editEntry(e); }}
          onDeleteEntry={(id) => { deleteEntry(id); }}
        />
      )}

      {/* FAB Add Form Modal */}
      {showFabForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowFabForm(false)} />
          <div className="relative w-full sm:max-w-lg bg-[#1a1d2e] border border-slate-700/60 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-700/50">
              <h2 className="font-semibold text-slate-100">Log a Drink</h2>
              <button onClick={() => setShowFabForm(false)} className="text-slate-400 hover:text-slate-200 transition p-1">
                <span className="text-lg">✕</span>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <DrinkForm
                presets={data.presets}
                initialDate={todayStr}
                onSave={(entry) => {
                  addEntry(entry);
                  setShowFabForm(false);
                }}
                onCancel={() => setShowFabForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
