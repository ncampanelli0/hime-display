# Hime Display API Documentation

## Overview

Hime Display now includes a powerful API for external control of Live2D models, perfect for AI-driven character systems like Neuro-sama. The API supports both WebSocket (for real-time bidirectional communication) and HTTP REST endpoints.

## Configuration

The API server can be configured in your config database. Default settings:

```json
{
  "api": {
    "enabled": true,
    "wsPort": 8765,
    "httpPort": 8766
  }
}
```

## Connection Methods

### WebSocket (Recommended for AI)

Connect to `ws://localhost:8765` for real-time bidirectional communication.

**Benefits:**
- Real-time updates
- Persistent connection
- Receive feedback from the model
- Lower latency

### HTTP REST API

Send POST requests to `http://localhost:8766`

**Benefits:**
- Simple integration
- No persistent connection needed
- Easy testing with tools like curl or Postman

## Command Structure

All commands follow this JSON structure:

```json
{
  "action": "actionName",
  "data": {
    // Action-specific data
  }
}
```

## Available Actions

### 1. Control Model Parameters

#### Set Single Parameter
```json
{
  "action": "setParameter",
  "data": {
    "parameterId": "ParamAngleX",
    "value": 15.5
  }
}
```

Common Live2D parameters:
- `ParamAngleX` - Head rotation left/right (-30 to 30)
- `ParamAngleY` - Head rotation up/down (-30 to 30)
- `ParamAngleZ` - Head tilt (-30 to 30)
- `ParamEyeLOpen` - Left eye openness (0 to 1)
- `ParamEyeROpen` - Right eye openness (0 to 1)
- `ParamEyeBallX` - Eye direction horizontal (-1 to 1)
- `ParamEyeBallY` - Eye direction vertical (-1 to 1)
- `ParamMouthOpenY` - Mouth openness (0 to 1)
- `ParamMouthForm` - Mouth shape (-1 to 1, smile to frown)
- `ParamBodyAngleX` - Body rotation (-10 to 10)
- `ParamBreath` - Breathing animation (0 to 1)

#### Set Multiple Parameters
```json
{
  "action": "setParameters",
  "data": {
    "parameters": [
      { "parameterId": "ParamAngleX", "value": 10 },
      { "parameterId": "ParamAngleY", "value": 5 },
      { "parameterId": "ParamMouthOpenY", "value": 0.8 }
    ]
  }
}
```

### 2. Play Animations

#### Play Specific Motion
```json
{
  "action": "playMotion",
  "data": {
    "group": "idle",
    "index": 0
  }
}
```

Or by file name:
```json
{
  "action": "playMotion",
  "data": {
    "group": "idle",
    "file": "idle_01.motion3.json"
  }
}
```

#### Play Random Motion
```json
{
  "action": "playRandomMotion",
  "data": {
    "group": "idle"
  }
}
```

Or from any group:
```json
{
  "action": "playRandomMotion",
  "data": {}
}
```

#### Stop Motion
```json
{
  "action": "stopMotion",
  "data": {}
}
```

### 3. Control Model Features

#### Auto Breathing
```json
{
  "action": "setAutoBreath",
  "data": {
    "enabled": false
  }
}
```

#### Auto Eye Blinking
```json
{
  "action": "setAutoEyeBlink",
  "data": {
    "enabled": false
  }
}
```

#### Mouse Tracking
```json
{
  "action": "setTrackMouse",
  "data": {
    "enabled": false
  }
}
```

### 4. Control Model Parts

#### Set Part Opacity
```json
{
  "action": "setPart",
  "data": {
    "partId": "PartAccessory",
    "value": 0.5
  }
}
```

#### Set Multiple Parts
```json
{
  "action": "setParts",
  "data": {
    "parts": [
      { "partId": "PartAccessory", "value": 1.0 },
      { "partId": "PartHat", "value": 0.0 }
    ]
  }
}
```

### 5. Window Control

#### Show Display Window
```json
{
  "action": "showDisplay",
  "data": {}
}
```

#### Hide Display Window
```json
{
  "action": "hideDisplay",
  "data": {}
}
```

