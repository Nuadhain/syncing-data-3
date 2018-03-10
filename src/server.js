const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest);

console.log(`Listening on 127.0.0.1: ${port}`);

const io = socketio(app);

app.listen(port);

io.on('connect', (sock) => {
  const socket = sock;

  socket.join('room');

  socket.user = {
    hash: `${Math.floor(Math.random() * 100000)}${new Date().getTime()}`,
    lastUpdate: new Date().getTime(),
    x: Math.floor(Math.random() * 700),
    y: 50,
    prevX: 0,
    prevY: 0,
    destX: 0,
    destY: 0,
    alpha: 0,
    height: 50,
    width: 50,
  };

  socket.emit('joined', socket.user);

  socket.on('gravity', (data) => {
    socket.user = data;

    //if (socket.user.y <= 450) {
      socket.user.destY = socket.user.y + 2;
    //}

    io.sockets.in('room').emit('updatedMovement', socket.user);
  });

  socket.on('movePlayer', (data) => {
    socket.user = data;
    socket.user.lastUpdate = new Date().getTime();

    socket.broadcast.to('room').emit('updatedMovement', socket.user);
  });
});
