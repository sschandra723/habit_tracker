package com.habittracker.habit_tracker.service;

import com.habittracker.habit_tracker.entity.User;
import com.habittracker.habit_tracker.repository.UserRepository;
import com.habittracker.habit_tracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public String signup(User user) {

        // ✅ Manual validation — clear error messages
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (!user.getEmail().contains("@")) {
            throw new RuntimeException("Invalid email format");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }
        if (user.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User registered!";
    }

    public Map<String, String> login(String email, String password) {

        if (email == null || email.isBlank()) throw new RuntimeException("Email is required");
        if (password == null || password.isBlank()) throw new RuntimeException("Password is required");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return Map.of(
                "accessToken", jwtUtil.generateToken(email),
                "refreshToken", jwtUtil.generateRefreshToken(email)
        );
    }

    public String refresh(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }
        String email = jwtUtil.extractEmail(refreshToken);
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return jwtUtil.generateToken(email);
    }
}