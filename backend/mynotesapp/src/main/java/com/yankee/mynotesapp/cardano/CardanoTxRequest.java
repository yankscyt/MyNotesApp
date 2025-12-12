package com.yankee.mynotesapp.cardano;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardanoTxRequest {
    // The address currently connected in the user's wallet
    private String senderAddress;

    // The target address (for the "Send to Self" assignment, this will be the same
    // as senderAddress)
    private String recipientAddress;

    // The amount the user wants to send, specified in ADA (e.g., 1.5)
    private double amountAda;
}