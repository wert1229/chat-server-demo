package com.posicube.chatbot.controller;

import com.posicube.chatbot.model.CreateRoomRequest;
import com.posicube.chatbot.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatService chatService;

    @PostMapping("/rooms")
    public ResponseEntity<?> createRoom(@RequestBody CreateRoomRequest request) {
        String id = chatService.createRoom(request.getName());
        // TEST
        return ResponseEntity.ok(id);
    }

    @GetMapping("/rooms")
    public ResponseEntity<?> getRooms() {
        return ResponseEntity.ok(chatService.getRooms());
    }
}
