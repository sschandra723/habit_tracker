package com.habittracker.habit_tracker.service;

import com.habittracker.habit_tracker.dto.HabitAnalyticsDTO;
import com.habittracker.habit_tracker.entity.Habit;
import com.habittracker.habit_tracker.entity.HabitLog;
import com.habittracker.habit_tracker.repository.HabitLogRepository;
import com.habittracker.habit_tracker.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class HabitLogService {

    @Autowired private HabitLogRepository habitLogRepository;
    @Autowired private HabitRepository    habitRepository;

    private static final int[]    MILESTONE_DAYS  = {3,7,10,14,21,30,45,60,90,120,150};
    private static final String[] MILESTONE_NAMES = {
            "Triangulum","Crux","Aries","Lyra","Cassiopeia",
            "Orion","Scorpius","Hercules","Perseus","Andromeda","Ophiuchus"
    };

    public static String constellationForStreak(int streak) {
        String result = null;
        for (int i = 0; i < MILESTONE_DAYS.length; i++) {
            if (streak >= MILESTONE_DAYS[i]) result = MILESTONE_NAMES[i];
            else break;
        }
        return result;
    }

    // ── Mark today (idempotent) ───────────────────────────────────────────────
    @Transactional
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

    // ── Current streak ────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public int getStreak(Long habitId) {
        List<HabitLog> logs = habitLogRepository.findByHabit_IdOrderByDateDesc(habitId);
        int streak = 0;
        LocalDate expected = LocalDate.now();
        for (HabitLog log : logs) {
            if (log.getDate().equals(expected)) { streak++; expected = expected.minusDays(1); }
            else break;
        }
        return streak;
    }

    // ── Best streak ───────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public int getBestStreak(Long habitId) {
        List<HabitLog> logs = habitLogRepository.findByHabit_IdOrderByDateDesc(habitId);
        if (logs.isEmpty()) return 0;
        int longest = 1, current = 1;
        for (int i = 1; i < logs.size(); i++) {
            if (logs.get(i-1).getDate().minusDays(1).equals(logs.get(i).getDate())) {
                current++; longest = Math.max(longest, current);
            } else { current = 1; }
        }
        return longest;
    }

    // ── Calendar: ISO date strings ────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<String> getCalendarDatesAsStrings(Long habitId) {
        return habitLogRepository.findByHabit_IdOrderByDateDesc(habitId)
                .stream()
                .map(log -> log.getDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .toList();
    }

    // ── Full analytics DTO ────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public HabitAnalyticsDTO getAnalytics(Long habitId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        LocalDate today  = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        List<HabitLog> allLogs = habitLogRepository.findByHabit_IdOrderByDateDesc(habitId);
        Set<String> doneDates = new HashSet<>();
        allLogs.forEach(l -> doneDates.add(l.getDate().format(fmt)));

        // Current streak
        int streak = 0;
        LocalDate expected = today;
        for (HabitLog log : allLogs) {
            if (log.getDate().equals(expected)) { streak++; expected = expected.minusDays(1); }
            else break;
        }

        // Best streak
        int best = allLogs.isEmpty() ? 0 : 1, cur = 1;
        for (int i = 1; i < allLogs.size(); i++) {
            if (allLogs.get(i-1).getDate().minusDays(1).equals(allLogs.get(i).getDate())) {
                cur++; best = Math.max(best, cur);
            } else { cur = 1; }
        }

        // Weekly data (last 7 days, oldest first)
        List<HabitAnalyticsDTO.DayData> weeklyData = new ArrayList<>();
        int completedThisWeek = 0;
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            boolean done = doneDates.contains(date.format(fmt));
            if (done) completedThisWeek++;
            weeklyData.add(new HabitAnalyticsDTO.DayData(
                    date.format(fmt),
                    date.getDayOfWeek().toString().substring(0, 3),
                    done));
        }

        // Next milestone
        int nextDays = 0; String nextName = null;
        for (int i = 0; i < MILESTONE_DAYS.length; i++) {
            if (streak < MILESTONE_DAYS[i]) {
                nextDays = MILESTONE_DAYS[i]; nextName = MILESTONE_NAMES[i]; break;
            }
        }

        HabitAnalyticsDTO dto = new HabitAnalyticsDTO();
        dto.setHabitId(habitId);
        dto.setName(habit.getName());
        dto.setDescription(habit.getDescription());
        dto.setCurrentStreak(streak);
        dto.setBestStreak(best);
        dto.setCompletedThisWeek(completedThisWeek);
        dto.setWeeklyPercentage(Math.round((completedThisWeek / 7.0f) * 100));
        dto.setWeeklyData(weeklyData);
        dto.setConstellation(constellationForStreak(streak));
        dto.setNextMilestoneDays(nextDays);
        dto.setNextMilestoneName(nextName);
        return dto;
    }

    // ── Streak + constellation for dashboard card ─────────────────────────────
    @Transactional(readOnly = true)
    public Map<String, Object> getStreakWithConstellation(Long habitId) {
        int streak = getStreak(habitId);
        Map<String, Object> result = new HashMap<>();
        result.put("habitId", habitId);
        result.put("streak",  streak);
        result.put("constellation", constellationForStreak(streak));
        return result;
    }

    // ── Weekly count for dashboard card ──────────────────────────────────────
    @Transactional(readOnly = true)
    public int getWeeklyCompletedDays(Long habitId) {
        LocalDate today = LocalDate.now();
        return habitLogRepository.findByHabit_IdAndDateBetween(
                habitId, today.minusDays(6), today).size();
    }
}