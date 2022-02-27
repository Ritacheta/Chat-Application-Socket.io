const uuidv4 = require("uuid/v4");

/*
 *	createUser
 *	Creates a user.
 *	@prop id {string}
 *	@prop name {string}
 *	@param {object}
 *		name {string}
 */
const createUser = ({ name = "", socketId = null, password = "" } = {}) => ({
  id: uuidv4(),
  name,
  socketId,
  password
});

/*
 *	createMessage
 *	Creates a messages object.
 * 	@prop id {string}
 * 	@prop time {Date} the time in 24hr format i.e. 14:22
 * 	@prop message {string} actual string message
 * 	@prop sender {string} sender of the message
 *	@param {object}
 *		message {string}
 *		sender {string}
 */
const createMessage = ({ message = "", sender = "", isImage = false } = {}) => ({
  id: uuidv4(),
  time: getTime(new Date(Date.now())),
  message,
  sender,
  isImage
});

/*
 *	createChat
 *	Creates a Chat object
 * 	@prop id {string}
 * 	@prop name {string}
 * 	@prop messages {Array.Message}
 * 	@prop users {Array.string}
 *	@param {object}
 *		messages {Array.Message}
 *		name {string}
 *		users {Array.string}
 *
 */
const createChat = ({
  messages = [],
  name = "Community",
  users = [],
  isCommunity = false,
} = {}) => ({
  id: uuidv4(),
  name: isCommunity ? "Community" : createChatNameFromUsers(users),
  messages,
  users,
  typingUsers: [],
  isCommunity,
});
const createChatNameFromUsers = (users, excludedUser = "") => {
  return users.filter((u) => u !== excludedUser).join(" & ") || "Empty Users";
};

/*
 *	@param date {Date}
 *	@return a string represented in 24hr time i.e. '11:30', '19:30'
 */
const getTime = (date) => {
  return `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`;
};

module.exports = {
  createMessage,
  createChat,
  createUser,
  createChatNameFromUsers,
};
