const { io } = require("socket.io-client");
const socket = io("http://localhost:5005");

socket.on("connect", () => {
    console.log("Socket Connected!");
});

socket.on("sizeStockUpdated", (data) => {
    console.log("SOCKET Event sizeStockUpdated ->", data);
});

socket.on("sizeUpdated", (data) => {
    console.log("SOCKET Event sizeUpdated ->", data);
});
