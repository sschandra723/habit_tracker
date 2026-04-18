package com.habittracker.habit_tracker.controller;

import com.habittracker.habit_tracker.entity.HabitLog;
import com.habittracker.habit_tracker.service.HabitLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class HabitLogController {

    @Autowired
    private HabitLogService habitLogService;

    // POST /api/logs/{habitId}/mark  — mark today as done
    @PostMapping("/{habitId}/mark")
    public ResponseEntity<Map<String, String>> markHabit(@PathVariable Long habitId,
                                                         Authentication auth) {
        String result = habitLogService.markHabit(habitId, auth.getName());
        return ResponseEntity.ok(Map.of("message", result));
    }

    // DELETE /api/logs/{habitId}/mark  — undo today's mark
    @DeleteMapping("/{habitId}/mark")
    public ResponseEntity<Map<String, String>> unmarkHabit(@PathVariable Long habitId,
                                                           Authentication auth) {
        String result = habitLogService.unmarkHabit(habitId, auth.getName());
        return ResponseEntity.ok(Map.of("message", result));
    }

    // GET /api/logs/{habitId}/logs
    @GetMapping("/{habitId}/logs")
    public ResponseEntity<List<HabitLog>> getLogs(@PathVariable Long habitId) {
        return ResponseEntity.ok(habitLogService.getLogsByHabitId(habitId));
    }
    // GET /api/logs/{habitId}/streak
    @GetMapping("/{habitId}/streak")
    public ResponseEntity<Map<String, Integer>> getStreak(@PathVariable Long habitId) {
        return ResponseEntity.ok(Map.of("streak", habitLogService.getStreak(habitId)));
    }

    // GET /api/logs/{habitId}/weekly
    @GetMapping("/{habitId}/weekly")
    public ResponseEntity<Map<String, Integer>> getWeeklyProgress(@PathVariable Long habitId) {
        Map<String, Integer> response = new HashMap<>();
        response.put("totalDays", 7);
        response.put("completedDays", habitLogService.getWeeklyCompletedDays(habitId));
        return ResponseEntity.ok(response);
    }

    // GET /api/logs/{habitId}/monthly
    @GetMapping("/{habitId}/monthly")
    public ResponseEntity<Map<String, Integer>> getMonthlyProgress(@PathVariable Long habitId) {
        Map<String, Integer> response = new HashMap<>();
        response.put("completedDays", habitLogService.getMonthlyCompletedDays(habitId));
        return ResponseEntity.ok(response);
    }

    // GET /api/logs/{habitId}/longest-streak
    @GetMapping("/{habitId}/longest-streak")
    public ResponseEntity<Map<String, Integer>> getLongestStreak(@PathVariable Long habitId) {
        return ResponseEntity.ok(Map.of("Streak", habitLogService.getLongestStreak(habitId)));
    }

    // GET /api/logs/{habitId}/calendar
    @GetMapping("/{habitId}/calendar")
    public ResponseEntity<List<LocalDate>> getCalendar(@PathVariable Long habitId) {
        return ResponseEntity.ok(habitLogService.getCalendarDates(habitId));
    }
    @GetMapping("/{habitId}/progress-path")
    public ResponseEntity<List<LocalDate>> getProgressPath(@PathVariable Long habitId) {
        return ResponseEntity.ok(habitLogService.getProgressPath(habitId));
    }

    }

