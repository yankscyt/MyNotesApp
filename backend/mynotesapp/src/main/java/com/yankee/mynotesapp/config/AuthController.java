package com.yankee.mynotesapp.auth;

import com.yankee.mynotesapp.model.User;
import com.yankee.mynotesapp.config.JwtUtil;
import com.yankee.mynotesapp.repository.UserRepository;
import com.yankee.mynotesapp.config.CustomUserDetailsService;

import jakarta.annotation.security.PermitAll;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.*;

import org.springframework.dao.DataIntegrityViolationException;

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
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    // ----------------------------------------------------
    // SIGNUP (FIXED VERSION)
    // ----------------------------------------------------
    @PermitAll
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody AuthRequest request) {

        // Prevent null request
        if (request == null) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Invalid request payload");
            return new ResponseEntity<>(resp, HttpStatus.BAD_REQUEST);
        }

        // Normalize username (frontend uses “username” as email)
        String username = request.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = request.getEmail();
        }
        if (username != null)
            username = username.trim().toLowerCase();

        // Validate username
        if (username == null || username.isEmpty()) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Email is required");
            return new ResponseEntity<>(resp, HttpStatus.BAD_REQUEST);
        }

        // Validate password
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Password is required");
            return new ResponseEntity<>(resp, HttpStatus.BAD_REQUEST);
        }

        // Check if username already exists
        try {
            if (userRepository.existsByUsername(username)) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("message", "Email is already in use!");
                return new ResponseEntity<>(resp, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception ex) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Unable to validate username uniqueness");
            resp.put("error", ex.getMessage());
            return new ResponseEntity<>(resp, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Build user entity (set all NON NULLABLE FIELDS)
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // walletAddress is nullable so no need to set unless provided

        // Save
        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException dive) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Database constraint violation while registering user");
            resp.put("error",
                    dive.getMostSpecificCause() != null ? dive.getMostSpecificCause().getMessage() : dive.getMessage());
            return new ResponseEntity<>(resp, HttpStatus.CONFLICT);
        } catch (Exception e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Failed to register user");
            resp.put("error", e.getMessage());
            return new ResponseEntity<>(resp, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // OK response (frontend expects "message")
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ----------------------------------------------------
    // LOGIN
    // ----------------------------------------------------
    @PermitAll
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));
        } catch (Exception e) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Invalid username or password");
            return new ResponseEntity<>(resp, HttpStatus.UNAUTHORIZED);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Login successful");

        return ResponseEntity.ok(response);
    }
}