## Example: AI Integration

### Python WebSocket Client

```python
import asyncio
import websockets
import json

class HimeDisplayAPI:
    def __init__(self, url="ws://localhost:8765"):
        self.url = url
        self.websocket = None
    
    async def connect(self):
        self.websocket = await websockets.connect(self.url)
        response = await self.websocket.recv()
        print(f"Connected: {response}")
    
    async def send_command(self, action, data):
        command = {
            "action": action,
            "data": data
        }
        await self.websocket.send(json.dumps(command))
        response = await self.websocket.recv()
        return json.loads(response)
    
    async def set_emotion(self, emotion):
        """Set model emotion based on AI state"""
        if emotion == "happy":
            await self.send_command("setParameters", {
                "parameters": [
                    {"parameterId": "ParamMouthForm", "value": 1.0},
                    {"parameterId": "ParamEyeLOpen", "value": 0.9},
                    {"parameterId": "ParamEyeROpen", "value": 0.9}
                ]
            })
        elif emotion == "surprised":
            await self.send_command("setParameters", {
                "parameters": [
                    {"parameterId": "ParamMouthOpenY", "value": 0.8},
                    {"parameterId": "ParamEyeLOpen", "value": 1.0},
                    {"parameterId": "ParamEyeROpen", "value": 1.0}
                ]
            })
        elif emotion == "sad":
            await self.send_command("setParameters", {
                "parameters": [
                    {"parameterId": "ParamMouthForm", "value": -1.0},
                    {"parameterId": "ParamEyeLOpen", "value": 0.5},
                    {"parameterId": "ParamEyeROpen", "value": 0.5}
                ]
            })
    
    async def speak(self, text):
        """Simulate speaking animation"""
        # Disable auto breathing during speech
        await self.send_command("setAutoBreath", {"enabled": False})
        
        # Open mouth
        for i in range(5):
            await self.send_command("setParameter", {
                "parameterId": "ParamMouthOpenY",
                "value": 0.7 + (i % 2) * 0.3
            })
            await asyncio.sleep(0.15)
        
        # Close mouth
        await self.send_command("setParameter", {
            "parameterId": "ParamMouthOpenY",
            "value": 0.0
        })
        
        # Re-enable auto breathing
        await self.send_command("setAutoBreath", {"enabled": True})
    
    async def close(self):
        if self.websocket:
            await self.websocket.close()

# Usage example
async def main():
    api = HimeDisplayAPI()
    await api.connect()
    
    # Show the display
    await api.send_command("showDisplay", {})
    
    # Disable automatic features for full control
    await api.send_command("setAutoEyeBlink", {"enabled": False})
    await api.send_command("setTrackMouse", {"enabled": False})
    
    # Set happy emotion
    await api.set_emotion("happy")
    
    # Play idle animation
    await api.send_command("playRandomMotion", {"group": "idle"})
    
    # Simulate speaking
    await api.speak("Hello, I'm controlled by AI!")
    
    await api.close()

if __name__ == "__main__":
    asyncio.run(main())
```

### JavaScript/Node.js Client

```javascript
const WebSocket = require('ws');

class HimeDisplayAPI {
  constructor(url = 'ws://localhost:8765') {
    this.url = url;
    this.ws = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      
      this.ws.on('open', () => {
        console.log('Connected to Hime Display');
        resolve();
      });
      
      this.ws.on('message', (data) => {
        console.log('Received:', data.toString());
      });
      
      this.ws.on('error', reject);
    });
  }

  sendCommand(action, data) {
    const command = { action, data };
    this.ws.send(JSON.stringify(command));
  }

  setEmotion(emotion) {
    const emotions = {
      happy: [
        { parameterId: 'ParamMouthForm', value: 1.0 },
        { parameterId: 'ParamEyeLOpen', value: 0.9 },
        { parameterId: 'ParamEyeROpen', value: 0.9 }
      ],
      surprised: [
        { parameterId: 'ParamMouthOpenY', value: 0.8 },
        { parameterId: 'ParamEyeLOpen', value: 1.0 },
        { parameterId: 'ParamEyeROpen', value: 1.0 }
      ],
      neutral: [
        { parameterId: 'ParamMouthForm', value: 0.0 },
        { parameterId: 'ParamEyeLOpen', value: 1.0 },
        { parameterId: 'ParamEyeROpen', value: 1.0 }
      ]
    };

    this.sendCommand('setParameters', {
      parameters: emotions[emotion] || emotions.neutral
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Usage
(async () => {
  const api = new HimeDisplayAPI();
  await api.connect();
  
  // Show display
  api.sendCommand('showDisplay', {});
  
  // Set emotion
  api.setEmotion('happy');
  
  // Play animation
  api.sendCommand('playRandomMotion', { group: 'idle' });
})();
```

