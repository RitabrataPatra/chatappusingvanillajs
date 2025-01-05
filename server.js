const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const express = require("express");
const formatMessage = require("./utils/messages");
const {userJoin , getCurrentUser , userLeave , getRoomUsers} = require("./utils/users");

const app = express();
const server = http.createServer(app);

const io = socketio(server);
const botName = "ChatCord Bot";
//set static folder

app.use(express.static(path.join(__dirname, "public")));

//run when a client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);


    //Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord")); //broadcast to a single client

    //brodcast when a user connects and emit to a specific room
    socket.broadcast.to(user.room).emit(
      "message",
      formatMessage(botName, `${user.username} has joined the chat`)
    ); //will send to all the client except the user

    //Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  });

  //Listen for chat messages
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // runs when client disconnects
  socket.on("disconnect", () => {
    const leftUser = userLeave(socket.id);
    if (leftUser) {
     //will send "a user has left the chat" to all the clients connected
    io.to(leftUser.room).emit("message", formatMessage(botName,  `${leftUser.username} has left the chat`));
    }

    //send users and room info after disconnect
    io.to(leftUser.room).emit("roomUsers", {
      room: leftUser.room,
      users: getRoomUsers(leftUser.room),
    })
   
  });

  // io.emit() //will send broadcast to all clients in general
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on ${PORT}`));
