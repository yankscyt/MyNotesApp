// backend/mynotesapp/src/main/java/com/yankee/mynotesapp/auth/AuthController.java (COMPLETE CODE)

package com.yankee.mynotesapp.auth;

import com.yankee.mynotesapp.config.JwtUtil; // IMPORT 1: JWT Utility
import com.yankee.mynotesapp.config.CustomUserDetailsService; // IMPORT 2: User Details Service
import com.yankee.mynotesapp.user.User;
import com.yankee.mynotesapp.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager; // IMPORT 3: Authentication Manager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager; // Inject Authentication Manager

    @Autowired
    private JwtUtil jwtUtil; // Inject JWT Util

    @Autowired
    private CustomUserDetailsService userDetailsService; // Inject User Details Service

    // --- 1. SIGNUP Endpoint ---
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest request) {
        // 1. Basic validation
        if (userRepository.existsByEmail(request.getEmail())) {
            return new ResponseEntity<>("Email is already in use!", HttpStatus.BAD_REQUEST);
        }

        // For simplicity, we use email as the username for login in this MVP
        if (request.getUsername() == null || request.getUsername().isEmpty()) {
            request.setUsername(request.getEmail());
        }

        // 2. Create User Entity
        User user = new User(
                null,
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()), // Hash the password
                "ROLE_USER");

        // 3. Save to database
        userRepository.save(user);

        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }

    // --- 2. LOGIN Endpoint ---
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest request) {
        try {
            // 1. Authenticate credentials using the AuthenticationManager
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (Exception e) {
            // Authentication failed
            return new ResponseEntity<>("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        // 2. Load UserDetails to generate token
        final UserDetails userDetails = userDetailsService
                .loadUserByUsername(request.getUsername());

        // 3. Generate JWT
        final String token = jwtUtil.generateToken(userDetails);

        // 4. Return token in a clean JSON object
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);

        return ResponseEntity.ok(response);
    }
}