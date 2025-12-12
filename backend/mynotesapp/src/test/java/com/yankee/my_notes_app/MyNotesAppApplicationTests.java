package com.yankee.mynotesapp; // ⬅️ Corrected package name (assuming all lowercase 'mynotesapp')

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// ⬅️ CRITICAL FIX: Explicitly point to the main application class
@SpringBootTest(classes = MyNotesAppApplication.class)
class MyNotesAppApplicationTests {

	@Test
	void contextLoads() {
	}

}