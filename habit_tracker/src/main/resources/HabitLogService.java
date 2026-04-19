package com.habittracker.habit_tracker.service;

import com.habittracker.habit_tracker.entity.Habit;
import com.habittracker.habit_tracker.entity.HabitLog;
import com.habittracker.habit_tracker.repository.HabitLogRepository;
import com.habittracker.habit_tracker.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HabitLogService {

    @Autowired private HabitLogRepository habitLogRepository;
    @Autowired private HabitRepository habitRepository;

    // ─── Constellation mapping (derived from streak, never stored) ────────────
    public static String constellationForStreak(int streak) {
        if (streak >= 150) return "Ophiuchus";
        if (streak >= 120) return "Andromeda";
        if (streak >= 90)  return "Perseus";
        if (streak >= 60)  return "Hercules";
        if (streak >= 45)  return "Scorpius";
        if (streak >= 30)  return "Orion";
        if (streak >= 21)  return "Cassiopeia";
        if (streak >= 14)  return "Lyra";
        if (streak >= 10)  return "Aries";
        if (streak >= 7)   return "Crux";
        if (streak >= 3)   return "Triangulum";
        return null; // No constellation yet
    }

    // ─── Mark today (idempotent — already marked = success, no error) ─────────
    public String markHabit(Long habitId, String email) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));
        if (!habit.getUser().getEmail().equals(email))
            throw new RuntimeException("Access denied");

        LocalDate today = LocalDate.now();
        if (habitLogRepository.existsByHabit_IdAndDate(habitId, today))
            return "Already marked today";

        HabitLog log = new HabitLog();
        log.setHabit(habit);
        log.setDate(today);
        log.setCompleted(true);
        habitLogRepository.save(log);
        return "Habit marked!";
    }

    // ─── Streak: count consecutive days ending today, calculated dynamically ──
    public int getStreak(Long habitId) {
        List<HabitLog> logs = habitLogRepository.findByHabit_IdOrderByDateDesc(habitId);
        int streak = 0;
        LocalDate expected = LocalDate.now();
        for (HabitLog log : logs) {
            if (log.getDate().equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else {
                break; // Gap found — streak ends
            }
        }
        return streak;
    }

    // ─── Streak + constellation in one response ───────────────────────────────
    public Map<String, Object> getStreakWithConstellation(Long habitId) {
        int streak = getStreak(habitId);
        String constellation = constellationForStreak(streak);
        Map<String, Object> result = new HashMap<>();
        result.put("habitId", habitId);
        result.put("streak", streak);
        result.put("constellation", constellation);
        return result;
    }

    // ─── Longest ever streak ──────────────────────────────────────────────────
    public int getLongestStreak(Long habitId) {
        List<HabitLog> logs = habitLogRepository.findByHabit_IdOrderByDateDesc(habitId);
        if (logs.isEmpty()) return 0;
        int longest = 1, current = 1;
        for (int i = 1; i < logs.size(); i++) {
            LocalDate prev = logs.get(i - 1).getDate();
            LocalDate curr = logs.get(i).getDate();
            if (prev.minusDays(1).equals(curr)) {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 1;
            }
        }
        return longest;
    }

    // ─── Weekly completions (last 7 days) ────────────────────────────────────
    public int getWeeklyCompletedDays(Long habitId) {
        LocalDate today = LocalDate.now();
        return habitLogRepository.findByHabit_IdAndDateBetween(
                habitId, today.minusDays(6), today).size();
    }

    // ─── Monthly completions (this calendar month) ────────────────────────────
    public int getMonthlyCompletedDays(Long habitId) {
        LocalDate today = LocalDate.now();
        return habitLogRepository.findByHabit_IdAndDateBetween(
                habitId, today.withDayOfMonth(1), today).size();
    }

    // ─── All completed dates (for calendar) ──────────────────────────────────
    public List<LocalDate> getCalendarDates(Long habitId) {
        return habitLogRepository.findByHabit_IdOrderByDateDesc(habitId)
                .stream().map(HabitLog::getDate).toList();
    }

    // ─── Analytics: per-habit weekly data (last 7 days with day labels) ───────
    public List<Map<String, Object>> getWeeklyData(Long habitId) {
        LocalDate today = LocalDate.now();
        List<LocalDate> doneDates = habitLogRepository
                .findByHabit_IdAndDateBetween(habitId, today.minusDays(6), today)
                .stream().map(HabitLog::getDate).toList();

        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Map<String, Object> day = new HashMap<>();
            day.put("date", date.toString());
            day.put("day", date.getDayOfWeek().toString().substring(0, 3));
            day.put("done", doneDates.contains(date));
            result.add(day);
        }
        return result;
    }
}