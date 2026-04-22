package com.habittracker.habit_tracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "habit_logs")
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    private boolean completed;

    @ManyToOne
    @JoinColumn(name = "habit_id",
            foreignKey = @ForeignKey(name = "fk_habit_logs_habit"))
    private Habit habit;

    public HabitLog() {}

    public HabitLog(LocalDate date, boolean completed, Habit habit) {
        this.date      = date;
        this.completed = completed;
        this.habit     = habit;
    }

    public Long      getId()                         { return id; }
    public LocalDate getDate()                       { return date; }
    public void      setDate(LocalDate date)         { this.date = date; }
    public boolean   isCompleted()                   { return completed; }
    public void      setCompleted(boolean completed) { this.completed = completed; }
    public Habit     getHabit()                      { return habit; }
    public void      setHabit(Habit habit)           { this.habit = habit; }
}