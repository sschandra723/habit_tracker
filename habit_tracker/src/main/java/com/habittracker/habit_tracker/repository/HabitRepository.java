package com.habittracker.habit_tracker.repository;

import com.habittracker.habit_tracker.entity.Habit;
import com.habittracker.habit_tracker.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;


public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUser_Id(Long userId);

}