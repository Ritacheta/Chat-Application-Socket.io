import React, { Component } from "react";
import SideBar from "../sideBar/SideBar";
import {
  COMMUNITY_CHAT,
  MESSAGE_SENT,
  MESSAGE_RECIEVED,
  TYPING,
  PRIVATE_MESSAGE,
  USER_CONNECTED,
  USER_DISCONNECTED,
  NEW_CHAT_USER,
  IMAGE_SEND,
  IMAGE_RECIEVED,
} from "../../Events";
import ChatHeading from "./ChatHeading";
import Messages from "../messages/Messages";
import MessageInput from "../messages/MessageInput";
import { values, difference, differenceBy } from "lodash";

export default class ChatContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chats: [],
      users: [],
      activeChat: null,
    };
  }

  componentDidMount() {
    const { socket } = this.props;
    this.initSocket(socket);
  }

  componentWillUnmount() {
    const { socket } = this.props;
    socket.off(PRIVATE_MESSAGE);
    socket.off(USER_CONNECTED);
    socket.off(USER_DISCONNECTED);
    socket.off(NEW_CHAT_USER);
  }

  initSocket(socket) {
    socket.emit(COMMUNITY_CHAT, this.resetChat);
    socket.on(PRIVATE_MESSAGE, this.addChat);
    socket.on("connect", () => {
      socket.emit(COMMUNITY_CHAT, this.resetChat);
    });
    socket.on(USER_CONNECTED, (users) => {
      this.setState({ users: values(users) });
    });
    socket.on(USER_DISCONNECTED, (users) => {
      this.setState({ users: values(users) });
    });
    socket.on(NEW_CHAT_USER, this.addUserToChat);
  }

  sendOpenPrivateMessage = (reciever) => {
    const { socket, user } = this.props;
    const { activeChat } = this.state;
    socket.emit(PRIVATE_MESSAGE, { reciever, sender: user.name, activeChat });
  };

  addUserToChat = ({ chatId, newUser }) => {
    const { chats } = this.state;
    const newChats = chats.map((chat) => {
      if (chat.id === chatId) {
        let chat_curr = this.state.activeChat;
        chat_curr.name = chat_curr.name + " & " + newUser;
        this.setState({ activeChat: chat_curr });
        console.log(this.state);
        console.log(newUser);
        return Object.assign({}, chat, {
          users: [...chat.users, newUser],
          name: chat.name + " & " + newUser.name,
        });
      }
      return chat;
    });
    this.setState({ chats: newChats });
  };

  removeUserFromChat = (removedUsers) => {
    const { chats } = this.state;
    const newChats = chats.map((chat) => {
      let newUsers = difference(
        chat.users,
        removedUsers.map((u) => u.name)
      );
      return Object.assign({}, chat, { users: newUsers });
    });
    this.setState({ chats: newChats });
  };

  resetChat = (chat) => {
    return this.addChat(chat, true);
  };

  addChat = (chat, reset = false) => {
    const { socket } = this.props;
    const { chats } = this.state;

    const newChats = reset ? [chat] : [...chats, chat];
    this.setState({
      chats: newChats,
      activeChat: reset ? chat : this.state.activeChat,
    });

    const messageEvent = `${MESSAGE_RECIEVED}-${chat.id}`;
    const typingEvent = `${TYPING}-${chat.id}`;
    const imageEvent = `${IMAGE_RECIEVED}-${chat.id}`;

    socket.on(typingEvent, this.updateTypingInChat(chat.id));
    socket.on(messageEvent, this.addMessageToChat(chat.id));
    socket.on(imageEvent, this.addMessageToChat(chat.id));
  };

  addMessageToChat = (chatId) => {
    return (message) => {
      const { chats } = this.state;
      let newChats = chats.map((chat) => {
        if (chat.id === chatId) chat.messages.push(message);
        return chat;
      });

      this.setState({ chats: newChats });
    };
  };
  
  updateTypingInChat = (chatId) => {
    return ({ isTyping, user }) => {
      if (user !== this.props.user.name) {
        const { chats } = this.state;

        let newChats = chats.map((chat) => {
          if (chat.id === chatId) {
            if (isTyping && !chat.typingUsers.includes(user)) {
              chat.typingUsers.push(user);
            } else if (!isTyping && chat.typingUsers.includes(user)) {
              chat.typingUsers = chat.typingUsers.filter((u) => u !== user);
            }
          }
          return chat;
        });
        this.setState({ chats: newChats });
      }
    };
  };

  sendMessage = (chatId, message, Isimage) => {
    const { socket } = this.props;
    if (Isimage) {
      socket.emit(IMAGE_SEND, { chatId, message });
    } else {
      socket.emit(MESSAGE_SENT, { chatId, message });
    }
  };

  sendTyping = (chatId, isTyping) => {
    const { socket } = this.props;
    socket.emit(TYPING, { chatId, isTyping });
  };

  setActiveChat = (activeChat) => {
    this.setState({ activeChat });
  };
  render() {
    const { user, logout } = this.props;
    const { chats, activeChat, users } = this.state;
    return (
      <div className="container">
        <SideBar
          logout={logout}
          chats={chats}
          user={user}
          users={users}
          activeChat={activeChat}
          setActiveChat={this.setActiveChat}
          onSendPrivateMessage={this.sendOpenPrivateMessage}
        />
        <div className="chat-room-container">
          {activeChat !== null ? (
            <div className="chat-room">
              <ChatHeading name={activeChat.name} />
              <Messages
                messages={activeChat.messages}
                user={user}
                typingUsers={activeChat.typingUsers}
              />
              <MessageInput
                sendMessage={(message, Isimage) => {
                  this.sendMessage(activeChat.id, message, Isimage);
                }}
                sendTyping={(isTyping) => {
                  this.sendTyping(activeChat.id, isTyping);
                }}
              />
            </div>
          ) : (
            <div className="chat-room choose">
              <h3>Choose a chat!</h3>
            </div>
          )}
        </div>
      </div>
    );
  }
}
