package com.yankee.mynotesapp.note;

import com.yankee.mynotesapp.model.User;
import com.yankee.mynotesapp.repository.NoteRepository;
import com.yankee.mynotesapp.repository.UserRepository;
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

    // ⬅️ CRITICAL FIX: Use NoteRequest DTO for creation
    @PostMapping
    public Note createNote(@RequestBody NoteRequest noteRequest) {
        User user = getCurrentUser();

        // 1. Create a new Note entity
        Note note = new Note();

        // 2. Map fields from the DTO
        note.setTitle(noteRequest.getTitle());
        note.setContent(noteRequest.getContent());

        // 3. Set the authenticated User object
        note.setUser(user);

        return noteRepository.save(note);
    }

    // PUT /api/notes/{id} - Update an existing note
    // ⬅️ OPTIONAL FIX: For PUT, you should also use a DTO if possible, but keeping
    // NoteDetails here for consistency
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note noteDetails) {
        User currentUser = getCurrentUser();

        return noteRepository.findById(id).<ResponseEntity<Note>>map(note -> {
            // Security check: ensure note belongs to the user (comparing IDs is safe)
            if (!note.getUser().getId().equals(currentUser.getId())) {
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
        User currentUser = getCurrentUser();

        return noteRepository.findById(id).<ResponseEntity<Void>>map(note -> {
            // Security check: ensure note belongs to the user (comparing IDs is safe)
            if (!note.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).build();
            }

            noteRepository.delete(note);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}