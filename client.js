var io = require("socket.io-client");
var socket = io.connect("http://localhost:3005", {
  secure: false,
  transports: ["websocket"],
  "reconnection delay": 2000,
  "force new connection": true,
});
socket.on("connect", function () {
  console.log("User Connected");
});

socket.on("graphData", function (data) {
  console.log(data);
});
socket.on("disconnect", function () {
  console.log("Disconnected from server");
});
