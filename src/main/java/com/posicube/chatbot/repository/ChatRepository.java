package com.posicube.chatbot.repository;

import com.posicube.chatbot.model.ChatRoom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import java.util.*;

@RequiredArgsConstructor
@Repository
public class ChatRepository {

    private Map<String, ChatRoom> roomMap;

    @PostConstruct
    private void init() {
        roomMap = new HashMap<>();
    }

    public String createRoom(String name) {
        ChatRoom newRoom = new ChatRoom(UUID.randomUUID().toString(), name);
        this.roomMap.put(newRoom.getId(), newRoom);
        return newRoom.getId();
    }

    public ChatRoom findRoomById(String id) {
        return roomMap.get(id);
    }

    public List<ChatRoom> findAllRooms() {
        return new ArrayList<>(roomMap.values());
    }

}
