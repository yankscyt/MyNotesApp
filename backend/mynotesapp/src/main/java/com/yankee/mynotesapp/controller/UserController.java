package com.yankee.mynotesapp.controller;

import com.yankee.mynotesapp.model.User;
import com.yankee.mynotesapp.repository.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // DTO for linking wallet
    @Data
    public static class WalletLinkRequest {
        private String walletAddress;
    }

    @PostMapping("/link-wallet")
    public ResponseEntity<Map<String, Object>> linkWallet(
            @RequestBody WalletLinkRequest request,
            Principal principal) {

        Map<String, Object> response = new HashMap<>();

        String username = principal.getName();
        String wallet = request.getWalletAddress();

        if (wallet == null || wallet.trim().isEmpty()) {
            response.put("message", "Wallet address is required.");
            return ResponseEntity.badRequest().body(response);
        }

        // Log the action
        System.out.println("LOG: Linking wallet for user: " + username + " -> " + wallet);

        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setWalletAddress(wallet.trim());
            userRepository.save(user);

            response.put("message", "Wallet successfully linked.");
            response.put("walletAddress", wallet.trim());
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "User not found.");
            return ResponseEntity.status(404).body(response);
        }
    }
}
