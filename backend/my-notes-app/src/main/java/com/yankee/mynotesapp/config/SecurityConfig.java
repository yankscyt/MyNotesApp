// backend/src/main/java/com/yankee/mynotesapp/config/SecurityConfig.java

package com.yankee.mynotesapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1. Password Encoder Bean
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt is the standard, secure password hashing algorithm
        return new BCryptPasswordEncoder();
    }

    // 2. Security Filter Chain (Authorizes requests and defines session policy)
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless API
            .cors(cors -> cors.configure(http)) // Use the CorsFilter defined below
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Essential for JWT (no sessions)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints for authentication (Signup/Login)
                .requestMatchers("/api/auth/**").permitAll()
                // All other requests require authentication
                .anyRequest().authenticated()
            );

        // NOTE: We will add the JWT filter chain here on Day 2

        return http.build();
    }

    // 3. CORS Configuration (Allows Frontend to talk to Backend)
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allows requests from your React development server
        config.addAllowedOrigin("http://localhost:5173"); 
        
        // Allows all headers and methods
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        // Crucial for sending cookies/headers (like Authorization)
        config.setAllowCredentials(true); 

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}