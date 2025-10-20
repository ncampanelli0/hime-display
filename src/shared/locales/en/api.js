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

  // Endpoint details
  endpointsNote: {
    title: "How to use",
    desc: "Click on any endpoint below to see detailed parameters, examples, and how to call it.",
  },
  categories: {
    modelControl: "Model Control",
    animations: "Animations",
    autoFeatures: "Auto Features",
    windowControl: "Window Control",
  },
  parameters: "Parameters",
  paramName: "Parameter",
  paramType: "Type",
  paramRequired: "Required",
  paramDesc: "Description",
  yes: "Yes",
  no: "No",
  example: "Example",
  commonParameters: "Common Live2D Parameters",
  range: "Range",
  noParameters: "This action does not require any parameters.",
  commonMotionGroups: "Common Motion Groups",
  motionGroups: {
    idle: "Idle/standing animations",
    tapBody: "Reactions to body taps",
    tapHead: "Reactions to head taps",
    shake: "Shake/phone motion reactions",
    flick: "Flick gestures",
  },

  // Parameter descriptions
  params: {
    parameterId: "The ID of the Live2D parameter to modify (e.g., ParamMouthOpenY)",
    parameterValue: "The value to set (typically 0.0 to 1.0, or -1.0 to 1.0 for directional params)",
    parametersArray: "Array of parameter objects to set simultaneously",
    partId: "The ID of the model part to modify",
    opacity: "Opacity value from 0.0 (transparent) to 1.0 (opaque)",
    partsArray: "Array of part objects to modify simultaneously",
    motionGroup: "The name of the motion group (e.g., Idle, TapBody, TapHead)",
    motionIndex: "The index of the specific motion within the group (starting from 0)",
    priority: "Motion priority level: 0 (idle), 1 (normal), 2 (force), 3 (force)",
    enabled: "Boolean value: true to enable, false to disable",
  },

  // Live2D parameter descriptions
  live2dParams: {
    angleX: "Head rotation left/right",
    angleY: "Head tilt forward/back",
    angleZ: "Head tilt left/right",
    eyeLOpen: "Left eye open/closed",
    eyeROpen: "Right eye open/closed",
    eyeBallX: "Eye direction horizontal",
    eyeBallY: "Eye direction vertical",
    mouthOpenY: "Mouth open/closed",
    mouthForm: "Mouth shape (smile/frown)",
    browLY: "Left eyebrow position",
    browRY: "Right eyebrow position",
    bodyAngleX: "Body rotation",
    bodyAngleY: "Body lean forward/back",
    bodyAngleZ: "Body tilt left/right",
    breath: "Breathing animation",
    hairFront: "Front hair physics",
    hairSide: "Side hair physics",
    hairBack: "Back hair physics",
  },

  // Detailed endpoint descriptions
  endpoints: {
    setParameter: {
      desc: "Set a single Live2D parameter value. Use this to control specific aspects of the model like facial expressions, head rotation, or body movement. Parameters are typically normalized between 0.0 and 1.0, or -1.0 to 1.0 for directional values.",
    },
    setParameters: {
      desc: "Set multiple Live2D parameters simultaneously. More efficient than calling setParameter multiple times. Useful for coordinated movements like setting an entire facial expression.",
    },
    setPart: {
      desc: "Control the opacity of a model part. Use this to show/hide accessories, clothing layers, or other model components. Opacity ranges from 0.0 (completely transparent) to 1.0 (fully opaque).",
    },
    setParts: {
      desc: "Set opacity for multiple model parts at once. Efficient for changing outfits or toggling multiple accessories simultaneously.",
    },
    playMotion: {
      desc: "Play a specific motion animation by group name and index. Motion groups are defined in the model's motion3.json file. Priority determines if this motion can interrupt currently playing motions.",
    },
    playRandomMotion: {
      desc: "Play a random motion from the specified group. Great for adding variety to idle animations or reactions. The system will randomly select one motion from all available motions in the group.",
    },
    setAutoBreath: {
      desc: "Toggle automatic breathing animation. When enabled, the model will continuously perform subtle breathing movements. Disable this if you want full manual control over breathing parameters.",
    },
    setAutoEyeBlink: {
      desc: "Toggle automatic eye blinking. When enabled, the model will periodically blink naturally. Disable for manual control of eye blinking or when synchronizing with other animations.",
    },
    setTrackMouse: {
      desc: "Toggle mouse cursor tracking. When enabled, the model's eyes and head will follow the mouse cursor position. Disable for scripted head movements or when controlling gaze manually.",
    },
    showDisplay: {
      desc: "Show the display window if it's hidden. Use this to make the model visible after hiding it or to ensure it's displayed before sending other commands.",
    },
    hideDisplay: {
      desc: "Hide the display window. The model will continue running in the background and can still receive commands, but won't be visible on screen.",
    },
  },
};
