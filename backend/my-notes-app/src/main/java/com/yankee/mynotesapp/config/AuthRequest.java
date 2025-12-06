// backend/src/main/java/com/yankee/mynotesapp/auth/AuthRequest.java

package com.yankee.mynotesapp.auth;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String email;
    private String password;
}