/**
 * Hime Display MCP Server for LM Studio (Node.js version)
 * Model Context Protocol server for controlling Live2D characters
 * 
 * This is an alternative to the Python version if you prefer Node.js
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const WebSocket = require('ws');

// Configuration
const HIME_DISPLAY_WS = 'ws://localhost:8765';
const HIME_DISPLAY_HTTP = 'http://localhost:8766';

/**
 * Manages WebSocket connection to Hime Display
 */
class HimeDisplayConnection {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.connected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.on('open', () => {
          this.connected = true;
          console.error('[Hime Display] Connected');
          resolve(true);
        });

        this.ws.on('error', (error) => {
          console.error(`[Error] Connection failed: ${error.message}`);
          resolve(false);
        });

        this.ws.on('close', () => {
          this.connected = false;
          console.error('[Hime Display] Connection closed');
        });

        // Set timeout
        setTimeout(() => {
          if (!this.connected) {
            reject(new Error('Connection timeout'));
          }
        }, 5000);
      } catch (error) {
        resolve(false);
      }
    });
  }

  async sendCommand(action, data) {
    if (!this.connected) {
      const success = await this.connect();
      if (!success) {
        throw new Error('Not connected to Hime Display');
      }
    }

    return new Promise((resolve, reject) => {
      const command = { action, data };
      
      const messageHandler = (message) => {
        try {
          const response = JSON.parse(message.toString());
          this.ws.removeListener('message', messageHandler);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };

      this.ws.on('message', messageHandler);
      this.ws.send(JSON.stringify(command));

      // Timeout after 5 seconds
      setTimeout(() => {
        this.ws.removeListener('message', messageHandler);
        reject(new Error('Command timeout'));
      }, 5000);
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.connected = false;
    }
  }
}

// Global connection instance
const display = new HimeDisplayConnection(HIME_DISPLAY_WS);

// Emotion presets
const emotions = {
  happy: [
    { parameterId: 'ParamMouthForm', value: 1.0 },
    { parameterId: 'ParamEyeLOpen', value: 0.9 },
    { parameterId: 'ParamEyeROpen', value: 0.9 },
  ],
  sad: [
    { parameterId: 'ParamMouthForm', value: -1.0 },
    { parameterId: 'ParamEyeLOpen', value: 0.6 },
    { parameterId: 'ParamEyeROpen', value: 0.6 },
    { parameterId: 'ParamAngleY', value: -5 },
  ],
  surprised: [
    { parameterId: 'ParamMouthOpenY', value: 0.8 },
    { parameterId: 'ParamEyeLOpen', value: 1.0 },
    { parameterId: 'ParamEyeROpen', value: 1.0 },
  ],
  angry: [
    { parameterId: 'ParamMouthForm', value: -0.5 },
    { parameterId: 'ParamEyeLOpen', value: 0.7 },
    { parameterId: 'ParamEyeROpen', value: 0.7 },
    { parameterId: 'ParamBrowLY', value: -0.5 },
    { parameterId: 'ParamBrowRY', value: -0.5 },
  ],
  confused: [
    { parameterId: 'ParamMouthForm', value: 0.2 },
    { parameterId: 'ParamAngleX', value: 10 },
    { parameterId: 'ParamAngleY', value: -3 },
  ],
  neutral: [
    { parameterId: 'ParamMouthForm', value: 0.0 },
    { parameterId: 'ParamEyeLOpen', value: 1.0 },
    { parameterId: 'ParamEyeROpen', value: 1.0 },
    { parameterId: 'ParamAngleX', value: 0 },
    { parameterId: 'ParamAngleY', value: 0 },
  ],
  worried: [
    { parameterId: 'ParamMouthForm', value: -0.3 },
    { parameterId: 'ParamEyeLOpen', value: 0.8 },
    { parameterId: 'ParamEyeROpen', value: 0.8 },
    { parameterId: 'ParamBrowLY', value: 0.3 },
    { parameterId: 'ParamBrowRY', value: 0.3 },
  ],
  excited: [
    { parameterId: 'ParamMouthForm', value: 1.0 },
    { parameterId: 'ParamMouthOpenY', value: 0.3 },
    { parameterId: 'ParamEyeLOpen', value: 1.0 },
    { parameterId: 'ParamEyeROpen', value: 1.0 },
  ],
};

// Utility function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Tool handlers
 */
const toolHandlers = {
  async set_emotion(args) {
    const emotion = args.emotion;
    const params = emotions[emotion] || emotions.neutral;
    
    await display.sendCommand('setParameters', { parameters: params });
    return `✓ Set character emotion to '${emotion}'`;
  },

  async play_animation(args) {
    const { group, random = true } = args;
    
    if (random) {
      await display.sendCommand('playRandomMotion', { group });
      return `✓ Playing random animation from '${group}' group`;
    } else {
      await display.sendCommand('playMotion', { group, index: 0 });
      return `✓ Playing animation from '${group}' group`;
    }
  },

  async set_parameter(args) {
    const { parameter_id, value } = args;
    
    await display.sendCommand('setParameter', {
      parameterId: parameter_id,
      value: value
    });
    
    return `✓ Set parameter '${parameter_id}' to ${value}`;
  },

  async speak(args) {
    const { duration = 1.0, intensity = 0.7 } = args;
    
    // Disable auto breath
    await display.sendCommand('setAutoBreath', { enabled: false });
    
    // Animate mouth
    const frames = Math.floor(duration * 10);
    for (let i = 0; i < frames; i++) {
      const value = intensity * Math.abs((i % 4) - 2) / 2;
      await display.sendCommand('setParameter', {
        parameterId: 'ParamMouthOpenY',
        value: value
      });
      await sleep(100);
    }
    
    // Close mouth
    await display.sendCommand('setParameter', {
      parameterId: 'ParamMouthOpenY',
      value: 0.0
    });
    
    // Re-enable auto breath
    await display.sendCommand('setAutoBreath', { enabled: true });
    
    return `✓ Animated speaking for ${duration} seconds`;
  },

  async look_at(args) {
    const { x, y } = args;
    
    await display.sendCommand('setParameters', {
      parameters: [
        { parameterId: 'ParamEyeBallX', value: x },
        { parameterId: 'ParamEyeBallY', value: y },
        { parameterId: 'ParamAngleX', value: x * 15 },
        { parameterId: 'ParamAngleY', value: y * 10 },
        { parameterId: 'ParamBodyAngleX', value: x * 5 },
      ]
    });
    
    let direction = 'center';
    if (Math.abs(x) > 0.5) {
      direction = x < 0 ? 'left' : 'right';
    }
    if (Math.abs(y) > 0.5) {
      direction = `${direction} and ${y > 0 ? 'up' : 'down'}`;
    }
    
    return `✓ Character looking ${direction} (x=${x}, y=${y})`;
  },

  async control_auto_features(args) {
    const results = [];
    
    if ('breath' in args) {
      await display.sendCommand('setAutoBreath', { enabled: args.breath });
      results.push(`breathing: ${args.breath ? 'on' : 'off'}`);
    }
    
    if ('eye_blink' in args) {
      await display.sendCommand('setAutoEyeBlink', { enabled: args.eye_blink });
      results.push(`blinking: ${args.eye_blink ? 'on' : 'off'}`);
    }
    
    if ('track_mouse' in args) {
      await display.sendCommand('setTrackMouse', { enabled: args.track_mouse });
      results.push(`mouse tracking: ${args.track_mouse ? 'on' : 'off'}`);
    }
    
    return `✓ Updated auto features - ${results.join(', ')}`;
  },

  async window_control(args) {
    const { action } = args;
    
    if (action === 'show') {
      await display.sendCommand('showDisplay', {});
      return '✓ Display window shown';
    } else {
      await display.sendCommand('hideDisplay', {});
      return '✓ Display window hidden';
    }
  }
};

/**
 * Start the MCP server
 */
async function main() {
  console.error('[Hime Display MCP Server]');
  console.error(`Connecting to Hime Display at ${HIME_DISPLAY_WS}...`);
  
  // Try to connect
  const connected = await display.connect();
  if (connected) {
    console.error('✓ Connected to Hime Display successfully');
  } else {
    console.error('✗ Failed to connect to Hime Display');
    console.error('  Make sure:');
    console.error('  1. Hime Display is running');
    console.error('  2. API is enabled in settings');
    console.error('  3. Ports match your configuration');
    console.error('');
    console.error('The server will continue and retry connections on demand.');
  }

  const server = new Server(
    {
      name: 'hime-display',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'set_emotion',
          description: 'Set the Live2D character\'s emotional expression',
          inputSchema: {
            type: 'object',
            properties: {
              emotion: {
                type: 'string',
                enum: ['happy', 'sad', 'surprised', 'angry', 'confused', 'neutral', 'worried', 'excited'],
                description: 'The emotion to display'
              }
            },
            required: ['emotion']
          }
        },
        {
          name: 'play_animation',
          description: 'Play a Live2D animation from a specific motion group',
          inputSchema: {
            type: 'object',
            properties: {
              group: {
                type: 'string',
                description: 'Animation group name'
              },
              random: {
                type: 'boolean',
                description: 'Play random animation from group',
                default: true
              }
            },
            required: ['group']
          }
        },
        {
          name: 'set_parameter',
          description: 'Set a specific Live2D parameter value',
          inputSchema: {
            type: 'object',
            properties: {
              parameter_id: {
                type: 'string',
                description: 'Parameter ID'
              },
              value: {
                type: 'number',
                description: 'Parameter value'
              }
            },
            required: ['parameter_id', 'value']
          }
        },
        {
          name: 'speak',
          description: 'Animate the character speaking',
          inputSchema: {
            type: 'object',
            properties: {
              duration: {
                type: 'number',
                description: 'Duration in seconds',
                default: 1.0
              },
              intensity: {
                type: 'number',
                description: 'Speaking intensity (0.0 to 1.0)',
                default: 0.7
              }
            }
          }
        },
        {
          name: 'look_at',
          description: 'Make the character look in a specific direction',
          inputSchema: {
            type: 'object',
            properties: {
              x: {
                type: 'number',
                description: 'Horizontal direction (-1.0 to 1.0)',
                minimum: -1.0,
                maximum: 1.0
              },
              y: {
                type: 'number',
                description: 'Vertical direction (-1.0 to 1.0)',
                minimum: -1.0,
                maximum: 1.0
              }
            },
            required: ['x', 'y']
          }
        },
        {
          name: 'control_auto_features',
          description: 'Enable or disable automatic features',
          inputSchema: {
            type: 'object',
            properties: {
              breath: {
                type: 'boolean',
                description: 'Enable automatic breathing'
              },
              eye_blink: {
                type: 'boolean',
                description: 'Enable automatic eye blinking'
              },
              track_mouse: {
                type: 'boolean',
                description: 'Enable mouse tracking'
              }
            }
          }
        },
        {
          name: 'window_control',
          description: 'Show or hide the display window',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['show', 'hide'],
                description: 'Show or hide the window'
              }
            },
            required: ['action']
          }
        }
      ]
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      const handler = toolHandlers[name];
      if (!handler) {
        return {
          content: [
            {
              type: 'text',
              text: `✗ Unknown tool: ${name}`
            }
          ]
        };
      }

      const result = await handler(args);
      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `✗ Error executing ${name}: ${error.message}`
          }
        ],
        isError: true
      };
    }
  });

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('✓ MCP server started and ready');

  // Cleanup on exit
  process.on('SIGINT', () => {
    display.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
