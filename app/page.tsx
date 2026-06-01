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
      <div className="min-h-[100svh] flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#0c0e12' }}>
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl animate-bounce-in"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(45,212,191,0.15))', border: '1px solid rgba(99,102,241,0.35)' }}
        >
          🫗
        </div>
        <p className="text-slate-600 text-sm font-semibold animate-shimmer">Loading…</p>
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
    <div className="min-h-[100svh] flex flex-col" style={{ backgroundColor: '#0c0e12' }}>

      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-24 -right-20 w-80 h-80 rounded-full animate-float"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 68%)', filter: 'blur(48px)' }}
        />
        <div
          className="absolute top-[38%] -left-28 w-72 h-72 rounded-full animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.14) 0%, transparent 68%)', filter: 'blur(48px)', animationDelay: '2.5s' }}
        />
        <div
          className="absolute bottom-48 right-4 w-56 h-56 rounded-full animate-float"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 68%)', filter: 'blur(40px)', animationDelay: '5s' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-5 pt-10 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center text-[28px] glass-card animate-bounce-in animate-logo-pulse shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(45,212,191,0.18) 100%)',
                border: '1px solid rgba(99,102,241,0.4)',
              }}
            >
              🫗
            </div>
            <div>
              <h1
                className="text-5xl font-black leading-none tracking-tight gradient-text animate-bounce-in"
                style={{ animationDelay: '0.06s' }}
              >
                Log
              </h1>
              <p
                className="text-sm font-semibold mt-1 animate-bounce-in"
                style={{ color: '#475569', animationDelay: '0.12s' }}
              >
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-4 pb-5 mb-nav">
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
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 safe-bottom glass-nav"
        style={{ background: 'rgba(12,14,18,0.75)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-2xl mx-auto px-2">
          <div className="flex items-center">
            {TAB_CONFIG.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex flex-col items-center gap-1.5 py-3 transition-all animate-tab-in ${
                  activeTab === tab.id ? 'text-indigo-400' : 'text-slate-600'
                }`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <span
                  className={`transition-all duration-200 ${
                    activeTab === tab.id ? 'scale-115 drop-shadow-[0_0_8px_rgba(99,102,241,0.7)]' : ''
                  }`}
                >
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-bold transition-all ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`}>
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full animate-bounce-in"
                    style={{ background: 'linear-gradient(90deg, #818cf8, #2dd4bf)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* FAB - Add Drink */}
      <button
        onClick={() => setShowFabForm(true)}
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)', background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
        className="fixed right-5 sm:right-8 z-50 w-14 h-14 rounded-2xl text-white flex items-center justify-center glow-btn animate-pulse-glow"
        aria-label="Add drink"
      >
        <Plus size={22} />
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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" onClick={() => setShowFabForm(false)} />
          <div
            className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-modal max-h-[92vh] flex flex-col glass-modal"
            style={{ background: 'rgba(16,18,28,0.88)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div
              className="flex items-center justify-between px-6 pt-6 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🫗</span>
                <h2 className="font-black text-lg text-white">Log a Drink</h2>
              </div>
              <button
                onClick={() => setShowFabForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-white transition"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                ✕
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
