package com.habittracker.habit_tracker.controller;

import com.habittracker.habit_tracker.dto.UserDTO;
import com.habittracker.habit_tracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // GET /api/users/me  — get logged-in user's profile
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getUserByEmail(auth.getName()));
    }
}
