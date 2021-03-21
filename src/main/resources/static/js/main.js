'use strict';

var usernamePage = document.querySelector('#username-page');
var roomPage = document.querySelector('#room-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var roomForm = document.querySelector('#roomForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var roomArea = document.querySelector('#roomArea');
var connectingElement = document.querySelector('.connecting');

var stompClient = null;
var username = null;
var roomname = null;
var roomList = null;
var roomId = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function setUsername(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        roomPage.classList.remove('hidden');
        getRoomList();
    }
    event.preventDefault();
}

function getRoomList() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() { // 요청에 대한 콜백함수
        if(xhr.readyState === xhr.DONE) { // 요청이 완료되면 실행
            if(xhr.status === 200 || xhr.status === 201) { // 응답 코드가 200 혹은 201
                console.log('data: ' + xhr.responseText);
                roomArea.innerHTML = '';
                roomList = JSON.parse(xhr.responseText);
                for (var room of roomList) {
                    var roomElement = document.createElement('li');
                    roomElement.classList.add('event-message');
                    var textElement = document.createElement('p');
                    var messageText = document.createTextNode(room.name);
                    textElement.appendChild(messageText);
                    roomElement.appendChild(textElement);

                    roomElement.addEventListener('click', connect, true);

                    roomArea.appendChild(roomElement);
                }
            } else {
                console.error('data: ' + xhr.responseText);
            }
        }
    };
    xhr.open('GET', '/rooms'); // http 메서드와 URL설정
    xhr.send();
}

function createRoom(event) {
    roomname = document.querySelector('#room').value.trim();

    if(roomname) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() { // 요청에 대한 콜백함수
            if(xhr.readyState === xhr.DONE) { // 요청이 완료되면 실행
                if(xhr.status === 200 || xhr.status === 201) { // 응답 코드가 200 혹은 201
                    getRoomList();
                } else {
                    console.error('data: ' + xhr.responseText);
                }
            }
        };
        xhr.open('POST', '/rooms'); // http 메서드와 URL설정
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify({ 'name': roomname }));

        document.querySelector('#room').value = '';
    }
    event.preventDefault();
}

function connect(event) {
    roomId = roomList[indexInParent(this)].id;
    roomPage.classList.add('hidden');
    chatPage.classList.remove('hidden');

    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
    // event.preventDefault();
}

function indexInParent(node) {
    var children = node.parentNode.childNodes;
    var num = 0;
    for (var i=0; i<children.length; i++) {
        if (children[i]==node) return num;
        if (children[i].nodeType==1) num++;
    }
    return -1;
}

function onConnected() {
    // Subscribe to the Public Topic
    console.log('roomId: ' + roomId);
    stompClient.subscribe('/sub/chat/rooms/' + roomId, onMessageReceived);

    // Tell your username to the server
    stompClient.send("/pub/chat/join/" + roomId,
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();

    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/pub/chat/message", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', setUsername, true)
roomForm.addEventListener('submit', createRoom, true)
messageForm.addEventListener('submit', sendMessage, true)
