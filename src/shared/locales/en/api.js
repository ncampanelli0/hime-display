export default {
  // Menu
  api: "API",

  // Status
  status: "API Status",
  running: "API Server Running",
  stopped: "API Server Stopped",
  enableToStart: "Enable API in configuration to start the server",

  // Configuration
  configuration: "Configuration",
  enableApi: "Enable API Server",
  enableApiDesc: "Allow external control of Live2D models via WebSocket and HTTP",
  wsPort: "WebSocket Port",
  wsPortDesc: "Port for WebSocket connections (real-time bidirectional communication)",
  httpPort: "HTTP Port",
  httpPortDesc: "Port for HTTP REST API (simple one-way requests)",
  restartRequired: "Restart application to apply port changes",

  // Quick Actions
  quickActions: "Quick Actions",
  testConnection: "Test Connection",
  copyWebSocketUrl: "Copy WebSocket URL",
  copyHttpUrl: "Copy HTTP URL",
  openDocumentation: "Open Documentation",
  connectionSuccess: "API connection successful!",
  connectionFailed: "Failed to connect to API. Make sure it's enabled and running.",
  copiedToClipboard: "Copied to clipboard",

  // Endpoints
  availableEndpoints: "Available Endpoints",
  modelControl: "Model Control",
  animations: "Animations",
  autoFeatures: "Automatic Features",
  windowControl: "Window Control",

  endpoints: {
    setParameter: "Set a single Live2D parameter value",
    setParameters: "Set multiple Live2D parameters at once",
    setPart: "Set model part opacity",
    setParts: "Set multiple model parts at once",
    playMotion: "Play a specific motion animation",
    playRandomMotion: "Play a random motion from a group",
    setAutoBreath: "Enable/disable automatic breathing",
    setAutoEyeBlink: "Enable/disable automatic eye blinking",
    setTrackMouse: "Enable/disable mouse tracking",
    showDisplay: "Show the display window",
    hideDisplay: "Hide the display window",
  },

  // Example Code
  exampleCode: "Example Code",
  copyCode: "Copy Code",
};
