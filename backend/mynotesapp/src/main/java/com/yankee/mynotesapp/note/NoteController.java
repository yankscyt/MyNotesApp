// backend/mynotesapp/src/main/java/com/yankee/mynotesapp/note/NoteController.java

package com.yankee.mynotesapp.note;

import com.yankee.mynotesapp.user.User;
import com.yankee.mynotesapp.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper to get the current authenticated user from the JWT
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    // GET /api/notes - Retrieve all notes for the authenticated user
    @GetMapping
    public List<Note> getAllNotes() {
        User user = getCurrentUser();
        return noteRepository.findByUserId(user.getId());
    }

    // POST /api/notes - Create a new note
    @PostMapping
    public Note createNote(@RequestBody Note note) {
        User user = getCurrentUser();
        note.setUser(user);
        return noteRepository.save(note);
    }

    // PUT /api/notes/{id} - Update an existing note
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note noteDetails) {
        return noteRepository.findById(id).<ResponseEntity<Note>>map(note -> {
            // Security check: ensure note belongs to the user
            if (!note.getUser().equals(getCurrentUser())) {
                return ResponseEntity.status(403).build();
            }

            note.setTitle(noteDetails.getTitle());
            note.setContent(noteDetails.getContent());
            return ResponseEntity.ok(noteRepository.save(note));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/notes/{id} - Delete a note
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        return noteRepository.findById(id).<ResponseEntity<Void>>map(note -> {
            // Security check: ensure note belongs to the user
            if (!note.getUser().equals(getCurrentUser())) {
                return ResponseEntity.status(403).build();
            }

            noteRepository.delete(note);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}