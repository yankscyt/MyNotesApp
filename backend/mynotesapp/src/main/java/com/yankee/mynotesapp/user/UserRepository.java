package com.yankee.mynotesapp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; // Ensure this is imported

public interface UserRepository extends JpaRepository<User, Long> {

    // Existing: Used for login lookup
    Optional<User> findByUsername(String username);

    // NEW: Add this missing method for signup validation
    Boolean existsByEmail(String email);
}