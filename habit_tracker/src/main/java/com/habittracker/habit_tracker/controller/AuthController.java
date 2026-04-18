package com.habittracker.habit_tracker.controller;

import com.habittracker.habit_tracker.entity.User;
import com.habittracker.habit_tracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // POST /api/auth/signup
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody User user) {
        String result = authService.signup(user);
        return ResponseEntity.ok(Map.of("message", result));
    }

    // POST /api/auth/login → returns { accessToken, refreshToken }
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody User user) {
        Map<String, String> tokens = authService.login(user.getEmail(), user.getPassword());
        return ResponseEntity.ok(tokens);
    }

    // POST /api/auth/refresh  body: { "refreshToken": "..." }
    // → returns { "accessToken": "..." }
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("refreshToken is required");
        }
        String newAccessToken = authService.refresh(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }
}
