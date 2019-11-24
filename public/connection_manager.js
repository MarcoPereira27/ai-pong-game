class ConnectionManager {
  constructor() {
    this.conn = null;
    this.peers = new Map();
  }

  connect(adress) {
    this.conn = new WebSocket(adress);

    this.conn.addEventListener("open", () => {
      console.log("connection estabilished");
      this.initSession();
    });

    this.conn.addEventListener("message", event => {
      console.log("Received message", event.data);
      this.receive(event.data);
    });
  }

  initSession() {
    const sessionId = window.location.hash.split("#")[1];
    if (sessionId) {
      this.send({
        type: "join-session",
        id: sessionId
      });
    } else {
      this.send({
        type: "create-session"
      });
    }
  }

  updateManager(peers) {
    // const me = peers.you;
    const clients = peers.clients;

    clients.forEach(id => {
      if (!this.peers.has(id)) {
        this.peers.set(id, pong);
      }
    });
  }

  receive(msg) {
    const data = JSON.parse(msg);
    if (data.type === "session-created") {
      window.location.hash = data.id;
    } else if (data.type === "session-broadcast") {
      this.updateManager(data.peers);
    }
  }

  send(data) {
    const msg = JSON.stringify(data);
    console.log(`Sending message ${msg}`);
    this.conn.send(msg);
  }
}
