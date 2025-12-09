// backend/mynotesapp/src/main/java/com/yankee/mynotesapp/MyNotesAppApplication.java

package com.yankee.mynotesapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean; // ADD THIS IMPORT
import org.springframework.web.servlet.config.annotation.CorsRegistry; // ADD THIS IMPORT
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer; // ADD THIS IMPORT

@SpringBootApplication
public class MyNotesAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(MyNotesAppApplication.class, args);
	}

	// ADD THIS CORS BEAN FOR UNIVERSAL ACCESS
	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**") // Apply to all endpoints
						.allowedOrigins("http://localhost:5173") // Allow your React frontend
						.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow all CRUD methods
						.allowedHeaders("*"); // Allow all headers
			}
		};
	}
}