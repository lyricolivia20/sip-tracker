'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, Save, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { DrinkEntry, WeeklyGoal, WeekNote } from '@/lib/types';
import {
  getWeekDays, formatDate, getDayTotal, getWeekTotal,
  getDrinkingDaysCount, getHighestDay, formatShortDate, getWeekKey
} from '@/lib/calculations';
import { exportWeeklySummary } from '@/lib/storage';

interface Props {
  weekStart: Date;
  entries: DrinkEntry[];
  goals: WeeklyGoal;
  weekNote: WeekNote | null;
  onSaveNote: (note: WeekNote) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  isCurrentWeek: boolean;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getBarColor(total: number, goal: number): string {
  if (total === 0) return '#334155';
  const ratio = total / (goal / 7);
  if (ratio <= 0.5) return '#34d399';
  if (ratio <= 1) return '#818cf8';
  if (ratio <= 1.5) return '#f59e0b';
  return '#f87171';
}

export default function Dashboard({ weekStart, entries, goals, weekNote, onSaveNote, onPrevWeek, onNextWeek, onToday, isCurrentWeek }: Props) {
  const weekDays = getWeekDays(weekStart);
  const weekKey = getWeekKey(weekStart);
  const weekTotal = getWeekTotal(entries, weekDays);
  const drinkingDays = getDrinkingDaysCount(entries, weekDays);
  const highestDay = getHighestDay(entries, weekDays);
  const avgPerDrinkingDay = drinkingDays > 0 ? weekTotal / drinkingDays : 0;
  const weekEntries = weekDays.flatMap(d => entries.filter(e => e.date === formatDate(d)));

  const [noteText, setNoteText] = useState(weekNote?.text ?? '');
  const [reflection, setReflection] = useState(weekNote?.reflection ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNoteText(weekNote?.text ?? '');
    setReflection(weekNote?.reflection ?? '');
  }, [weekKey]);

  const chartData = weekDays.map((day, i) => ({
    name: DAY_LABELS[i],
    value: getDayTotal(entries, formatDate(day)),
  }));

  function handleSaveNote() {
    onSaveNote({ weekKey, text: noteText, reflection });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-col gap-5">
      {/* Week Nav */}
      <div className="flex items-center justify-between gap-2">
        <button onClick={onPrevWeek} className="p-2 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center flex-1">
          <p className="text-sm font-medium text-slate-200">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(weekStart.getTime() + 6*86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          {!isCurrentWeek && (
            <button onClick={onToday} className="px-3 py-1.5 text-xs rounded-xl border border-indigo-500/50 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition font-medium flex items-center gap-1">
              <CalendarDays size={13} /> Today
            </button>
          )}
          <button onClick={onNextWeek} className="p-2 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Weekly Total" value={weekTotal.toFixed(1)} sub="standard drinks" color={weekTotal > goals.maxStandardDrinks ? 'red' : 'indigo'} />
        <StatCard label="Drinking Days" value={drinkingDays.toString()} sub={`of ${goals.maxDrinkingDays} limit`} color={drinkingDays > goals.maxDrinkingDays ? 'amber' : 'emerald'} />
        <StatCard label="Avg Per Session" value={avgPerDrinkingDay.toFixed(1)} sub="std drinks/day" color="slate" />
        <StatCard
          label="Heaviest Day"
          value={highestDay ? highestDay.total.toFixed(1) : '—'}
          sub={highestDay ? formatShortDate(new Date(highestDay.date + 'T12:00')) : 'none'}
          color={highestDay && highestDay.total > 5 ? 'orange' : 'slate'}
        />
      </div>

      {/* Bar Chart */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3 font-medium">Daily Breakdown</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barSize={28} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(99,102,241,0.08)' }}
              contentStyle={{ background: '#1e2130', border: '1px solid #334155', borderRadius: 10, color: '#e2e8f0', fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v) => [`${Number(v).toFixed(2)} std`, '']}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={getBarColor(d.value, goals.maxStandardDrinks)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Goals Progress */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3 font-medium">Weekly Limit Progress</p>
        <ProgressRow
          label="Standard Drinks"
          value={weekTotal}
          max={goals.maxStandardDrinks}
          color={weekTotal > goals.maxStandardDrinks ? '#f87171' : '#818cf8'}
        />
        <div className="mt-3">
          <ProgressRow
            label="Drinking Days"
            value={drinkingDays}
            max={goals.maxDrinkingDays}
            color={drinkingDays > goals.maxDrinkingDays ? '#f59e0b' : '#34d399'}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3 font-medium">Weekly Notes & Patterns</p>
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          rows={3}
          placeholder="Note any patterns, triggers, or observations this week..."
          className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none text-sm"
        />
        <p className="text-xs text-slate-400 uppercase tracking-wider mt-3 mb-2 font-medium">Weekly Reflection</p>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          rows={2}
          placeholder="How do you feel about this week? What would you do differently?"
          className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none text-sm"
        />
        <button
          onClick={handleSaveNote}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-600 bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition text-sm font-medium"
        >
          <Save size={15} />
          {saved ? 'Saved!' : 'Save Notes'}
        </button>
      </div>

      {/* Export */}
      {weekEntries.length > 0 && (
        <button
          onClick={() => exportWeeklySummary(weekEntries, weekLabel)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition text-sm"
        >
          <Download size={15} />
          Export Week Summary
        </button>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const textColor = {
    indigo: 'text-indigo-300',
    red: 'text-red-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    orange: 'text-orange-400',
    slate: 'text-slate-300',
  }[color] ?? 'text-slate-300';

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 animate-slide-up">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}

function ProgressRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">{value.toFixed(value % 1 === 0 ? 0 : 1)} / {max}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
