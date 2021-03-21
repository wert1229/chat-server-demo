package com.posicube.chatbot.controller;

import com.posicube.chatbot.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@RequiredArgsConstructor
@Slf4j
@Controller
public class ChatController {

    private final SimpMessageSendingOperations messagingTemplate;

    @MessageMapping("/chat/join/{roomId}")
    public void joinRoom(@Payload ChatMessage chatMessage,
                                @DestinationVariable String roomId,
                                SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("roomId", roomId);
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        chatMessage.setContent(chatMessage.getSender() + " 님이 입장했습니다.");
        messagingTemplate.convertAndSend("/sub/chat/rooms/" + roomId, chatMessage);
    }

    @MessageMapping("/chat/message")
    public void sendMessage(@Payload ChatMessage chatMessage,
                            SimpMessageHeaderAccessor headerAccessor) {
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");

        // Do something

        messagingTemplate.convertAndSend("/sub/chat/rooms/" + roomId, chatMessage);
    }
}
