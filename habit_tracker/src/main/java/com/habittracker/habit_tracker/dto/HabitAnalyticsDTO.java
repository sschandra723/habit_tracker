package com.habittracker.habit_tracker.dto;

import java.util.List;

/**
 * Single response object for all per-habit analytics.
 * Frontend only renders this — zero business logic needed in React.
 */
public class HabitAnalyticsDTO {

    private Long   habitId;
    private String name;
    private String description;

    // ─── Streaks ──────────────────────────────────────────────────────────────
    private int    currentStreak;
    private int    bestStreak;

    // ─── Weekly ───────────────────────────────────────────────────────────────
    private int            completedThisWeek;  // 0-7
    private int            weeklyPercentage;   // 0-100
    private List<DayData>  weeklyData;         // 7 entries, Sun→Sat or Mon→Sun

    // ─── Constellation (auto-derived, user goal stored in frontend) ───────────
    private String constellation;       // current milestone name or null
    private int    nextMilestoneDays;   // days needed for next constellation
    private String nextMilestoneName;   // next constellation name

    // ─── Nested DTO for each day in the weekly chart ─────────────────────────
    public static class DayData {
        private String  date;   // "2026-04-19"
        private String  day;    // "MON", "TUE" …
        private boolean done;

        public DayData(String date, String day, boolean done) {
            this.date = date; this.day = day; this.done = done;
        }
        public String getDate()  { return date; }
        public String getDay()   { return day; }
        public boolean isDone()  { return done; }
    }

    // ─── Getters & setters ────────────────────────────────────────────────────
    public Long   getHabitId()            { return habitId; }
    public void   setHabitId(Long v)      { habitId = v; }
    public String getName()               { return name; }
    public void   setName(String v)       { name = v; }
    public String getDescription()        { return description; }
    public void   setDescription(String v){ description = v; }
    public int    getCurrentStreak()      { return currentStreak; }
    public void   setCurrentStreak(int v) { currentStreak = v; }
    public int    getBestStreak()         { return bestStreak; }
    public void   setBestStreak(int v)    { bestStreak = v; }
    public int    getCompletedThisWeek()  { return completedThisWeek; }
    public void   setCompletedThisWeek(int v){ completedThisWeek = v; }
    public int    getWeeklyPercentage()   { return weeklyPercentage; }
    public void   setWeeklyPercentage(int v){ weeklyPercentage = v; }
    public List<DayData> getWeeklyData()  { return weeklyData; }
    public void   setWeeklyData(List<DayData> v){ weeklyData = v; }
    public String getConstellation()      { return constellation; }
    public void   setConstellation(String v){ constellation = v; }
    public int    getNextMilestoneDays()  { return nextMilestoneDays; }
    public void   setNextMilestoneDays(int v){ nextMilestoneDays = v; }
    public String getNextMilestoneName()  { return nextMilestoneName; }
    public void   setNextMilestoneName(String v){ nextMilestoneName = v; }
}