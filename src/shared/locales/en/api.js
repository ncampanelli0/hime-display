export default {
  // Menu
  api: "API",

  // Overview
  overview: {
    title: "API Overview",
    whatIs: "What is the API?",
    description: "The Hime Display API allows you to programmatically control Live2D models from external applications. Perfect for AI assistants, chatbots, streaming tools, and automation scripts.",
    protocols: "Available Protocols",
    recommended: "Recommended",
    websocketDesc: "Persistent connection for real-time, bidirectional communication. Best for continuous control and receiving feedback.",
    httpDesc: "Simple request-response pattern. Best for one-off commands and simple integrations.",
    useCases: "Use Cases",
    useCase1: "🤖 AI-driven character control (like Neuro-sama)",
    useCase2: "🎮 Game integration and live event responses",
    useCase3: "📱 Mobile app remote control",
    useCase4: "🔧 Custom automation scripts and workflows",
  },

  // Status
  status: "API Status",
  running: "API Server Running",
  stopped: "API Server Stopped",
  enableToStart: "Enable API in configuration to start the server",
  "status.accepting": "Accepting connections",

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

  // Getting Started
  gettingStarted: {
    title: "Getting Started",
    step1: {
      title: "Step 1: Enable the API",
      desc: "Toggle the API switch above and configure your preferred ports.",
    },
    step2: {
      title: "Step 2: Connect to the Server",
      desc: "Use one of the following endpoints:",
    },
    step3: {
      title: "Step 3: Send Commands",
      desc: "Send JSON commands to control your model:",
    },
    step4: {
      title: "Step 4: See Results",
      desc: "Your Live2D model will respond to your commands in real-time!",
    },
    or: "or",
  },

  // Message Format
  messageFormat: {
    title: "Message Format",
    request: "Request Format",
    requestDesc: "All commands must be sent as JSON objects with the following structure:",
    fields: "Field Descriptions",
    actionField: "action",
    actionDesc: "The command name to execute (see Available Endpoints below)",
    dataField: "data",
    dataDesc: "Command-specific parameters (varies by action, some actions don't require data)",
    response: "Response Format",
    responseDesc: "The server responds with JSON indicating success or failure:",
    successResponse: "Success Response",
    errorResponse: "Error Response",
  },

  // Endpoints
  availableEndpoints: "Available Endpoints",
  modelControl: "Model Control",
  animations: "Animations",
  autoFeatures: "Automatic Features",
  windowControl: "Window Control",

  endpoints: {
    count: "endpoints",
    setParameter: "Set a single Live2D parameter value (e.g., mouth, eyes, head rotation)",
    setParameters: "Set multiple Live2D parameters at once for coordinated movements",
    setPart: "Set model part opacity (show/hide parts like clothing or accessories)",
    setParts: "Set multiple model parts at once",
    playMotion: "Play a specific motion animation by group and index",
    playRandomMotion: "Play a random motion from a motion group",
    setAutoBreath: "Enable/disable automatic breathing animation",
    setAutoEyeBlink: "Enable/disable automatic eye blinking animation",
    setTrackMouse: "Enable/disable eye and head tracking that follows the mouse cursor",
    showDisplay: "Show the display window",
    hideDisplay: "Hide the display window",
  },

  // Example Code
  exampleCode: "Example Code",
  exampleCodeDesc: "Copy and paste these examples to get started quickly. Modify the parameters to fit your needs.",
  copyCode: "Copy Code",

  // Troubleshooting
  troubleshooting: {
    title: "Troubleshooting",
    cannotConnect: "Cannot Connect to API",
    checkEnabled: "✓ Verify the API is enabled in configuration above",
    checkPorts: "✓ Ensure no other application is using the same ports",
    checkFirewall: "✓ Check your firewall settings aren't blocking the connection",
    restartApp: "✓ Try restarting the application",
    commandNotWorking: "Commands Not Working",
    checkFormat: "✓ Verify your JSON format is correct (no syntax errors)",
    checkAction: "✓ Make sure the action name matches exactly (case-sensitive)",
    checkModel: "✓ Ensure a Live2D model is loaded in the display window",
    checkResponse: "✓ Check the response message for specific error details",
    portInUse: "Port Already in Use",
    portInUseDesc: "If you see an error about ports being in use:",
    changePorts: "✓ Change to different port numbers in the configuration",
    checkOtherApps: "✓ Close other applications that might be using the same ports",
  },

  // Resources
  resources: {
    title: "Additional Resources",
    fullDocs: "Full API Documentation",
    moreExamples: "More Code Examples",
    reportIssue: "Report an Issue",
  },
};
