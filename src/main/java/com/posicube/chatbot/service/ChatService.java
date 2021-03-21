package com.posicube.chatbot.service;

import com.posicube.chatbot.model.ChatRoom;
import com.posicube.chatbot.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;

    public String createRoom(String name) {
        return chatRepository.createRoom(name);
    }

    public List<ChatRoom> getRooms() {
        return chatRepository.findAllRooms();
    }
}
