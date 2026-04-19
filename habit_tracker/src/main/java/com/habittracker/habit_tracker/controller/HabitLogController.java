package com.habittracker.habit_tracker.controller;

import com.habittracker.habit_tracker.service.HabitLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class HabitLogController {

    @Autowired private HabitLogService habitLogService;

    // POST /api/logs/{habitId}/mark  — mark today as done (idempotent)
    @PostMapping("/{habitId}/mark")
    public ResponseEntity<Map<String, String>> markHabit(
            @PathVariable Long habitId, Authentication auth) {
        String result = habitLogService.markHabit(habitId, auth.getName());
        return ResponseEntity.ok(Map.of("message", result));
    }

    // ✅ GET /api/logs/{habitId}/streak  — streak + constellation (dynamically derived)
    @GetMapping("/{habitId}/streak")
    public ResponseEntity<Map<String, Object>> getStreak(@PathVariable Long habitId) {
        return ResponseEntity.ok(habitLogService.getStreakWithConstellation(habitId));
    }

    // GET /api/logs/{habitId}/longest-streak
    @GetMapping("/{habitId}/longest-streak")
    public ResponseEntity<Map<String, Integer>> getLongestStreak(@PathVariable Long habitId) {
        return ResponseEntity.ok(Map.of("Streak", habitLogService.getLongestStreak(habitId)));
    }

    // GET /api/logs/{habitId}/weekly
    @GetMapping("/{habitId}/weekly")
    public ResponseEntity<Map<String, Integer>> getWeekly(@PathVariable Long habitId) {
        return ResponseEntity.ok(Map.of(
                "totalDays", 7,
                "completedDays", habitLogService.getWeeklyCompletedDays(habitId)
        ));
    }

    // GET /api/logs/{habitId}/monthly
    @GetMapping("/{habitId}/monthly")
    public ResponseEntity<Map<String, Integer>> getMonthly(@PathVariable Long habitId) {
        return ResponseEntity.ok(Map.of(
                "completedDays", habitLogService.getMonthlyCompletedDays(habitId)
        ));
    }

    // GET /api/logs/{habitId}/calendar  — all completed dates
    @GetMapping("/{habitId}/calendar")
    public ResponseEntity<List<LocalDate>> getCalendar(@PathVariable Long habitId) {
        return ResponseEntity.ok(habitLogService.getCalendarDates(habitId));
    }

    // GET /api/logs/{habitId}/weekly-data  — for analytics chart
    @GetMapping("/{habitId}/weekly-data")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyData(@PathVariable Long habitId) {
        return ResponseEntity.ok(habitLogService.getWeeklyData(habitId));
    }
}