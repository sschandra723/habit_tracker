package com.habittracker.habit_tracker.service;

import com.habittracker.habit_tracker.entity.Habit;
import com.habittracker.habit_tracker.entity.HabitLog;
import com.habittracker.habit_tracker.repository.HabitLogRepository;
import com.habittracker.habit_tracker.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class HabitLogService {

    @Autowired
    private HabitLogRepository habitLogRepository;

    @Autowired
    private HabitRepository habitRepository;

    // ✅ Mark habit as done today
    public String markHabit(Long habitId, String email) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

        LocalDate today = LocalDate.now();

        if (habitLogRepository.existsByHabit_IdAndDate(habitId, today)) {
            return "Already marked today";
        }

        HabitLog log = new HabitLog();
        log.setHabit(habit);
        log.setDate(today);
        log.setCompleted(true);
        habitLogRepository.save(log);

        return "Habit marked!";
    }

    // ✅ NEW: Unmark habit for today (undo)
    public String unmarkHabit(Long habitId, String email) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

        LocalDate today = LocalDate.now();

        HabitLog log = habitLogRepository.findByHabit_IdAndDate(habitId, today)
                .orElseThrow(() -> new RuntimeException("No log found for today"));

        habitLogRepository.delete(log);
        return "Habit unmarked for today";
    }

    // ✅ Get all logs for a habit, newest first
    public List<HabitLog> getLogsByHabitId(Long habitId) {
        return habitLogRepository.findByHabit_IdOrderByDateDesc(habitId);
    }

    // ✅ Current streak — counts consecutive days ending today
    public int getStreak(Long habitId) {
        List<HabitLog> logs = habitLogRepository.findByHabit_IdOrderByDateDesc(habitId);

        int streak = 0;
        LocalDate today = LocalDate.now();

        for (HabitLog log : logs) {
            if (log.getDate().equals(today.minusDays(streak))) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // ✅ How many days completed in the last 7 days
    public int getWeeklyCompletedDays(Long habitId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        return habitLogRepository.findByHabit_IdAndDateBetween(habitId, weekStart, today).size();
    }

    // ✅ How many days completed this calendar month
    public int getMonthlyCompletedDays(Long habitId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        return habitLogRepository.findByHabit_IdAndDateBetween(habitId, startOfMonth, today).size();
    }

    // ✅ Longest ever streak
    public int getLongestStreak(Long habitId) {
        List<HabitLog> logs = habitLogRepository.findByHabit_IdOrderByDateDesc(habitId);

        if (logs.isEmpty()) return 0;

        int longest = 1;
        int current = 1;

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

    // ✅ All completed dates (for calendar view)
    public List<LocalDate> getCalendarDates(Long habitId) {
        return habitLogRepository.findByHabit_IdOrderByDateDesc(habitId)
                .stream()
                .map(HabitLog::getDate)
                .toList();
    }
    public List<LocalDate> getProgressPath(Long habitId) {
        return habitLogRepository
                .findByHabit_IdOrderByDateAsc(habitId)
                .stream()
                .map(HabitLog::getDate)
                .toList();
    }
}
