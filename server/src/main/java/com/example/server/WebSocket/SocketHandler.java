package com.example.server.WebSocket;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class SocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(SocketHandler.class);

//    when you have to use and edit the common Arraylist in the same time. It will have a exception.
//    so you have to use CopyOnWriteArrayList
    List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
//    count message
    int messagecount = 0;
//    counrt session
    int sessionNumber = 0;

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message)
            throws InterruptedException, IOException {

//         parse message
        Map<String, String> value = new Gson().fromJson(message.getPayload(), Map.class);

//         start the service with the subscribe name
        if(value.keySet().contains("subscribe")) {
//            do something after subscribe


        } else if(value.keySet().contains("unsubscribe")) {
//             do something after unsubscribe
//             stop the service with the unsubscribe name or remove the session that unsubscribed
//             be careful not to stop the service if there are still sessions available

        } else {
            // do something with the sent object
            // add messageNumber
            if(value.get("type").equals("messageNumber")){
                messagecount++;
                value.put("messagecount", Integer.toString(messagecount));
            }
            // set connet number
            if(value.get("type").equals("message")){
                value.put("sessionNumber", Integer.toString(sessions.size()));
            }

            // send message to all sessions
            for (WebSocketSession webSocketSession : sessions) {
                webSocketSession.sendMessage(new TextMessage(new ObjectMapper().writeValueAsBytes(value)));
            }


        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // the messages will be broadcasted to all users.
        sessions.add(session);
        // ?
        super.afterConnectionEstablished(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // do something on connection closed
        sessions.remove(session);
        // ?
        super.afterConnectionClosed(session, status);
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        // handle binary message
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        // hanedle transport error
    }


}