const io = require("./index.js").io;

const {
  VERIFY_USER,
  USER_CONNECTED,
  USER_DISCONNECTED,
  LOGOUT,
  COMMUNITY_CHAT,
  MESSAGE_RECIEVED,
  MESSAGE_SENT,
  TYPING,
  PRIVATE_MESSAGE,
  NEW_CHAT_USER,
  IMAGE_SEND,
  IMAGE_RECIEVED
} = require("../Events");

const { createUser, createMessage, createChat } = require("../Factories");

let connectedUsers = {};
let USERS ={};

let communityChat = createChat({ isCommunity: true });

module.exports = function (socket) {
  console.log('\x1bc'); //clears console
  console.log("Socket Id:" + socket.id);

  let sendMessageToChatFromUser;
  let sendImageToChatFromUser;
  let sendTypingFromUser;

  socket.on(VERIFY_USER, (nickname, password,callback) => {
    console.log(nickname)
    if (isUser(nickname)) {
      if(isConnected(nickname))
      {        
        callback({ isUser: true, user: USERS[nickname], error:"User already logged in" });
      }
      else{
        USERS[nickname].socketId = socket.id;
        callback({ isUser: true, user: USERS[nickname], error:"" });
      }
    } else {
      callback({
        isUser: false,
        user: createUser({ name: nickname, socketId: socket.id , password:password}),
      });
    }
  });

  //User Connects with username
  socket.on(USER_CONNECTED, (user) => {
    user.socketId = socket.id;
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user;

    sendMessageToChatFromUser = sendMessageToChat(user.name);
    sendTypingFromUser = sendTypingToChat(user.name);
    sendImageToChatFromUser = sendImageToChat(user.name);

    io.emit(USER_CONNECTED, connectedUsers);
    console.log(connectedUsers);
    console.log(USERS)
  });

  //User disconnects
  socket.on("disconnect", () => {
    if ("user" in socket) {
      connectedUsers = removeUser(connectedUsers, socket.user.name);

      io.emit(USER_DISCONNECTED, connectedUsers);
      console.log("Disconnect", connectedUsers);
    }
  });

  //User logsout
  socket.on(LOGOUT, () => {
    connectedUsers = removeUser(connectedUsers, socket.user.name);
    io.emit(USER_DISCONNECTED, connectedUsers);
    console.log("Disconnect", connectedUsers);
  });

  //Get Community Chat
  socket.on(COMMUNITY_CHAT, (callback) => {
    callback(communityChat);
  });

  socket.on(MESSAGE_SENT, ({ chatId, message }) => {
    sendMessageToChatFromUser(chatId, message);
  });

  socket.on(IMAGE_SEND, ({ chatId, message }) => {
    sendImageToChatFromUser(chatId, message);
  });

  socket.on(TYPING, ({ chatId, isTyping }) => {
    sendTypingFromUser(chatId, isTyping);
  });

  socket.on(PRIVATE_MESSAGE, ({ reciever, sender, activeChat }) => {
    if (reciever in connectedUsers) {
      const recieverSocket = connectedUsers[reciever].socketId;
      if (activeChat === null || activeChat.id === communityChat.id) {
        const newChat = createChat({
          name: `${reciever}&${sender}`,
          users: [reciever, sender],
        });
        socket.to(recieverSocket).emit(PRIVATE_MESSAGE, newChat);
        socket.emit(PRIVATE_MESSAGE, newChat);
      } else {
        if (!reciever in activeChat.users) {
          activeChat.users
            .filter((user) => user in connectedUsers)
            .map((user) => connectedUsers[user])
            .map((user) => {
              socket.to(user.socketId).emit(NEW_CHAT_USER, {
                chatId: activeChat.id,
                newUser: reciever,
              });
            });
          socket.emit(NEW_CHAT_USER, {
            chatId: activeChat.id,
            newUser: reciever,
          });
        }
        socket.to(recieverSocket).emit(PRIVATE_MESSAGE, activeChat);
      }
    }
  });
};

function sendTypingToChat(user) {
  return (chatId, isTyping) => {
    io.emit(`${TYPING}-${chatId}`, { user, isTyping });
  };
}

function sendMessageToChat(sender) {
  return (chatId, message) => {
    io.emit(
      `${MESSAGE_RECIEVED}-${chatId}`,
      createMessage({ message, sender })
    );
  };
}

function sendImageToChat(sender) {
  return (chatId, message) => {
    io.emit(
      `${IMAGE_RECIEVED}-${chatId}`,
      createMessage({ message, sender, isImage:true })
    );
  };
}

function addUser(userList, user) {
  let newList = Object.assign({}, userList);
  if(!isConnected(user.name)){
    newList[user.name] =  user 
  }
  if(!isUser(user.name)){
    let newL = Object.assign({}, USERS);
    newL[user.name] = user
    USERS=newL;
  }
  return newList;  
}

function removeUser(userList, username) {
  let newList = Object.assign({}, userList);
  delete newList[username];
  console.log("USERS")
  console.log(USERS)
  return newList;
}

function isUser(username) {
  return username in USERS;
}
function isConnected(username){
  return username in connectedUsers;
}