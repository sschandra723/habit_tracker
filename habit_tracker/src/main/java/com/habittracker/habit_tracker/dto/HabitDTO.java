package com.habittracker.habit_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class HabitDTO {

    private Long id;

    @NotBlank(message = "Habit name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @Size(max = 255, message = "Description can be at most 255 characters")
    private String description;

    private Long userId;

    // ── Constellation fields ──────────────────────────────────────────────
    private String targetConstellation;
    private LocalDate constellationStartDate;

    public HabitDTO() {}

    public HabitDTO(Long id, String name, String description, Long userId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.userId = userId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTargetConstellation() { return targetConstellation; }
    public void setTargetConstellation(String targetConstellation) { this.targetConstellation = targetConstellation; }

    public LocalDate getConstellationStartDate() { return constellationStartDate; }
    public void setConstellationStartDate(LocalDate constellationStartDate) { this.constellationStartDate = constellationStartDate; }
}