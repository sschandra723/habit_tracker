package com.habittracker.habit_tracker.controller;

import com.habittracker.habit_tracker.dto.HabitDTO;
import com.habittracker.habit_tracker.service.HabitService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    // POST /api/habits
    @PostMapping
    public ResponseEntity<HabitDTO> createHabit(@Valid @RequestBody HabitDTO dto,
                                                Authentication auth) {
        if (auth == null) throw new RuntimeException("User not authenticated");
        return ResponseEntity.ok(habitService.createHabit(dto, auth.getName()));
    }

    // GET /api/habits
    @GetMapping
    public ResponseEntity<List<HabitDTO>> getMyHabits(Authentication auth) {
        if (auth == null) throw new RuntimeException("User not authenticated");
        return ResponseEntity.ok(habitService.getHabitsForUser(auth.getName()));
    }

    // PUT /api/habits/{id}
    @PutMapping("/{id}")
    public ResponseEntity<HabitDTO> updateHabit(@PathVariable Long id,
                                                @Valid @RequestBody HabitDTO dto,
                                                Authentication auth) {
        return ResponseEntity.ok(habitService.updateHabit(id, dto, auth.getName()));
    }

    // PATCH /api/habits/{id}/constellation  body: { "constellation": "Orion" }
    @PatchMapping("/{id}/constellation")
    public ResponseEntity<HabitDTO> setConstellation(@PathVariable Long id,
                                                     @RequestBody Map<String, String> body,
                                                     Authentication auth) {
        String name = body.get("constellation");
        if (name == null || name.isBlank()) {
            throw new RuntimeException("constellation name is required");
        }
        return ResponseEntity.ok(habitService.setConstellation(id, name, auth.getName()));
    }

    // DELETE /api/habits/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable Long id,
                                            Authentication auth) {
        habitService.deleteHabit(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}