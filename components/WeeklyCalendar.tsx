'use client';

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { DrinkEntry } from '@/lib/types';
import {
  getWeekDays, formatDate, getDayTotal, getDayColor,
  isToday, formatWeekRange, getWeekTotal, getDrinkingDaysCount,
  getHighestDay, formatShortDate
} from '@/lib/calculations';

interface Props {
  weekStart: Date;
  entries: DrinkEntry[];
  goals: { maxStandardDrinks: number; maxDrinkingDays: number };
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onDayClick: (dateStr: string) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAY_COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  empty: { bg: 'bg-slate-800/40', border: 'border-slate-700/40', text: 'text-slate-500', dot: '' },
  low: { bg: 'bg-emerald-950/60', border: 'border-emerald-700/50', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  moderate: { bg: 'bg-amber-950/60', border: 'border-amber-700/50', text: 'text-amber-300', dot: 'bg-amber-400' },
  high: { bg: 'bg-orange-950/60', border: 'border-orange-700/50', text: 'text-orange-300', dot: 'bg-orange-400' },
  'very-high': { bg: 'bg-red-950/60', border: 'border-red-700/50', text: 'text-red-300', dot: 'bg-red-400' },
};

export default function WeeklyCalendar({ weekStart, entries, goals, onPrevWeek, onNextWeek, onToday, onDayClick }: Props) {
  const weekDays = getWeekDays(weekStart);
  const weekTotal = getWeekTotal(entries, weekDays);
  const drinkingDays = getDrinkingDaysCount(entries, weekDays);
  const highestDay = getHighestDay(entries, weekDays);
  const progressPct = Math.min((weekTotal / goals.maxStandardDrinks) * 100, 100);
  const isOverGoal = weekTotal > goals.maxStandardDrinks;

  const today = new Date();
  const isCurrentWeek = weekDays.some(d => isToday(d));

  return (
    <div className="flex flex-col gap-4">
      {/* Week Nav */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onPrevWeek}
          className="p-2 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center flex-1">
          <p className="text-sm font-medium text-slate-200">{formatWeekRange(weekStart)}</p>
        </div>

        <div className="flex gap-2">
          {!isCurrentWeek && (
            <button
              onClick={onToday}
              className="px-3 py-1.5 text-xs rounded-xl border border-indigo-500/50 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition font-medium flex items-center gap-1"
            >
              <CalendarDays size={13} />
              Today
            </button>
          )}
          <button
            onClick={onNextWeek}
            className="p-2 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day, i) => {
          const dateStr = formatDate(day);
          const total = getDayTotal(entries, dateStr);
          const color = getDayColor(total);
          const colors = DAY_COLOR_CLASSES[color];
          const todayDay = isToday(day);

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl border card-hover transition-all relative ${colors.bg} ${colors.border} ${
                todayDay ? 'ring-2 ring-indigo-500/60' : ''
              }`}
            >
              <span className="text-xs text-slate-500 font-medium">{DAY_LABELS[i]}</span>
              <span className={`text-sm font-bold ${todayDay ? 'text-indigo-300' : 'text-slate-200'}`}>
                {day.getDate()}
              </span>
              {total > 0 ? (
                <>
                  <span className={`text-xs font-semibold ${colors.text}`}>{total.toFixed(1)}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                </>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              )}
            </button>
          );
        })}
      </div>

      {/* Weekly Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mt-1">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <p className="text-xs text-slate-400 mb-1">Total Drinks</p>
          <p className={`text-2xl font-bold ${isOverGoal ? 'text-red-400' : 'text-indigo-300'}`}>
            {weekTotal.toFixed(1)}
          </p>
          <p className="text-xs text-slate-500">of {goals.maxStandardDrinks} goal</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-xs text-slate-400 mb-1">Drink Days</p>
          <p className={`text-2xl font-bold ${drinkingDays > goals.maxDrinkingDays ? 'text-amber-400' : 'text-emerald-400'}`}>
            {drinkingDays}
          </p>
          <p className="text-xs text-slate-500">of {goals.maxDrinkingDays} goal</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <p className="text-xs text-slate-400 mb-1">Peak Day</p>
          {highestDay ? (
            <>
              <p className="text-2xl font-bold text-orange-300">{highestDay.total.toFixed(1)}</p>
              <p className="text-xs text-slate-500">{formatShortDate(new Date(highestDay.date + 'T12:00'))}</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-slate-600">—</p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Weekly Progress</span>
          <span className={`text-xs font-medium ${isOverGoal ? 'text-red-400' : 'text-indigo-300'}`}>
            {weekTotal.toFixed(1)} / {goals.maxStandardDrinks} std drinks
          </span>
        </div>
        <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isOverGoal ? 'bg-red-500' : progressPct > 75 ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {isOverGoal && (
          <p className="text-xs text-red-400 mt-1.5">Over weekly goal by {(weekTotal - goals.maxStandardDrinks).toFixed(1)} drinks</p>
        )}
      </div>
    </div>
  );
}
