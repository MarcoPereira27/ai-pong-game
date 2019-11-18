var express = require("express");

var app = express();
var server = app.listen(3000);

app.use(express.static("public"));

console.log("My socket server is running bro");

var socket = require("socket.io");

var io = socket(server);

io.sockets.on("connection", newConnection);

var clientNumber = {
  number: io.engine.clientsCount
};

function newConnection(socket) {
  console.log("new connection: " + socket.id);
  console.log(io.engine.clientsCount);

  socket.broadcast.emit("clientNumber", clientNumber);
}