### HTTP REST Example (curl)

```bash
# Set parameter
curl -X POST http://localhost:8766 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "setParameter",
    "data": {
      "parameterId": "ParamMouthOpenY",
      "value": 0.8
    }
  }'

# Play random motion
curl -X POST http://localhost:8766 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "playRandomMotion",
    "data": {
      "group": "idle"
    }
  }'

# Health check
curl http://localhost:8766/health
```

## MCP Server Integration

For Model Context Protocol (MCP) server integration, you can create tools that call the Hime Display API:

```python
# Example MCP tool for controlling Live2D model
from mcp.server import Server
from mcp.types import Tool, TextContent
import aiohttp
import json

server = Server("hime-display-controller")

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="set_model_emotion",
            description="Set the Live2D model's emotion",
            inputSchema={
                "type": "object",
                "properties": {
                    "emotion": {
                        "type": "string",
                        "enum": ["happy", "sad", "surprised", "neutral"],
                        "description": "The emotion to display"
                    }
                },
                "required": ["emotion"]
            }
        ),
        Tool(
            name="play_animation",
            description="Play a Live2D animation",
            inputSchema={
                "type": "object",
                "properties": {
                    "group": {
                        "type": "string",
                        "description": "Animation group name"
                    }
                }
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "set_model_emotion":
        emotion_params = {
            "happy": [
                {"parameterId": "ParamMouthForm", "value": 1.0},
                {"parameterId": "ParamAngleY", "value": 5}
            ],
            "sad": [
                {"parameterId": "ParamMouthForm", "value": -1.0},
                {"parameterId": "ParamAngleY", "value": -5}
            ],
            # ... more emotions
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://localhost:8766",
                json={
                    "action": "setParameters",
                    "data": {"parameters": emotion_params[arguments["emotion"]]}
                }
            ) as response:
                result = await response.json()
                return [TextContent(type="text", text=f"Emotion set to {arguments['emotion']}")]
    
    # ... more tool implementations
```

## Tips for AI Character Development

1. **Disable Auto Features**: Turn off `autoBreath`, `autoEyeBlink`, and `trackMouse` for full AI control
2. **Smooth Transitions**: Use multiple parameter updates with small delays for natural movements
3. **Emotion Mapping**: Create emotion presets that map to parameter combinations
4. **Speech Sync**: Coordinate mouth movements with TTS audio playback
5. **Context-Aware Animations**: Play different motion groups based on conversation context
6. **Performance**: Use WebSocket for real-time control instead of HTTP for lower latency

## Troubleshooting

- **Connection Refused**: Make sure Hime Display is running and API is enabled in config
- **Display Window Not Responding**: Ensure a model is loaded in the display window
- **Parameter Not Working**: Check that the parameter ID matches your model's parameters
- **Port Already in Use**: Change the port in the config database

## Advanced: Custom Command Extension

You can extend the `CommandHandler` class to add custom commands specific to your AI character:

```javascript
// In CommandHandler.js, add new methods
setCustomEmotion(data) {
  const { emotion, intensity } = data;
  // Your custom logic here
  return { success: true, action: "setCustomEmotion", emotion, intensity };
}
```

Then add it to the switch statement in the `handle` method.

## Support

For issues or questions about the API, please open an issue on the GitHub repository.
