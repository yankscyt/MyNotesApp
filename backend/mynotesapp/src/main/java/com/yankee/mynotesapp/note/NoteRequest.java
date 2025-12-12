package com.yankee.mynotesapp.note;

import lombok.Data;

@Data
public class NoteRequest {
    private String title;
    private String content;
    // We do NOT include the 'user' or 'id' fields here.
}