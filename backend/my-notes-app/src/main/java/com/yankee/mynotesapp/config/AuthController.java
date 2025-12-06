// backend/src/main/java/com/yankee/mynotesapp/auth/AuthController.java

package com.yankee.mynotesapp.auth;

import com.yankee.mynotesapp.user.User;
import com.yankee.mynotesapp.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
                "ROLE_USER"
        );

        // 3. Save to database
        userRepository.save(user);

        // NOTE: We will return a JWT token here on Day 2

        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }
}