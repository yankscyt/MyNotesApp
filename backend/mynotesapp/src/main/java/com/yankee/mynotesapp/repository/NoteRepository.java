// backend/mynotesapp/src/main/java/com/yankee/mynotesapp/note/NoteRepository.java

package com.yankee.mynotesapp.repository;

import com.yankee.mynotesapp.note.Note;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    // Custom query to find all notes belonging to a specific user
    List<Note> findByUserId(Long userId);
}