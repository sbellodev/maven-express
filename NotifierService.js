const url = require("url");
const { Server } = require("ws");

class NotifierService {
  constructor() {
    this.connections = new Map();
  }

  connect(server) {
    this.server = new Server({ noServer: true });
    this.interval = setInterval(this.checkAll.bind(this), 10000);
    this.server.on("close", this.close.bind(this));
    this.server.on("connection", this.add.bind(this));
    server.on("upgrade", (request, socket, head) => {
      console.log("ws upgrade");
      const id = url.parse(request.url, true).query.storeId;

      if (id) {
        this.server.handleUpgrade(request, socket, head, (ws) =>
          this.server.emit("connection", id, ws)
        );
      } else {
        socket.destroy();
      }
    });
  }

  add(id, socket) {
    console.log("ws add");
    socket.isAlive = true;
    socket.on("pong", () => (socket.isAlive = true));
    socket.on("close", this.remove.bind(this, id));
    this.connections.set(id, socket);
  }

  send(id, message) {
    console.log("ws sending message");

    const connection = this.connections.get(id);

    connection.send(JSON.stringify(message));
  }

  broadcast(message) {
    console.log("ws broadcast");
    this.connections.forEach((connection) =>
      connection.send(JSON.stringify(message))
    );
  }

  isAlive(id) {
    return !!this.connections.get(id);
  }

  checkAll() {
    this.connections.forEach((connection) => {
      if (!connection.isAlive) {
        return connection.terminate();
      }

      connection.isAlive = false;
      connection.ping("");
    });
  }

  remove(id) {
    this.connections.delete(id);
  }

  close() {
    clearInterval(this.interval);
  }
}

module.exports = NotifierService;