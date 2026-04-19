package com.habittracker.habit_tracker.controller;

import com.habittracker.habit_tracker.dto.UserDTO;
import com.habittracker.habit_tracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // GET /api/users/me
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getUserByEmail(auth.getName()));
    }

    // PATCH /api/users/me  body: { "name": "New Name" }
    @PatchMapping("/me")
    public ResponseEntity<UserDTO> updateMyProfile(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        String newName = body.get("name");
        if (newName == null || newName.isBlank()) {
            throw new RuntimeException("Name cannot be empty");
        }
        return ResponseEntity.ok(userService.updateName(auth.getName(), newName.trim()));
    }
}