package com.clothingstore.api.controller;

import com.clothingstore.api.dto.AuthResponse;
import com.clothingstore.api.dto.LoginRequest;
import com.clothingstore.api.dto.RegisterRequest;
import com.clothingstore.api.entity.User;
import com.clothingstore.api.repository.UserRepository;
import com.clothingstore.api.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole("CUSTOMER");

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getRole()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getRole()));
    }

}