import express from "express";
import http from "http";
import createGame from "./public/game.js";
import socketio from "socket.io";

const app = express();
const server = http.createServer(app);
const sockets = socketio(server);

app.use(express.static("public"));

const game = createGame();
game.start();

game.subscribe((command) => {
  //console.log(`> Emiting ${command.type}`);
  sockets.emit(command.type, command); //vai ficar atualizando
});

let maxConcurrentConnections = 10; //numero maximo de pessoas conectadas
setInterval(() => {
  sockets.emit("concurrent-connections", sockets.engine.clientsCount);
}, 5000);

sockets.on("connection", (socket) => {
  const admin = socket.handshake.query.admin;

  if (sockets.engine.clientsCount > maxConcurrentConnections && !admin) {
    // o admin nao obedecerá o limite máximo, porém eu nao defini nenhum adm
    socket.emit("show-max-concurrent-connections-message");
    socket.conn.close();
    return;
  } else {
    socket.emit("hide-max-concurrent-connections-message");
  }
  const playerId = socket.id;
  console.log(`> Player connected: ${playerId}`);

  game.addPlayer({ playerId: playerId });

  socket.emit("setup", game.state);

  socket.on("disconnect", () => {
    game.removePlayer({ playerId: playerId });
    console.log(`> Player disconnected: ${playerId}`);
  });

  socket.on("move-player", (command) => {
    command.playerId = playerId;
    command.type = "move-player";

    game.movePlayer(command);
  });

  socket.on("admin-concurrent-connections", (newConcurrentConnections) => {
    maxConcurrentConnections = newConcurrentConnections;
  });
});

server.listen(3000, () => {
  console.log(["> Server listening on port: 3000", "> http://localhost:3000/"]);
});
