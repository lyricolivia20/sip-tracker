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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0c0e12' }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ backgroundColor: '#0c0e12cc', backdropFilter: 'blur(24px)' }}>
        <div className="max-w-2xl mx-auto px-5 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-[13px] font-semibold tracking-tight text-slate-200">log</span>
          </div>
          <span className="text-[11px] text-slate-600 tabular-nums">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 mb-nav">
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom" style={{ backgroundColor: '#0c0e12e8', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex flex-col items-center gap-1 py-3.5 transition-all ${
                  activeTab === tab.id
                    ? 'text-indigo-400'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <span className={`transition-all duration-200 ${activeTab === tab.id ? 'scale-110' : ''}`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-medium transition-all ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-indigo-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* FAB - Add Drink */}
      <button
        onClick={() => setShowFabForm(true)}
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)' }}
        className="fixed right-5 sm:right-8 z-50 w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center glow-btn animate-pulse-glow"
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
