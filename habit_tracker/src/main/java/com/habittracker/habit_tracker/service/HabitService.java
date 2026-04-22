package com.habittracker.habit_tracker.service;

import com.habittracker.habit_tracker.dto.HabitDTO;
import com.habittracker.habit_tracker.entity.Habit;
import com.habittracker.habit_tracker.entity.User;
import com.habittracker.habit_tracker.repository.HabitLogRepository;
import com.habittracker.habit_tracker.repository.HabitRepository;
import com.habittracker.habit_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class HabitService {

    private final HabitRepository    habitRepository;
    private final UserRepository     userRepository;
    private final HabitLogRepository habitLogRepository;

    public HabitService(HabitRepository habitRepository,
                        UserRepository userRepository,
                        HabitLogRepository habitLogRepository) {
        this.habitRepository    = habitRepository;
        this.userRepository     = userRepository;
        this.habitLogRepository = habitLogRepository;
    }

    @Transactional
    public HabitDTO createHabit(HabitDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Habit habit = new Habit();
        habit.setName(dto.getName());
        habit.setDescription(dto.getDescription());
        habit.setUser(user);

        if (dto.getTargetConstellation() != null) {
            habit.setTargetConstellation(dto.getTargetConstellation());
            habit.setConstellationStartDate(
                    dto.getConstellationStartDate() != null
                            ? dto.getConstellationStartDate()
                            : LocalDate.now());
        }

        return convertToDTO(habitRepository.save(habit));
    }

    @Transactional(readOnly = true)
    public List<HabitDTO> getHabitsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return habitRepository.findByUser_Id(user.getId())
                .stream().map(this::convertToDTO).toList();
    }

    @Transactional
    public HabitDTO updateHabit(Long habitId, HabitDTO dto, String email) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));
        if (!habit.getUser().getEmail().equals(email))
            throw new RuntimeException("Access denied");
        if (dto.getName() != null && !dto.getName().isBlank())
            habit.setName(dto.getName());
        if (dto.getDescription() != null)
            habit.setDescription(dto.getDescription());
        return convertToDTO(habitRepository.save(habit));
    }

    @Transactional
    public HabitDTO setConstellation(Long habitId, String constellationName, String email) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));
        if (!habit.getUser().getEmail().equals(email))
            throw new RuntimeException("Access denied");
        habit.setTargetConstellation(constellationName);
        habit.setConstellationStartDate(LocalDate.now());
        return convertToDTO(habitRepository.save(habit));
    }

    /**
     * Delete habit + all its logs.
     *
     * @Transactional is REQUIRED — without it Spring has no open EntityManager
     * and deleteByHabit_Id throws "cannot reliably process 'remove' call".
     *
     * Because FIX_DATABASE.sql added ON DELETE CASCADE on the FK,
     * deleting the habit row will also auto-delete all its habit_logs in DB.
     * We still call deleteByHabit_Id first as a safety net for Hibernate's cache.
     */
    @Transactional
    public void deleteHabit(Long habitId, String email) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));
        if (!habit.getUser().getEmail().equals(email))
            throw new RuntimeException("Access denied");

        // Delete logs first (Hibernate level), then the habit
        habitLogRepository.deleteByHabit_Id(habitId);
        habitRepository.delete(habit);
    }

    public HabitDTO convertToDTO(Habit habit) {
        HabitDTO dto = new HabitDTO();
        dto.setId(habit.getId());
        dto.setName(habit.getName());
        dto.setDescription(habit.getDescription());
        if (habit.getUser() != null) dto.setUserId(habit.getUser().getId());
        dto.setTargetConstellation(habit.getTargetConstellation());
        dto.setConstellationStartDate(habit.getConstellationStartDate());
        return dto;
    }
}