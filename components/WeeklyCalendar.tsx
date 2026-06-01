'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DrinkEntry } from '@/lib/types';
import {
  getWeekDays, formatDate, getDayTotal, getDayColor,
  isToday, formatWeekRange, getWeekTotal, getDrinkingDaysCount,
  getHighestDay, formatShortDate
} from '@/lib/calculations';

const MOOD_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#84cc16',
  5: '#22c55e',
};

interface Props {
  weekStart: Date;
  entries: DrinkEntry[];
  goals: { maxStandardDrinks: number; maxDrinkingDays: number };
  dayMoods: Record<string, number>;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onDayClick: (dateStr: string) => void;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type DayColorKey = 'empty' | 'low' | 'moderate' | 'high' | 'very-high';

const DAY_STYLES: Record<DayColorKey, { bg: string; border: string; numColor: string; amtColor: string }> = {
  empty:      { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.05)', numColor: '#64748b', amtColor: '' },
  low:        { bg: 'rgba(45,212,191,0.07)',  border: 'rgba(45,212,191,0.2)',   numColor: '#f1f5f9', amtColor: '#2dd4bf' },
  moderate:   { bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.2)',   numColor: '#f1f5f9', amtColor: '#f59e0b' },
  high:       { bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.22)',  numColor: '#f1f5f9', amtColor: '#f97316' },
  'very-high':{ bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.22)',   numColor: '#f1f5f9', amtColor: '#f87171' },
};

export default function WeeklyCalendar({ weekStart, entries, goals, dayMoods, onPrevWeek, onNextWeek, onToday, onDayClick }: Props) {
  const weekDays = getWeekDays(weekStart);
  const weekTotal = getWeekTotal(entries, weekDays);
  const drinkingDays = getDrinkingDaysCount(entries, weekDays);
  const highestDay = getHighestDay(entries, weekDays);
  const progressPct = Math.min((weekTotal / goals.maxStandardDrinks) * 100, 100);
  const isOverGoal = weekTotal > goals.maxStandardDrinks;
  const isCurrentWeek = weekDays.some(d => isToday(d));

  return (
    <div className="flex flex-col gap-6">

      {/* Week Nav */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onPrevWeek}
          className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 active:scale-90 transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2.5">
          <p className="text-sm font-medium text-slate-300 tabular-nums">{formatWeekRange(weekStart)}</p>
          {!isCurrentWeek && (
            <button
              onClick={onToday}
              className="text-[10px] px-2.5 py-1 rounded-full font-medium text-indigo-400 transition-all"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              today
            </button>
          )}
        </div>

        <button
          onClick={onNextWeek}
          className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 active:scale-90 transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day, i) => {
          const dateStr = formatDate(day);
          const total = getDayTotal(entries, dateStr);
          const colorKey = getDayColor(total) as DayColorKey;
          const style = DAY_STYLES[colorKey];
          const todayDay = isToday(day);

          const moodRating = dayMoods[dateStr];
          const moodColor = moodRating ? MOOD_COLORS[moodRating] : null;

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className="flex flex-col items-center justify-center gap-1 rounded-[18px] card-hover animate-day relative overflow-hidden"
              style={{
                minHeight: '90px',
                padding: '12px 4px 10px',
                background: todayDay ? 'rgba(99,102,241,0.1)' : style.bg,
                border: `1px solid ${todayDay ? 'rgba(99,102,241,0.45)' : style.border}`,
                boxShadow: todayDay ? '0 0 20px rgba(99,102,241,0.2)' : 'none',
                animationDelay: `${i * 0.03}s`,
              }}
            >
              <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: todayDay ? '#818cf8' : '#334155' }}>
                {DAY_LABELS[i]}
              </span>
              <span className="text-[19px] font-bold leading-none" style={{ color: todayDay ? '#a5b4fc' : style.numColor }}>
                {day.getDate()}
              </span>
              {total > 0 ? (
                <span className="text-[10px] font-semibold leading-none" style={{ color: style.amtColor }}>
                  {total.toFixed(1)}
                </span>
              ) : (
                <span className="text-[10px] leading-none" style={{ color: '#1e293b' }}>·</span>
              )}
              {/* Mood bar */}
              {moodColor && (
                <div
                  className="absolute bottom-0 left-1 right-1 h-[3px] rounded-full"
                  style={{ background: moodColor, opacity: 0.85 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-2.5">

        {/* Weekly Total */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-1 animate-slide-up glass-card"
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', animationDelay: '0.05s' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#4338ca' }}>Week</p>
          <p className="text-[24px] font-black tracking-tight leading-none" style={{ color: isOverGoal ? '#f87171' : '#a5b4fc' }}>
            {weekTotal.toFixed(1)}
          </p>
          <p className="text-[9px] font-semibold" style={{ color: '#312e81' }}>of {goals.maxStandardDrinks} std</p>
          <div className="mt-2 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: isOverGoal ? '#f87171' : progressPct > 75 ? '#fbbf24' : 'linear-gradient(90deg, #818cf8, #6366f1)' }}
            />
          </div>
        </div>

        {/* Drinking Days */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-1 animate-slide-up glass-card"
          style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.18)', animationDelay: '0.08s' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#0f766e' }}>Days</p>
          <p className="text-[24px] font-black tracking-tight leading-none" style={{ color: drinkingDays > goals.maxDrinkingDays ? '#fbbf24' : '#34d399' }}>
            {drinkingDays}
          </p>
          <p className="text-[9px] font-semibold" style={{ color: '#134e4a' }}>of {goals.maxDrinkingDays}</p>
        </div>

        {/* Peak Day */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-1 animate-slide-up glass-card"
          style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.18)', animationDelay: '0.11s' }}
        >
          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#92400e' }}>Peak</p>
          {highestDay ? (
            <>
              <p className="text-[24px] font-black tracking-tight leading-none" style={{ color: '#fb923c' }}>
                {highestDay.total.toFixed(1)}
              </p>
              <p className="text-[9px] font-semibold" style={{ color: '#78350f' }}>{formatShortDate(new Date(highestDay.date + 'T12:00'))}</p>
            </>
          ) : (
            <>
              <p className="text-[24px] font-black tracking-tight leading-none" style={{ color: '#1e293b' }}>—</p>
              <p className="text-[9px] font-semibold" style={{ color: '#1e293b' }}>none yet</p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
