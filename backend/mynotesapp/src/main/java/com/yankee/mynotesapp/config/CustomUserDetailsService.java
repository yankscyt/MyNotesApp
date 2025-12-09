// backend/mynotesapp/src/main/java/com/yankee/mynotesapp/config/CustomUserDetailsService.java

package com.yankee.mynotesapp.config;

import com.yankee.mynotesapp.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {

        // FIX: The incoming argument is the email/username used for login.
        // We need to try finding the user by that field.

        // Assuming your UserRepository has a findByUsername method that searches by the
        // email field
        com.yankee.mynotesapp.user.User user = userRepository.findByUsername(usernameOrEmail)
                .orElseThrow(
                        () -> new UsernameNotFoundException("User not found with username/email: " + usernameOrEmail));

        // Converts our custom User entity to Spring Security's UserDetails interface
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), // This is the field Spring Security uses internally
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole())));
    }
}