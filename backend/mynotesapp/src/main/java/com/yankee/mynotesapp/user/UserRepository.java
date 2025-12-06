// backend/mynotesapp/src/main/java/com/yankee/mynotesapp/user/UserRepository.java

package main.java.com.yankee.mynotesapp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Custom method to find a user by username for login
    Optional<User> findByUsername(String username);

    // Custom method to check if a user exists by email for registration
    boolean existsByEmail(String email);
}