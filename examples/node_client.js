/**
 * Node.js client for controlling Hime Display Live2D models
 * Perfect for AI character integration
 */

const WebSocket = require('ws');
const http = require('http');

class HimeDisplayClient {
  constructor(host = 'localhost', wsPort = 8765, httpPort = 8766) {
    this.wsUrl = `ws://${host}:${wsPort}`;
    this.httpUrl = `http://${host}:${httpPort}`;
    this.ws = null;
    this.connected = false;
    this.messageHandlers = new Map();
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.on('open', () => {
        console.log('✓ Connected to Hime Display');
        this.connected = true;
      });

      this.ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        // Handle connection message
        if (message.type === 'connection') {
          resolve(message);
        }
        
        // Call registered handlers
        this.messageHandlers.forEach(handler => handler(message));
      });

      this.ws.on('error', (error) => {
        console.error('✗ WebSocket error:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('✓ Disconnected');
        this.connected = false;
      });
    });
  }

  /**
   * Register a message handler
   */
  onMessage(handler) {
    const id = Math.random().toString(36);
    this.messageHandlers.set(id, handler);
    return () => this.messageHandlers.delete(id);
  }

  /**
   * Send command via WebSocket
   */
  sendCommand(action, data = {}) {
    if (!this.connected) {
      throw new Error('Not connected to Hime Display');
    }

    const command = { action, data };
    this.ws.send(JSON.stringify(command));
  }

  /**
   * Send command via HTTP POST (alternative to WebSocket)
   */
  async sendCommandHttp(action, data = {}) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({ action, data });
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(this.httpUrl, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(JSON.parse(body)));
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * Disconnect
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  // Convenience methods

  setParameter(parameterId, value) {
    this.sendCommand('setParameter', { parameterId, value });
  }

  setParameters(parameters) {
    this.sendCommand('setParameters', { parameters });
  }

  playMotion(group, index = null, file = null) {
    const data = { group };
    if (index !== null) data.index = index;
    if (file) data.file = file;
    this.sendCommand('playMotion', data);
  }

  playRandomMotion(group = null) {
    const data = group ? { group } : {};
    this.sendCommand('playRandomMotion', data);
  }

  setAutoBreath(enabled) {
    this.sendCommand('setAutoBreath', { enabled });
  }

  setAutoEyeBlink(enabled) {
    this.sendCommand('setAutoEyeBlink', { enabled });
  }

  setTrackMouse(enabled) {
    this.sendCommand('setTrackMouse', { enabled });
  }

  showDisplay() {
    this.sendCommand('showDisplay', {});
  }

  hideDisplay() {
    this.sendCommand('hideDisplay', {});
  }

  /**
   * Set emotion using predefined parameter sets
   */
  setEmotion(emotion) {
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
      ],
      neutral: [
        { parameterId: 'ParamMouthForm', value: 0.0 },
        { parameterId: 'ParamEyeLOpen', value: 1.0 },
        { parameterId: 'ParamEyeROpen', value: 1.0 },
      ]
    };

    if (!emotions[emotion]) {
      throw new Error(`Unknown emotion: ${emotion}`);
    }

    this.setParameters(emotions[emotion]);
  }

  /**
   * Make model look in a direction
   */
  lookAt(x, y) {
    this.setParameters([
      { parameterId: 'ParamEyeBallX', value: x },
      { parameterId: 'ParamEyeBallY', value: y },
      { parameterId: 'ParamAngleX', value: x * 15 },
      { parameterId: 'ParamAngleY', value: y * 10 },
    ]);
  }

  /**
   * Animate speaking
   */
  async speakAnimation(duration = 1000, intensity = 0.7) {
    const frames = Math.floor(duration / 100);
    
    for (let i = 0; i < frames; i++) {
      const value = intensity * Math.abs((i % 4) - 2) / 2;
      this.setParameter('ParamMouthOpenY', value);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.setParameter('ParamMouthOpenY', 0.0);
  }
}

// Example usage
async function demo() {
  console.log('Hime Display Node.js Client');
  console.log('='.repeat(40));

  const client = new HimeDisplayClient();

  try {
    // Connect
    await client.connect();
    
    // Listen to server messages
    client.onMessage((msg) => {
      if (msg.type === 'command-result') {
        console.log('Command result:', msg.result);
      }
    });

    console.log('\n=== Demo Start ===\n');

    // Show display
    console.log('1. Showing display...');
    client.showDisplay();
    await sleep(1000);

    // Take control
    console.log('2. Taking full control...');
    client.setAutoBreath(false);
    client.setAutoEyeBlink(false);
    client.setTrackMouse(false);
    await sleep(1000);

    // Cycle through emotions
    const emotions = ['neutral', 'happy', 'surprised', 'sad', 'angry'];
    for (const emotion of emotions) {
      console.log(`3. Emotion: ${emotion}`);
      client.setEmotion(emotion);
      await sleep(2000);
    }

    // Play animation
    console.log('4. Playing animation...');
    client.playRandomMotion('idle');
    await sleep(2000);

    // Look around
    console.log('5. Looking around...');
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1], [0, 0]];
    for (const [x, y] of directions) {
      client.lookAt(x, y);
      await sleep(500);
    }

    // Speak
    console.log('6. Speaking animation...');
    await client.speakAnimation(2000, 0.8);

    // Re-enable auto features
    console.log('7. Re-enabling auto features...');
    client.setAutoBreath(true);
    client.setAutoEyeBlink(true);
    client.setTrackMouse(true);

    console.log('\n✓ Demo complete!');

  } catch (error) {
    console.error('✗ Error:', error);
  } finally {
    setTimeout(() => client.disconnect(), 1000);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run demo if executed directly
if (require.main === module) {
  demo();
}

module.exports = HimeDisplayClient;
