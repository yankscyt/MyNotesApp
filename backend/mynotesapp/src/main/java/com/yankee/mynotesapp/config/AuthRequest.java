// backend/mynotesapp/src/main/java/com/yankee/mynotesapp/auth/AuthRequest.java

package com.yankee.mynotesapp.auth;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {
    // Only these three fields are needed for registration/login DTO
    private String username;
    private String password;
    private String email;
}