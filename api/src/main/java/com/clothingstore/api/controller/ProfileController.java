package com.clothingstore.api.controller;

import com.clothingstore.api.dto.*;
import com.clothingstore.api.entity.User;
import com.clothingstore.api.repository.UserRepository;
import com.clothingstore.api.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @GetMapping
    public UserResponse getProfile(Authentication auth) {
        User user = getUser(auth);
        return UserResponse.from(user);
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(Authentication auth, @RequestBody UserResponse request) {
        User user = getUser(auth);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        userRepository.save(user);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication auth, @Valid @RequestBody ChangePasswordRequest request) {
        User user = getUser(auth);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok().body("Password updated");
    }

    @PostMapping("/change-email")
    public ResponseEntity<?> changeEmail(Authentication auth, @Valid @RequestBody ChangeEmailRequest request) {
        User user = getUser(auth);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Current password is incorrect");
        }

        if (userRepository.existsByEmail(request.getNewEmail())) {
            return ResponseEntity.badRequest().body("Email already in use");
        }

        user.setEmail(request.getNewEmail());
        userRepository.save(user);

        // Issue a fresh token — the old one has the previous email embedded as the subject
        String newToken = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(newToken, user.getEmail(), user.getRole()));
    }

    private User getUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

}