const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const apiRoutes = require("./routes.js");
const websocket = require("./sockets.js");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));


app.get("/api/about", (req, res) => {
  res.send("Node.js server is running!");
});


// API Routes
app.use("/api", apiRoutes);

const http = require("http");
const server = http.createServer(app);

// Attach WebSocket to HTTP server
websocket(server);

server.listen(5000, '0.0.0.0', () => {
  console.log("HTTP server running on http://localhost:5000");
});
