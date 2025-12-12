package com.yankee.mynotesapp.config;

import com.yankee.mynotesapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

        @Autowired
        private UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {

                // ⬅️ FIX 1: Change findByEmail to findByUsername
                com.yankee.mynotesapp.model.User user = userRepository.findByUsername(usernameOrEmail)
                                .orElseThrow(
                                                () -> new UsernameNotFoundException(
                                                                "User not found with username/email: "
                                                                                + usernameOrEmail));

                // Define the authorities (roles) for the user
                List<GrantedAuthority> authorities = Collections.singletonList(
                                new SimpleGrantedAuthority("ROLE_USER"));

                return new org.springframework.security.core.userdetails.User(
                                // ⬅️ FIX 2: Change user.getEmail() to user.getUsername()
                                user.getUsername(),
                                user.getPassword(),
                                authorities);
        }
}