package com.yankee.mynotesapp.auth;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {

    // Frontend sends:
    // username (email) and password
    private String username;
    private String password;

    // Helper: treat username as email for consistency
    public String getEmail() {
        return this.username;
    }
}
