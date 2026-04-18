package com.habittracker.habit_tracker.repository;

import com.habittracker.habit_tracker.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {

    List<HabitLog> findByHabit_Id(Long habitId);

    List<HabitLog> findByHabit_IdAndDateBetween(Long habitId, LocalDate start, LocalDate end);

    List<HabitLog> findByHabit_IdOrderByDateDesc(Long habitId);
    List<HabitLog> findByHabit_IdOrderByDateAsc(Long habitId);
    List<HabitLog> findByHabitIdOrderByDateDesc(Long habitId);
    boolean existsByHabit_IdAndDate(Long habitId, LocalDate date);

    // ✅ NEW: needed for unmark
    Optional<HabitLog> findByHabit_IdAndDate(Long habitId, LocalDate date);

    // ✅ NEW: needed for cascade delete when a habit is deleted
    void deleteByHabit_Id(Long habitId);

}
