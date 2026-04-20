package com.habittracker.habit_tracker.controller;

import com.habittracker.habit_tracker.dto.HabitAnalyticsDTO;
import com.habittracker.habit_tracker.service.HabitLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class HabitLogController {

    @Autowired private HabitLogService habitLogService;

    /** Mark today as done (idempotent). */
    @PostMapping("/{habitId}/mark")
    public ResponseEntity<Map<String, String>> markHabit(
            @PathVariable Long habitId, Authentication auth) {
        return ResponseEntity.ok(Map.of("message",
                habitLogService.markHabit(habitId, auth.getName())));
    }

    /** Current streak + constellation name. */
    @GetMapping("/{habitId}/streak")
    public ResponseEntity<Map<String, Object>> getStreak(@PathVariable Long habitId) {
        return ResponseEntity.ok(habitLogService.getStreakWithConstellation(habitId));
    }

    /** ✅ FIXED: Was missing — Dashboard calls this to show best streak badge. */
    @GetMapping("/{habitId}/longest-streak")
    public ResponseEntity<Map<String, Integer>> getLongestStreak(@PathVariable Long habitId) {
        return ResponseEntity.ok(Map.of("Streak", habitLogService.getBestStreak(habitId)));
    }

    /** Calendar — returns ISO date strings "YYYY-MM-DD". */
    @GetMapping("/{habitId}/calendar")
    public ResponseEntity<List<String>> getCalendar(@PathVariable Long habitId) {
        return ResponseEntity.ok(habitLogService.getCalendarDatesAsStrings(habitId));
    }

    /** Weekly completed count for dashboard mini-bar. */
    @GetMapping("/{habitId}/weekly")
    public ResponseEntity<Map<String, Integer>> getWeekly(@PathVariable Long habitId) {
        return ResponseEntity.ok(Map.of(
                "totalDays", 7,
                "completedDays", habitLogService.getWeeklyCompletedDays(habitId)
        ));
    }

    /** Full analytics DTO — single call, all data computed in backend. */
    @GetMapping("/{habitId}/analytics")
    public ResponseEntity<HabitAnalyticsDTO> getAnalytics(@PathVariable Long habitId) {
        return ResponseEntity.ok(habitLogService.getAnalytics(habitId));
    }
}