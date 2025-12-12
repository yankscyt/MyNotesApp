// backend/mynotesapp/src/main/java/com/yankee/mynotesapp/config/CardanoConfig.java
package com.yankee.mynotesapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CardanoConfig {

    @Value("${blockfrost.api.key}")
    private String blockfrostApiKey;

    public String getBlockfrostApiKey() {
        return blockfrostApiKey;
    }
}
