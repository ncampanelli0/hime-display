import { EventEmitter } from "events";
import { WebSocketServer } from "ws";
import http from "http";
import { logger } from "../core/Logger";

/**
 * API Server for external control of Live2D models
 * Supports both WebSocket and HTTP REST API
 * Perfect for AI integration (like Neuro-sama style projects)
 */
export class ApiServer extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      wsPort: config.wsPort || 8765,
      httpPort: config.httpPort || 8766,
      enabled: config.enabled !== false,
      ...config,
    };
    
    this.wsServer = null;
    this.httpServer = null;
    this.clients = new Set();
  }

  /**
   * Start both WebSocket and HTTP servers
   */
  start() {
    if (!this.config.enabled) {
      logger.info("[API Server] Disabled in config");
      return;
    }

    try {
      this.startWebSocketServer();
      this.startHttpServer();
      logger.info("[API Server] Started successfully");
    } catch (error) {
      logger.error("[API Server] Failed to start:", error);
      this.emit("error", error);
    }
  }

  /**
   * Start WebSocket server for real-time bidirectional communication
   */
  startWebSocketServer() {
    this.wsServer = new WebSocketServer({ port: this.config.wsPort });

    this.wsServer.on("listening", () => {
      logger.info(`[API Server] WebSocket listening on port ${this.config.wsPort}`);
      this.emit("ws-started", this.config.wsPort);
    });

    this.wsServer.on("connection", (ws, req) => {
      const clientIp = req.socket.remoteAddress;
      logger.info(`[API Server] WebSocket client connected from ${clientIp}`);
      this.clients.add(ws);

      // Send welcome message
      ws.send(JSON.stringify({
        type: "connection",
        status: "connected",
        message: "Connected to Hime Display API",
        timestamp: Date.now(),
      }));

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message, ws);
        } catch (error) {
          logger.error("[API Server] Failed to parse message:", error);
          ws.send(JSON.stringify({
            type: "error",
            message: "Invalid JSON format",
            error: error.message,
          }));
        }
      });

      ws.on("close", () => {
        this.clients.delete(ws);
        logger.info(`[API Server] WebSocket client disconnected from ${clientIp}`);
      });

      ws.on("error", (error) => {
        logger.error("[API Server] WebSocket error:", error);
      });
    });

    this.wsServer.on("error", (error) => {
      logger.error("[API Server] WebSocket server error:", error);
      this.emit("error", error);
    });
  }

  /**
   * Start HTTP server for REST API endpoints
   */
  startHttpServer() {
    this.httpServer = http.createServer((req, res) => {
      // Enable CORS
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const message = JSON.parse(body);
            this.handleMessage(message);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              status: "success",
              message: "Command received",
              timestamp: Date.now(),
            }));
          } catch (error) {
            logger.error("[API Server] HTTP request error:", error);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              status: "error",
              message: error.message,
            }));
          }
        });
      } else if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          status: "ok",
          timestamp: Date.now(),
        }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          status: "error",
          message: "Endpoint not found",
        }));
      }
    });

    this.httpServer.listen(this.config.httpPort, () => {
      logger.info(`[API Server] HTTP listening on port ${this.config.httpPort}`);
      this.emit("http-started", this.config.httpPort);
    });

    this.httpServer.on("error", (error) => {
      logger.error("[API Server] HTTP server error:", error);
      this.emit("error", error);
    });
  }

  /**
   * Handle incoming messages from WebSocket or HTTP
   */
  handleMessage(message, ws = null) {
    logger.info("[API Server] Received message:", message);

    // Validate message structure
    if (!message.action) {
      const error = "Message must contain an 'action' field";
      logger.warn("[API Server]", error);
      if (ws) {
        ws.send(JSON.stringify({ type: "error", message: error }));
      }
      return;
    }

    // Emit the message for the Application to handle
    this.emit("api-command", message);

    // Send acknowledgment if WebSocket
    if (ws) {
      ws.send(JSON.stringify({
        type: "ack",
        action: message.action,
        timestamp: Date.now(),
      }));
    }
  }

  /**
   * Broadcast message to all connected WebSocket clients
   */
  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(data);
      }
    });
  }

  /**
   * Stop all servers
   */
  stop() {
    if (this.wsServer) {
      this.wsServer.close(() => {
        logger.info("[API Server] WebSocket server stopped");
      });
    }

    if (this.httpServer) {
      this.httpServer.close(() => {
        logger.info("[API Server] HTTP server stopped");
      });
    }

    this.clients.clear();
  }
}
