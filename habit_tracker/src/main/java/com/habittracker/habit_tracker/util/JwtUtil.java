package com.habittracker.habit_tracker.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    // Access token: 15 minutes
    private final long ACCESS_TOKEN_EXPIRY = 1000L * 60 * 15;

    // Refresh token: 7 days
    private final long REFRESH_TOKEN_EXPIRY = 1000L * 60 * 60 * 24 * 7;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email) {
        return buildToken(email, ACCESS_TOKEN_EXPIRY, "access");
    }

    // ✅ NEW: generate a long-lived refresh token
    public String generateRefreshToken(String email) {
        return buildToken(email, REFRESH_TOKEN_EXPIRY, "refresh");
    }

    private String buildToken(String email, long expiry, String type) {
        return Jwts.builder()
                .setSubject(email)
                .claim("type", type)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiry))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ✅ NEW: check claim type so refresh tokens can't be used as access tokens
    public boolean isRefreshToken(String token) {
        try {
            String type = (String) Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("type");
            return "refresh".equals(type);
        } catch (Exception e) {
            return false;
        }
    }
}
