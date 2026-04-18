package com.habittracker.habit_tracker.service;

import com.habittracker.habit_tracker.dto.HabitDTO;
import com.habittracker.habit_tracker.entity.Habit;
import com.habittracker.habit_tracker.entity.HabitLog;
import com.habittracker.habit_tracker.entity.User;
import com.habittracker.habit_tracker.repository.HabitLogRepository;
import com.habittracker.habit_tracker.repository.HabitRepository;
import com.habittracker.habit_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class HabitService {

    private final HabitRepository habitRepository;
    private final UserRepository userRepository;
    private final HabitLogRepository habitLogRepository;
    private CurrentUserService currentUserService;

    public HabitService(HabitRepository habitRepository,
                        UserRepository userRepository,
                        HabitLogRepository habitLogRepository,
                        CurrentUserService currentUserService) {
        this.habitRepository = habitRepository;
        this.userRepository = userRepository;
        this.habitLogRepository = habitLogRepository;
        this.currentUserService = currentUserService;
    }

    // ✅ Create habit scoped to logged-in user
    public HabitDTO createHabit(HabitDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Habit habit = new Habit();
        habit.setName(dto.getName());
        habit.setDescription(dto.getDescription());
        habit.setUser(user);

        // Persist constellation fields if provided on creation
        if (dto.getTargetConstellation() != null) {
            habit.setTargetConstellation(dto.getTargetConstellation());
            habit.setConstellationStartDate(
                    dto.getConstellationStartDate() != null
                            ? dto.getConstellationStartDate()
                            : LocalDate.now()
            );
        }

        return convertToDTO(habitRepository.save(habit));
    }

    // ✅ Get only the logged-in user's habits
    public List<HabitDTO> getHabitsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return habitRepository.findByUser_Id(user.getId())
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // ✅ Update habit name / description (owner-checked)
    public HabitDTO updateHabit(Long habitId, HabitDTO dto, String email) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

        if (dto.getName() != null && !dto.getName().isBlank()) {
            habit.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            habit.setDescription(dto.getDescription());
        }

        return convertToDTO(habitRepository.save(habit));
    }

    // ✅ Set or change the constellation target (owner-checked)
    public HabitDTO setConstellation(Long habitId, String constellationName, String email) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

        habit.setTargetConstellation(constellationName);
        // Reset start date to today when a new constellation is chosen
        habit.setConstellationStartDate(LocalDate.now());

        return convertToDTO(habitRepository.save(habit));
    }

    // ✅ Delete habit and all its logs (owner-checked)
    public void deleteHabit(Long habitId, String email) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

        habitLogRepository.deleteByHabit_Id(habitId);
        habitRepository.delete(habit);
    }

    public String markHabit(Long habitId) {
        User user = currentUserService.getCurrentUser();

        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (habitLogRepository.existsByHabit_IdAndDate(habitId, LocalDate.now())) {
            return "Already marked today";
        }

        HabitLog log = new HabitLog();
        log.setHabit(habit);
        log.setDate(LocalDate.now());
        habitLogRepository.save(log);

        return "Habit marked!";
    }

    public HabitDTO convertToDTO(Habit habit) {
        HabitDTO dto = new HabitDTO();
        dto.setId(habit.getId());
        dto.setName(habit.getName());
        dto.setDescription(habit.getDescription());
        if (habit.getUser() != null) {
            dto.setUserId(habit.getUser().getId());
        }
        // ── Constellation fields ──
        dto.setTargetConstellation(habit.getTargetConstellation());
        dto.setConstellationStartDate(habit.getConstellationStartDate());
        return dto;
    }

    public List<HabitDTO> getAllHabits() {
        return habitRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }
}