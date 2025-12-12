package com.yankee.mynotesapp.controller;

import com.yankee.mynotesapp.service.CardanoService;
import com.yankee.mynotesapp.cardano.CardanoTxRequest; // ⬅️ NEW IMPORT
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cardano")
public class CardanoController {

    @Autowired
    private CardanoService cardanoService;

    @GetMapping("/utxos")
    public ResponseEntity<?> getUTxOs(@RequestParam String address) {
        try {
            List<Map<String, Object>> utxos = cardanoService.getUTxOs(address);
            return ResponseEntity.ok(utxos);
        } catch (Exception e) {
            System.err.println("UTXO Fetch Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to fetch UTxOs", "error", e.getMessage()));
        }
    }

    // ⬅️ NEW ENDPOINT: Builds the raw transaction for the wallet to sign
    @PostMapping("/build-unsigned-tx")
    public ResponseEntity<?> buildTx(@RequestBody CardanoTxRequest request) {
        try {
            // Call the service to perform the complex transaction building
            String unsignedTxHex = cardanoService.buildUnsignedTransaction(
                    request.getSenderAddress(),
                    request.getRecipientAddress(),
                    request.getAmountAda());

            // Returns the raw CBOR hex of the unsigned transaction
            return ResponseEntity.ok(Map.of("unsignedTxHex", unsignedTxHex));
        } catch (UnsupportedOperationException e) {
            // This is the expected error until you implement the complex building logic in
            // the Service
            return ResponseEntity.status(501).body(
                    Map.of("message", "Transaction building not implemented on the server.", "error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Transaction Build Error: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Failed to build transaction", "error", e.getMessage()));
        }
    }

    @PostMapping("/submit-tx")
    public ResponseEntity<?> submitTx(@RequestBody Map<String, String> body) {
        String signedTxHex = body.get("signedTxHex");

        if (signedTxHex == null || signedTxHex.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Signed transaction hex is required."));
        }

        try {
            Map<String, Object> result = cardanoService.submitTransaction(signedTxHex);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Transaction Submission Error: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Failed to submit transaction", "error", e.getMessage()));
        }
    }
}