//frontend api calls
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userlist = document.getElementById("users");

//get usernaeme and room from URL
const {username , room} = Qs.parse(location.search , {
    ignoreQueryPrefix: true 
})


const socket = io();

//join chatroom
socket.emit('joinRoom' , {username , room})

//get room and users
socket.on('roomUsers' , ({room , users})=>{
    outputRoomName(room);
    outputUsers(users);
})

socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  //Scroll Down
    chatMessages.scrollTop = chatMessages.scrollHeight;

 
});

//Message submit

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log(e.target);
  const msg = e.target.elements.msg.value;

  //Emittimg a message to the server
  socket.emit("chatMessage", msg);

     //clear input
     e.target.elements.msg.value = "";
     e.target.elements.msg.focus();
});

const outputMessage = (message) => {
  const div = document.createElement("div");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
  ${message.text}
  </p>`;
  div.classList.add("message"); //adding inside div with class "message"
document.querySelector(".chat-messages").appendChild(div)
};


const outputRoomName= (room)=>{
    roomName.innerText = room;
}

const outputUsers= (users)=>{
    userlist.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`
}