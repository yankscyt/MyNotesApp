package com.yankee.mynotesapp.model;

import lombok.Data;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;

@Entity
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Your email (username)
    @Column(unique = true, nullable = false)
    private String username;

    // Required
    @Column(nullable = false)
    private String password;

    // Optional for primary EVM wallet (MetaMask)
    @Column(length = 42, nullable = true)
    private String walletAddress;

    // ⬅️ CRITICAL FIX: NEW FIELD for Cardano/Secondary Wallet
    @Column(length = 100, nullable = true)
    private String secondaryWalletAddress;
}